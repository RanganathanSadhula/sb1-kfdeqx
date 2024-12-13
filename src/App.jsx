import React, { useRef, useState, useEffect } from 'react';
import WebcamCapture from './components/WebcamCapture';
import ImageUpload from './components/ImageUpload';
import VideoUpload from './components/VideoUpload';
import PredictionResults from './components/PredictionResults';
import { loadModel, processImage, processVideo } from './utils/modelUtils';

function App() {
  const [model, setModel] = useState(null);
  const [predictions, setPredictions] = useState([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [detectionMode, setDetectionMode] = useState('image');
  const webcamRef = useRef(null);
  const fileInputRef = useRef(null);

  useEffect(() => {
    const initModel = async () => {
      const loadedModel = await loadModel();
      setModel(loadedModel);
    };
    initModel();
  }, []);

  const handleImageProcess = async (imageElement) => {
    setIsProcessing(true);
    const results = await processImage(model, imageElement);
    setPredictions(results);
    setIsProcessing(false);
  };

  const handleVideoProcess = async (canvas) => {
    const results = await processVideo(model, canvas);
    setPredictions(results);
  };

  const handleFileUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    setSelectedFile(URL.createObjectURL(file));
    const img = new Image();
    img.src = URL.createObjectURL(file);
    img.onload = () => handleImageProcess(img);
  };

  const handleWebcamCapture = async () => {
    if (webcamRef.current) {
      const imageSrc = webcamRef.current.getScreenshot();
      const img = new Image();
      img.src = imageSrc;
      img.onload = () => handleImageProcess(img);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8 text-center">
          Advanced Ambulance Detection System
        </h1>

        <div className="mb-6 flex justify-center space-x-4">
          <button
            onClick={() => setDetectionMode('image')}
            className={`px-4 py-2 rounded ${
              detectionMode === 'image'
                ? 'bg-blue-500 text-white'
                : 'bg-gray-200 text-gray-700'
            }`}
          >
            Image Detection
          </button>
          <button
            onClick={() => setDetectionMode('video')}
            className={`px-4 py-2 rounded ${
              detectionMode === 'video'
                ? 'bg-blue-500 text-white'
                : 'bg-gray-200 text-gray-700'
            }`}
          >
            Video Detection
          </button>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-lg mb-8">
          {detectionMode === 'image' ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <ImageUpload
                fileInputRef={fileInputRef}
                onFileUpload={handleFileUpload}
                selectedFile={selectedFile}
              />
              <WebcamCapture
                webcamRef={webcamRef}
                onCapture={handleWebcamCapture}
                isProcessing={isProcessing}
              />
            </div>
          ) : (
            <VideoUpload onVideoProcess={handleVideoProcess} />
          )}
        </div>

        {isProcessing && (
          <div className="text-center text-lg font-semibold text-blue-600 mb-8">
            Processing...
          </div>
        )}

        {predictions.length > 0 && (
          <PredictionResults predictions={predictions} />
        )}
      </div>
    </div>
  );
}

export default App;
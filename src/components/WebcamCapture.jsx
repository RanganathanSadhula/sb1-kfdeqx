import React from 'react';
import Webcam from 'react-webcam';

function WebcamCapture({ webcamRef, onCapture, isProcessing }) {
  return (
    <div>
      <h2 className="text-xl font-semibold mb-4">Live Camera</h2>
      <Webcam
        ref={webcamRef}
        screenshotFormat="image/jpeg"
        className="w-full rounded-lg"
      />
      <button
        onClick={onCapture}
        className="mt-4 bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 disabled:bg-blue-300"
        disabled={isProcessing}
      >
        Capture and Analyze
      </button>
    </div>
  );
}

export default WebcamCapture;
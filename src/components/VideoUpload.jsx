import React, { useRef, useState } from 'react';

function VideoUpload({ onVideoProcess }) {
  const [videoSrc, setVideoSrc] = useState(null);
  const videoRef = useRef(null);
  const canvasRef = useRef(null);

  const handleVideoUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setVideoSrc(url);
    }
  };

  const processFrame = () => {
    if (videoRef.current && canvasRef.current) {
      const canvas = canvasRef.current;
      const video = videoRef.current;
      
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      
      const ctx = canvas.getContext('2d');
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      
      onVideoProcess(canvas);
      
      if (!video.paused && !video.ended) {
        requestAnimationFrame(processFrame);
      }
    }
  };

  const handlePlay = () => {
    processFrame();
  };

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold mb-4">Upload Video</h2>
      <input
        type="file"
        accept="video/*"
        onChange={handleVideoUpload}
        className="w-full"
      />
      {videoSrc && (
        <div className="relative">
          <video
            ref={videoRef}
            src={videoSrc}
            className="w-full rounded-lg"
            controls
            onPlay={handlePlay}
          />
          <canvas
            ref={canvasRef}
            className="hidden"
          />
        </div>
      )}
    </div>
  );
}

export default VideoUpload;
import React from 'react';

function ImageUpload({ fileInputRef, onFileUpload, selectedFile }) {
  return (
    <div>
      <h2 className="text-xl font-semibold mb-4">Upload Image</h2>
      <input
        type="file"
        ref={fileInputRef}
        onChange={onFileUpload}
        accept="image/*"
        className="mb-4"
      />
      {selectedFile && (
        <img
          src={selectedFile}
          alt="Uploaded"
          className="max-w-full h-auto rounded-lg"
        />
      )}
    </div>
  );
}

export default ImageUpload;
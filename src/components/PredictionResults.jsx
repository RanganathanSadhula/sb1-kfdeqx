import React from 'react';

function PredictionResults({ predictions }) {
  return (
    <div className="bg-white p-6 rounded-lg shadow-lg">
      <h2 className="text-xl font-semibold mb-4">Detection Results</h2>
      <ul className="space-y-2">
        {predictions.map((prediction, index) => (
          <li key={index} className="flex justify-between items-center">
            <span className="font-medium">{prediction.className}</span>
            <span className="text-gray-600">
              {(prediction.probability * 100).toFixed(2)}% confidence
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default PredictionResults;
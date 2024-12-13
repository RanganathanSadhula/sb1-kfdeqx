import * as tf from '@tensorflow/tfjs';
import * as mobilenet from '@tensorflow-models/mobilenet';

export const loadModel = async () => {
  try {
    const model = await mobilenet.load();
    console.log('Model loaded successfully');
    return model;
  } catch (error) {
    console.error('Error loading model:', error);
    throw error;
  }
};

export const processImage = async (model, imageElement) => {
  if (!model) return [];

  try {
    const predictions = await model.classify(imageElement);
    return filterAmbulancePredictions(predictions);
  } catch (error) {
    console.error('Error processing image:', error);
    return [];
  }
};

export const processVideo = async (model, canvas) => {
  if (!model) return [];

  try {
    const predictions = await model.classify(canvas);
    return filterAmbulancePredictions(predictions);
  } catch (error) {
    console.error('Error processing video frame:', error);
    return [];
  }
};

const filterAmbulancePredictions = (predictions) => {
  const relevantPredictions = predictions.filter(pred => {
    const className = pred.className.toLowerCase();
    return (
      className.includes('ambulance') ||
      className.includes('emergency') ||
      className.includes('vehicle') ||
      className.includes('siren') ||
      className.includes('medical') ||
      className.includes('rescue') ||
      className.includes('hospital')
    );
  });

  return relevantPredictions.map(pred => {
    const className = pred.className.toLowerCase();
    let confidenceBoost = 1;
    
    if (className.includes('ambulance')) confidenceBoost = 1.2;
    if (className.includes('emergency')) confidenceBoost = 1.1;
    
    return {
      ...pred,
      probability: Math.min(pred.probability * confidenceBoost, 1)
    };
  });
};
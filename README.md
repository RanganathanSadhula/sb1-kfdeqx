# Ambulance Detection System

This Python-based system uses deep learning to detect ambulances in images and videos. It combines LSTM (Long Short-Term Memory) networks with CNN (Convolutional Neural Network) features for accurate detection of ambulance-specific characteristics.

## Features

- Deep learning model combining CNN and LSTM
- Detection of specific ambulance features:
  - Ambulance body
  - Emergency lights
  - Sirens
  - Emergency numbers (e.g., 108)
- Image and video processing capabilities
- High accuracy detection system

## Setup

1. Install dependencies:
```bash
pip install -r requirements.txt
```

2. Organize your dataset:
```
data/
├── train/
│   ├── ambulance/
│   └── non_ambulance/
└── validation/
    ├── ambulance/
    └── non_ambulance/
```

3. Train the model:
- Place your training images in the appropriate directories
- Uncomment the training code in main()
- Run the script

## Usage

```python
from ambulance_detection import AmbulanceDetector

# Initialize detector
detector = AmbulanceDetector()

# Train (if needed)
detector.train('data/train', 'data/validation', epochs=20)

# Predict
results = detector.detect_ambulance_features('path_to_image.jpg')
print(results)
```
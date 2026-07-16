# KUMPAS

## Overview

KUMPAS is Aaron's most recent listed portfolio project. It was built during ACM TechSprint: Asteria 2026 as an accessibility-focused Filipino Sign Language recognition and translation system. Webcam input is converted into readable text and can be translated into Filipino, Cebuano, Ilocano, Waray, Hiligaynon, or Kapampangan.

The frontend uses React, Vite, and TypeScript and is deployed on Vercel. A Python inference backend is deployed on Railway. The computer-vision and machine-learning pipeline uses OpenCV, MediaPipe hand landmarks, TensorFlow, Keras, NumPy data, and an LSTM sequence classifier. It recognizes movement across a sequence of frames rather than treating gestures as isolated static images.

## Aaron's Contribution

Aaron worked as a hackathon team member and machine-learning developer. He helped build the sign-recognition workflow, trained the LSTM model on MediaPipe hand-landmark sequences, connected webcam gesture input to Python inference, integrated predictions with the React interface, added multilingual output, and helped deploy the frontend and backend.

The system had 29 gesture classes, processed 30-frame sequences, and used 126 landmark features per frame. Formal final accuracy metrics were not established during the hackathon, so the public chatbot must not invent an accuracy percentage. Testing was more reliable with clear motion, good lighting, and visible hands.

KUMPAS developed Aaron's skills in sequence classification, real-time computer vision, dataset preparation, model training, full-stack ML integration, deployment, accessibility-focused product design, and teamwork under time constraints.


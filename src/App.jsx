import React from 'react';
import CameraRecorder from './CameraRecorder';
import './index.css';

export default function App() {
  return (
    <div className="app-container">
      <h1 style={{ marginBottom: '1.5rem', color: '#f1f1f1' }}>
        AS Interpreter
      </h1>
      <CameraRecorder />
    </div>
  );
}

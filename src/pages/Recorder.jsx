import React, { useRef, useState, useEffect } from 'react';

import { Hands, HAND_CONNECTIONS } from '@mediapipe/hands';
import { Camera } from '@mediapipe/camera_utils';
import { drawConnectors, drawLandmarks } from '@mediapipe/drawing_utils';

export default function LocalHandOverlay() {
  const videoRef  = useRef(null);
  const cameraRef = useRef(null);
  const canvasRef = useRef(null);
  const landmarksRef = useRef(null);

  const [prediction, setPrediction ] = useState('');
  const [translating, setTranslating] = useState(false);

  const [isFront, setIsFront] = useState(true);

  const THROTTLE_MS = 1000;

  const API_URL = import.meta.env.VITE_API_URL + 'upload';

  useEffect(() => {

    const facingMode = isFront ? 'user' : 'environment';

    cameraRef.current?.stop();

    // 1) Initialize MediaPipe Hands
    const hands = new Hands({
      locateFile: (file) =>
        `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}`,
    });
    hands.setOptions({
      maxNumHands: 2,
      modelComplexity: 1,
      minDetectionConfidence: 0.6,
      minTrackingConfidence: 0.6,
    });

    // 2) Handle results by drawing only primitives
    hands.onResults((results) => {
      const canvas = canvasRef.current;
      const ctx    = canvas.getContext('2d');
      const video  = videoRef.current;

      // match sizes
      canvas.width  = video.videoWidth;
      canvas.height = video.videoHeight;

      // clear previous overlay
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // draw landmarks and connections (no background image)
      if (results.multiHandLandmarks) {
        for (const landmarks of results.multiHandLandmarks) {
          drawConnectors(ctx, landmarks, HAND_CONNECTIONS, {
            color: '#00FF00',
            lineWidth: 4,
          });
          drawLandmarks(ctx, landmarks, {
            color: '#FF0000',
            lineWidth: 2,
            radius: 4,
          });
        }
        landmarksRef.current = results.multiHandLandmarks;
      } else {
        landmarksRef.current = null;
      }
    });

    // 3) Hook up the camera
    const camera = new Camera(videoRef.current, {
      onFrame: async () => {
        await hands.send({ image: videoRef.current });
      },
      width: 1280,
      height: 720,
      facingMode,
    });
    cameraRef.current = camera;
    camera.start();

    return () => {
      camera.stop();
      hands.close();
    };
  }, [isFront]);

  useEffect(() => {
    if (!translating) return;
    const iv = setInterval(async () => {
      const pts = landmarksRef.current;
      if (!pts) return;
      try {
        const res  = await fetch(API_URL, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ landmarks: pts })
        });
        const data = await res.json();
        if (data.prediction) setPrediction(data.prediction);
      } catch (e) {
        console.error('Predict error:', e);
      }
    }, THROTTLE_MS);
    return () => clearInterval(iv);
  }, [translating]);



  return (
    <div className="app-container learning-page">
      <div className="video-container" style={{ transform: 'scaleX(-1)' }}>
        <video
          ref={videoRef}
          className="video-element"
          autoPlay
          playsInline
          muted
        />
        <canvas
          ref={canvasRef}
          className="canvas-overlay"
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            pointerEvents: 'none',
            width: '100%',
            height: '100%',
          }}
        />
        <div className="api-response overlay-response">
          {prediction}
        </div>

        <div className="controls">
          <button className="button" onClick={() => setTranslating(t => !t)}>
            {translating ? 'Stop Translating' : 'Start Translating'}
          </button>
        </div>

        <div className='camera-controls'>
          <button
              className="button"
              onClick={() => setIsFront(f => !f)}
            >
              Switch Camera
          </button>
        </div>

      </div>
    </div>
  );
}

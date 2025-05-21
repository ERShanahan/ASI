import React, { useRef, useState, useEffect } from 'react';

import { Hands, HAND_CONNECTIONS } from '@mediapipe/hands';
import { Camera } from '@mediapipe/camera_utils';
import { drawConnectors, drawLandmarks } from '@mediapipe/drawing_utils';

export default function LocalHandOverlay() {
  const videoRef  = useRef(null);
  const canvasRef = useRef(null);
  const landmarksRef = useRef(null);

  const [prediction, setPrediction ] = useState('');
  const [translating, setTranslating] = useState(false);

  const THROTTLE_MS = 1000;

  const API_URL = import.meta.env.VITE_API_URL + 'upload';

  useEffect(() => {
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
    });
    camera.start();

    return () => {
      camera.stop();
      hands.close();
    };
  }, []);

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
        console.log(data.prediction)
      } catch (e) {
        console.error('Predict error:', e);
      }
    }, THROTTLE_MS);
    return () => clearInterval(iv);
  }, [translating]);



  return (
    <div style={{ position: 'relative', width: '100%' }}>
      <div style={{transform: 'scaleX(-1)'}}>
        <video
          ref={videoRef}
          style={{ width: '100%', borderRadius: 8, background: '#000' }}
          autoPlay
          playsInline
          muted
        />
        <canvas
          ref={canvasRef}
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            pointerEvents: 'none',
            width: '100%',
            height: '100%',
          }}
        />
      </div>
      <div
        style={{
          position: 'absolute',
          bottom: '10%',
          left: '5%',
          padding: '0.5rem 1rem',
          background: 'rgba(0,0,0,0.5)',
          color: '#fff',
          fontSize: '2rem',
          borderRadius: '8px',
        }}
      >
        {prediction}
      </div>
      {/* Start/Stop Translating */}
      <button
        onClick={() => setTranslating(t => !t)}
        style={{
          position: 'absolute',
          bottom: '10%',
          left: '80%',
          padding: '0.5rem 1rem',
          fontSize: '1rem',
          borderRadius: '4px',
        }}
      >
        {translating ? 'Stop Translating' : 'Start Translating'}
      </button>
    </div>
  );
}

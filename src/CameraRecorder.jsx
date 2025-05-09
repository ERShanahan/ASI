import React, { useRef, useState, useEffect } from 'react';

export default function CameraRecorder() {
  const videoRef = useRef(null);
  const recorderRef = useRef(null);
  const [stream, setStream] = useState(null);
  const [recording, setRecording] = useState(false);
  const [facingMode, setFacingMode] = useState('user');

  // start or restart preview
  const startPreview = async () => {
    if (stream) {
      stream.getTracks().forEach(t => t.stop());
    }
    try {
      const newStream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode },
        audio: false
      });
      videoRef.current.srcObject = newStream;
      setStream(newStream);
    } catch (err) {
      console.error('Error accessing camera:', err);
    }
  };

  useEffect(() => {
    startPreview();
    return () => stream && stream.getTracks().forEach(t => t.stop());
  }, [facingMode]);

  // handle start/stop recording
  const handleRecord = () => {
    if (!recording) {
      const recorder = new MediaRecorder(stream, { mimeType: 'video/webm' });
      let chunks = [];
      recorder.ondataavailable = e => chunks.push(e.data);
      recorder.onstop = async () => {
        const blob = new Blob(chunks, { type: 'video/webm' });
        const form = new FormData();
        form.append('video', blob, 'capture.webm');
        try {
          const res = await fetch(
            import.meta.env.VITE_API_URL + '/upload',
            { method: 'POST', body: form }
          );
          const data = await res.json();
          alert('Backend says: ' + JSON.stringify(data));
        } catch (err) {
          console.error('Upload failed:', err);
        }
      };
      recorder.start();
      recorderRef.current = recorder;
    } else {
      recorderRef.current.stop();
    }
    setRecording(!recording);
  };

  return (
    <>
      <div className="video-container">
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted
        />
      </div>
      <div className="controls">
        <button className="button" onClick={handleRecord}>
          {recording ? 'Stop Recording' : 'Start Recording'}
        </button>
        <button
          className="button"
          onClick={() =>
            setFacingMode(m => (m === 'user' ? 'environment' : 'user'))
          }
        >
          Switch Camera
        </button>
      </div>
    </>
  );
}

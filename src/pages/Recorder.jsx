import React, { useRef, useState, useEffect } from 'react';

export default function Recorder() {
  const videoRef      = useRef(null);
  const canvasRef     = useRef(null);
  const captureReqRef = useRef(null);

  const [stream,     setStream    ] = useState(null);
  const [recording,  setRecording ] = useState(false);
  const [facingMode, setFacingMode] = useState('user');
  const [text,       setText      ] = useState('');
  const [loading,    setLoading   ] = useState(false);

  const API_URL = import.meta.env.VITE_API_URL + 'upload';

  const lastSentRef = useRef(0);
  const THROTTLE_MS = 1000;

  // 1. Start camera preview
  const startPreview = async () => {
    if (stream) stream.getTracks().forEach(t => t.stop());
    try {
      const newStream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode },
        audio: false
      });
      videoRef.current.srcObject = newStream;
      await videoRef.current.play();
      setStream(newStream);
    } catch (err) {
      console.error('Camera error:', err);
      setText('Unable to access camera');
    }
  };

  useEffect(() => {
    startPreview();
    return () => stream && stream.getTracks().forEach(t => t.stop());
  }, [facingMode]);

  useEffect(() => {
    if (recording) {
      // once recording turns true, kick off the loop
      captureReqRef.current = setInterval(captureFrame, THROTTLE_MS);
    } else {
      // when recording turns false, cancel it
      clearInterval(captureReqRef.current);
    }
  }, [recording]);

  // 2. Frame‐capture loop using requestAnimationFrame
  const captureFrame = () => {
    const now = performance.now();
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas || !recording) return;

    const ctx = canvas.getContext('2d');
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

    if (now - lastSentRef.current >= THROTTLE_MS){
      canvas.toBlob(async blob => {
        if (!blob) return;

        // build form and POST
        const form = new FormData();
        form.append('frame', blob, 'frame.jpg');

        try {
          const res = await fetch(API_URL, {
            method: 'POST',
            body: form
          });
          if (!res.ok) throw new Error(`Status ${res.status}`);
          const data = await res.json();
          setText(data.message ?? JSON.stringify(data));
        } catch (err) {
          console.error('Upload error:', err);
          setText(`Error: ${err.message}`);
        }
      }, 'image/jpeg');
      lastSentRef.current = now;
    }
  };  

  // 3. Handle start/stop recording
  const handleRecord = () => {
    if (!recording) {
      setText('');
      setLoading(false);
      const video = videoRef.current;
      canvasRef.current = document.createElement('canvas');
      canvasRef.current.width  = video.videoWidth;
      canvasRef.current.height = video.videoHeight;
      setRecording(true);
    } else {
      setRecording(false);
    }
  };

  return (
    <div style={{ width: '100%', maxWidth: 800, margin: 'auto' }}>
      <div className="video-container">
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted
          style={{ width: '100%', borderRadius: 8, background: '#000' }}
        />
      </div>

      <div className="api-response" >
        {!recording
          ? 'Press "Start Recording" to begin Translating'
          : loading
            ? 'Processing...'
            : text
        }
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
    </div>
  );
}


// export default function Recorder() {
//   const videoRef = useRef(null);
//   const recorderRef = useRef(null);
//   const [stream, setStream] = useState(null);
//   const [recording, setRecording] = useState(false);
//   const [facingMode, setFacingMode] = useState('user');
//   const [loading, setLoading] = useState(false);
//   const [text, setText] = useState('');

//   // init camera
//   const startPreview = async () => {
//     if (stream) stream.getTracks().forEach(t => t.stop());
//     try {
//       const newStream = await navigator.mediaDevices.getUserMedia({
//         video: { facingMode },
//         audio: false
//       });
//       videoRef.current.srcObject = newStream;
//       setStream(newStream);
//     } catch (err) {
//       console.error('Camera error:', err);
//       setText('Unable to access camera');
//     }
//   };

//   useEffect(() => {
//     startPreview();
//     return () => stream && stream.getTracks().forEach(t => t.stop());
//   }, [facingMode]);

//   // upload and extract text
//   const uploadBlob = async blob => {
//     setLoading(true);
//     setText('');
//     try {
//       const form = new FormData();
//       form.append('video', blob, 'capture.webm');

//       const res = await fetch(
//         import.meta.env.VITE_API_URL + '/upload',
//         { method: 'POST', body: form }
//       );
//       if (!res.ok) throw new Error(`Server ${res.status}`);
//       const data = await res.json();

//       // assume API returns { message: "some text" }
//       setText(data.message ?? JSON.stringify(data));
//     } catch (err) {
//       console.error('Upload failed:', err);
//       setText(`Error: ${err.message}`);
//     } finally {
//       setLoading(false);
//     }
//   };

//   // start/stop recording
//   const handleRecord = () => {
//     if (!recording) {
//       const recorder = new MediaRecorder(stream, { mimeType: 'video/webm' });
//       let chunks = [];
//       recorder.ondataavailable = e => chunks.push(e.data);
//       recorder.onstop = () => {
//         const blob = new Blob(chunks, { type: 'video/webm' });
//         uploadBlob(blob);
//       };
//       recorder.start();
//       recorderRef.current = recorder;
//       setText(''); // clear old text
//     } else {
//       recorderRef.current.stop();
//     }
//     setRecording(r => !r);
//   };

//   return (
//     <div style={{ width: '100%', maxWidth: 800 }}>
//       <div className="video-container">
//         <video ref={videoRef} autoPlay playsInline muted />
//       </div>

//       <div className="api-response">
//         {loading
//           ? 'Processing...'
//           : text
//           ? text
//           : 'Record a clip to Translate.'}
//       </div>

//       <div className="controls">
//         <button className="button" onClick={handleRecord}>
//           {recording ? 'Stop Recording' : 'Start Recording'}
//         </button>
//         <button
//           className="button"
//           onClick={() =>
//             setFacingMode(m => (m === 'user' ? 'environment' : 'user'))
//           }
//         >
//           Switch Camera
//         </button>
//       </div>

      
//     </div>
//   );
// }

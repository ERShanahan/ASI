import React from 'react';

export default function Home() {
  return (
    <div className="home-page">
      <h2>Welcome to AS Interpreter</h2>
      <p>Use this app to record ASL videos and get live translations.</p>
      <div className="examples">
        <div className="card">
          <h3>How it works</h3>
          <p>Record a short clip—we'll translate it into English.</p>
        </div>
        <div className="card">
          <h3>Tips</h3>
          <ul>
            <li>Keep your hand in frame.</li>
            <li>Good lighting helps recognition accuracy.</li>
          </ul>
        </div>
      </div>
    </div>
  );
}

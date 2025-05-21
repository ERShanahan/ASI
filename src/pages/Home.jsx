import React from 'react';
import { Link } from 'react-router-dom';
import './Home.css';

export default function Home() {
  return (
    <div className="home-container">
      {/* Parallax hero section */}
      <section className="parallax-section">
        <div className="parallax-overlay">
          <h1 className="app-title">American Sign Interpreter</h1>
          <Link to="/record" className="get-started-btn">
            Get Started
          </Link>
        </div>
      </section>

      {/* Info cards section */}
      <section className="info-section">
        <div className="info-card">
          <h2>Problem Statement</h2>
          <p>
            {/* Replace with actual problem statement text */}
            Describe the challenge that drives the need for an ASL interpreter.
          </p>
        </div>
        <div className="info-card">
          <h2>Mission Statement</h2>
          <p>
            {/* Replace with actual mission statement text */}
            Our mission is to bridge communication barriers by offering live sign
            language interpretation.
          </p>
        </div>
        <div className="info-card">
          <h2>Contact Information</h2>
          <p>
            {/* Replace with actual contact info */}
            Email: support@aslint.com
            <br /> Phone: (123) 456-7890
          </p>
        </div>
      </section>
    </div>
  );
}

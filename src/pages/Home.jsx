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
          <h2>
            Unfortunately, We only currently support finger spelling. Word-Level Support Coming soon!
          </h2>
        </div>
      </section>

      {/* Info cards section */}
      <section className="info-section">
        <div className="info-card">
          <h2>Problem</h2>
          <p>
            {/* Replace with actual problem statement text */}
            Current video-based gesture and sign-language tools are either too clunky, too inaccurate, or too narrowly focused. We need an intuitive, browser-based system that can track hand motion, recognize signs on the fly, and seamlessly translate into text.
          </p>
        </div>
        <div className="info-card">
          <h2>Mission</h2>
          <p>
            {/* Replace with actual mission statement text */}
            Our goal is to empower everyone—whether you’re deaf, hard of hearing, or simply looking to learn a new way of communicating—with a lightweight, accessible tool that’s as natural to use as having a conversation.
          </p>
        </div>
        <div className="info-card">
          <h2>Contact</h2>
          <p>
            {/* Replace with actual contact info */}
            My name is Ethan Shanahan, a senior Computer Science Major at Stevens Institute of Technology, looking to pursue a Masters in Machine Learning. I hope to provide widely available tools for everyone to use!
            Email: eshanaha@stevens.edu
          </p>
        </div>
      </section>
    </div>
  );
}

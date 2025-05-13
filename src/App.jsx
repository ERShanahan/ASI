import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Header from './components/Header';
import Footer from './components/Footer';
import Home from './pages/Home';
import Recorder from './pages/Recorder';
import Learn from './pages/Learn'
import './index.css';

export default function App() {
  return (
    <BrowserRouter>
      <div className="app-container">
        <Header />

        <main className="main-content">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/record" element={<Recorder />} />
            <Route path="/learn" element={<Learn />} />
          </Routes>
        </main>

        <Footer />
      </div>
    </BrowserRouter>
  );
}

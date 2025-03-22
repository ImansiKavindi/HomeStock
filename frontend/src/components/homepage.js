import React from 'react';
import '../css/homepage.css'; // New CSS file for HomePage styling
import { useNavigate } from 'react-router-dom'; // ✅ Import useNavigate

const HomePage = () => {

  const navigate = useNavigate(); // Hook for navigation

  const handleGetStarted = () => {
    navigate('/dashboard'); // Navigate to Dashboard page
  };


  return (
    <div className="homepage-container">
      {/* Navbar */}
      <nav className="navbar">
        <div className="navbar-container">
          <a href="/" className="logo">
            <img src="/images/logo.png" alt="HomeStock Logo" className="logo-img" />
            HomeStock
          </a>
          <ul className="nav-links">
            <li><a href="#features">Features</a></li>
            <li><a href="#about">About</a></li>
            <li><a href="#contact">Contact</a></li>
           
          </ul>
        </div>
      </nav>

      {/* Fullscreen Video and Text Side by Side */}
      <div className="hero-section">
  <div className="square-container">
    <div className="hero-text">
      <h1>Organize Your Home Effortlessly</h1>
      <p>Track inventory, budget, and plan meals with ease.</p>
      <button className="cta-button" onClick={handleGetStarted}>Get Started</button>
    </div>

    <div className="video-container">
      <video autoPlay loop muted>
        <source src="images/homevideo.mp4" type="video/mp4" />
        Your browser does not support the video tag.
      </video>
    </div>
  </div>
</div>

      
      {/* Features and other content can go below */}
    </div>
  );
};

export default HomePage;

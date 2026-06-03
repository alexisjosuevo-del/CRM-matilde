import React, { useState, useEffect } from 'react';
import './SplashScreen.css';

const SplashScreen = ({ onComplete }) => {
  const [phase, setPhase] = useState('enter'); // enter -> glow -> exit

  useEffect(() => {
    const glowTimer = setTimeout(() => setPhase('glow'), 800);
    const exitTimer = setTimeout(() => setPhase('exit'), 2200);
    const completeTimer = setTimeout(() => onComplete(), 3000);

    return () => {
      clearTimeout(glowTimer);
      clearTimeout(exitTimer);
      clearTimeout(completeTimer);
    };
  }, [onComplete]);

  return (
    <div className={`splash-screen ${phase}`}>
      {/* Animated background particles */}
      <div className="splash-particles">
        <div className="particle p1"></div>
        <div className="particle p2"></div>
        <div className="particle p3"></div>
        <div className="particle p4"></div>
        <div className="particle p5"></div>
        <div className="particle p6"></div>
      </div>

      {/* Logo container with glow ring */}
      <div className="splash-logo-wrapper">
        <div className="splash-glow-ring"></div>
        <div className="splash-logo-container">
          <img src="/logo.jpeg" alt="Logo Matilde" className="splash-logo" />
        </div>
        <div className="splash-brand-name">Matilde</div>
        <div className="splash-tagline">Tu CRM inteligente</div>
      </div>

      {/* Loading bar */}
      <div className="splash-loader">
        <div className="splash-loader-bar"></div>
      </div>
    </div>
  );
};

export default SplashScreen;

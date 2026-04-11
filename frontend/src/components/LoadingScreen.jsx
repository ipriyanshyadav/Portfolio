import React, { useEffect, useState } from 'react';
import './LoadingScreen.css';

const LoadingScreen = ({ isLoading }) => {
  const [visible, setVisible] = useState(true);
  const [fading, setFading] = useState(false);

  useEffect(() => {
    if (!isLoading) {
      setFading(true);
      const timer = setTimeout(() => setVisible(false), 600);
      return () => clearTimeout(timer);
    }
  }, [isLoading]);

  if (!visible) return null;

  // Generate animated particles
  const particles = Array.from({ length: 12 }, (_, i) => ({
    id: i,
    angle: (i * 30) * (Math.PI / 180),
  }));

  return (
    <div className={`loading-overlay ${fading ? 'loading-overlay_fade' : ''}`}>
      <div className="loading-content">
        {/* Glass spinner */}
        <div className="glass-spinner">
          <div className="glass-spinner__inner">
            <div className="glass-spinner__orb" />
            <div className="glass-spinner__ring" />
          </div>

          {/* Animated particles */}
          <div className="particle-ring">
            {particles.map((particle) => (
              <div
                key={particle.id}
                className="particle"
                style={{
                  '--angle': `${particle.id * 30}deg`,
                  '--delay': `${particle.id * 0.08}s`,
                }}
              />
            ))}
          </div>
        </div>

        {/* Loading text */}
        <div className="loading-text">
          <span className="loading-text__dot">.</span>
          <span className="loading-text__dot">.</span>
          <span className="loading-text__dot">.</span>
        </div>
      </div>
    </div>
  );
};

export default LoadingScreen;

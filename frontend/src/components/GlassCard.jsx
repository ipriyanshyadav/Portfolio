import { useState, useRef } from 'react';

export default function GlassCard({ children, className = '', onClick }) {
  const [isHovered, setIsHovered] = useState(false);
  const cardRef = useRef(null);

  const handleMouseMove = (e) => {
    if (!cardRef.current) return;

    const rect = cardRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const centerX = rect.width / 2;
    const centerY = rect.height / 2;

    const rotateX = ((y - centerY) / centerY) * -12;
    const rotateY = ((x - centerX) / centerX) * 12;

    cardRef.current.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.02, 1.02, 1.02)`;
  };

  const handleMouseEnter = () => {
    setIsHovered(true);
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    if (cardRef.current) {
      cardRef.current.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)';
    }
  };

  return (
    <div
      ref={cardRef}
      onClick={onClick}
      onMouseMove={handleMouseMove}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      className={`glass-card ${isHovered ? 'glass-card--hovered' : ''} ${className}`}
      style={{
        transition: 'transform 0.15s ease-out',
        cursor: onClick ? 'pointer' : 'default',
      }}
    >
      <style>{`
        .glass-card {
          background: rgba(255, 255, 255, 0.03);
          backdrop-filter: blur(20px);
          -webkit-backdrop-filter: blur(20px);
          border: 1px solid rgba(255, 255, 255, 0.15);
          border-radius: 20px;
          box-shadow:
            0 0 20px rgba(0, 122, 255, 0.1),
            0 0 40px rgba(0, 122, 255, 0.05),
            inset 0 0 20px rgba(255, 255, 255, 0.02);
          padding: 24px;
          position: relative;
          overflow: hidden;
        }

        .glass-card::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: radial-gradient(
            circle at var(--mouse-x, 50%) var(--mouse-y, 50%),
            rgba(255, 255, 255, 0.08) 0%,
            transparent 60%
          );
          opacity: 0;
          transition: opacity 0.3s ease;
          pointer-events: none;
        }

        .glass-card--hovered::before {
          opacity: 1;
        }

        .glass-card--hovered {
          box-shadow:
            0 0 30px rgba(0, 122, 255, 0.2),
            0 0 60px rgba(0, 122, 255, 0.1),
            inset 0 0 30px rgba(255, 255, 255, 0.03);
          border-color: rgba(0, 122, 255, 0.4);
        }
      `}</style>
      {children}
    </div>
  );
}

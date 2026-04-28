import React, { useEffect, useRef } from 'react';
import { Box } from '@mui/material';

const ParticleField = () => {
  const containerRef = useRef(null);

  useEffect(() => {
    if (!containerRef.current) return;
    
    const container = containerRef.current;
    container.innerHTML = '';
    
    const particleCount = 60;
    for (let i = 0; i < particleCount; i++) {
      const p = document.createElement('div');
      p.className = 'particle';
      
      const size = Math.random() * 2 + 1;
      const x = Math.random() * 100;
      const y = Math.random() * 100;
      const opacity = Math.random() * 0.5 + 0.1;
      const duration = Math.random() * 20 + 10;
      const delay = Math.random() * -20;

      Object.assign(p.style, {
        position: 'absolute',
        width: `${size}px`,
        height: `${size}px`,
        background: 'white',
        borderRadius: '50%',
        opacity: opacity,
        top: `${y}%`,
        left: `${x}%`,
        boxShadow: '0 0 10px rgba(255, 255, 255, 0.5)',
        animation: `float ${duration}s linear infinite`,
        animationDelay: `${delay}s`
      });
      
      container.appendChild(p);
    }
  }, []);

  return (
    <Box 
      ref={containerRef} 
      sx={{ 
        position: 'fixed', 
        top: 0, 
        left: 0, 
        width: '100%', 
        height: '100%', 
        zIndex: -1, 
        pointerEvents: 'none',
        overflow: 'hidden',
        '@keyframes float': {
          '0%': { transform: 'translateY(0) translateX(0)', opacity: 0 },
          '10%': { opacity: 0.5 },
          '90%': { opacity: 0.5 },
          '100%': { transform: 'translateY(-100vh) translateX(20px)', opacity: 0 }
        }
      }} 
    />
  );
};

export default ParticleField;

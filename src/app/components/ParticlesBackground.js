'use client';

import { useEffect, useRef } from 'react';

export default function ParticlesBackground() {
  const starsRef = useRef(null);

  useEffect(() => {
    if (!starsRef.current) return;
    const container = starsRef.current;
    container.innerHTML = '';
    const numberOfStars = 120;
    const w = window.innerWidth;
    const h = window.innerHeight;
    for (let i = 0; i < numberOfStars; i++) {
      const star = document.createElement('div');
      star.className = 'star';
      // Tamaños pequeños aleatorios
      const size = Math.random() * 2.2 + 0.6;
      star.style.width = `${size}px`;
      star.style.height = `${size}px`;
      // Posición aleatoria
      star.style.left = `${Math.random() * w}px`;
      star.style.top = `${Math.random() * h}px`;
      // Opacidad y animación aleatoria
      star.style.opacity = (Math.random() * 0.5 + 0.5).toString();
      star.style.animationDuration = `${Math.random() * 2 + 3}s`;
      star.style.animationDelay = `${Math.random() * 4}s`;
      container.appendChild(star);
    }
    // Regenerar al redimensionar
    const handleResize = () => {
      container.innerHTML = '';
      const w = window.innerWidth;
      const h = window.innerHeight;
      for (let i = 0; i < numberOfStars; i++) {
        const star = document.createElement('div');
        star.className = 'star';
        const size = Math.random() * 2.2 + 0.6;
        star.style.width = `${size}px`;
        star.style.height = `${size}px`;
        star.style.left = `${Math.random() * w}px`;
        star.style.top = `${Math.random() * h}px`;
        star.style.opacity = (Math.random() * 0.5 + 0.5).toString();
        star.style.animationDuration = `${Math.random() * 2 + 3}s`;
        star.style.animationDelay = `${Math.random() * 4}s`;
        container.appendChild(star);
      }
    };
    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
      container.innerHTML = '';
    };
  }, []);
  return <div className="stars" ref={starsRef} />;
}

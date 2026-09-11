import React, { useEffect, useState } from 'react';

export function MagicParticles({ className = '' }) {
  const [particles, setParticles] = useState([]);

  useEffect(() => {
    // Generate 40 magical floating particles
    const newParticles = Array.from({ length: 40 }).map((_, i) => ({
      id: i,
      left: Math.random() * 100, // %
      top: 100 + Math.random() * 20, // Start slightly below bottom
      size: Math.random() * 3 + 1.5, // px
      duration: Math.random() * 25 + 15, // seconds (very slow)
      delay: Math.random() * -40, // seconds (staggered start)
      opacity: Math.random() * 0.4 + 0.1,
    }));
    setParticles(newParticles);
  }, []);

  return (
    <div className={`fixed inset-0 pointer-events-none -z-10 overflow-hidden ${className}`} aria-hidden="true">
      {particles.map(p => (
        <div
          key={p.id}
          className="absolute rounded-full bg-[#d8b770] shadow-[0_0_8px_rgba(216,183,112,0.8)]"
          style={{
            left: `${p.left}%`,
            top: `${p.top}%`,
            width: `${p.size}px`,
            height: `${p.size}px`,
            opacity: p.opacity,
            animation: `float-particle ${p.duration}s linear infinite`,
            animationDelay: `${p.delay}s`,
          }}
        />
      ))}
      <style dangerouslySetInnerHTML={{__html: `
        @keyframes float-particle {
          0% { transform: translateY(0) scale(1); opacity: 0; }
          15% { opacity: 1; }
          50% { transform: translateY(-60vh) scale(1.5); }
          85% { opacity: 1; }
          100% { transform: translateY(-120vh) scale(0.5); opacity: 0; }
        }
      `}} />
    </div>
  );
}

export function MagicBackground() {
  return (
    <div className="fixed inset-0 pointer-events-none -z-10 overflow-hidden select-none bg-[#070908]" aria-hidden="true">
      <div className="absolute -inset-[20%] opacity-70" style={{
        background: 'radial-gradient(circle at 24% 20%, rgba(42,93,78,.15), transparent 30%), radial-gradient(circle at 76% 72%, rgba(104,68,35,.15), transparent 35%), linear-gradient(135deg,#070908 10%,#0d1512 48%,#080907 82%)'
      }} />
      <MagicParticles />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_30%,rgba(0,0,0,.58)_100%)]" />
    </div>
  );
}

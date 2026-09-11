import React, { useEffect, useRef } from 'react';

export function MagicBackground() {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };
    window.addEventListener('resize', handleResize);

    // Subtle Magic Mana Motes (35 particles)
    const particleCount = 35;
    const colors = [
      'rgba(245, 158, 11, ',   // Gold / Amber
      'rgba(251, 191, 36, ',   // Warm Yellow
      'rgba(56, 189, 248, ',   // Arcane Cyan
      'rgba(168, 85, 247, ',   // Mystic Purple
      'rgba(244, 63, 94, '     // Rose Ember
    ];

    const particles = Array.from({ length: particleCount }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      size: Math.random() * 2.2 + 0.8,
      speedY: Math.random() * 0.45 + 0.15,
      speedX: (Math.random() - 0.5) * 0.25,
      color: colors[Math.floor(Math.random() * colors.length)],
      baseAlpha: Math.random() * 0.35 + 0.15,
      pulseSpeed: Math.random() * 0.02 + 0.01,
      pulseOffset: Math.random() * Math.PI * 2
    }));

    let time = 0;

    const render = () => {
      time += 0.02;
      ctx.clearRect(0, 0, width, height);

      for (let i = 0; i < particleCount; i++) {
        const p = particles[i];
        p.y -= p.speedY;
        p.x += Math.sin(time + p.pulseOffset) * 0.3 + p.speedX;

        // Reset when exiting top
        if (p.y < -10) {
          p.y = height + 10;
          p.x = Math.random() * width;
        }
        if (p.x < -10) p.x = width + 10;
        if (p.x > width + 10) p.x = -10;

        const alpha = p.baseAlpha + Math.sin(time * 2 + p.pulseOffset) * 0.1;
        const currentAlpha = Math.max(0.05, Math.min(0.6, alpha));

        // Soft glowing mana particle
        const gradient = ctx.createRadialGradient(
          p.x,
          p.y,
          0,
          p.x,
          p.y,
          p.size * 3
        );
        gradient.addColorStop(0, p.color + currentAlpha + ')');
        gradient.addColorStop(0.5, p.color + currentAlpha * 0.4 + ')');
        gradient.addColorStop(1, p.color + '0)');

        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size * 3, 0, Math.PI * 2);
        ctx.fill();

        // Crisp center core
        ctx.fillStyle = p.color + (currentAlpha + 0.2) + ')';
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size * 0.7, 0, Math.PI * 2);
        ctx.fill();
      }

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <div className="fixed inset-0 pointer-events-none -z-10 overflow-hidden select-none">
      {/* Deep Obsidian & Arcane Nebula Atmospheric Gradient */}
      <div className="absolute inset-0 bg-[#070709]" />

      {/* Pulsing Arcane Ambient Glow 1 (Warm Gold / Amber) */}
      <div
        className="absolute top-[-15%] left-[20%] w-[55vw] h-[55vw] rounded-full bg-amber-600/10 blur-[120px] animate-pulse"
        style={{ animationDuration: '9s' }}
      />

      {/* Pulsing Arcane Ambient Glow 2 (Mystic Indigo / Violet) */}
      <div
        className="absolute bottom-[-10%] right-[15%] w-[50vw] h-[50vw] rounded-full bg-indigo-700/10 blur-[130px] animate-pulse"
        style={{ animationDuration: '12s' }}
      />

      {/* Floating Interactive Mana Particles Canvas */}
      <canvas ref={canvasRef} className="absolute inset-0 block w-full h-full" />

      {/* Vignette border for depth */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_transparent_45%,_rgba(0,0,0,0.85)_100%)] pointer-events-none" />
    </div>
  );
}

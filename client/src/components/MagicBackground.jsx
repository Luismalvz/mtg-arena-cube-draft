import React from 'react';

export function MagicBackground() {
  return (
    <div className="fixed inset-0 pointer-events-none -z-10 overflow-hidden select-none">
      {/* Deep, clean obsidian background defined by index.css base styles, 
          but we can add a very subtle glow layer here for depth */}
      <div 
        className="absolute top-[-20%] left-[-10%] w-[60vw] h-[60vw] rounded-full bg-slate-800/15 blur-[120px]" 
      />
      <div 
        className="absolute bottom-[-20%] right-[-10%] w-[50vw] h-[50vw] rounded-full bg-amber-900/10 blur-[130px]" 
      />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_transparent_0%,_rgba(0,0,0,0.6)_100%)]" />
    </div>
  );
}

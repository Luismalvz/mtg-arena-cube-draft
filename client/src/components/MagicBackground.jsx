import React from 'react';

export function MagicBackground() {
  return (
    <div className="fixed inset-0 pointer-events-none -z-10 overflow-hidden select-none bg-[#070908]" aria-hidden="true">
      <div className="absolute -inset-[20%] opacity-70" style={{
        background: 'radial-gradient(circle at 24% 20%, rgba(42,93,78,.28), transparent 28%), radial-gradient(circle at 76% 72%, rgba(104,68,35,.2), transparent 30%), linear-gradient(135deg,#070908 10%,#0d1512 48%,#080907 82%)'
      }} />
      <div className="absolute -left-[18vw] top-[8vh] h-[48vw] w-[48vw] rounded-full blur-[90px]" style={{ background: 'rgba(38,117,92,.13)', animation: 'drift-a 18s ease-in-out infinite alternate' }} />
      <div className="absolute -right-[15vw] bottom-[-16vw] h-[52vw] w-[52vw] rounded-full blur-[110px]" style={{ background: 'rgba(181,119,48,.11)', animation: 'drift-b 22s ease-in-out infinite alternate' }} />
      <div className="absolute inset-0 opacity-[.035]" style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=%220 0 180 180%22 xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cfilter id=%22n%22%3E%3CfeTurbulence type=%22fractalNoise%22 baseFrequency=%22.9%22 numOctaves=%223%22 stitchTiles=%22stitch%22/%3E%3C/filter%3E%3Crect width=%22100%25%22 height=%22100%25%22 filter=%22url(%23n)%22 opacity=%22.8%22/%3E%3C/svg%3E")', animation: 'grain-step 9s steps(2) infinite' }} />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_30%,rgba(0,0,0,.58)_100%)]" />
    </div>
  );
}

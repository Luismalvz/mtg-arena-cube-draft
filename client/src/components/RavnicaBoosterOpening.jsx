import React, { useCallback, useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import { sound } from '../utils/audio';
import { ManaCost } from '../utils/manaSymbols';
import './RavnicaBoosterOpening.css';

// Geometry helpers
const normalize = v => {
  const len = Math.hypot(v.x, v.y) || 1;
  return { x: v.x / len, y: v.y / len };
};
const crossSign = (A, d, P) => d.x * (P.y - A.y) - d.y * (P.x - A.x);
const segIntersect = (p1, p2, A, d) => {
  const r = { x: p2.x - p1.x, y: p2.y - p1.y };
  const denom = r.x * d.y - r.y * d.x;
  if (Math.abs(denom) < 1e-9) return p2;
  const t = ((A.x - p1.x) * d.y - (A.y - p1.y) * d.x) / denom;
  return { x: p1.x + r.x * t, y: p1.y + r.y * t };
};
const clipBySide = (poly, A, d, keepPositive) => {
  const out = [];
  const n = poly.length;
  for (let i = 0; i < n; i++) {
    const curr = poly[i], next = poly[(i + 1) % n];
    const currSide = crossSign(A, d, curr), nextSide = crossSign(A, d, next);
    const currIn = keepPositive ? currSide >= 0 : currSide <= 0;
    const nextIn = keepPositive ? nextSide >= 0 : nextSide <= 0;
    if (currIn) out.push(curr);
    if (currIn !== nextIn) out.push(segIntersect(curr, next, A, d));
  }
  return out;
};
const polyToClipPath = (poly, w, h) => {
  const pts = poly.map(p => `${(p.x / w * 100).toFixed(2)}% ${(p.y / h * 100).toFixed(2)}%`);
  return `polygon(${pts.join(',')})`;
};

export function RavnicaBoosterOpening({ round = 1, totalPacks = 3, cards = [], onFinishOpening }) {
  const [stage, setStage] = useState('sealed'); // sealed, ripping, emerging, fanned
  const [hovered, setHovered] = useState(null);

  const packHitzone = useRef(null);
  const packStage = useRef(null);
  const packArt = useRef(null);
  const canvasRef = useRef(null);
  
  const gestureBuf = useRef([]);
  const trailBuf = useRef([]);
  const isDown = useRef(false);
  const cutState = useRef({ inProgress: false, done: false });

  const WINDOW_MS = 260;
  const TRAIL_MS = 220;

  const displayCards = cards.length ? cards : Array.from({ length: 15 }, (_, i) => ({ instanceId: `placeholder-${i}`, name: `Carta ${i + 1}`, type_line: 'Ravnica', mana_cost: '{2}{U}{B}' }));
  const mid = (displayCards.length - 1) / 2;
  const spacing = Math.min(30, Math.max(17, ((typeof window !== 'undefined' ? window.innerWidth : 1200) - 130) / Math.max(1, displayCards.length)));

  const spawnFlash = (A, B) => {
    if (!packStage.current) return;
    const flash = document.createElement('div');
    flash.className = 'cut-flash';
    const midPt = { x: (A.x + B.x) / 2, y: (A.y + B.y) / 2 };
    const angle = Math.atan2(B.y - A.y, B.x - A.x) * 180 / Math.PI;
    const len = Math.hypot(B.x - A.x, B.y - A.y) * 1.15;
    flash.style.left = `${midPt.x}px`;
    flash.style.top = `${midPt.y}px`;
    flash.style.width = `${len}px`;
    flash.style.transform = `translate(-50%,-50%) rotate(${angle}deg)`;
    packStage.current.appendChild(flash);
    flash.animate([{ opacity: 0 }, { opacity: 1, offset: .25 }, { opacity: 0 }], { duration: 380, easing: 'ease-out' }).onfinish = () => flash.remove();
  };

  const spawnSparks = (A, B) => {
    if (!packStage.current) return;
    const midPt = { x: (A.x + B.x) / 2, y: (A.y + B.y) / 2 };
    for (let i = 0; i < 10; i++) {
      const s = document.createElement('div');
      s.className = 'spark';
      s.style.left = `${midPt.x}px`;
      s.style.top = `${midPt.y}px`;
      packStage.current.appendChild(s);
      const ang = Math.random() * Math.PI * 2;
      const dist = 26 + Math.random() * 46;
      s.animate([
        { transform: 'translate(-50%,-50%) translate(0,0)', opacity: 1 },
        { transform: `translate(-50%,-50%) translate(${Math.cos(ang) * dist}px,${Math.sin(ang) * dist}px)`, opacity: 0 }
      ], { duration: 480 + Math.random() * 220, easing: 'ease-out' }).onfinish = () => s.remove();
    }
  };

  const triggerCut = (A, B) => {
    if (cutState.current.inProgress || cutState.current.done) return;
    cutState.current.inProgress = true;
    sound.playPackRip();

    const rect = packStage.current.getBoundingClientRect();
    const w = rect.width, h = rect.height;
    const d = normalize({ x: B.x - A.x, y: B.y - A.y });
    const rectPoly = [{ x: 0, y: 0 }, { x: w, y: 0 }, { x: w, y: h }, { x: 0, y: h }];
    const polyPos = clipBySide(rectPoly, A, d, true);
    const polyNeg = clipBySide(rectPoly, A, d, false);

    const halfA = packArt.current.cloneNode(true);
    const halfB = packArt.current.cloneNode(true);
    halfA.className = 'pack-half';
    halfB.className = 'pack-half';
    halfA.style.clipPath = polyToClipPath(polyPos, w, h);
    halfB.style.clipPath = polyToClipPath(polyNeg, w, h);
    packStage.current.appendChild(halfA);
    packStage.current.appendChild(halfB);
    packArt.current.style.opacity = '0';

    const n = { x: -d.y, y: d.x };
    const throwDist = Math.max(w, h) * 0.85;

    halfA.animate([
      { transform: 'translate(0px,0px) rotate(0deg)', opacity: 1 },
      { transform: `translate(${n.x * throwDist}px,${n.y * throwDist + 50}px) rotate(12deg)`, opacity: 0 }
    ], { duration: 620, easing: 'cubic-bezier(.2,.7,.3,1)', fill: 'forwards' });

    const animB = halfB.animate([
      { transform: 'translate(0px,0px) rotate(0deg)', opacity: 1 },
      { transform: `translate(${-n.x * throwDist}px,${-n.y * throwDist + 50}px) rotate(-12deg)`, opacity: 0 }
    ], { duration: 620, easing: 'cubic-bezier(.2,.7,.3,1)', fill: 'forwards' });

    spawnFlash(A, B);
    spawnSparks(A, B);

    setStage('ripping');

    animB.onfinish = () => {
      halfA.remove();
      halfB.remove();
      cutState.current.inProgress = false;
      cutState.current.done = true;
      setStage('emerging');
      sound.playShuffle();
      setTimeout(() => { setStage('fanned'); sound.playFanfare(); }, 800);
    };
  };

  const tryEvaluate = () => {
    if (cutState.current.done || cutState.current.inProgress) return;
    if (gestureBuf.current.length < 2) return;
    const first = gestureBuf.current[0];
    const last = gestureBuf.current[gestureBuf.current.length - 1];
    const net = Math.hypot(last.x - first.x, last.y - first.y);
    let pathLen = 0;
    for (let i = 1; i < gestureBuf.current.length; i++) {
      pathLen += Math.hypot(gestureBuf.current[i].x - gestureBuf.current[i - 1].x, gestureBuf.current[i].y - gestureBuf.current[i - 1].y);
    }
    const straightness = pathLen > 0 ? net / pathLen : 0;
    const hitRect = packHitzone.current.getBoundingClientRect();
    const diag = Math.hypot(hitRect.width, hitRect.height);

    if (net > diag * 0.35 && straightness > 0.5) {
      const stageRect = packStage.current.getBoundingClientRect();
      const A = { x: first.x - stageRect.left, y: first.y - stageRect.top };
      const B = { x: last.x - stageRect.left, y: last.y - stageRect.top };
      triggerCut(A, B);
    }
  };

  const pushGesturePoint = e => {
    const p = { x: e.clientX, y: e.clientY, t: performance.now() };
    gestureBuf.current.push(p);
    const cutoff = p.t - WINDOW_MS;
    while (gestureBuf.current.length && gestureBuf.current[0].t < cutoff) gestureBuf.current.shift();
    trailBuf.current.push(p);
    return p;
  };

  const onPointerDown = e => {
    if (cutState.current.done || cutState.current.inProgress) return;
    if (e.pointerType !== 'mouse') {
      isDown.current = true;
      gestureBuf.current = [];
      pushGesturePoint(e);
      e.currentTarget.setPointerCapture?.(e.pointerId);
    }
  };
  const onPointerMove = e => {
    if (cutState.current.done || cutState.current.inProgress) return;
    if (e.pointerType === 'mouse' || isDown.current) {
      pushGesturePoint(e);
      tryEvaluate();
    }
  };
  const onPointerUp = e => {
    if (e.pointerType !== 'mouse') {
      isDown.current = false;
      tryEvaluate();
      gestureBuf.current = [];
    }
  };
  const onPointerLeave = () => {
    if (!cutState.current.done && !cutState.current.inProgress) gestureBuf.current = [];
  };

  const manualCut = () => {
    if (cutState.current.done || cutState.current.inProgress || !packStage.current) return;
    const rect = packStage.current.getBoundingClientRect();
    triggerCut({ x: rect.width * 0.06, y: rect.height * 0.14 }, { x: rect.width * 0.94, y: rect.height * 0.86 });
  };

  useEffect(() => {
    const key = event => {
      if (!['Enter', ' '].includes(event.key)) return; event.preventDefault();
      if (stage === 'sealed') manualCut(); else if (stage === 'ripping' || stage === 'emerging') setStage('fanned'); else onFinishOpening?.();
    };
    window.addEventListener('keydown', key); return () => window.removeEventListener('keydown', key);
  }, [stage, onFinishOpening]);

  useEffect(() => {
    const resizeCanvas = () => {
      if (!canvasRef.current || !packHitzone.current) return;
      const rect = packHitzone.current.getBoundingClientRect();
      const dpr = window.devicePixelRatio || 1;
      canvasRef.current.width = Math.max(1, rect.width * dpr);
      canvasRef.current.height = Math.max(1, rect.height * dpr);
      canvasRef.current.style.width = `${rect.width}px`;
      canvasRef.current.style.height = `${rect.height}px`;
      const ctx = canvasRef.current.getContext('2d');
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    window.addEventListener('resize', resizeCanvas);
    resizeCanvas();
    return () => window.removeEventListener('resize', resizeCanvas);
  }, [stage]);

  useEffect(() => {
    if (stage !== 'sealed') return;
    let animId;
    const drawTrail = () => {
      if (!canvasRef.current || !packHitzone.current) return;
      const ctx = canvasRef.current.getContext('2d');
      const rect = packHitzone.current.getBoundingClientRect();
      ctx.clearRect(0, 0, rect.width, rect.height);
      const now = performance.now();
      trailBuf.current = trailBuf.current.filter(p => now - p.t < TRAIL_MS);
      if (trailBuf.current.length > 1) {
        for (let i = 1; i < trailBuf.current.length; i++) {
          const a = trailBuf.current[i - 1], b = trailBuf.current[i];
          const age = (now - b.t) / TRAIL_MS;
          const alpha = Math.max(0, 1 - age);
          ctx.beginPath();
          ctx.moveTo(a.x - rect.left, a.y - rect.top);
          ctx.lineTo(b.x - rect.left, b.y - rect.top);
          ctx.lineCap = 'round';
          ctx.lineWidth = 4 * alpha + 1;
          ctx.strokeStyle = `rgba(255,255,255,${0.85 * alpha})`;
          ctx.shadowColor = 'rgba(41,217,194,0.9)';
          ctx.shadowBlur = 10 * alpha;
          ctx.stroke();
        }
      }
      animId = requestAnimationFrame(drawTrail);
    };
    animId = requestAnimationFrame(drawTrail);
    return () => cancelAnimationFrame(animId);
  }, [stage]);

  return <div className="booster-overlay" role="dialog" aria-modal="true" aria-label={`Abrir sobre ${round}`}>
    <div className="booster-copy">
      <span>{String(round).padStart(2, '0')} / {String(totalPacks).padStart(2, '0')}</span>
      <strong>{stage === 'fanned' ? 'Ravnica revelada' : 'Ravnica Remastered'}</strong>
    </div>

    <div className="pack-zone">
      {stage === 'sealed' && (
        <div ref={packHitzone} className="pack-hitzone" onPointerDown={onPointerDown} onPointerMove={onPointerMove} onPointerUp={onPointerUp} onPointerCancel={onPointerUp} onPointerLeave={onPointerLeave}>
          <canvas ref={canvasRef} className="trail-canvas" />
          <div ref={packStage} className="pack-stage">
            <div ref={packArt} className="pack-art">
              <div className="pack-foil" />
              <div className="pack-shine" />
              <div className="pack-frame">
                <div className="pack-brand">RAVNICA</div>
                <div className="pack-emblem" aria-hidden="true">
                  <svg viewBox="0 0 64 64" fill="none">
                    <polygon points="32,4 54,20 46,52 18,52 10,20" stroke="#fff" strokeWidth="2" strokeOpacity=".9" />
                    <polygon points="32,16 44,25 39,44 25,44 20,25" fill="#fff" fillOpacity=".85" />
                  </svg>
                </div>
                <div className="pack-type">Sobre Booster<br />Ravnica Cube</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {stage === 'sealed' && <p className="astra-instructions">Pasa el mouse de un lado a otro para cortar</p>}
      {stage === 'sealed' && <button className="tap-fallback" onClick={manualCut}>Abrir con un toque</button>}
    </div>

    <div className="fanned-cards-container">
      <AnimatePresence>
        {(stage === 'emerging' || stage === 'fanned') && displayCards.map((card, index) => {
          const offset = index - mid, isHovered = hovered === index;
          const x = stage === 'fanned' ? offset * spacing : 0;
          const y = stage === 'fanned' ? Math.abs(offset) * 4 - 28 : 120;
          return <motion.div key={card.instanceId || index} className="fanned-card" initial={{ y: 130, scale: .72, opacity: 0 }} animate={{ x, y: isHovered ? y - 38 : y, rotateZ: stage === 'fanned' ? offset * 2.6 : 0, scale: isHovered ? 1.2 : 1, opacity: 1, zIndex: isHovered ? 80 : 30 + index }} transition={{ type: 'spring', stiffness: 250, damping: 24, delay: stage === 'fanned' ? index * .018 : 0 }} onMouseEnter={() => setHovered(index)} onMouseLeave={() => setHovered(null)}>
            <div className="booster-card">
              {card.image_url ? <img src={card.image_url} alt={card.name} /> : <div className="booster-card-fallback"><strong>{card.name}</strong><span>{card.type_line}</span><ManaCost manaCost={card.mana_cost} size="xs" /></div>}
            </div>
          </motion.div>;
        })}
      </AnimatePresence>
    </div>

    {stage === 'fanned' && <motion.button initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} onClick={onFinishOpening} className="booster-continue">Draft <ArrowRight className="h-4 w-4" /></motion.button>}
  </div>;
}

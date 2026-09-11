import React, { useCallback, useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import { sound } from '../utils/audio';
import { ManaCost } from '../utils/manaSymbols';
import './RavnicaBoosterOpening.css';

const BOOSTER_IMAGE = '/collector-booster.png';

export function RavnicaBoosterOpening({ round = 1, totalPacks = 3, cards = [], onFinishOpening }) {
  const [stage, setStage] = useState('sealed');
  const [tear, setTear] = useState(0);
  const [dragging, setDragging] = useState(false);
  const [hovered, setHovered] = useState(null);
  const startX = useRef(0);
  const packRef = useRef(null);

  const open = useCallback(() => {
    if (stage !== 'sealed') return;
    setTear(1); sound.playPackRip(); setStage('ripping');
    setTimeout(() => { sound.playShuffle(); setStage('emerging'); }, 520);
    setTimeout(() => { sound.playFanfare(); setStage('fanned'); }, 1250);
  }, [stage]);

  const pointerDown = event => {
    if (stage !== 'sealed') return;
    startX.current = event.clientX; setDragging(true); event.currentTarget.setPointerCapture?.(event.pointerId);
  };
  const pointerMove = event => {
    if (!dragging || stage !== 'sealed' || !packRef.current) return;
    const distance = Math.max(0, event.clientX - startX.current);
    setTear(Math.min(1, distance / (packRef.current.getBoundingClientRect().width * .72)));
  };
  const pointerUp = () => { if (!dragging) return; setDragging(false); if (tear > .58) open(); else setTear(0); };

  useEffect(() => {
    const key = event => {
      if (!['Enter',' '].includes(event.key)) return; event.preventDefault();
      if (stage === 'sealed') open(); else if (stage === 'ripping' || stage === 'emerging') setStage('fanned'); else onFinishOpening?.();
    };
    window.addEventListener('keydown', key); return () => window.removeEventListener('keydown', key);
  }, [stage, open, onFinishOpening]);

  const displayCards = cards.length ? cards : Array.from({ length: 15 }, (_, i) => ({ instanceId:`placeholder-${i}`, name:`Carta ${i+1}`, type_line:'Ravnica', mana_cost:'{2}{U}{B}' }));
  const mid = (displayCards.length - 1) / 2;
  const spacing = Math.min(30, Math.max(17, ((typeof window !== 'undefined' ? window.innerWidth : 1200) - 130) / Math.max(1, displayCards.length)));

  return <div className="booster-overlay" role="dialog" aria-modal="true" aria-label={`Abrir sobre ${round}`}>
    <div className="booster-copy"><span>{String(round).padStart(2,'0')} / {String(totalPacks).padStart(2,'0')}</span><strong>{stage === 'fanned' ? 'Ravnica revelada' : 'Ravnica Remastered'}</strong></div>
    <div className="booster-stage">
      <motion.div ref={packRef} className={`booster-pack-wrapper ${dragging ? 'is-dragging' : ''}`} onPointerDown={pointerDown} onPointerMove={pointerMove} onPointerUp={pointerUp} onPointerCancel={pointerUp} animate={stage === 'sealed' ? { y:[0,-7,0], rotateZ:[-.5,.5,-.5] } : stage === 'ripping' ? { x:[0,-4,5,-2,0], scale:.985 } : { y:110, scale:.82, opacity: stage === 'fanned' ? .15 : .55 }} transition={stage === 'sealed' ? { duration:4, repeat:Infinity, ease:'easeInOut' } : { duration:.48 }}>
        <div className="booster-body"><img src={BOOSTER_IMAGE} alt="Sobre Ravnica Remastered" /><div className="booster-foil-sheen" /></div>
        <motion.div className="booster-top" animate={stage === 'sealed' ? {} : { x:150, y:-40, rotate:18, opacity:0 }} transition={{ duration:.62, ease:[.2,.8,.2,1] }}><img src={BOOSTER_IMAGE} alt="" /><div className="booster-crimp-top" /></motion.div>
        <div className="booster-tear-zone"><div className="booster-tear-track"><div className="booster-tear-progress" style={{ width:`${tear*100}%` }} /><div className="booster-tear-handle" style={{ left:`calc(${tear*100}% - 12px)` }}>›</div></div></div>
        {stage !== 'sealed' && <div className="booster-tear-flash" />}
      </motion.div>

      <div className="fanned-cards-container">
        <AnimatePresence>{(stage === 'emerging' || stage === 'fanned') && displayCards.map((card,index) => {
          const offset = index-mid, isHovered = hovered === index;
          const x = stage === 'fanned' ? offset*spacing : 0;
          const y = stage === 'fanned' ? Math.abs(offset)*4-28 : 120;
          return <motion.div key={card.instanceId || index} className="fanned-card" initial={{ y:130, scale:.72, opacity:0 }} animate={{ x, y:isHovered ? y-38 : y, rotateZ:stage === 'fanned' ? offset*2.6 : 0, scale:isHovered ? 1.2 : 1, opacity:1, zIndex:isHovered ? 80 : 30+index }} transition={{ type:'spring', stiffness:250, damping:24, delay:stage === 'fanned' ? index*.018 : 0 }} onMouseEnter={() => setHovered(index)} onMouseLeave={() => setHovered(null)}>
            <div className="booster-card">
              {card.image_url ? <img src={card.image_url} alt={card.name} /> : <div className="booster-card-fallback"><strong>{card.name}</strong><span>{card.type_line}</span><ManaCost manaCost={card.mana_cost} size="xs" /></div>}
            </div>
          </motion.div>;
        })}</AnimatePresence>
      </div>
    </div>
    {stage === 'sealed' && <button onClick={open} className="booster-hint">Desliza para abrir <span>→</span></button>}
    {stage === 'fanned' && <motion.button initial={{ opacity:0,y:10 }} animate={{ opacity:1,y:0 }} onClick={onFinishOpening} className="booster-continue">Draft <ArrowRight className="h-4 w-4" /></motion.button>}
  </div>;
}

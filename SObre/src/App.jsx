import { useCallback, useEffect, useRef, useState } from 'react';

const boosterImage = '/collector-booster.png';

export default function App() {
  const [isOpen, setIsOpen] = useState(false);
  const [isShaking, setIsShaking] = useState(false);
  const envelopeRef = useRef(null);

  const toggleEnvelope = useCallback(() => {
    setIsOpen((open) => !open);
  }, []);

  const resetEnvelope = useCallback((event) => {
    event.stopPropagation();
    setIsOpen(false);
    setIsShaking(false);
  }, []);

  const previewEnvelope = useCallback(() => {
    if (!isOpen) {
      setIsShaking(true);
      window.setTimeout(() => setIsShaking(false), 480);
    }
  }, [isOpen]);

  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === 'Escape' && isOpen) setIsOpen(false);
      if ((event.key === 'Enter' || event.key === ' ') && document.activeElement === envelopeRef.current) {
        event.preventDefault();
        toggleEnvelope();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, toggleEnvelope]);

  return (
    <main className="page-shell">
      <section className="hero" aria-labelledby="page-title">
        <p className="eyebrow">Ravnica Remastered · Collector Booster</p>
        <h1 id="page-title">Abre el sobre.</h1>
        <p className="intro">Una pequeña animación interactiva para revelar tu próximo booster.</p>

        <div className="stage">
          <div className="ambient-glow" aria-hidden="true" />
          <button
            ref={envelopeRef}
            className={`envelope ${isOpen ? 'is-open' : ''} ${isShaking ? 'is-shaking' : ''}`}
            type="button"
            onClick={toggleEnvelope}
            onMouseEnter={previewEnvelope}
            aria-expanded={isOpen}
            aria-label={isOpen ? 'Cerrar el sobre' : 'Abrir el sobre'}
          >
            <span className="envelope-shadow" aria-hidden="true" />
            <span className="envelope-back" aria-hidden="true" />

            <span className="booster" aria-hidden="true">
              <img src={boosterImage} alt="" />
            </span>

            <span className="envelope-pocket" aria-hidden="true" />
            <span className="envelope-flap" aria-hidden="true" />
            <span className="seal" aria-hidden="true">
              <span>✦</span>
            </span>
            <span className="spark spark-one" aria-hidden="true">✦</span>
            <span className="spark spark-two" aria-hidden="true">✧</span>
            <span className="spark spark-three" aria-hidden="true">✦</span>
          </button>
        </div>

        <div className="controls">
          <p className="hint" aria-live="polite">
            {isOpen ? 'El booster está listo para descubrir.' : 'Haz clic o pulsa Enter para abrirlo.'}
          </p>
          <button className="reset-button" type="button" onClick={resetEnvelope} disabled={!isOpen}>
            Cerrar sobre
          </button>
        </div>
      </section>
    </main>
  );
}

import React from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { ArrowLeftRight } from 'lucide-react';

export function SwapAnimationOverlay({ event = null }) {
  return (
    <AnimatePresence>
      {event && (
        <motion.div
          className="swap-event-shell"
          initial={{ opacity: 0, y: -18 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ type: 'spring', stiffness: 420, damping: 34 }}
          role="status"
          aria-live="polite"
        >
          <div className="swap-event-mark" aria-hidden="true">
            <ArrowLeftRight />
          </div>
          <div className="swap-event-copy">
            <div className="swap-event-player">
              <span>#{event.seatIndex + 1}</span>
              {event.playerName}
            </div>
            <div className="swap-event-cards">
              <span>{event.offerCard?.name}</span>
              <ArrowLeftRight aria-hidden="true" />
              <strong>{event.plazaCard?.name}</strong>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

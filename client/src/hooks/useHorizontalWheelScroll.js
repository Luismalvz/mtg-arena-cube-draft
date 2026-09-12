import { useCallback, useRef } from 'react';

export function useHorizontalWheelScroll() {
  const cleanupRef = useRef(null);

  const ref = useCallback((element) => {
    // Cleanup previous listener if it exists
    if (cleanupRef.current) {
      cleanupRef.current();
      cleanupRef.current = null;
    }

    if (element) {
      const handleWheel = (event) => {
        if (element.scrollWidth <= element.clientWidth) return;
        
        const delta = Math.abs(event.deltaX) > Math.abs(event.deltaY) ? event.deltaX : event.deltaY;
        if (!delta) return;
        
        const previous = element.scrollLeft;
        element.scrollLeft += delta * 2.5;
        
        if (element.scrollLeft !== previous) {
          event.preventDefault();
        }
      };

      element.addEventListener('wheel', handleWheel, { passive: false });
      
      // Store the cleanup function for when the element unmounts or changes
      cleanupRef.current = () => {
        element.removeEventListener('wheel', handleWheel);
      };
    }
  }, []);

  return ref;
}

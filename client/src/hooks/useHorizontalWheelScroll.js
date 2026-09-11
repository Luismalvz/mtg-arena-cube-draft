import { useEffect, useRef } from 'react';

export function useHorizontalWheelScroll() {
  const ref = useRef(null);

  useEffect(() => {
    const element = ref.current;
    if (!element) return undefined;

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
    return () => element.removeEventListener('wheel', handleWheel);
  }, []);

  return ref;
}

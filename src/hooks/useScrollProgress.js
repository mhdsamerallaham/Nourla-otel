import { useEffect, useRef } from 'react';

/**
 * High-Performance Scroll Progress Hook
 * Measures scroll progress (0.0 to 1.0) inside containerRef using a passive listener.
 * Stores result in a ref to avoid React state re-renders on scroll.
 */
export function useScrollProgress(containerRef) {
  const scrollProgressRef = useRef(0);

  useEffect(() => {
    const handleScroll = () => {
      if (!containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const viewportH = window.innerHeight || document.documentElement.clientHeight;
      const totalScrollable = rect.height - viewportH;

      if (totalScrollable <= 0) {
        scrollProgressRef.current = 0;
        return;
      }

      const currentScroll = Math.max(0, -rect.top);
      const rawProgress = currentScroll / totalScrollable;
      scrollProgressRef.current = Math.min(1, Math.max(0, rawProgress));
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    window.addEventListener('resize', handleScroll, { passive: true });
    handleScroll();

    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('resize', handleScroll);
    };
  }, [containerRef]);

  return scrollProgressRef;
}

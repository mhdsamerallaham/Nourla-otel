import { useEffect, useRef, useState, useCallback } from 'react';

function formatFrameIndex(index, padLength = 4) {
  return String(index + 1).padStart(padLength, '0');
}

/**
 * High-Performance Frame Loader Hook
 * Loads first 20 frames immediately, then lazy-loads remaining frames progressively.
 * Automatically chooses /frames/desktop/ or /frames/mobile/ based on viewport width.
 */
export function useFrameLoader({ totalFrames = 300, ext = 'webp' }) {
  const cacheRef = useRef(new Map());
  const [isInitialLoaded, setIsInitialLoaded] = useState(false);
  const [loadedRatio, setLoadedRatio] = useState(0);

  const isMobileRef = useRef(typeof window !== 'undefined' && window.innerWidth < 768);
  const basePath = isMobileRef.current ? '/frames/mobile/frame_' : '/frames/desktop/frame_';

  useEffect(() => {
    let isCancelled = false;
    let loadedCount = 0;
    const cache = cacheRef.current;

    const loadSingleFrame = (index) => {
      return new Promise((resolve) => {
        if (cache.has(index)) {
          resolve(cache.get(index));
          return;
        }

        const formatted = formatFrameIndex(index, 4);
        const url = `${basePath}${formatted}.${ext}`;
        const img = new Image();
        img.decoding = 'async'; // Fast GPU decoding
        img.src = url;

        img.onload = () => {
          if (!isCancelled) {
            cache.set(index, img);
            loadedCount++;
            setLoadedRatio(loadedCount / totalFrames);
          }
          resolve(img);
        };

        img.onerror = () => {
          resolve(null);
        };
      });
    };

    const loadSequence = async () => {
      // 1. Load initial 20 frames for instant display
      const initialBatch = Math.min(20, totalFrames);
      const initialPromises = [];
      for (let i = 0; i < initialBatch; i++) {
        initialPromises.push(loadSingleFrame(i));
      }
      await Promise.all(initialPromises);

      if (!isCancelled) {
        setIsInitialLoaded(true);
      }

      // 2. Progressively load remaining frames in background idle time
      if (!isCancelled && totalFrames > initialBatch) {
        let current = initialBatch;
        const chunkSize = isMobileRef.current ? 10 : 25;

        const loadNextChunk = () => {
          if (isCancelled) return;

          const chunkPromises = [];
          const end = Math.min(current + chunkSize, totalFrames);
          for (let i = current; i < end; i++) {
            chunkPromises.push(loadSingleFrame(i));
          }

          current = end;

          if (current < totalFrames && !isCancelled) {
            if ('requestIdleCallback' in window) {
              window.requestIdleCallback(loadNextChunk);
            } else {
              setTimeout(loadNextChunk, 50);
            }
          }
        };

        loadNextChunk();
      }
    };

    loadSequence();

    return () => {
      isCancelled = true;
    };
  }, [totalFrames, basePath, ext]);

  const getFrame = useCallback((index) => {
    const cache = cacheRef.current;
    if (cache.has(index)) return cache.get(index);

    // Fallback to nearest loaded frame to avoid blank canvas
    if (cache.size > 0) {
      let minDiff = Infinity;
      let nearest = null;
      for (const [k, img] of cache.entries()) {
        const diff = Math.abs(k - index);
        if (diff < minDiff) {
          minDiff = diff;
          nearest = img;
        }
      }
      return nearest;
    }

    return null;
  }, []);

  return {
    getFrame,
    isInitialLoaded,
    loadedRatio,
    isMobile: isMobileRef.current,
  };
}

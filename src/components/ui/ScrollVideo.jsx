import React, { useRef, useEffect, useState, useCallback } from 'react';

/**
 * Formats a frame number to zero-padded string, e.g. 1 -> "0001"
 */
function formatFrameIndex(index, padLength = 4) {
  return String(index).padStart(padLength, '0');
}

/**
 * Dynamic Canvas Fallback Frame Generator
 * Generates a high-resolution, luxury 3D camera zoom animation if real frame JPEGs are missing.
 */
function createProceduralFrame(frameIdx, totalFrames, width = 1280, height = 720) {
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');
  if (!ctx) return canvas;

  const progress = frameIdx / (totalFrames - 1);
  const time = progress * Math.PI * 2;

  // Background Gradient
  const grad = ctx.createRadialGradient(
    width / 2, height / 2, 100 * (1 + progress * 0.5),
    width / 2, height / 2, width * 0.8
  );
  grad.addColorStop(0, '#6F7255');  // Olive primary
  grad.addColorStop(0.5, '#4F523A'); // Dark Accent
  grad.addColorStop(1, '#1A1C14');   // Deep Night

  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, width, height);

  // Decorative Golden Rings
  ctx.save();
  ctx.translate(width / 2, height / 2);
  const zoom = 1 + progress * 0.6;
  ctx.scale(zoom, zoom);

  for (let i = 0; i < 5; i++) {
    const radius = 120 + i * 70;
    const rotation = time * (i % 2 === 0 ? 1 : -1) * 0.5;

    ctx.save();
    ctx.rotate(rotation);
    ctx.strokeStyle = `rgba(231, 225, 211, ${0.15 + (i * 0.05)})`;
    ctx.lineWidth = 2 + i;
    ctx.beginPath();
    ctx.arc(0, 0, radius, 0, Math.PI * 2);
    ctx.stroke();

    for (let d = 0; d < 4; d++) {
      const angle = (d * Math.PI / 2);
      const dotX = Math.cos(angle) * radius;
      const dotY = Math.sin(angle) * radius;
      ctx.fillStyle = '#E7E1D3';
      ctx.beginPath();
      ctx.arc(dotX, dotY, 4, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();
  }

  // Central Emblem
  ctx.fillStyle = '#FDFBF7';
  ctx.font = '500 36px Georgia, serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('NOURLA BOUTIQUE HOTEL', 0, -20);

  ctx.fillStyle = '#E7E1D3';
  ctx.font = '300 16px sans-serif';
  ctx.fillText(`FRAME ${formatFrameIndex(frameIdx + 1, 4)} / ${totalFrames}`, 0, 30);

  ctx.restore();

  return canvas;
}

export default function ScrollVideo({
  frames = 300,
  path = '/frames/frame_',
  ext = 'jpg',
  scrollMultiplier = 5, // 500vh scroll height
  debugMode = false,
  overlayText = true,
}) {
  const canvasRef = useRef(null);
  const containerRef = useRef(null);

  // System Refs for 60fps performance (NO React re-renders in hot path!)
  const frameCacheRef = useRef(new Map());
  const targetFrameRef = useRef(0);
  const currentFrameRef = useRef(0);
  const lastDrawnFrameRef = useRef(-1);
  const rafIdRef = useRef(null);

  // Mobile Detection State
  const [isMobile, setIsMobile] = useState(() => typeof window !== 'undefined' && window.innerWidth < 768);

  // Debug & Status state
  const [loadedCount, setLoadedCount] = useState(0);
  const [fps, setFps] = useState(60);
  const [currentFrameState, setCurrentFrameState] = useState(0);
  const [scrollPercentState, setScrollPercentState] = useState(0);
  const [isUsingProceduralFallback, setIsUsingProceduralFallback] = useState(false);

  // Mobile resize detector
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // 1. MOBILE-OPTIMIZED PRELOADING STRATEGY
  useEffect(() => {
    let isCancelled = false;
    let loaded = 0;
    const cache = frameCacheRef.current;

    // Mobile uses step = 2 (150 frames) for light memory footprint on iOS/Android
    const step = isMobile ? 2 : 1;
    const effectiveFramesCount = Math.ceil(frames / step);

    // Helper to load a single frame
    const loadFrame = (index) => {
      return new Promise((resolve) => {
        // If already cached, resolve
        if (cache.has(index)) {
          resolve(true);
          return;
        }

        const frameNum = index + 1;
        const formattedIndex = formatFrameIndex(frameNum, 4);
        const imgUrl = `${path}${formattedIndex}.${ext}`;

        const img = new Image();
        img.crossOrigin = 'anonymous';
        img.decoding = 'async'; // Fast async decoding on mobile GPUs
        img.src = imgUrl;

        img.onload = () => {
          if (!isCancelled) {
            cache.set(index, img);
            loaded++;
            setLoadedCount(loaded);

            // Force immediate draw of Frame 0 so mobile screen is NEVER blank
            if (index === 0 && canvasRef.current) {
              const canvas = canvasRef.current;
              const ctx = canvas.getContext('2d');
              if (ctx) {
                const canvasW = canvas.width;
                const canvasH = canvas.height;
                const sourceW = img.naturalWidth || 1280;
                const sourceH = img.naturalHeight || 720;
                const scale = Math.max(canvasW / sourceW, canvasH / sourceH);
                const drawW = sourceW * scale;
                const drawH = sourceH * scale;
                ctx.drawImage(img, (canvasW - drawW) / 2, (canvasH - drawH) / 2, drawW, drawH);
              }
            }
          }
          resolve(true);
        };

        img.onerror = () => {
          if (!isCancelled) {
            const fallbackCanvas = createProceduralFrame(index, frames);
            cache.set(index, fallbackCanvas);
            loaded++;
            setLoadedCount(loaded);
            setIsUsingProceduralFallback(true);
          }
          resolve(false);
        };
      });
    };

    // Priority Batch 1: Load first ~15 frames immediately
    const loadBatch1 = async () => {
      const firstBatchIndices = [];
      for (let i = 0; i < frames; i += step) {
        firstBatchIndices.push(i);
        if (firstBatchIndices.length >= 15) break;
      }

      await Promise.all(firstBatchIndices.map(loadFrame));

      // Batch 2 & 3: Load remaining frames progressively
      if (!isCancelled) {
        let currentIdx = 0;
        const loadNextChunk = () => {
          if (isCancelled) return;
          const chunkSize = isMobile ? 5 : 15; // Smaller chunks on mobile to prevent memory lock
          let loadedInChunk = 0;

          for (let i = currentIdx; i < frames; i += step) {
            if (!cache.has(i)) {
              loadFrame(i);
              loadedInChunk++;
              if (loadedInChunk >= chunkSize) {
                currentIdx = i + step;
                break;
              }
            }
          }

          if (loaded < effectiveFramesCount && !isCancelled) {
            if ('requestIdleCallback' in window) {
              window.requestIdleCallback(loadNextChunk);
            } else {
              setTimeout(loadNextChunk, 100);
            }
          }
        };

        loadNextChunk();
      }
    };

    loadBatch1();

    return () => {
      isCancelled = true;
    };
  }, [frames, path, ext, isMobile]);

  // 2. MOBILE & TOUCH SCROLL PROGRESS LISTENER
  useEffect(() => {
    const handleScroll = () => {
      if (!containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const viewportH = window.innerHeight || document.documentElement.clientHeight;
      const totalScrollable = rect.height - viewportH;

      if (totalScrollable <= 0) return;

      const currentScroll = Math.max(0, -rect.top);
      const progress = Math.min(1, Math.max(0, currentScroll / totalScrollable));

      // Map progress to target frame index (0 to frames - 1)
      targetFrameRef.current = progress * (frames - 1);

      if (debugMode) {
        setScrollPercentState(Math.round(progress * 100));
      }
    };

    // Add scroll, touchmove, and resize listeners for complete mobile browser support
    window.addEventListener('scroll', handleScroll, { passive: true });
    window.addEventListener('touchmove', handleScroll, { passive: true });
    window.addEventListener('resize', handleScroll, { passive: true });
    handleScroll();

    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('touchmove', handleScroll);
      window.removeEventListener('resize', handleScroll);
    };
  }, [frames, debugMode]);

  // 3. CANVAS HIGH-DPI RESIZING & COVER SCALING (MOBILE GPU CAP)
  const resizeCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    // Mobile Cap: Strictly 1.0 DPR on mobile screens to prevent GPU texture overflow
    const mobileScreen = window.innerWidth < 768;
    const dpr = mobileScreen ? 1.0 : Math.min(window.devicePixelRatio || 1, 2);

    const displayWidth = window.innerWidth;
    const displayHeight = window.innerHeight;

    const targetW = Math.round(displayWidth * dpr);
    const targetH = Math.round(displayHeight * dpr);

    if (canvas.width !== targetW || canvas.height !== targetH) {
      canvas.width = targetW;
      canvas.height = targetH;
    }

    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = mobileScreen ? 'medium' : 'high';
    }
  }, []);

  useEffect(() => {
    window.addEventListener('resize', resizeCanvas);
    window.addEventListener('orientationchange', resizeCanvas);
    resizeCanvas();
    return () => {
      window.removeEventListener('resize', resizeCanvas);
      window.removeEventListener('orientationchange', resizeCanvas);
    };
  }, [resizeCanvas]);

  // 4. ANIMATION LERP & RENDER LOOP (requestAnimationFrame)
  useEffect(() => {
    let frameCounter = 0;
    let fpsIntervalTimer = performance.now();

    const render = (now) => {
      rafIdRef.current = requestAnimationFrame(render);

      // FPS calculation for debug mode
      frameCounter++;
      if (now - fpsIntervalTimer >= 1000) {
        if (debugMode) setFps(frameCounter);
        frameCounter = 0;
        fpsIntervalTimer = now;
      }

      // Smooth LERP (linear interpolation)
      // Mobile uses 0.20 for responsive touch feel, desktop uses 0.12
      const lerpFactor = isMobile ? 0.20 : 0.12;
      const diff = targetFrameRef.current - currentFrameRef.current;

      if (Math.abs(diff) > 0.001) {
        currentFrameRef.current += diff * lerpFactor;
      } else {
        currentFrameRef.current = targetFrameRef.current;
      }

      const frameIdxToDraw = Math.round(currentFrameRef.current);
      const clampedIdx = Math.max(0, Math.min(frames - 1, frameIdxToDraw));

      // On mobile, if exact frame isn't loaded yet, find nearest cached frame
      let mediaToDraw = frameCacheRef.current.get(clampedIdx);
      if (!mediaToDraw && isMobile && frameCacheRef.current.size > 0) {
        // Search nearest cached frame index
        let minDiff = Infinity;
        for (const [key, val] of frameCacheRef.current.entries()) {
          const d = Math.abs(key - clampedIdx);
          if (d < minDiff) {
            minDiff = d;
            mediaToDraw = val;
          }
        }
      }

      // Only draw if frame index or media has changed
      if (clampedIdx !== lastDrawnFrameRef.current && mediaToDraw) {
        const canvas = canvasRef.current;
        if (canvas) {
          const ctx = canvas.getContext('2d');

          if (ctx) {
            const canvasW = canvas.width;
            const canvasH = canvas.height;

            const sourceW = mediaToDraw.naturalWidth || mediaToDraw.width || 1280;
            const sourceH = mediaToDraw.naturalHeight || mediaToDraw.height || 720;

            // Object-fit: COVER math
            const scale = Math.max(canvasW / sourceW, canvasH / sourceH);
            const drawW = sourceW * scale;
            const drawH = sourceH * scale;
            const offsetX = (canvasW - drawW) / 2;
            const offsetY = (canvasH - drawH) / 2;

            ctx.clearRect(0, 0, canvasW, canvasH);
            ctx.drawImage(mediaToDraw, offsetX, offsetY, drawW, drawH);
            lastDrawnFrameRef.current = clampedIdx;

            if (debugMode) {
              setCurrentFrameState(clampedIdx);
            }
          }
        }
      }
    };

    rafIdRef.current = requestAnimationFrame(render);

    return () => {
      if (rafIdRef.current) {
        cancelAnimationFrame(rafIdRef.current);
      }
    };
  }, [frames, debugMode, isMobile]);

  // Compute text overlay phase based on current scroll progress
  const progressRatio = targetFrameRef.current / (frames - 1);

  // Mobile scroll height multiplier is slightly lower (3.5x) for comfortable mobile scrolling
  const effectiveScrollMultiplier = isMobile ? Math.min(scrollMultiplier, 3.5) : scrollMultiplier;

  return (
    <div
      ref={containerRef}
      className="relative w-full"
      style={{ height: `${effectiveScrollMultiplier * 100}vh` }}
    >
      {/* Sticky Fullscreen Canvas Viewport (Uses h-[100dvh] for mobile Safari compatibility) */}
      <div className="sticky top-0 left-0 w-full h-screen h-[100dvh] overflow-hidden bg-[#1A1C14] z-10">
        <canvas
          ref={canvasRef}
          className="w-full h-full object-cover block will-change-transform"
        />

        {/* Dynamic Luxury Overlay Texts (Synced with Scroll Animation) */}
        {overlayText && (
          <div className="absolute inset-0 pointer-events-none flex items-center justify-center p-4 sm:p-6 text-center z-20">
            {/* Phase 1: 0% - 28% */}
            <div
              className={`transition-all duration-700 transform max-w-3xl px-2 ${
                progressRatio >= 0 && progressRatio < 0.28
                  ? 'opacity-100 translate-y-0 scale-100'
                  : 'opacity-0 translate-y-8 scale-95'
              }`}
            >
              <span className="text-[10px] sm:text-xs font-semibold tracking-[0.3em] uppercase text-[#E7E1D3] bg-[#6F7255]/80 backdrop-blur-md px-3.5 py-1 rounded-full border border-white/20 inline-block mb-3">
                URLA, İZMİR
              </span>
              <h1 className="font-serif text-3xl sm:text-6xl text-white font-normal leading-tight shadow-text">
                Nourla Boutique Hotel
              </h1>
              <p className="text-xs sm:text-base text-[#E7E1D3] mt-2 font-light max-w-xl mx-auto drop-shadow-md">
                Doğanın kalbinde, zamansız bir Ege masalı. Aşağı kaydırarak keşfedin.
              </p>
            </div>

            {/* Phase 2: 28% - 58% */}
            <div
              className={`transition-all duration-700 transform max-w-3xl px-2 absolute ${
                progressRatio >= 0.28 && progressRatio < 0.58
                  ? 'opacity-100 translate-y-0 scale-100'
                  : 'opacity-0 -translate-y-8 scale-95'
              }`}
            >
              <span className="text-[10px] sm:text-xs font-semibold tracking-[0.3em] uppercase text-[#E7E1D3] bg-[#4F523A]/80 backdrop-blur-md px-3.5 py-1 rounded-full border border-white/20 inline-block mb-3">
                BESPOKE DESIGN SUITES
              </span>
              <h2 className="font-serif text-2xl sm:text-5xl text-white font-normal leading-tight">
                Özel Tasarlanmış 10 Süit
              </h2>
              <p className="text-xs sm:text-base text-[#E7E1D3] mt-2 font-light max-w-xl mx-auto">
                Her ayrıntısı özenle düşünülmüş, taş mimari ve doğal dokunun mükemmel uyumu.
              </p>
            </div>

            {/* Phase 3: 58% - 88% */}
            <div
              className={`transition-all duration-700 transform max-w-3xl px-2 absolute ${
                progressRatio >= 0.58 && progressRatio < 0.88
                  ? 'opacity-100 translate-y-0 scale-100'
                  : 'opacity-0 translate-y-8 scale-95'
              }`}
            >
              <span className="text-[10px] sm:text-xs font-semibold tracking-[0.3em] uppercase text-[#E7E1D3] bg-[#6F7255]/80 backdrop-blur-md px-3.5 py-1 rounded-full border border-white/20 inline-block mb-3">
                AUTHENTIC TERROIR & GASTRONOMY
              </span>
              <h2 className="font-serif text-2xl sm:text-5xl text-white font-normal leading-tight">
                Urla Bağ Yolu & Gastronomi
              </h2>
              <p className="text-xs sm:text-base text-[#E7E1D3] mt-2 font-light max-w-xl mx-auto">
                Michelin lezzet duraklarına ve tarihi şarap rotalarına adımlarla ulaşın.
              </p>
            </div>

            {/* Phase 4: 88% - 100% */}
            <div
              className={`transition-all duration-700 transform max-w-3xl px-2 absolute ${
                progressRatio >= 0.88
                  ? 'opacity-100 translate-y-0 scale-100'
                  : 'opacity-0 translate-y-8 scale-95'
              }`}
            >
              <span className="text-[10px] sm:text-xs font-semibold tracking-[0.3em] uppercase text-[#E7E1D3] bg-[#6F7255]/80 backdrop-blur-md px-3.5 py-1 rounded-full border border-white/20 inline-block mb-3">
                RESERVATION OPEN
              </span>
              <h2 className="font-serif text-2xl sm:text-5xl text-white font-normal leading-tight">
                Sizi Ağıralamaktan Onur Duyarız
              </h2>
              <div className="mt-4 sm:mt-6 pointer-events-auto">
                <a
                  href="/tr/reservation"
                  className="px-6 sm:px-8 py-3 sm:py-3.5 rounded-full bg-[#6F7255] hover:bg-[#4F523A] text-white text-xs font-semibold uppercase tracking-widest transition-all shadow-xl inline-block"
                >
                  Hemen Rezerve Et
                </a>
              </div>
            </div>
          </div>
        )}

        {/* Debug Panel (Active when debugMode={true}) */}
        {debugMode && (
          <div className="absolute top-16 right-2 sm:right-4 z-50 bg-[#1A1C14]/90 text-[#E7E1D3] backdrop-blur-md p-3 sm:p-4 rounded-xl border border-[#E7E1D3]/30 text-[10px] sm:text-xs font-mono shadow-2xl space-y-1 min-w-[160px] sm:min-w-[200px]">
            <div className="text-[9px] sm:text-[10px] text-[#6F7255] font-bold uppercase tracking-wider mb-1.5 border-b border-[#E7E1D3]/20 pb-1 flex justify-between items-center">
              <span>MOBILE ENGINE</span>
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            </div>
            <div>Device: <span className="text-white font-bold">{isMobile ? 'Mobile' : 'Desktop'}</span></div>
            <div>Frame: <span className="text-white font-bold">{currentFrameState + 1} / {frames}</span></div>
            <div>Scroll Progress: <span className="text-white font-bold">{scrollPercentState}%</span></div>
            <div>Loaded: <span className="text-white font-bold">{loadedCount} frames</span></div>
            <div>FPS: <span className="text-white font-bold">{fps}</span></div>
          </div>
        )}

        {/* Scroll Down Indicator */}
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 pointer-events-none text-center animate-bounce z-30">
          <span className="text-[9px] sm:text-[10px] tracking-[0.25em] text-[#E7E1D3] font-semibold uppercase block mb-1">
            AŞAĞI KAYDIRIN
          </span>
          <div className="w-4 sm:w-5 h-7 sm:h-9 rounded-full border-2 border-[#E7E1D3]/60 mx-auto flex items-start justify-center p-1">
            <div className="w-1 h-2 bg-[#E7E1D3] rounded-full animate-scrollDot"></div>
          </div>
        </div>
      </div>
    </div>
  );
}

import React, { useRef, useEffect, useState, useCallback } from 'react';
import { useScrollProgress } from '../../hooks/useScrollProgress';
import { useFrameLoader } from '../../hooks/useFrameLoader';

export default function ScrollAnimation({
  totalFrames = 300,
  scrollMultiplier = 4, // 400vh scroll distance for smooth feel
  debugMode = false,
  overlayText = true,
}) {
  const containerRef = useRef(null);
  const canvasRef = useRef(null);

  // Custom Hooks
  const scrollProgressRef = useScrollProgress(containerRef);
  const { getFrame, loadedRatio, isMobile } = useFrameLoader({ totalFrames });

  // Physics & Animation Loop Refs (Zero React re-renders in hot path!)
  const currentFrameRef = useRef(0);
  const lastDrawnFrameRef = useRef(-1);
  const rafIdRef = useRef(null);

  // Debug State
  const [fpsState, setFpsState] = useState(60);
  const [currentFrameState, setCurrentFrameState] = useState(0);

  // High DPI Canvas Resizing
  const resizeCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    // Mobile DPR cap strictly 1.0, Desktop 1.5 max for performance
    const dpr = isMobile ? 1.0 : Math.min(window.devicePixelRatio || 1, 1.5);
    const w = window.innerWidth;
    const h = window.innerHeight;

    const targetW = Math.round(w * dpr);
    const targetH = Math.round(h * dpr);

    if (canvas.width !== targetW || canvas.height !== targetH) {
      canvas.width = targetW;
      canvas.height = targetH;
    }

    const ctx = canvas.getContext('2d', { alpha: false });
    if (ctx) {
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = isMobile ? 'fast' : 'medium';
    }
  }, [isMobile]);

  useEffect(() => {
    window.addEventListener('resize', resizeCanvas);
    window.addEventListener('orientationchange', resizeCanvas);
    resizeCanvas();
    return () => {
      window.removeEventListener('resize', resizeCanvas);
      window.removeEventListener('orientationchange', resizeCanvas);
    };
  }, [resizeCanvas]);

  // Render & LERP Loop (60 FPS Target)
  useEffect(() => {
    let frameCount = 0;
    let lastTime = performance.now();

    const render = (now) => {
      rafIdRef.current = requestAnimationFrame(render);

      // FPS Counter for Debug Mode
      frameCount++;
      if (now - lastTime >= 1000) {
        if (debugMode) setFpsState(frameCount);
        frameCount = 0;
        lastTime = now;
      }

      // 1. Strict Scroll Progress Clamping (0.0 to 1.0)
      const clampedProgress = Math.min(1.0, Math.max(0.0, scrollProgressRef.current));
      const targetFrame = clampedProgress * (totalFrames - 1);
      const lerpSpeed = isMobile ? 0.14 : 0.08;
      const diff = targetFrame - currentFrameRef.current;

      if (Math.abs(diff) > 0.001) {
        currentFrameRef.current += diff * lerpSpeed;
      } else {
        currentFrameRef.current = targetFrame;
      }

      // 2. Integer Frame Index Clamping
      const frameIdxToDraw = Math.floor(currentFrameRef.current);
      const clampedIdx = Math.max(0, Math.min(totalFrames - 1, frameIdxToDraw));

      // 3. Render ONLY when frame index changes!
      if (clampedIdx !== lastDrawnFrameRef.current) {
        const canvas = canvasRef.current;
        if (canvas) {
          const ctx = canvas.getContext('2d', { alpha: false });
          const img = getFrame(clampedIdx);

          if (ctx && img) {
            const canvasW = canvas.width;
            const canvasH = canvas.height;
            const imgW = img.naturalWidth || 1280;
            const imgH = img.naturalHeight || 720;

            // Object-fit COVER scaling
            const scale = Math.max(canvasW / imgW, canvasH / imgH);
            const drawW = imgW * scale;
            const drawH = imgH * scale;
            const offsetX = (canvasW - drawW) / 2;
            const offsetY = (canvasH - drawH) / 2;

            // Neutral Dark Background fill to eliminate any green border flicker
            ctx.fillStyle = '#0D0E0C';
            ctx.fillRect(0, 0, canvasW, canvasH);

            ctx.drawImage(img, offsetX, offsetY, drawW, drawH);
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
  }, [totalFrames, getFrame, debugMode, isMobile, scrollProgressRef]);

  // Compute text overlay phase based on current scroll progress
  const progressRatio = Math.min(1.0, Math.max(0.0, scrollProgressRef.current));

  return (
    <div
      ref={containerRef}
      className="relative w-full"
      style={{ height: `${scrollMultiplier * 100}vh` }}
    >
      {/* Sticky Fullscreen Canvas Viewport (Pure Obsidian Neutral Background) */}
      <div className="sticky top-0 left-0 w-full h-screen h-[100dvh] overflow-hidden bg-[#0D0E0C] z-10">
        <canvas
          ref={canvasRef}
          className="w-full h-full object-cover block will-change-transform"
        />

        {/* Dynamic Luxury Overlay Texts */}
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
              <span className="text-[10px] sm:text-xs font-semibold tracking-[0.3em] uppercase text-[#E7E1D3] bg-black/60 backdrop-blur-md px-3.5 py-1 rounded-full border border-white/20 inline-block mb-3">
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
              <span className="text-[10px] sm:text-xs font-semibold tracking-[0.3em] uppercase text-[#E7E1D3] bg-black/60 backdrop-blur-md px-3.5 py-1 rounded-full border border-white/20 inline-block mb-3">
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
              <span className="text-[10px] sm:text-xs font-semibold tracking-[0.3em] uppercase text-[#E7E1D3] bg-black/60 backdrop-blur-md px-3.5 py-1 rounded-full border border-white/20 inline-block mb-3">
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
              <span className="text-[10px] sm:text-xs font-semibold tracking-[0.3em] uppercase text-[#E7E1D3] bg-black/60 backdrop-blur-md px-3.5 py-1 rounded-full border border-white/20 inline-block mb-3">
                RESERVATION OPEN
              </span>
              <h2 className="font-serif text-2xl sm:text-5xl text-white font-normal leading-tight">
                Sizi Ağırlamaktan Onur Duyarız
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

        {/* Debug Panel */}
        {debugMode && (
          <div className="absolute top-16 right-2 sm:right-4 z-50 bg-[#1A1C14]/90 text-[#E7E1D3] backdrop-blur-md p-3 rounded-xl border border-[#E7E1D3]/30 text-[10px] sm:text-xs font-mono shadow-2xl space-y-1 min-w-[160px]">
            <div className="text-[#6F7255] font-bold uppercase tracking-wider mb-1.5 border-b border-[#E7E1D3]/20 pb-1 flex justify-between items-center">
              <span>60 FPS ENGINE</span>
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            </div>
            <div>Mode: <span className="text-white font-bold">{isMobile ? 'Mobile (WebP)' : 'Desktop (WebP)'}</span></div>
            <div>Frame: <span className="text-white font-bold">{currentFrameState + 1} / {totalFrames}</span></div>
            <div>Loaded: <span className="text-white font-bold">{Math.round(loadedRatio * 100)}%</span></div>
            <div>FPS: <span className="text-white font-bold">{fpsState}</span></div>
          </div>
        )}

        {/* Scroll Indicator */}
        <div className="absolute bottom-10 left-1/2 -translate-x-1/2 pointer-events-none text-center animate-bounce z-30">
          <span className="text-[9px] sm:text-[10px] tracking-[0.25em] text-[#E7E1D3] font-semibold uppercase block mb-1">
            AŞAĞI KAYDIRIN
          </span>
          <div className="w-4 sm:w-5 h-7 sm:h-9 rounded-full border-2 border-[#E7E1D3]/60 mx-auto flex items-start justify-center p-1">
            <div className="w-1 h-2 bg-[#E7E1D3] rounded-full animate-scrollDot"></div>
          </div>
        </div>

        {/* Smooth Blend Gradient at Bottom Transition to Next Page Section */}
        <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-[#FDFBF7] via-[#FDFBF7]/40 to-transparent pointer-events-none z-20" />
      </div>
    </div>
  );
}

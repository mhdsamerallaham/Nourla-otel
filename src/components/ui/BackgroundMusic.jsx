import React, { useEffect, useRef, useState } from 'react';
import { Volume2, VolumeX, Music } from 'lucide-react';

const AUDIO_SRC = '/nourla/muzik.mp3';
const TARGET_VOLUME = 0.35; // Calm, ambient background volume
const FADE_DURATION_MS = 1500; // 1.5 seconds smooth fade-in
const LOCAL_STORAGE_KEY = 'nourla_bg_music_pref'; // 'enabled' | 'disabled'

export default function BackgroundMusic() {
  const audioRef = useRef(null);
  const fadeAnimRef = useRef(null);
  const hasStartedRef = useRef(false);

  // React state strictly for UI button icon
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);

  // Smooth Fade-In Helper using requestAnimationFrame
  const fadeInAudio = (audioEl, targetVol, duration) => {
    if (!audioEl) return;
    const startTime = performance.now();
    audioEl.volume = 0;

    const animateFade = (currentTime) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(1, elapsed / duration);
      audioEl.volume = progress * targetVol;

      if (progress < 1) {
        fadeAnimRef.current = requestAnimationFrame(animateFade);
      }
    };

    fadeAnimRef.current = requestAnimationFrame(animateFade);
  };

  // Safe Play execution with browser autoplay policy handling
  const safePlay = () => {
    const audio = audioRef.current;
    if (!audio) return;

    // Check if user previously explicitly muted music
    const userPref = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (userPref === 'disabled') {
      setIsMuted(true);
      return;
    }

    audio.volume = 0;
    const playPromise = audio.play();

    if (playPromise !== undefined) {
      playPromise
        .then(() => {
          setIsPlaying(true);
          setIsMuted(false);
          fadeInAudio(audio, TARGET_VOLUME, FADE_DURATION_MS);
        })
        .catch(() => {
          // Autoplay blocked silently by browser - user interaction will trigger it
          setIsPlaying(false);
        });
    }
  };

  // User Interaction Trigger (First Scroll or Click)
  useEffect(() => {
    const handleFirstInteraction = () => {
      if (hasStartedRef.current) return;
      hasStartedRef.current = true;

      safePlay();

      // Clean up first-interaction listeners immediately
      window.removeEventListener('scroll', handleFirstInteraction);
      window.removeEventListener('click', handleFirstInteraction);
      window.removeEventListener('touchstart', handleFirstInteraction);
    };

    // Attach passive listeners for maximum performance
    window.addEventListener('scroll', handleFirstInteraction, { passive: true, once: true });
    window.addEventListener('click', handleFirstInteraction, { passive: true, once: true });
    window.addEventListener('touchstart', handleFirstInteraction, { passive: true, once: true });

    return () => {
      window.removeEventListener('scroll', handleFirstInteraction);
      window.removeEventListener('click', handleFirstInteraction);
      window.removeEventListener('touchstart', handleFirstInteraction);
      if (fadeAnimRef.current) cancelAnimationFrame(fadeAnimRef.current);
    };
  }, []);

  // Toggle Button Click Handler
  const toggleMusic = () => {
    const audio = audioRef.current;
    if (!audio) return;

    // Ensure hasStarted flag is set
    hasStartedRef.current = true;

    if (isPlaying && !audio.paused) {
      // Pause music
      audio.pause();
      setIsPlaying(false);
      setIsMuted(true);
      localStorage.setItem(LOCAL_STORAGE_KEY, 'disabled');
    } else {
      // Resume / Play music
      audio.volume = TARGET_VOLUME;
      audio.play()
        .then(() => {
          setIsPlaying(true);
          setIsMuted(false);
          localStorage.setItem(LOCAL_STORAGE_KEY, 'enabled');
        })
        .catch(() => {});
    }
  };

  return (
    <>
      {/* Single Audio Element - Zero initial preloading */}
      <audio
        ref={audioRef}
        src={AUDIO_SRC}
        loop
        preload="none"
      />

      {/* Floating Glassmorphism Toggle Pill (Bottom-Right) */}
      <div className="fixed bottom-6 right-6 z-50">
        <button
          onClick={toggleMusic}
          aria-label={isPlaying ? 'Müziği Sesi Kapat' : 'Müziği Başlat'}
          className={`group relative flex items-center gap-2.5 px-4 py-2.5 rounded-full border backdrop-blur-md shadow-2xl transition-all duration-500 ${
            isPlaying
              ? 'bg-[#1A1C14]/85 border-[#6F7255] text-[#E7E1D3] hover:scale-105'
              : 'bg-[#1A1C14]/70 border-[#E7E1D3]/30 text-[#E7E1D3]/70 hover:text-white hover:border-[#6F7255] hover:scale-105'
          }`}
        >
          {/* Animated Soundwave Equalizer Bars when playing */}
          {isPlaying ? (
            <div className="flex items-end gap-0.5 h-3.5 w-3.5">
              <span className="w-0.5 bg-[#6F7255] animate-bounce h-full rounded-full" style={{ animationDelay: '0ms' }}></span>
              <span className="w-0.5 bg-[#E7E1D3] animate-bounce h-2/3 rounded-full" style={{ animationDelay: '150ms' }}></span>
              <span className="w-0.5 bg-[#6F7255] animate-bounce h-full rounded-full" style={{ animationDelay: '300ms' }}></span>
            </div>
          ) : isMuted ? (
            <VolumeX className="w-4 h-4 text-red-400/80" />
          ) : (
            <Music className="w-4 h-4 text-[#6F7255]" />
          )}

          <span className="text-[11px] font-semibold tracking-wider uppercase">
            {isPlaying ? 'Fon Müziği' : 'Müzik'}
          </span>
        </button>
      </div>
    </>
  );
}

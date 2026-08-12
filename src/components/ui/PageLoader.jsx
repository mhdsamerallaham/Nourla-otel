import React, { useState, useEffect } from 'react';
import { Sparkle } from 'lucide-react';

const INTRO_QUOTES = [
  "Urla'nın kalbinde, saklı taş mimari ve zeytin ağaçlarının huzur veren atmosferi...",
  "Her detayı özenle tasarlanmış 10 bespoke süit ve zamansız bir Ege masalı...",
  "Michelin gastronomi rotasına ve Urla Bağ Yolu'na adımlarla ulaşın...",
  "Nourla Boutique Hotel — Lüks ve doğa ile bütünleşen özel bir sığınak."
];

export default function PageLoader({ progress = 0, isReady = false, onComplete }) {
  const [quoteIndex, setQuoteIndex] = useState(0);
  const [displayPercent, setDisplayPercent] = useState(0);
  const [isFadingOut, setIsFadingOut] = useState(false);
  const [isHidden, setIsHidden] = useState(false);

  // Smoothly increment percentage to target progress (0 to 100)
  useEffect(() => {
    const targetPercent = Math.min(100, Math.round(progress * 100));

    const timer = setInterval(() => {
      setDisplayPercent((prev) => {
        if (prev < targetPercent) {
          return prev + 1;
        }
        if (targetPercent >= 100 && prev >= 100) {
          clearInterval(timer);
        }
        return prev;
      });
    }, 20);

    return () => clearInterval(timer);
  }, [progress]);

  // Rotate story quotes every 2.8 seconds
  useEffect(() => {
    const quoteInterval = setInterval(() => {
      setQuoteIndex((prev) => (prev + 1) % INTRO_QUOTES.length);
    }, 2800);

    return () => clearInterval(quoteInterval);
  }, []);

  // Handle Fade-Out Transition when 100% reached or isReady is true
  useEffect(() => {
    if (displayPercent >= 100 || isReady) {
      const fadeTimer = setTimeout(() => {
        setIsFadingOut(true);
      }, 500);

      const hideTimer = setTimeout(() => {
        setIsHidden(true);
        if (onComplete) onComplete();
      }, 1500);

      return () => {
        clearTimeout(fadeTimer);
        clearTimeout(hideTimer);
      };
    }
  }, [displayPercent, isReady, onComplete]);

  if (isHidden) return null;

  return (
    <div
      className={`fixed inset-0 z-[100] bg-[#1A1C14] text-[#E7E1D3] flex flex-col justify-between p-8 sm:p-14 transition-all duration-1000 ease-in-out ${
        isFadingOut ? 'opacity-0 pointer-events-none scale-105' : 'opacity-100 scale-100'
      }`}
    >
      {/* Top Brand Tag */}
      <div className="flex items-center justify-between border-b border-[#E7E1D3]/15 pb-6">
        <div className="flex items-center gap-2">
          <Sparkle className="w-4 h-4 text-[#6F7255] animate-spin" />
          <span className="text-[10px] sm:text-xs font-semibold tracking-[0.3em] uppercase text-[#E7E1D3]/80">
            NOURLA BOUTIQUE HOTEL
          </span>
        </div>
        <span className="text-[10px] sm:text-xs tracking-[0.2em] font-mono text-[#6F7255]">
          URLA, İZMİR
        </span>
      </div>

      {/* Center Story & Quotes Presentation */}
      <div className="max-w-3xl mx-auto text-center space-y-8 my-auto py-12">
        <span className="text-[10px] sm:text-xs font-semibold tracking-[0.35em] text-[#6F7255] uppercase bg-[#6F7255]/10 px-4 py-1.5 rounded-full border border-[#6F7255]/30 inline-block">
          AKDENİZ LÜKS DENEYİMİ
        </span>

        <h1 className="font-serif text-3xl sm:text-5xl md:text-6xl text-[#FDFBF7] font-normal leading-tight">
          Nourla Sığınağınıza Hoş Geldiniz
        </h1>

        {/* Rotating Story Quotes with Smooth Fade */}
        <div className="h-16 flex items-center justify-center">
          <p
            key={quoteIndex}
            className="text-xs sm:text-sm md:text-base text-[#E7E1D3]/90 font-light max-w-xl mx-auto leading-relaxed animate-fadeIn italic"
          >
            "{INTRO_QUOTES[quoteIndex]}"
          </p>
        </div>
      </div>

      {/* Bottom Progress Bar & Percentage Counter */}
      <div className="max-w-xl mx-auto w-full space-y-3">
        <div className="flex items-center justify-between text-[11px] font-mono tracking-widest text-[#E7E1D3]/80">
          <span>DENEYİM YÜKLENİYOR...</span>
          <span className="text-white font-bold">{displayPercent}%</span>
        </div>

        {/* Gold & Olive Animated Loading Line */}
        <div className="w-full h-1.5 bg-[#2B2B2B] rounded-full overflow-hidden p-0.5 border border-[#E7E1D3]/20">
          <div
            className="h-full bg-gradient-to-r from-[#4F523A] via-[#6F7255] to-[#E7E1D3] rounded-full transition-all duration-300 ease-out shadow-glow"
            style={{ width: `${displayPercent}%` }}
          />
        </div>
      </div>
    </div>
  );
}

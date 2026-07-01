// frontend/src/components/SplashScreen.tsx
import React, { useState, useEffect } from "react";
import { ChevronRight } from "lucide-react";

interface SplashScreenProps {
  onComplete: () => void;
}

export function SplashScreen({ onComplete }: SplashScreenProps) {
  const [phase, setPhase] = useState<"loading" | "transition" | "complete">(
    "loading",
  );
  const [letterIndex, setLetterIndex] = useState(0);
  const [showTagline, setShowTagline] = useState(false);
  const [showButton, setShowButton] = useState(false);

  const brandName = "SKYMART";
  const tagline = "Enter a universe where every product shines ✨";

  useEffect(() => {
    // Each letter appears after 500ms (0.5 seconds)
    const letterInterval = setInterval(() => {
      setLetterIndex((prev) => {
        if (prev < brandName.length) {
          return prev + 1;
        } else {
          clearInterval(letterInterval);
          // After all letters appear, wait 800ms then show tagline
          setTimeout(() => {
            setShowTagline(true);
            // After tagline, wait 1200ms then show button
            setTimeout(() => {
              setShowButton(true);
            }, 1200);
          }, 800);
          return prev;
        }
      });
    }, 500); // ← 500ms = 0.5 seconds between each letter

    return () => clearInterval(letterInterval);
  }, []);

  const handleEnter = () => {
    setPhase("transition");
    setTimeout(() => {
      onComplete();
    }, 800);
  };

  return (
    <div className="fixed inset-0 z-[9999] overflow-hidden">
      {/* Deep Space Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#08081a] via-[#0d0d2a] to-[#120820]">
        <div className="absolute top-[-30%] right-[-20%] w-[500px] h-[500px] bg-purple-600/8 rounded-full blur-3xl"></div>
        <div className="absolute bottom-[-30%] left-[-20%] w-[500px] h-[500px] bg-blue-600/6 rounded-full blur-3xl"></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] bg-indigo-500/5 rounded-full blur-3xl"></div>
      </div>

      {/* Animated Stars - Very slow */}
      <div className="absolute inset-0 pointer-events-none">
        {/* Small distant stars */}
        {[...Array(120)].map((_, i) => (
          <div
            key={`small-${i}`}
            className="absolute rounded-full bg-white/20"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              width: `${Math.random() * 1 + 0.5}px`,
              height: `${Math.random() * 1 + 0.5}px`,
              opacity: 0.2 + Math.random() * 0.2,
            }}
          ></div>
        ))}

        {/* Medium stars - gentle twinkle */}
        {[...Array(40)].map((_, i) => (
          <div
            key={`medium-${i}`}
            className="absolute rounded-full bg-white/50 animate-twinkle-very-slow"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              width: `${Math.random() * 2 + 1}px`,
              height: `${Math.random() * 2 + 1}px`,
              animationDelay: `${Math.random() * 10}s`,
              animationDuration: `${Math.random() * 8 + 6}s`,
            }}
          ></div>
        ))}

        {/* Bright stars with soft glow */}
        {[...Array(15)].map((_, i) => (
          <div
            key={`bright-${i}`}
            className="absolute rounded-full bg-white/70 animate-twinkle-very-slow"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              width: `${Math.random() * 3 + 2}px`,
              height: `${Math.random() * 3 + 2}px`,
              animationDelay: `${Math.random() * 8}s`,
              animationDuration: `${Math.random() * 10 + 8}s`,
              boxShadow:
                "0 0 15px rgba(255,255,255,0.1), 0 0 30px rgba(255,255,255,0.05)",
            }}
          ></div>
        ))}

        {/* Shooting stars - VERY SLOW */}
        {[...Array(2)].map((_, i) => (
          <div
            key={`shooting-${i}`}
            className="absolute animate-shooting-star-very-slow"
            style={{
              left: `${Math.random() * 40 + 30}%`,
              top: `${Math.random() * 20 + 10}%`,
              animationDelay: `${i * 18 + 12}s`,
              animationDuration: "10s",
            }}
          >
            <div className="relative">
              <div className="w-[200px] h-[1.5px] bg-gradient-to-r from-transparent via-white/60 to-white/80 rounded-full rotate-[-25deg]"></div>
              <div className="absolute right-[-4px] top-[-4px] w-[8px] h-[8px] bg-white rounded-full shadow-[0_0_20px_rgba(255,255,255,0.3)] rotate-[-25deg]"></div>
            </div>
          </div>
        ))}
      </div>

      {/* Gold sparkle particles */}
      <div className="absolute inset-0 pointer-events-none">
        {[...Array(12)].map((_, i) => (
          <div
            key={`gold-${i}`}
            className="absolute text-amber-400/10 animate-float-very-slow"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              fontSize: `${Math.random() * 12 + 6}px`,
              animationDelay: `${Math.random() * 10}s`,
              animationDuration: `${Math.random() * 10 + 8}s`,
            }}
          >
            ✦
          </div>
        ))}
      </div>

      {/* Main Content */}
      <div className="relative z-10 flex flex-col items-center justify-center min-h-screen px-6">
        {/* Brand Name - SKY (White) + MART (Gold) */}
        <div className="relative mb-10">
          <div className="flex items-center justify-center gap-1 sm:gap-2">
            {/* SKY - White */}
            {["S", "K", "Y"].map((letter, idx) => (
              <span
                key={letter}
                className={`text-5xl sm:text-7xl md:text-8xl font-serif font-light tracking-wider transition-all duration-700 ${
                  letterIndex >= idx + 1
                    ? "opacity-100 translate-y-0 text-white drop-shadow-[0_0_50px_rgba(255,255,255,0.15)]"
                    : "opacity-0 translate-y-12 text-white/20"
                }`}
                style={{
                  transitionDelay: `${(idx + 1) * 0.1}s`,
                  transitionTimingFunction: "cubic-bezier(0.34, 1.56, 0.64, 1)",
                }}
              >
                {letter}
              </span>
            ))}

            {/* MART - Gold */}
            {["M", "A", "R", "T"].map((letter, idx) => (
              <span
                key={letter}
                className={`text-5xl sm:text-7xl md:text-8xl font-serif font-light tracking-wider transition-all duration-700 ${
                  letterIndex >= idx + 4
                    ? "opacity-100 translate-y-0 text-transparent bg-clip-text bg-gradient-to-r from-amber-300 via-amber-400 to-amber-500 drop-shadow-[0_0_60px_rgba(245,158,11,0.15)]"
                    : "opacity-0 translate-y-12 text-amber-300/20"
                }`}
                style={{
                  transitionDelay: `${(idx + 4) * 0.1}s`,
                  transitionTimingFunction: "cubic-bezier(0.34, 1.56, 0.64, 1)",
                }}
              >
                {letter}
              </span>
            ))}
          </div>

          {/* Gold underline */}
          <div
            className={`absolute -bottom-4 left-0 h-[1.5px] bg-gradient-to-r from-amber-400/20 via-amber-400/50 to-amber-400/20 transition-all duration-1000 ${
              letterIndex === brandName.length
                ? "w-full opacity-100"
                : "w-0 opacity-0"
            }`}
            style={{
              transitionDelay: "0.5s",
            }}
          ></div>
        </div>

        {/* Tagline */}
        <div
          className={`transition-all duration-700 ${
            showTagline
              ? "opacity-100 translate-y-0"
              : "opacity-0 translate-y-4"
          }`}
        >
          <p className="text-base sm:text-lg md:text-xl text-white/60 font-light tracking-[0.15em] text-center max-w-md mx-auto">
            {tagline}
          </p>
        </div>

        {/* Enter Button */}
        <div
          className={`mt-12 transition-all duration-700 ${
            showButton ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
          }`}
        >
          <button
            onClick={handleEnter}
            className="group relative px-10 py-4 bg-gradient-to-r from-amber-500 to-amber-600 text-white rounded-full font-medium text-sm uppercase tracking-widest shadow-lg shadow-amber-500/20 hover:shadow-2xl hover:shadow-amber-500/30 transition-all hover:-translate-y-0.5 active:translate-y-0"
          >
            <span className="flex items-center gap-3 relative z-10">
              Enter the Universe
              <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </span>
            <div className="absolute inset-0 rounded-full bg-gradient-to-r from-amber-400 to-amber-500 opacity-0 group-hover:opacity-20 transition-opacity"></div>
          </button>
        </div>

        {/* Loading dots */}
        {letterIndex < brandName.length && (
          <div className="absolute bottom-12 left-1/2 -translate-x-1/2 flex items-center gap-2">
            <div className="w-1.5 h-1.5 bg-amber-400/30 rounded-full animate-pulse"></div>
            <div className="w-1.5 h-1.5 bg-amber-400/30 rounded-full animate-pulse delay-150"></div>
            <div className="w-1.5 h-1.5 bg-amber-400/30 rounded-full animate-pulse delay-300"></div>
          </div>
        )}

        {/* Version */}
        <div className="absolute bottom-6 right-8 text-[10px] text-white/15 font-mono tracking-widest">
          ✦ 2026
        </div>
      </div>

      {/* Transition overlay */}
      <div
        className={`absolute inset-0 bg-gradient-to-br from-[#08081a] via-[#0d0d2a] to-[#120820] transition-all duration-800 pointer-events-none ${
          phase === "transition"
            ? "opacity-100 scale-100"
            : "opacity-0 scale-95"
        }`}
      ></div>
    </div>
  );
}

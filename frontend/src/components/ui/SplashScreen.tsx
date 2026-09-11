import React, { useEffect, useState } from 'react';

interface SplashScreenProps {
  onComplete?: () => void;
}

export const SplashScreen: React.FC<SplashScreenProps> = ({ onComplete }) => {
  const [phase, setPhase] = useState<'enter' | 'idle' | 'exit'>('enter');
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    // Phase timeline:
    // 0ms    → enter (logo scales in)
    // 600ms  → idle (progress bar animates)
    // 2200ms → exit (fade out)
    // 2800ms → onComplete

    const t1 = setTimeout(() => setPhase('idle'), 600);
    const t2 = setTimeout(() => setPhase('exit'), 2200);
    const t3 = setTimeout(() => onComplete?.(), 2800);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
    };
  }, [onComplete]);

  // Animate progress bar
  useEffect(() => {
    if (phase !== 'idle') return;
    const start = Date.now();
    const duration = 1400; // ms

    const frame = () => {
      const elapsed = Date.now() - start;
      const pct = Math.min(elapsed / duration, 1);
      // Ease out cubic
      const eased = 1 - Math.pow(1 - pct, 3);
      setProgress(Math.round(eased * 100));
      if (pct < 1) requestAnimationFrame(frame);
    };

    const raf = requestAnimationFrame(frame);
    return () => cancelAnimationFrame(raf);
  }, [phase]);

  return (
    <div
      className="splash-root"
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 9999,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(135deg, #0f0c29 0%, #302b63 45%, #24243e 100%)',
        opacity: phase === 'exit' ? 0 : 1,
        transition: phase === 'exit' ? 'opacity 0.6s cubic-bezier(0.4,0,0.2,1)' : 'none',
        pointerEvents: phase === 'exit' ? 'none' : 'all',
      }}
    >
      {/* Ambient Orbs */}
      <div style={{
        position: 'absolute', top: '-10%', left: '-5%',
        width: '45vw', height: '45vw', borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(99,102,241,0.30) 0%, transparent 70%)',
        filter: 'blur(40px)', animation: 'splashOrb1 8s ease-in-out infinite',
      }} />
      <div style={{
        position: 'absolute', bottom: '-10%', right: '-5%',
        width: '50vw', height: '50vw', borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(168,85,247,0.25) 0%, transparent 70%)',
        filter: 'blur(48px)', animation: 'splashOrb2 10s ease-in-out infinite',
      }} />
      <div style={{
        position: 'absolute', top: '30%', right: '10%',
        width: '30vw', height: '30vw', borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(20,184,166,0.18) 0%, transparent 70%)',
        filter: 'blur(36px)', animation: 'splashOrb1 12s ease-in-out infinite reverse',
      }} />

      {/* Particle Stars */}
      {PARTICLES.map((p, i) => (
        <div key={i} style={{
          position: 'absolute',
          left: `${p.x}%`, top: `${p.y}%`,
          width: p.size, height: p.size,
          borderRadius: '50%',
          background: 'white',
          opacity: p.opacity,
          animation: `splashTwinkle ${p.dur}s ease-in-out infinite`,
          animationDelay: `${p.delay}s`,
        }} />
      ))}

      {/* Content */}
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '28px',
          position: 'relative',
          zIndex: 10,
          transform: phase === 'enter' ? 'scale(0.75) translateY(24px)' : 'scale(1) translateY(0)',
          opacity: phase === 'enter' ? 0 : 1,
          transition: 'transform 0.6s cubic-bezier(0.34,1.56,0.64,1), opacity 0.5s ease',
        }}
      >
        {/* Logo Ring */}
        <div style={{ position: 'relative' }}>
          {/* Outer spinning ring */}
          <div style={{
            position: 'absolute', inset: '-12px',
            borderRadius: '50%',
            border: '2px solid transparent',
            background: 'linear-gradient(135deg, rgba(99,102,241,0.8), rgba(168,85,247,0.8), rgba(20,184,166,0.6)) border-box',
            WebkitMask: 'linear-gradient(#fff 0 0) padding-box, linear-gradient(#fff 0 0)',
            WebkitMaskComposite: 'destination-out',
            maskComposite: 'exclude',
            animation: 'splashSpin 3s linear infinite',
          }} />
          {/* Inner pulsing glow */}
          <div style={{
            position: 'absolute', inset: '-20px',
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(99,102,241,0.3) 0%, transparent 70%)',
            animation: 'splashPulse 2s ease-in-out infinite',
          }} />

          {/* Logo Box */}
          <div style={{
            width: 96, height: 96, borderRadius: 28,
            background: 'linear-gradient(135deg, #4f46e5 0%, #7c3aed 50%, #6d28d9 100%)',
            boxShadow: '0 20px 60px rgba(79,70,229,0.45), 0 0 0 1px rgba(255,255,255,0.15) inset',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            position: 'relative', overflow: 'hidden',
          }}>
            {/* Shine overlay */}
            <div style={{
              position: 'absolute', top: 0, left: 0, right: 0, height: '55%',
              background: 'linear-gradient(180deg, rgba(255,255,255,0.22) 0%, transparent 100%)',
              borderRadius: '28px 28px 0 0',
            }} />
            {/* Calendar + Clock SVG */}
            <svg width="52" height="52" viewBox="0 0 24 24" fill="none" style={{ position: 'relative', zIndex: 1 }}>
              {/* Calendar frame */}
              <rect x="2.5" y="3.5" width="19" height="18" rx="3" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
              {/* Top pins */}
              <line x1="8" y1="1.5" x2="8" y2="4.5" stroke="white" strokeWidth="2" strokeLinecap="round" />
              <line x1="16" y1="1.5" x2="16" y2="4.5" stroke="white" strokeWidth="2" strokeLinecap="round" />
              {/* Header divider */}
              <line x1="2.5" y1="8.5" x2="21.5" y2="8.5" stroke="rgba(255,255,255,0.7)" strokeWidth="1.5" strokeLinecap="round" />
              {/* Grid dots */}
              <circle cx="7" cy="12" r="0.9" fill="rgba(255,255,255,0.85)" />
              <circle cx="7" cy="15.5" r="0.9" fill="rgba(255,255,255,0.85)" />
              <circle cx="7" cy="19" r="0.9" fill="rgba(255,255,255,0.85)" />
              {/* Clock badge */}
              <circle cx="15.5" cy="15.5" r="5" fill="#4338ca" stroke="white" strokeWidth="1.8" />
              <circle cx="15.5" cy="15.5" r="5" fill="url(#clockGrad)" stroke="white" strokeWidth="1.8" />
              {/* Clock hands */}
              <polyline points="15.5,13 15.5,15.5 17.2,16.6" stroke="white" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
              <defs>
                <radialGradient id="clockGrad" cx="40%" cy="35%">
                  <stop offset="0%" stopColor="#6366f1" />
                  <stop offset="100%" stopColor="#4338ca" />
                </radialGradient>
              </defs>
            </svg>
          </div>
        </div>

        {/* App Name */}
        <div style={{ textAlign: 'center' }}>
          <h1 style={{
            fontSize: 28, fontWeight: 800, letterSpacing: '-0.5px',
            background: 'linear-gradient(90deg, #e0e7ff 0%, #c7d2fe 40%, #ddd6fe 70%, #f5d0fe 100%)',
            WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
            backgroundClip: 'text', margin: 0, lineHeight: 1.2,
            fontFamily: "'Plus Jakarta Sans', sans-serif",
          }}>
            StaffGrid
          </h1>
          <p style={{
            fontSize: 12, color: 'rgba(199,210,254,0.65)', letterSpacing: '0.2em',
            fontWeight: 600, textTransform: 'uppercase', margin: '6px 0 0',
            fontFamily: "'Plus Jakarta Sans', sans-serif",
          }}>
            Workforce Scheduler
          </p>
        </div>

        {/* Progress Section */}
        <div style={{ width: 220, display: 'flex', flexDirection: 'column', gap: 10 }}>
          {/* Progress Bar */}
          <div style={{
            height: 4, borderRadius: 99,
            background: 'rgba(255,255,255,0.1)',
            overflow: 'hidden',
            boxShadow: '0 0 0 1px rgba(255,255,255,0.07)',
          }}>
            <div style={{
              height: '100%',
              width: `${progress}%`,
              borderRadius: 99,
              background: 'linear-gradient(90deg, #6366f1 0%, #a855f7 50%, #14b8a6 100%)',
              boxShadow: '0 0 12px rgba(99,102,241,0.6)',
              transition: 'width 0.05s linear',
            }} />
          </div>

          {/* Status dots */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
            {[0, 1, 2].map(i => (
              <div
                key={i}
                style={{
                  width: 6, height: 6, borderRadius: '50%',
                  background: progress > (i + 1) * 30 ? '#818cf8' : 'rgba(255,255,255,0.2)',
                  transition: 'background 0.3s ease',
                  boxShadow: progress > (i + 1) * 30 ? '0 0 8px rgba(129,140,248,0.8)' : 'none',
                }}
              />
            ))}
          </div>

          <p style={{
            textAlign: 'center', fontSize: 11, fontWeight: 600,
            color: 'rgba(199,210,254,0.5)', letterSpacing: '0.15em',
            textTransform: 'uppercase', margin: 0,
            fontFamily: "'Plus Jakarta Sans', sans-serif",
          }}>
            {progress < 40 ? 'Initializing...' : progress < 80 ? 'Loading workspace...' : 'Almost ready...'}
          </p>
        </div>
      </div>

      {/* Footer */}
      <div style={{
        position: 'absolute', bottom: 28,
        fontSize: 11, color: 'rgba(148,163,184,0.4)',
        fontWeight: 500, letterSpacing: '0.05em',
        fontFamily: "'Plus Jakarta Sans', sans-serif",
        opacity: phase === 'enter' ? 0 : 0.8,
        transition: 'opacity 1s ease 0.4s',
      }}>
        © {new Date().getFullYear()} StaffGrid — All rights reserved
      </div>

      <style>{SPLASH_KEYFRAMES}</style>
    </div>
  );
};

// ── Static particle data (generated once) ─────────────────────────────────────
const PARTICLES = Array.from({ length: 28 }, (_, i) => ({
  x: (i * 37 + 13) % 100,
  y: (i * 53 + 7) % 100,
  size: i % 3 === 0 ? 3 : i % 3 === 1 ? 2 : 1.5,
  opacity: 0.12 + (i % 5) * 0.06,
  dur: 2.5 + (i % 5) * 0.7,
  delay: (i * 0.3) % 3,
}));

// ── CSS keyframes injected via <style> ────────────────────────────────────────
const SPLASH_KEYFRAMES = `
  @keyframes splashOrb1 {
    0%, 100% { transform: translate(0, 0) scale(1); }
    50% { transform: translate(30px, -40px) scale(1.1); }
  }
  @keyframes splashOrb2 {
    0%, 100% { transform: translate(0, 0) scale(1); }
    50% { transform: translate(-40px, 30px) scale(1.08); }
  }
  @keyframes splashTwinkle {
    0%, 100% { opacity: var(--base-op, 0.2); transform: scale(1); }
    50% { opacity: 0.7; transform: scale(1.4); }
  }
  @keyframes splashSpin {
    from { transform: rotate(0deg); }
    to { transform: rotate(360deg); }
  }
  @keyframes splashPulse {
    0%, 100% { transform: scale(1); opacity: 0.5; }
    50% { transform: scale(1.15); opacity: 0.9; }
  }
`;

export default SplashScreen;

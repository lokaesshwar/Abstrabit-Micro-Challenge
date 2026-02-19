'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { useRouter } from 'next/navigation';
import LoginButton from '@/components/auth/LoginButton';

const spells = ['Lumos', 'Accio', 'Alohomora', 'Wingardium Leviosa', 'Expecto Patronum'];

export default function LandingPage() {
  const [mounted, setMounted] = useState(false);
  const [currentSpell, setCurrentSpell] = useState(0);
  const [stars, setStars] = useState<{ x: number; y: number; size: number; delay: number }[]>([]);
  const router = useRouter();
  useEffect(() => {
    setMounted(true);
    const arr = Array.from({ length: 80 }, () => ({
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: Math.random() * 2.5 + 0.5,
      delay: Math.random() * 4,
    }));
    setStars(arr);

    supabase.auth.getUser().then(({ data }) => {
      if (data.user) router.push('/dashboard');
    });

    const interval = setInterval(() => {
      setCurrentSpell((p) => (p + 1) % spells.length);
    }, 2500);
    return () => clearInterval(interval);
  }, []);

  if (!mounted) return null;

  return (
    <main className="landing-root">
      {/* Starfield */}
      <div className="starfield" aria-hidden>
        {stars.map((s, i) => (
          <span
            key={i}
            className="star"
            style={{
              left: `${s.x}%`,
              top: `${s.y}%`,
              width: s.size,
              height: s.size,
              animationDelay: `${s.delay}s`,
            }}
          />
        ))}
      </div>

      {/* Floating candles */}
      <div className="candles" aria-hidden>
        {[10, 25, 40, 60, 75, 88].map((left, i) => (
          <div key={i} className="candle" style={{ left: `${left}%`, animationDelay: `${i * 0.7}s` }}>
            <div className="flame" />
            <div className="wax" />
          </div>
        ))}
      </div>

      <div className="hero">
        <div className="crest">⚡</div>
        <p className="subtitle">The Marauder's Digital Archive</p>
        <h1 className="title">Spellbound<br />Bookmarks</h1>

        <div className="spell-ticker" aria-live="polite">
          <span className="spell-label">Current incantation: </span>
          <span className="spell-word" key={currentSpell}>{spells[currentSpell]}</span>
        </div>

        <p className="description">
          Store your most treasured scrolls of knowledge, enchanted URLs, and mystical pages—all 
          guarded by the ancient magic of your Hogwarts identity.
        </p>

        <div className="login-wrap">
          <LoginButton />
        </div>

        <div className="houses">
          {['🦁 Gryffindor', '🦅 Ravenclaw', '🦡 Hufflepuff', '🐍 Slytherin'].map((h) => (
            <span key={h} className="house-badge">{h}</span>
          ))}
        </div>
      </div>

      <footer className="footer">
        <p>Mischief Managed · Protected by Hogwarts Enchantments · © {new Date().getFullYear()}</p>
      </footer>

      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=IM+Fell+English:ital@0;1&family=Cinzel+Decorative:wght@400;700&family=Cinzel:wght@400;600&display=swap');

        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

        body {
          background: #0a0612;
          color: #e8d5a3;
          font-family: 'IM Fell English', serif;
          min-height: 100vh;
          overflow-x: hidden;
        }

        .landing-root {
          min-height: 100vh;
          display: flex;
          flex-direction: column;
          position: relative;
          overflow: hidden;
          background: radial-gradient(ellipse at 50% 0%, #1a0a2e 0%, #0a0612 60%);
        }

        /* Starfield */
        .starfield { position: fixed; inset: 0; pointer-events: none; z-index: 0; }
        .star {
          position: absolute;
          border-radius: 50%;
          background: #fff;
          opacity: 0.6;
          animation: twinkle 3s ease-in-out infinite alternate;
        }
        @keyframes twinkle {
          from { opacity: 0.2; transform: scale(0.8); }
          to { opacity: 1; transform: scale(1.2); }
        }

        /* Candles */
        .candles { position: fixed; inset: 0; pointer-events: none; z-index: 1; }
        .candle {
          position: absolute;
          bottom: 10%;
          display: flex;
          flex-direction: column;
          align-items: center;
          animation: float-candle 6s ease-in-out infinite alternate;
        }
        @keyframes float-candle {
          from { transform: translateY(0px); }
          to { transform: translateY(-30px); }
        }
        .flame {
          width: 8px; height: 18px;
          background: linear-gradient(to top, #ff6600, #ffcc00, #fff8e1);
          border-radius: 50% 50% 20% 20%;
          animation: flicker 0.4s ease-in-out infinite alternate;
          box-shadow: 0 0 10px 4px rgba(255,150,0,0.5);
        }
        @keyframes flicker {
          from { transform: scaleX(1) scaleY(1) rotate(-2deg); opacity: 0.9; }
          to { transform: scaleX(0.85) scaleY(1.1) rotate(2deg); opacity: 1; }
        }
        .wax {
          width: 6px; height: 40px;
          background: linear-gradient(to bottom, #f5f0e8, #d4c9b0);
          border-radius: 2px;
        }

        /* Hero */
        .hero {
          position: relative;
          z-index: 10;
          flex: 1;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 80px 24px 40px;
          text-align: center;
          gap: 20px;
        }

        .crest {
          font-size: 64px;
          animation: pulse-glow 2s ease-in-out infinite alternate;
          filter: drop-shadow(0 0 20px #c9a84c);
        }
        @keyframes pulse-glow {
          from { filter: drop-shadow(0 0 10px #c9a84c); }
          to { filter: drop-shadow(0 0 30px #f0c040); }
        }

        .subtitle {
          font-family: 'Cinzel', serif;
          font-size: 0.85rem;
          letter-spacing: 0.3em;
          text-transform: uppercase;
          color: #9b7a3a;
        }

        .title {
          font-family: 'Cinzel Decorative', serif;
          font-size: clamp(2.5rem, 8vw, 5rem);
          font-weight: 700;
          line-height: 1.1;
          background: linear-gradient(135deg, #c9a84c, #f5e070, #c9a84c, #8b5e1a);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          filter: drop-shadow(0 0 30px rgba(201,168,76,0.4));
          animation: shimmer 4s linear infinite;
          background-size: 200% auto;
        }
        @keyframes shimmer {
          from { background-position: 0% center; }
          to { background-position: 200% center; }
        }

        .spell-ticker {
          font-family: 'Cinzel', serif;
          font-size: 0.9rem;
          color: #7cb8f0;
          letter-spacing: 0.1em;
          min-height: 1.5em;
        }
        .spell-word {
          color: #a8d8ff;
          font-style: italic;
          animation: spell-appear 0.5s ease forwards;
        }
        @keyframes spell-appear {
          from { opacity: 0; transform: translateY(-6px); }
          to { opacity: 1; transform: translateY(0); }
        }

        .description {
          max-width: 540px;
          font-size: 1.05rem;
          line-height: 1.8;
          color: #b8a07a;
          font-style: italic;
        }

        .login-wrap {
          margin-top: 8px;
        }

        .houses {
          display: flex;
          gap: 12px;
          flex-wrap: wrap;
          justify-content: center;
          margin-top: 16px;
        }
        .house-badge {
          font-family: 'Cinzel', serif;
          font-size: 0.75rem;
          padding: 4px 12px;
          border: 1px solid #3a2a1a;
          border-radius: 20px;
          color: #7a6040;
          letter-spacing: 0.05em;
        }

        .footer {
          position: relative;
          z-index: 10;
          text-align: center;
          padding: 20px;
          font-size: 0.75rem;
          color: #4a3a20;
          font-family: 'Cinzel', serif;
          letter-spacing: 0.1em;
          border-top: 1px solid #1a1208;
        }
      `}</style>
    </main>
  );
}

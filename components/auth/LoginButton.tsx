'use client';

import { supabase } from '@/lib/supabaseClient';

export default function LoginButton() {
  const handleLogin = async () => {
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/dashboard`,
      },
    });
  };

  return (
    <>
      <button className="login-btn" onClick={handleLogin}>
        <span className="btn-icon">🪄</span>
        <span className="btn-text">Enter with Google Patronus</span>
        <span className="btn-glow" aria-hidden />
      </button>

      <style jsx>{`
        .login-btn {
          position: relative;
          display: inline-flex;
          align-items: center;
          gap: 12px;
          padding: 14px 32px;
          background: linear-gradient(135deg, #1a0e04, #2a1a08);
          border: 1px solid #c9a84c;
          border-radius: 8px;
          color: #e8d5a3;
          font-family: 'Cinzel', serif;
          font-size: 0.95rem;
          letter-spacing: 0.08em;
          cursor: pointer;
          transition: all 0.3s ease;
          overflow: hidden;
          box-shadow:
            0 0 20px rgba(201,168,76,0.15),
            inset 0 1px 0 rgba(201,168,76,0.2);
        }
        .login-btn:hover {
          background: linear-gradient(135deg, #2a1a08, #3a2510);
          box-shadow:
            0 0 40px rgba(201,168,76,0.4),
            inset 0 1px 0 rgba(201,168,76,0.3);
          transform: translateY(-2px);
          border-color: #f5e070;
          color: #f5e070;
        }
        .login-btn:active {
          transform: translateY(0);
        }

        .btn-icon { font-size: 1.2rem; }
        .btn-text { position: relative; z-index: 1; }

        .btn-glow {
          position: absolute;
          inset: 0;
          background: linear-gradient(135deg, transparent 40%, rgba(201,168,76,0.08) 100%);
          pointer-events: none;
        }
      `}</style>
    </>
  );
}

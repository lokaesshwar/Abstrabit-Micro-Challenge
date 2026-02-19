'use client';

import { supabase } from '@/lib/supabaseClient';
import { useRouter } from 'next/navigation';

export default function LogoutButton() {
  const router = useRouter();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/');
    router.refresh();
  };

  return (
    <>
      <button className="logout-btn" onClick={handleLogout}>
        🚪 Floo Powder Exit
      </button>
      <style jsx>{`
        .logout-btn {
          background: none;
          border: 1px solid #2a1a08;
          border-radius: 6px;
          padding: 7px 14px;
          color: #6a4a1a;
          font-family: 'Cinzel', serif;
          font-size: 0.75rem;
          letter-spacing: 0.05em;
          cursor: pointer;
          transition: all 0.2s;
          white-space: nowrap;
        }
        .logout-btn:hover {
          border-color: #4a2a10;
          color: #9b6a30;
          background: rgba(201,168,76,0.05);
        }
      `}</style>
    </>
  );
}

'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient';
import BookmarkForm from '@/components/dashboard/BookmarkForm';
import LogoutButton from '@/components/dashboard/LogoutButton';
import type { Bookmark } from '@/types/bookmark';

export default function DashboardPage() {
  const [user, setUser] = useState<any>(null);
  const userRef = useRef<any>(null);
  const [bookmarks, setBookmarks] = useState<Bookmark[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) {
        router.push('/');
        return;
      }
      userRef.current = session.user;
      setUser(session.user);
      fetchBookmarks(session.user.id);
      subscribeToBookmarks(session.user.id);
    });
  }, []);

  const fetchBookmarks = async (userId: string) => {
    const { data, error } = await supabase
      .from('bookmarks')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });
    if (error) console.error('Fetch error:', error.message);
    setBookmarks(data || []);
    setLoading(false);
  };

  const subscribeToBookmarks = (userId: string) => {
    const channel = supabase
      .channel('bookmarks-realtime')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'bookmarks', filter: `user_id=eq.${userId}` },
        () => fetchBookmarks(userId)
      )
      .subscribe();
    return () => supabase.removeChannel(channel);
  };

  const handleAdd = async (title: string, url: string) => {
    const currentUser = userRef.current;
    if (!currentUser) { console.error('No user session found'); return; }
    console.log('Inserting:', { title, url, user_id: currentUser.id });
    const { error } = await supabase
      .from('bookmarks')
      .insert([{ title: title, url: url, user_id: currentUser.id }]);
    if (error) {
      console.error('Insert failed:', error.message);
    } else {
      fetchBookmarks(currentUser.id);
    }
  };

  const handleDelete = async (id: string) => {
    const currentUser = userRef.current;
    await supabase.from('bookmarks').delete().eq('id', id);
    if (currentUser) fetchBookmarks(currentUser.id);
  };

  if (loading) return <LoadingScreen />;

  return (
    <div style={{ minHeight: '100vh', background: '#080510', color: '#e8d5a3', fontFamily: "'IM Fell English', serif" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=IM+Fell+English:ital@0;1&family=Cinzel+Decorative:wght@400;700&family=Cinzel:wght@400;600&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body { background: #080510; }
        .hp-input {
          background: rgba(8,5,16,0.9);
          border: 1px solid #3a2510;
          border-radius: 6px;
          padding: 10px 14px;
          color: #e8d5a3;
          font-family: 'IM Fell English', serif;
          font-size: 0.95rem;
          outline: none;
          width: 100%;
          transition: border-color 0.2s, box-shadow 0.2s;
        }
        .hp-input:focus { border-color: #c9a84c; box-shadow: 0 0 12px rgba(201,168,76,0.2); }
        .hp-input::placeholder { color: #3a2a12; }
        .hp-btn {
          display: inline-flex; align-items: center; gap: 8px;
          padding: 10px 24px;
          background: linear-gradient(135deg, #2a1a04, #3a2510);
          border: 1px solid #c9a84c;
          border-radius: 6px;
          color: #c9a84c;
          font-family: 'Cinzel', serif;
          font-size: 0.85rem;
          letter-spacing: 0.06em;
          cursor: pointer;
          transition: all 0.2s;
        }
        .hp-btn:hover { background: linear-gradient(135deg, #3a2510, #4a3018); box-shadow: 0 0 20px rgba(201,168,76,0.3); color: #f5e070; }
        .hp-btn:disabled { opacity: 0.6; cursor: not-allowed; }
        .bookmark-card {
          display: flex; align-items: flex-start; gap: 16px;
          padding: 16px 20px;
          background: linear-gradient(135deg, rgba(25,15,5,0.8), rgba(15,8,3,0.9));
          border: 1px solid #1a1008;
          border-radius: 8px;
          margin-bottom: 10px;
          transition: border-color 0.2s, box-shadow 0.2s;
        }
        .bookmark-card:hover { border-color: #2a1a08; box-shadow: 0 0 20px rgba(201,168,76,0.08); }
        .bookmark-title {
          font-family: 'Cinzel', serif; font-size: 0.95rem;
          color: #d4a840; text-decoration: none;
          display: block; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
        }
        .bookmark-title:hover { color: #f5e070; text-decoration: underline; }
        .del-btn {
          background: none; border: 1px solid transparent; border-radius: 6px;
          padding: 6px 8px; cursor: pointer; font-size: 1rem;
          transition: all 0.2s; flex-shrink: 0;
        }
        .del-btn:hover { background: rgba(180,50,30,0.15); border-color: rgba(180,50,30,0.4); }
      `}</style>

      <div style={{
        position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 0,
        background: 'radial-gradient(ellipse at 20% 20%, rgba(30,10,60,0.8) 0%, transparent 50%), radial-gradient(ellipse at 80% 80%, rgba(10,30,20,0.6) 0%, transparent 50%), #080510'
      }} />

      <header style={{
        position: 'relative', zIndex: 10,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '16px 32px', borderBottom: '1px solid #2a1a08',
        background: 'rgba(8,5,16,0.95)', backdropFilter: 'blur(8px)',
        flexWrap: 'wrap', gap: '12px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <span style={{ fontSize: '2rem', filter: 'drop-shadow(0 0 12px #c9a84c)' }}>⚡</span>
          <div>
            <h1 style={{
              fontFamily: "'Cinzel Decorative', serif", fontSize: '1.3rem',
              background: 'linear-gradient(135deg, #c9a84c, #f5e070)',
              WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text'
            }}>The Restricted Section</h1>
            <p style={{ fontSize: '0.75rem', color: '#6a5030', fontStyle: 'italic' }}>
              Your personal grimoire of enchanted scrolls
            </p>
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          {user && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              {user.user_metadata?.avatar_url && (
                <img src={user.user_metadata.avatar_url} alt="avatar" style={{
                  width: 36, height: 36, borderRadius: '50%',
                  border: '2px solid #c9a84c', boxShadow: '0 0 10px rgba(201,168,76,0.4)'
                }} />
              )}
              <span style={{ fontFamily: "'Cinzel', serif", fontSize: '0.8rem', color: '#a0804a' }}>
                {user.user_metadata?.name || user.email}
              </span>
            </div>
          )}
          <LogoutButton />
        </div>
      </header>

      <main style={{ position: 'relative', zIndex: 10, maxWidth: 860, margin: '0 auto', padding: '40px 24px 60px', display: 'flex', flexDirection: 'column', gap: '40px' }}>
        <div style={{
          background: 'linear-gradient(135deg, rgba(40,25,8,0.9), rgba(25,15,5,0.95))',
          border: '1px solid #3a2510', borderRadius: 12, padding: 32,
          boxShadow: '0 0 40px rgba(201,168,76,0.05), inset 0 1px 0 rgba(201,168,76,0.1)'
        }}>
          <h2 style={{ fontFamily: "'Cinzel', serif", fontSize: '1rem', color: '#c9a84c', marginBottom: 20, letterSpacing: '0.05em' }}>
            📜 Inscribe a New Scroll
          </h2>
          <BookmarkForm onAdd={handleAdd} />
        </div>

        <div>
          <h2 style={{ fontFamily: "'Cinzel', serif", fontSize: '1rem', color: '#9b7a3a', display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20, letterSpacing: '0.08em' }}>
            <span style={{ color: '#4a3010', fontSize: '0.7rem' }}>✦</span>
            Your Collected Scrolls
            <span style={{ background: 'rgba(201,168,76,0.15)', border: '1px solid #3a2510', color: '#c9a84c', fontSize: '0.75rem', padding: '2px 8px', borderRadius: 12 }}>
              {bookmarks.length}
            </span>
            <span style={{ color: '#4a3010', fontSize: '0.7rem' }}>✦</span>
          </h2>

          {bookmarks.length === 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12, padding: '60px 24px', border: '1px dashed #1a1008', borderRadius: 10, textAlign: 'center' }}>
              <span style={{ fontSize: '2.5rem', opacity: 0.4 }}>🪄</span>
              <p style={{ fontFamily: "'Cinzel', serif", fontSize: '0.95rem', color: '#4a3a1a' }}>No scrolls yet, young witch or wizard</p>
              <p style={{ fontSize: '0.85rem', color: '#2a2010', fontStyle: 'italic' }}>Cast your first inscription above to begin your archive.</p>
            </div>
          ) : (
            bookmarks.map((b) => (
              <div key={b.id} className="bookmark-card">
                <span style={{ fontSize: '1.4rem', flexShrink: 0, marginTop: 2 }}>📜</span>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <a href={b.url} target="_blank" rel="noopener noreferrer" className="bookmark-title">{b.title}</a>
                  <p style={{ fontSize: '0.78rem', color: '#4a3a1a', marginTop: 3, fontStyle: 'italic', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {(() => { try { return new URL(b.url).hostname; } catch { return b.url; } })()}
                  </p>
                  <p style={{ fontSize: '0.72rem', color: '#3a2a10', marginTop: 2 }}>
                    Inscribed on {new Date(b.created_at).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
                  </p>
                </div>
                <button className="del-btn" onClick={() => handleDelete(b.id)}>🗑️</button>
              </div>
            ))
          )}
        </div>
      </main>
    </div>
  );
}

function LoadingScreen() {
  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: '#080510', gap: '20px', color: '#c9a84c' }}>
      <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
      <div style={{ fontSize: '3rem', animation: 'spin 2s linear infinite' }}>⚡</div>
      <p style={{ fontFamily: 'Cinzel, serif', fontSize: '0.9rem', letterSpacing: '0.2em', color: '#6a5030' }}>Consulting the Sorting Hat...</p>
    </div>
  );
}

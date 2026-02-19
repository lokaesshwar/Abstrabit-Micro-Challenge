'use client';

import { useState } from 'react';

interface Props {
  onAdd: (title: string, url: string) => Promise<void>;
}

export default function BookmarkForm({ onAdd }: Props) {
  const [title, setTitle] = useState('');
  const [url, setUrl] = useState('');
  const [casting, setCasting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedTitle = title.trim();
    const trimmedUrl = url.trim();
    if (!trimmedTitle || !trimmedUrl) return;
    setCasting(true);
    try {
      let finalUrl = trimmedUrl;
      if (!/^https?:\/\//i.test(finalUrl)) finalUrl = 'https://' + finalUrl;
      console.log('Form submitting with:', trimmedTitle, finalUrl);
      await onAdd(trimmedTitle, finalUrl);
      setTitle('');
      setUrl('');
    } finally {
      setCasting(false);
    }
  };

  const inputStyle: React.CSSProperties = {
    background: 'rgba(8,5,16,0.9)',
    border: '1px solid #3a2510',
    borderRadius: 6,
    padding: '10px 14px',
    color: '#e8d5a3',
    fontFamily: "'IM Fell English', serif",
    fontSize: '0.95rem',
    outline: 'none',
    width: '100%',
  };

  const labelStyle: React.CSSProperties = {
    fontFamily: "'Cinzel', serif",
    fontSize: '0.75rem',
    letterSpacing: '0.08em',
    color: '#9b7a3a',
    display: 'block',
    marginBottom: 6,
  };

  return (
    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <div>
        <label style={labelStyle} htmlFor="bookmark-title">📜 Scroll Name (Title)</label>
        <input
          id="bookmark-title"
          style={inputStyle}
          type="text"
          placeholder="e.g. Hogwarts Online Library"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          disabled={casting}
          required
          autoComplete="off"
        />
      </div>

      <div>
        <label style={labelStyle} htmlFor="bookmark-url">🔮 Portal Address (URL)</label>
        <input
          id="bookmark-url"
          style={inputStyle}
          type="text"
          placeholder="e.g. https://hogwarts.edu"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          disabled={casting}
          required
          autoComplete="off"
        />
      </div>

      <button
        type="submit"
        disabled={casting}
        style={{
          alignSelf: 'flex-start',
          display: 'inline-flex',
          alignItems: 'center',
          gap: 8,
          padding: '10px 24px',
          background: 'linear-gradient(135deg, #2a1a04, #3a2510)',
          border: '1px solid #c9a84c',
          borderRadius: 6,
          color: '#c9a84c',
          fontFamily: "'Cinzel', serif",
          fontSize: '0.85rem',
          letterSpacing: '0.06em',
          cursor: casting ? 'not-allowed' : 'pointer',
          opacity: casting ? 0.6 : 1,
        }}
      >
        {casting ? '⚡ Enchanting...' : '✨ Seal the Scroll'}
      </button>
    </form>
  );
}

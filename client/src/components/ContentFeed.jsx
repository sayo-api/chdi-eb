import { useState, useEffect } from 'react';
import { RankChip } from '../components/RankBadge';
import api from '../api/axios';
import { useAppAuth } from '../context/AppAuthContext';

const TYPE_STYLES = {
  announcement: { bg: 'rgba(201,162,39,0.08)', border: 'rgba(201,162,39,0.3)', icon: '📢', color: '#C9A227' },
  info:         { bg: 'rgba(107,163,224,0.08)', border: 'rgba(107,163,224,0.3)', icon: 'ℹ️', color: '#6BA3E0' },
  warning:      { bg: 'rgba(224,160,32,0.08)', border: 'rgba(224,160,32,0.3)', icon: '⚠️', color: '#E8A020' },
  success:      { bg: 'rgba(110,191,72,0.08)', border: 'rgba(110,191,72,0.3)', icon: '✅', color: '#6EBF48' },
};

export default function ContentFeed() {
  const { isAppLoggedIn } = useAppAuth();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('appToken');
    const headers = token ? { Authorization: `Bearer ${token}` } : {};
    api.get('/content', { headers })
      .then(r => setItems(r.data.content || []))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [isAppLoggedIn]);

  if (loading || items.length === 0) return null;

  return (
    <div style={{ marginBottom: 28 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
        <div style={{ width: 2, height: 14, background: 'var(--gold)', borderRadius: 1 }} />
        <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, fontSize: 10, letterSpacing: '0.2em', textTransform: 'uppercase', color: 'var(--gold)' }}>AVISOS & INFORMAÇÕES</span>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {items.map(item => {
          const s = TYPE_STYLES[item.type] || TYPE_STYLES.info;
          return (
            <div key={item._id} style={{ background: s.bg, border: `1px solid ${s.border}`, borderRadius: 12, padding: '14px 16px', borderLeft: `3px solid ${s.color}` }}>
              <div style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
                <span style={{ fontSize: 18, flexShrink: 0 }}>{s.icon}</span>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4, flexWrap: 'wrap' }}>
                    <span style={{ fontFamily: 'var(--font-display)', fontSize: 14, fontWeight: 700, color: 'var(--white)', letterSpacing: '0.04em' }}>{item.title}</span>
                    {item.pinned && <span style={{ fontSize: 9, fontFamily: 'var(--font-mono)', padding: '1px 6px', borderRadius: 3, background: `${s.color}22`, color: s.color, letterSpacing: '0.1em', border: `1px solid ${s.color}44` }}>FIXADO</span>}
                    {item.visibility === 'loggedIn' && <span style={{ fontSize: 9, fontFamily: 'var(--font-mono)', padding: '1px 6px', borderRadius: 3, background: 'rgba(107,163,224,0.1)', color: '#6BA3E0', letterSpacing: '0.1em', border: '1px solid rgba(107,163,224,0.2)' }}>🔒 LOGIN</span>}
                    {item.visibility === 'specific' && <span style={{ fontSize: 9, fontFamily: 'var(--font-mono)', padding: '1px 6px', borderRadius: 3, background: 'rgba(90,158,58,0.1)', color: '#6EBF48', letterSpacing: '0.1em', border: '1px solid rgba(90,158,58,0.2)' }}>👤 PESSOAL</span>}
                  </div>
                  <p style={{ fontSize: 13, color: 'var(--white-dim)', lineHeight: 1.5, whiteSpace: 'pre-wrap' }}>{item.body}</p>
                  {item.imageUrl && <img src={item.imageUrl} alt="" style={{ marginTop: 10, maxWidth: '100%', borderRadius: 8, maxHeight: 200, objectFit: 'cover' }} />}
                  <div style={{ fontSize: 10, color: 'rgba(244,242,236,0.25)', marginTop: 8, fontFamily: 'var(--font-mono)' }}>
                    {new Date(item.createdAt).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' })}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

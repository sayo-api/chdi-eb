import { useEffect, useState, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { IconPreview } from '../components/Icons';
import api from '../api/axios';

export default function VideoPlayer() {
  const { id } = useParams();
  const [song, setSong] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeCard, setActiveCard] = useState(null);
  const videoRef = useRef(null);

  useEffect(() => {
    api.get(`/songs/${id}`)
      .then(({ data }) => setSong(data.song))
      .catch(() => setError('Vídeo não encontrado.'))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-dark)' }}>
      <Navbar />
      <div className="page-loader"><div className="spinner" /></div>
    </div>
  );

  if (error || !song) return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-dark)' }}>
      <Navbar />
      <div style={{ textAlign: 'center', padding: '80px 20px', color: 'var(--white-dim)' }}>
        <p>{error || 'Vídeo não encontrado.'}</p>
        <Link to="/" className="btn btn-gold" style={{ marginTop: 20, display: 'inline-block' }}>Voltar</Link>
      </div>
    </div>
  );

  const backTo = song.category ? `/modulo/${song.category._id || song.category}` : '/';
  const cards = song.cards || [];

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-dark)' }}>
      <Navbar />

      {/* Header */}
      <div style={{ background: 'linear-gradient(180deg, rgba(22,50,80,0.25) 0%, transparent 100%)', borderBottom: '1px solid var(--border)', padding: '24px 16px 20px' }}>
        <div className="container">
          <Link to={backTo} style={{ display: 'inline-flex', alignItems: 'center', gap: 6, color: 'var(--white-dim)', textDecoration: 'none', fontSize: 13, fontWeight: 600, marginBottom: 18 }}
            onMouseEnter={e => e.currentTarget.style.color = 'var(--gold)'}
            onMouseLeave={e => e.currentTarget.style.color = 'var(--white-dim)'}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><polyline points="15,18 9,12 15,6" /></svg>
            Voltar ao módulo
          </Link>
          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            {song.category && <IconPreview iconName={song.category.icon} colorKey={song.category.iconColor} />}
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
                <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 26, letterSpacing: '0.08em', color: 'var(--white)' }}>{song.title}</h1>
                <span style={{ fontSize: 11, fontWeight: 700, padding: '3px 8px', borderRadius: 5, background: 'rgba(134,198,69,0.12)', color: '#86c645', border: '1px solid rgba(134,198,69,0.25)', letterSpacing: '0.1em' }}>
                  🎬 VÍDEO
                </span>
              </div>
              {song.category && <p style={{ color: 'var(--white-dim)', fontSize: 13, fontWeight: 600 }}>{song.category.name}</p>}
              {song.description && <p style={{ color: 'var(--white-faint)', fontSize: 13, marginTop: 4 }}>{song.description}</p>}
            </div>
          </div>
        </div>
      </div>

      <div className="container" style={{ padding: '24px 16px 80px' }}>

        {/* ── Vídeo Player ── */}
        <div className="fade-up" style={{ marginBottom: 32 }}>
          {song.videoUrl ? (
            <div style={{
              position: 'relative', paddingBottom: '56.25%', height: 0,
              borderRadius: 14, overflow: 'hidden',
              border: '1px solid rgba(134,198,69,0.2)',
              boxShadow: '0 8px 40px rgba(0,0,0,0.5)',
              background: '#000',
            }}>
              <video
                ref={videoRef}
                src={song.videoUrl}
                controls
                style={{
                  position: 'absolute', top: 0, left: 0,
                  width: '100%', height: '100%',
                  borderRadius: 14,
                }}
              />
            </div>
          ) : (
            <div style={{
              aspectRatio: '16/9', borderRadius: 14, background: 'rgba(0,0,0,0.4)',
              border: '1px solid var(--border)', display: 'flex', flexDirection: 'column',
              alignItems: 'center', justifyContent: 'center', color: 'var(--white-faint)',
            }}>
              <svg width="56" height="56" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" style={{ marginBottom: 12 }}>
                <polygon points="23,7 16,12 23,17" /><rect x="1" y="5" width="15" height="14" rx="2" />
              </svg>
              <p style={{ fontSize: 14 }}>Vídeo não disponível</p>
            </div>
          )}
        </div>

        {/* ── Cards de instrução ── */}
        {cards.length > 0 && (
          <div className="fade-up">
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
              <div style={{ width: 3, height: 14, background: 'var(--gold)', borderRadius: 2 }} />
              <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.18em', textTransform: 'uppercase', color: 'var(--gold)' }}>
                INSTRUÇÕES DE EXECUÇÃO
              </span>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 14 }}>
              {cards.map((card, ci) => (
                <div
                  key={ci}
                  onClick={() => setActiveCard(activeCard === ci ? null : ci)}
                  style={{
                    background: activeCard === ci ? 'rgba(212,175,55,0.08)' : 'var(--bg-card)',
                    border: `1px solid ${activeCard === ci ? 'rgba(212,175,55,0.4)' : 'var(--border)'}`,
                    borderRadius: 12, padding: '16px 18px', cursor: 'pointer',
                    transition: 'all 0.2s',
                  }}
                  onMouseEnter={e => { if (activeCard !== ci) e.currentTarget.style.borderColor = 'rgba(212,175,55,0.25)'; }}
                  onMouseLeave={e => { if (activeCard !== ci) e.currentTarget.style.borderColor = 'var(--border)'; }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: activeCard === ci ? 14 : 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <div style={{
                        width: 28, height: 28, borderRadius: 8, flexShrink: 0,
                        background: 'rgba(212,175,55,0.12)', border: '1px solid rgba(212,175,55,0.3)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontFamily: 'var(--font-display)', fontSize: 12, color: 'var(--gold)', fontWeight: 700,
                      }}>
                        {String(ci + 1).padStart(2, '0')}
                      </div>
                      <span style={{ fontSize: 14, fontWeight: 700, color: 'var(--white)' }}>{card.title}</span>
                    </div>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--gold)" strokeWidth="2.5"
                      style={{ transition: 'transform 0.2s', transform: activeCard === ci ? 'rotate(180deg)' : 'rotate(0deg)', flexShrink: 0 }}>
                      <polyline points="6,9 12,15 18,9" />
                    </svg>
                  </div>

                  {activeCard === ci && card.steps?.length > 0 && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                      {card.steps.map((step, si) => (
                        <div key={si} style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
                          <div style={{
                            width: 20, height: 20, borderRadius: '50%', flexShrink: 0,
                            background: 'rgba(134,198,69,0.15)', border: '1px solid rgba(134,198,69,0.3)',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            fontSize: 10, fontWeight: 700, color: '#86c645', marginTop: 1,
                          }}>
                            {si + 1}
                          </div>
                          <p style={{ fontSize: 13, color: 'var(--white-dim)', lineHeight: 1.5, margin: 0 }}>{step}</p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

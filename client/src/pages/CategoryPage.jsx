import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { IconPreview } from '../components/Icons';
import api from '../api/axios';

function formatDuration(ms) {
  if (!ms) return '';
  const s = Math.floor(ms / 1000);
  const m = Math.floor(s / 60);
  const sec = s % 60;
  return `${m}:${sec.toString().padStart(2, '0')}`;
}

export default function CategoryPage() {
  const { id } = useParams();
  const [category, setCategory] = useState(null);
  const [songs, setSongs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all'); // all | audio | video

  useEffect(() => {
    const load = async () => {
      try {
        const [catsRes, songsRes] = await Promise.all([
          api.get('/categories'),
          api.get(`/songs/category/${id}`),
        ]);
        const cat = catsRes.data.categories.find(c => c._id === id);
        setCategory(cat || null);
        setSongs(songsRes.data.songs);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [id]);

  if (loading) return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-dark)' }}>
      <Navbar />
      <div className="page-loader"><div className="spinner" /></div>
    </div>
  );

  if (!category) return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-dark)' }}>
      <Navbar />
      <div style={{ textAlign: 'center', padding: '80px 20px', color: 'var(--white-dim)' }}>
        <p>Módulo não encontrado.</p>
        <Link to="/" className="btn btn-gold" style={{ marginTop: 20 }}>Voltar</Link>
      </div>
    </div>
  );

  const audioCount = songs.filter(s => (s.contentType || 'audio') === 'audio').length;
  const videoCount = songs.filter(s => s.contentType === 'video').length;

  const filtered = songs.filter(s => {
    if (filter === 'audio') return (s.contentType || 'audio') === 'audio';
    if (filter === 'video') return s.contentType === 'video';
    return true;
  });

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-dark)' }}>
      <Navbar />

      {/* Module Header */}
      <div style={{ background: 'linear-gradient(180deg, rgba(45,80,22,0.22) 0%, transparent 100%)', borderBottom: '1px solid var(--border)', padding: '32px 16px 24px' }}>
        <div className="container">
          <Link to="/" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, color: 'var(--white-dim)', textDecoration: 'none', fontSize: 13, fontWeight: 600, marginBottom: 20 }}
            onMouseEnter={e => e.currentTarget.style.color = 'var(--gold)'}
            onMouseLeave={e => e.currentTarget.style.color = 'var(--white-dim)'}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><polyline points="15,18 9,12 15,6" /></svg>
            Todos os módulos
          </Link>
          <div style={{ display: 'flex', alignItems: 'center', gap: 18 }}>
            <IconPreview iconName={category.icon} colorKey={category.iconColor} size={34} />
            <div>
              <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 32, letterSpacing: '0.1em', color: 'var(--white)', marginBottom: 4 }}>
                {category.name}
              </h1>
              {category.description && (
                <p style={{ color: 'var(--white-dim)', fontSize: 14 }}>{category.description}</p>
              )}
              <div style={{ display: 'flex', gap: 12, marginTop: 6 }}>
                {audioCount > 0 && (
                  <span style={{ color: 'var(--gold)', fontSize: 12, fontWeight: 700 }}>
                    🎵 {audioCount} música{audioCount > 1 ? 's' : ''}
                  </span>
                )}
                {videoCount > 0 && (
                  <span style={{ color: '#86c645', fontSize: 12, fontWeight: 700 }}>
                    🎬 {videoCount} vídeo{videoCount > 1 ? 's' : ''}
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Content list */}
      <div className="container" style={{ padding: '28px 16px 60px' }}>

        {/* Filtro — só aparece se há os dois tipos */}
        {audioCount > 0 && videoCount > 0 && (
          <div style={{ display: 'flex', gap: 8, marginBottom: 24 }}>
            {[
              { key: 'all',   label: 'Tudo',      color: 'var(--gold)' },
              { key: 'audio', label: '🎵 Músicas', color: 'var(--gold)' },
              { key: 'video', label: '🎬 Vídeos',  color: '#86c645' },
            ].map(({ key, label, color }) => (
              <button key={key} onClick={() => setFilter(key)}
                style={{
                  padding: '7px 16px', borderRadius: 20, fontSize: 13, fontWeight: 700,
                  cursor: 'pointer', transition: 'all 0.15s', border: 'none',
                  background: filter === key ? `rgba(${key === 'video' ? '134,198,69' : '212,175,55'},0.15)` : 'rgba(255,255,255,0.05)',
                  color: filter === key ? color : 'var(--white-dim)',
                  outline: filter === key ? `1px solid ${color}` : 'none',
                }}>
                {label}
              </button>
            ))}
          </div>
        )}

        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20 }}>
          <div style={{ width: 3, height: 16, background: 'var(--gold)', borderRadius: 2 }} />
          <span style={{ fontFamily: 'var(--font-body)', fontWeight: 700, fontSize: 11, letterSpacing: '0.18em', textTransform: 'uppercase', color: 'var(--gold)' }}>
            {filter === 'video' ? 'VÍDEOS DO MÓDULO' : filter === 'audio' ? 'MÚSICAS DO MÓDULO' : 'CONTEÚDO DO MÓDULO'}
          </span>
        </div>

        {filtered.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '60px 20px', color: 'var(--white-dim)' }}>
            <p>Nenhum conteúdo neste módulo ainda.</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {filtered.map((song, i) => {
              const isVideo = song.contentType === 'video';
              const href = isVideo ? `/video/${song._id}` : `/play/${song._id}`;
              return (
                <Link key={song._id} to={href} style={{ textDecoration: 'none' }}>
                  <div className="card fade-up" style={{
                    display: 'flex', alignItems: 'center', gap: 16, padding: '16px 18px',
                    cursor: 'pointer', transition: 'all 0.2s', animationDelay: `${i * 0.05}s`,
                    borderColor: isVideo ? 'rgba(134,198,69,0.1)' : 'rgba(201,162,39,0.1)',
                  }}
                    onMouseEnter={e => {
                      e.currentTarget.style.borderColor = isVideo ? '#86c645' : 'var(--gold)';
                      e.currentTarget.style.transform = 'translateX(4px)';
                      e.currentTarget.style.background = 'var(--card-hover)';
                    }}
                    onMouseLeave={e => {
                      e.currentTarget.style.borderColor = isVideo ? 'rgba(134,198,69,0.1)' : 'rgba(201,162,39,0.1)';
                      e.currentTarget.style.transform = 'translateX(0)';
                      e.currentTarget.style.background = 'var(--card-bg)';
                    }}>

                    {/* Ícone / número */}
                    <div style={{
                      width: 38, height: 38, borderRadius: 9, flexShrink: 0,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      background: isVideo ? 'rgba(134,198,69,0.1)' : 'var(--bg-dark)',
                      border: isVideo ? '1px solid rgba(134,198,69,0.25)' : 'none',
                    }}>
                      {isVideo
                        ? <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#86c645" strokeWidth="2"><polygon points="23,7 16,12 23,17" /><rect x="1" y="5" width="15" height="14" rx="2" /></svg>
                        : <span style={{ fontFamily: 'var(--font-display)', fontSize: 14, color: 'var(--gold)', fontWeight: 700 }}>{String(i + 1).padStart(2, '0')}</span>}
                    </div>

                    {/* Info */}
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--white)', marginBottom: 3, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {song.title}
                      </div>
                      {song.description && (
                        <div style={{ fontSize: 13, color: 'var(--white-dim)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {song.description}
                        </div>
                      )}
                    </div>

                    {/* Badges */}
                    <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexShrink: 0 }}>
                      {isVideo && song.cards?.length > 0 && (
                        <span style={{ fontSize: 10, fontWeight: 700, padding: '3px 7px', borderRadius: 5, background: 'rgba(134,198,69,0.12)', color: '#86c645' }}>
                          {song.cards.length} CARD{song.cards.length > 1 ? 'S' : ''}
                        </span>
                      )}
                      {!isVideo && song.lyrics?.length > 0 && (
                        <span style={{ fontSize: 10, fontWeight: 700, padding: '3px 7px', borderRadius: 5, background: 'rgba(134,198,69,0.12)', color: '#86c645' }}>
                          SYNC
                        </span>
                      )}
                      {!isVideo && song.duration > 0 && (
                        <span style={{ fontSize: 12, color: 'var(--white-faint)', fontFamily: 'monospace' }}>
                          {formatDuration(song.duration)}
                        </span>
                      )}
                      <svg width="16" height="16" viewBox="0 0 24 24"
                        fill={isVideo ? '#86c645' : 'var(--gold)'} stroke="none">
                        <polygon points="5,3 19,12 5,21" />
                      </svg>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

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

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-dark)' }}>
      <Navbar />

      {/* Module Header */}
      <div style={{ background: 'linear-gradient(180deg, rgba(45,80,22,0.22) 0%, transparent 100%)', borderBottom: '1px solid var(--border)', padding: '32px 16px 24px' }}>
        <div className="container">
          <Link to="/" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, color: 'var(--white-dim)', textDecoration: 'none', fontSize: 13, fontWeight: 600, marginBottom: 20 }}
            onMouseEnter={e => e.currentTarget.style.color = 'var(--gold)'}
            onMouseLeave={e => e.currentTarget.style.color = 'var(--white-dim)'}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><polyline points="15,18 9,12 15,6"/></svg>
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
              <p style={{ color: 'var(--gold)', fontSize: 12, fontWeight: 700, marginTop: 4 }}>
                {songs.length} canção(ões)
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Songs list */}
      <div className="container" style={{ padding: '28px 16px 60px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20 }}>
          <div style={{ width: 3, height: 16, background: 'var(--gold)', borderRadius: 2 }} />
          <span style={{ fontFamily: 'var(--font-body)', fontWeight: 700, fontSize: 11, letterSpacing: '0.18em', textTransform: 'uppercase', color: 'var(--gold)' }}>
            CANÇÕES DO MÓDULO
          </span>
        </div>

        {songs.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '60px 20px', color: 'var(--white-dim)' }}>
            <p>Nenhuma canção neste módulo ainda.</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {songs.map((song, i) => (
              <Link key={song._id} to={`/play/${song._id}`} style={{ textDecoration: 'none' }}>
                <div className="card fade-up" style={{ display: 'flex', alignItems: 'center', gap: 16, padding: '16px 18px', cursor: 'pointer', borderColor: 'rgba(201,162,39,0.1)', transition: 'all 0.2s', animationDelay: `${i * 0.05}s` }}
                  onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--gold)'; e.currentTarget.style.transform = 'translateX(4px)'; e.currentTarget.style.background = 'var(--card-hover)'; }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(201,162,39,0.1)'; e.currentTarget.style.transform = 'translateX(0)'; e.currentTarget.style.background = 'var(--card-bg)'; }}>

                  {/* Number */}
                  <div style={{ width: 36, height: 36, borderRadius: 8, background: 'var(--bg-dark)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <span style={{ fontFamily: 'var(--font-display)', fontSize: 14, color: 'var(--gold)', fontWeight: 700 }}>{String(i + 1).padStart(2, '0')}</span>
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
                    {song.lyrics?.length > 0 && (
                      <span style={{ fontSize: 10, fontWeight: 700, padding: '3px 7px', borderRadius: 5, background: 'rgba(134,198,69,0.12)', color: '#86c645' }}>
                        SYNC
                      </span>
                    )}
                    {song.duration > 0 && (
                      <span style={{ fontSize: 12, color: 'var(--white-faint)', fontFamily: 'monospace' }}>
                        {formatDuration(song.duration)}
                      </span>
                    )}
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="var(--gold)" stroke="none">
                      <polygon points="5,3 19,12 5,21"/>
                    </svg>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

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

function fmtSize(bytes) {
  if (!bytes) return '';
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export default function CategoryPage() {
  const { id } = useParams();
  const [category, setCategory] = useState(null);
  const [songs,    setSongs]    = useState([]);
  const [pdfs,     setPdfs]     = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [filter,   setFilter]   = useState('all'); // all | audio | video | pdf

  useEffect(() => {
    const load = async () => {
      try {
        const [catsRes, songsRes, pdfsRes] = await Promise.all([
          api.get('/categories'),
          api.get(`/songs/category/${id}`),
          api.get(`/pdfs/category/${id}`),
        ]);
        const cat = catsRes.data.categories.find(c => c._id === id);
        setCategory(cat || null);
        setSongs(songsRes.data.songs);
        setPdfs(pdfsRes.data.pdfs);
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
  const pdfCount   = pdfs.length;
  const hasMultiple = [audioCount > 0, videoCount > 0, pdfCount > 0].filter(Boolean).length > 1;

  // Build unified filtered list
  let items = [];
  if (filter !== 'audio' && filter !== 'video') {
    pdfs.forEach(p => items.push({ ...p, _type: 'pdf' }));
  }
  if (filter !== 'pdf') {
    songs.forEach(s => items.push({ ...s, _type: s.contentType === 'video' ? 'video' : 'audio' }));
  }
  // Sort by order
  items.sort((a, b) => (a.order ?? 0) - (b.order ?? 0));

  if (filter === 'audio') items = items.filter(i => i._type === 'audio');
  if (filter === 'video') items = items.filter(i => i._type === 'video');
  if (filter === 'pdf')   items = pdfs.map(p => ({ ...p, _type: 'pdf' }));

  const filters = [
    { key: 'all',   label: 'Tudo',       show: hasMultiple },
    { key: 'audio', label: '🎵 Músicas',  show: audioCount > 0 },
    { key: 'video', label: '🎬 Vídeos',   show: videoCount > 0 },
    { key: 'pdf',   label: '📄 PDFs',     show: pdfCount > 0 },
  ].filter(f => f.show);

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
              <div style={{ display: 'flex', gap: 12, marginTop: 6, flexWrap: 'wrap' }}>
                {audioCount > 0 && (
                  <span style={{ color: 'var(--gold)', fontSize: 12, fontWeight: 700 }}>🎵 {audioCount} música{audioCount > 1 ? 's' : ''}</span>
                )}
                {videoCount > 0 && (
                  <span style={{ color: '#86c645', fontSize: 12, fontWeight: 700 }}>🎬 {videoCount} vídeo{videoCount > 1 ? 's' : ''}</span>
                )}
                {pdfCount > 0 && (
                  <span style={{ color: '#60a5fa', fontSize: 12, fontWeight: 700 }}>📄 {pdfCount} PDF{pdfCount > 1 ? 's' : ''}</span>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Content list */}
      <div className="container" style={{ padding: '28px 16px 60px' }}>

        {/* Filter tabs */}
        {filters.length > 1 && (
          <div style={{ display: 'flex', gap: 8, marginBottom: 24, flexWrap: 'wrap' }}>
            {filters.map(({ key, label }) => {
              const active = filter === key;
              const clr = key === 'video' ? '#86c645' : key === 'pdf' ? '#60a5fa' : 'var(--gold)';
              return (
                <button key={key} onClick={() => setFilter(key)} style={{
                  padding: '7px 16px', borderRadius: 20, fontSize: 13, fontWeight: 700,
                  cursor: 'pointer', transition: 'all 0.15s', border: 'none',
                  background: active ? `rgba(${key==='video'?'134,198,69':key==='pdf'?'96,165,250':'212,175,55'},0.15)` : 'rgba(255,255,255,0.05)',
                  color: active ? clr : 'var(--white-dim)',
                  outline: active ? `1px solid ${clr}` : 'none',
                }}>
                  {label}
                </button>
              );
            })}
          </div>
        )}

        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20 }}>
          <div style={{ width: 3, height: 16, background: 'var(--gold)', borderRadius: 2 }} />
          <span style={{ fontFamily: 'var(--font-body)', fontWeight: 700, fontSize: 11, letterSpacing: '0.18em', textTransform: 'uppercase', color: 'var(--gold)' }}>
            CONTEÚDO DO MÓDULO
          </span>
        </div>

        {items.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '60px 20px', color: 'var(--white-dim)' }}>
            <p>Nenhum conteúdo neste módulo ainda.</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {items.map((item, i) => {
              const isPdf   = item._type === 'pdf';
              const isVideo = item._type === 'video';
              const href    = isPdf ? `/pdf/${item._id}` : isVideo ? `/video/${item._id}` : `/play/${item._id}`;
              const clr     = isPdf ? '#60a5fa' : isVideo ? '#86c645' : 'var(--gold)';
              const borderClr = isPdf ? 'rgba(96,165,250,0.12)' : isVideo ? 'rgba(134,198,69,0.1)' : 'rgba(201,162,39,0.1)';

              return (
                <Link key={item._id} to={href} style={{ textDecoration: 'none' }}>
                  <div className="card fade-up" style={{
                    display: 'flex', alignItems: 'center', gap: 16, padding: '16px 18px',
                    cursor: 'pointer', transition: 'all 0.2s', animationDelay: `${i * 0.04}s`,
                    borderColor: borderClr,
                  }}
                    onMouseEnter={e => { e.currentTarget.style.borderColor = clr; e.currentTarget.style.transform = 'translateX(4px)'; }}
                    onMouseLeave={e => { e.currentTarget.style.borderColor = borderClr; e.currentTarget.style.transform = 'translateX(0)'; }}>

                    {/* Cover / icon */}
                    {isPdf && item.coverUrl ? (
                      <img src={item.coverUrl} alt="" style={{ width: 42, height: 56, objectFit: 'cover', borderRadius: 6, flexShrink: 0, border: `1px solid ${borderClr}` }} />
                    ) : (
                      <div style={{ width: 38, height: 38, borderRadius: 9, flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', background: isPdf ? 'rgba(96,165,250,0.1)' : isVideo ? 'rgba(134,198,69,0.1)' : 'var(--bg-dark)', border: `1px solid ${borderClr}` }}>
                        {isPdf
                          ? <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={clr} strokeWidth="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14,2 14,8 20,8"/></svg>
                          : isVideo
                          ? <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={clr} strokeWidth="2"><polygon points="23,7 16,12 23,17"/><rect x="1" y="5" width="15" height="14" rx="2"/></svg>
                          : <span style={{ fontFamily: 'var(--font-display)', fontSize: 14, color: clr, fontWeight: 700 }}>{String(i + 1).padStart(2, '0')}</span>
                        }
                      </div>
                    )}

                    {/* Info */}
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--white)', marginBottom: 2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {item.title}
                      </div>
                      {(item.subtitle || item.description) && (
                        <div style={{ fontSize: 12, color: 'var(--white-dim)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {item.subtitle || item.description}
                        </div>
                      )}
                    </div>

                    {/* Right badges */}
                    <div style={{ display: 'flex', gap: 6, alignItems: 'center', flexShrink: 0 }}>
                      {isPdf && item.pageCount > 0 && (
                        <span style={{ fontSize: 10, fontWeight: 700, padding: '3px 7px', borderRadius: 5, background: 'rgba(96,165,250,0.1)', color: '#60a5fa' }}>
                          {item.pageCount}p
                        </span>
                      )}
                      {isPdf && item.fileSize > 0 && (
                        <span style={{ fontSize: 10, fontWeight: 700, padding: '3px 7px', borderRadius: 5, background: 'rgba(255,255,255,0.06)', color: 'var(--white-faint)' }}>
                          {fmtSize(item.fileSize)}
                        </span>
                      )}
                      {!isPdf && !isVideo && item.duration > 0 && (
                        <span style={{ fontSize: 12, color: 'var(--white-faint)', fontFamily: 'monospace' }}>{formatDuration(item.duration)}</span>
                      )}
                      <svg width="16" height="16" viewBox="0 0 24 24" fill={clr} stroke="none">
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

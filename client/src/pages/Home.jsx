import { useEffect, useState, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { IconPreview } from '../components/Icons';
import AdminLoginModal from '../components/AdminLoginModal';
import ContentFeed from '../components/ContentFeed';
import api from '../api/axios';
import { useAppAuth } from '../context/AppAuthContext';

function useSecretTrigger(threshold = 5, windowMs = 3000) {
  const [show, setShow] = useState(false);
  const clicks = useRef([]);
  const handleClick = () => {
    const now = Date.now();
    clicks.current = clicks.current.filter(t => now - t < windowMs);
    clicks.current.push(now);
    if (clicks.current.length >= threshold) { clicks.current = []; setShow(true); }
  };
  return { show, open: handleClick, close: () => setShow(false) };
}

function BandeiraBrasil({ size = 120 }) {
  return (
    <svg width={size} height={size * 0.7} viewBox="0 0 120 84" xmlns="http://www.w3.org/2000/svg"
      style={{ borderRadius: 6, boxShadow: '0 4px 20px rgba(0,0,0,0.5), 0 0 40px rgba(0,150,60,0.2)', display: 'block' }}>
      <rect width="120" height="84" fill="#009C3B" />
      <polygon points="60,7 113,42 60,77 7,42" fill="#FFDF00" />
      <circle cx="60" cy="42" r="18" fill="#002776" />
      <path d="M 42 48 Q 60 38 78 48" stroke="white" strokeWidth="3.5" fill="none" />
      <text x="60" y="50" textAnchor="middle" fill="white" fontSize="4.2" fontFamily="Arial, sans-serif" fontWeight="700" letterSpacing="0.8">ORDEM E PROGRESSO</text>
      {[[55,33],[65,33],[51,37],[69,37],[47,42],[73,42],[51,47],[69,47],[55,51],[65,51],[60,31],[60,53]].map(([cx, cy], i) => (
        <circle key={i} cx={cx} cy={cy} r="0.9" fill="white" />
      ))}
    </svg>
  );
}

function ModuleCard({ category, songs, index, isLoggedIn }) {
  const navigate = useNavigate();
  const audioCount = songs.filter(s => (s.contentType || 'audio') === 'audio').length;
  const videoCount = songs.filter(s => s.contentType === 'video').length;
  const locked = category.requiresLogin && !isLoggedIn;

  const handleClick = () => {
    if (locked) return;
    navigate(`/modulo/${category._id}`);
  };

  return (
    <div
      className={`fade-up fade-up-${Math.min(index + 1, 5)}`}
      onClick={handleClick}
      style={{
        background: locked ? 'rgba(10,15,8,0.8)' : 'var(--bg-card)',
        border: `1px solid ${locked ? 'rgba(244,242,236,0.05)' : 'var(--border)'}`,
        borderRadius: 14, padding: '18px 20px',
        cursor: locked ? 'not-allowed' : 'pointer',
        transition: 'all 0.22s', marginBottom: 10,
        opacity: locked ? 0.7 : 1,
        position: 'relative', overflow: 'hidden',
      }}
      onMouseEnter={e => {
        if (locked) return;
        e.currentTarget.style.borderColor = 'var(--border-strong)';
        e.currentTarget.style.transform = 'translateX(4px)';
        e.currentTarget.style.background = 'var(--bg-card-hover)';
      }}
      onMouseLeave={e => {
        if (locked) return;
        e.currentTarget.style.borderColor = 'var(--border)';
        e.currentTarget.style.transform = 'translateX(0)';
        e.currentTarget.style.background = 'var(--bg-card)';
      }}
    >
      {locked && (
        <div style={{ position: 'absolute', inset: 0, backgroundImage: 'repeating-linear-gradient(45deg, transparent, transparent 8px, rgba(244,242,236,0.015) 8px, rgba(244,242,236,0.015) 9px)', pointerEvents: 'none' }} />
      )}
      <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
        <div style={{ opacity: locked ? 0.5 : 1 }}>
          <IconPreview iconName={category.icon} colorKey={category.iconColor} />
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap', marginBottom: 3 }}>
            <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 19, fontWeight: 700, letterSpacing: '0.06em', color: locked ? 'var(--white-faint)' : 'var(--white)' }}>
              {category.name}
            </h3>
            {category.isNew && !locked && <span className="badge badge-new">NOVO</span>}
            {locked && (
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, padding: '2px 8px', borderRadius: 4, background: 'rgba(244,242,236,0.06)', border: '1px solid rgba(244,242,236,0.1)', fontSize: 10, color: 'var(--white-faint)', fontFamily: 'var(--font-mono)', letterSpacing: '0.08em' }}>
                <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
                ACESSO RESTRITO
              </span>
            )}
          </div>
          {category.description && (
            <p style={{ color: locked ? 'var(--white-faint)' : 'var(--white-dim)', fontSize: 13, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', marginBottom: 6 }}>
              {locked ? 'Faça login no aplicativo para acessar este módulo.' : category.description}
            </p>
          )}
          {!locked && (
            <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
              {audioCount > 0 && <span style={{ fontSize: 11, color: 'var(--gold)', fontWeight: 600 }}>🎵 {audioCount} música{audioCount > 1 ? 's' : ''}</span>}
              {videoCount > 0 && <span style={{ fontSize: 11, color: '#6EBF48', fontWeight: 600 }}>🎬 {videoCount} vídeo{videoCount > 1 ? 's' : ''}</span>}
            </div>
          )}
          {!locked && (
            <div className="progress-bar-wrap" style={{ marginTop: 8 }}>
              <div className="progress-bar-fill" style={{ width: `${Math.min(100, (songs.length / 10) * 100)}%` }} />
            </div>
          )}
        </div>
        {locked ? (
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="rgba(244,242,236,0.15)" strokeWidth="2" strokeLinecap="round"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
        ) : (
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--white-faint)" strokeWidth="2" strokeLinecap="round"><polyline points="9,18 15,12 9,6" /></svg>
        )}
      </div>
      {!locked && songs.length > 0 && (
        <div style={{ marginTop: 14, borderTop: '1px solid var(--border)', paddingTop: 12, display: 'flex', flexDirection: 'column', gap: 2 }}
          onClick={e => e.stopPropagation()}>
          {songs.slice(0, 3).map(song => {
            const isVideo = song.contentType === 'video';
            return (
              <Link key={song._id} to={isVideo ? `/video/${song._id}` : `/play/${song._id}`}
                style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 10, padding: '7px 10px', borderRadius: 8, transition: 'background 0.15s', color: 'var(--white)' }}
                onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.05)'}
                onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                <div style={{ width: 30, height: 30, borderRadius: 7, flexShrink: 0, background: isVideo ? 'rgba(110,191,72,0.12)' : 'var(--bg-dark)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  {isVideo
                    ? <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="#6EBF48" strokeWidth="2"><polygon points="23,7 16,12 23,17"/><rect x="1" y="5" width="15" height="14" rx="2"/></svg>
                    : <svg width="11" height="11" viewBox="0 0 24 24" fill="var(--gold)" stroke="none"><polygon points="5,3 19,12 5,21"/></svg>}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 13, fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{song.title}</div>
                </div>
                {!isVideo && song.lyrics?.length > 0 && (
                  <span style={{ fontSize: 10, fontWeight: 700, padding: '2px 6px', borderRadius: 4, background: 'rgba(110,191,72,0.1)', color: '#6EBF48', flexShrink: 0, fontFamily: 'var(--font-mono)' }}>SYNC</span>
                )}
              </Link>
            );
          })}
          {songs.length > 3 && (
            <div style={{ padding: '5px 10px', fontSize: 12, color: 'var(--white-faint)', textAlign: 'center', fontFamily: 'var(--font-mono)' }}>
              + {songs.length - 3} mais →
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default function Home() {
  const [categories, setCategories] = useState([]);
  const [songsByCategory, setSongsByCategory] = useState({});
  const [loading, setLoading] = useState(true);
  const secret = useSecretTrigger(5, 3000);
  const { isAppLoggedIn, appUser } = useAppAuth();

  useEffect(() => {
    const load = async () => {
      try {
        const { data } = await api.get('/categories');
        setCategories(data.categories || []);
        const songsMap = {};
        await Promise.all(data.categories.map(async cat => {
          try {
            const { data: sd } = await api.get(`/songs/category/${cat._id}`);
            songsMap[cat._id] = sd.songs;
          } catch { songsMap[cat._id] = []; }
        }));
        setSongsByCategory(songsMap);
      } catch (e) { console.error(e); }
      finally { setLoading(false); }
    };
    load();
  }, []);

  const groups = [];
  const seen = new Set();
  categories.forEach(cat => {
    const label = cat.sectionLabel || 'MÓDULOS DE APRENDIZAGEM';
    if (!seen.has(label)) { seen.add(label); groups.push({ label, cats: [] }); }
    groups.find(g => g.label === label)?.cats.push(cat);
  });

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-dark)' }}>
      <Navbar />

      <div style={{ position: 'relative', overflow: 'hidden', background: 'linear-gradient(180deg, #081506 0%, #0a1408 60%, var(--bg-dark) 100%)', borderBottom: '1px solid rgba(201,162,39,0.1)', padding: '48px 16px 40px' }}>
        <div style={{ position: 'absolute', inset: 0, opacity: 0.08, backgroundImage: 'radial-gradient(circle at 15% 50%, #3a7c20 0%, transparent 55%), radial-gradient(circle at 85% 30%, #C9A227 0%, transparent 45%)', pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '1px', background: 'linear-gradient(90deg, transparent, rgba(201,162,39,0.3), transparent)', animation: 'scanline 4s ease infinite', pointerEvents: 'none' }} />

        <div className="container" style={{ position: 'relative', textAlign: 'center' }}>
          <div onClick={secret.open} style={{ cursor: 'default', userSelect: 'none', marginBottom: 20, display: 'inline-block', animation: 'fadeIn 0.8s ease both' }}>
            <BandeiraBrasil size={200} />
          </div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12, marginBottom: 10, animation: 'fadeIn 0.8s 0.2s ease both', opacity: 0 }}>
            <div style={{ height: 1, width: 60, background: 'linear-gradient(90deg, transparent, rgba(201,162,39,0.5))' }} />
            <div style={{ width: 5, height: 5, background: 'var(--gold)', borderRadius: '50%' }} />
            <div style={{ height: 1, width: 60, background: 'linear-gradient(90deg, rgba(201,162,39,0.5), transparent)' }} />
          </div>
          <p style={{ fontFamily: 'var(--font-mono)', fontSize: 11, letterSpacing: '0.22em', textTransform: 'uppercase', color: 'var(--white-faint)', animation: 'fadeIn 0.8s 0.4s ease both', opacity: 0 }}>
            Sistema de Aprendizagem e Treinamento · 1º RCG
          </p>
          {isAppLoggedIn && (
            <div style={{ marginTop: 12, display: 'inline-flex', alignItems: 'center', gap: 8, padding: '6px 16px', borderRadius: 20, background: 'rgba(201,162,39,0.1)', border: '1px solid rgba(201,162,39,0.25)' }}>
              <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#6EBF48', animation: 'pulse 1.5s ease infinite' }} />
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10, letterSpacing: '0.1em', color: 'var(--gold)' }}>
                LOGADO · {appUser?.rank?.toUpperCase()} {appUser?.name?.split(' ')[0]?.toUpperCase()}
              </span>
            </div>
          )}
        </div>
      </div>

      <div className="container" style={{ padding: '28px 16px 60px' }}>
        {/* Content Feed */}
        <ContentFeed />

        {loading ? (
          <div style={{ display: 'flex', justifyContent: 'center', padding: '60px 0' }}><div className="spinner" /></div>
        ) : categories.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '60px 20px', color: 'var(--white-dim)' }}>
            <p style={{ fontSize: 16, fontFamily: 'var(--font-display)', letterSpacing: '0.06em' }}>Nenhum módulo disponível no momento.</p>
          </div>
        ) : (
          groups.map(group => (
            <div key={group.label} style={{ marginBottom: 32 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
                <div style={{ width: 2, height: 14, background: 'var(--gold)', borderRadius: 1 }} />
                <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, fontSize: 10, letterSpacing: '0.2em', textTransform: 'uppercase', color: 'var(--gold)' }}>
                  {group.label}
                </span>
              </div>
              {group.cats.map((cat, i) => (
                <ModuleCard key={cat._id} category={cat} songs={songsByCategory[cat._id] || []} index={i} isLoggedIn={isAppLoggedIn} />
              ))}
            </div>
          ))
        )}
      </div>

      <div style={{ textAlign: 'center', padding: '20px 16px', borderTop: '1px solid rgba(201,162,39,0.06)', color: 'rgba(244,242,236,0.15)', fontFamily: 'var(--font-mono)', fontSize: 10, letterSpacing: '0.12em' }}>
        C.H.D.I · 1º RCG · Brasília – DF · v2.1
      </div>

      {secret.show && <AdminLoginModal onClose={secret.close} />}

      <style>{`
        @keyframes scanline { 0% { transform: translateX(-100%); } 100% { transform: translateX(100vw); } }
      `}</style>
    </div>
  );
}

import { useEffect, useState, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { IconPreview } from '../components/Icons';
import AdminLoginModal from '../components/AdminLoginModal';
import api from '../api/axios';

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

// ── Bandeira do Brasil SVG ────────────────────────────────────────────────────
function BandeiraBrasil({ size = 120 }) {
  return (
    <svg width={size} height={size * 0.7} viewBox="0 0 120 84" xmlns="http://www.w3.org/2000/svg"
      style={{ borderRadius: 6, boxShadow: '0 4px 20px rgba(0,0,0,0.5), 0 0 30px rgba(0,150,60,0.3)', display: 'block' }}>
      {/* Fundo verde */}
      <rect width="120" height="84" fill="#009C3B" />
      {/* Losango amarelo */}
      <polygon points="60,7 113,42 60,77 7,42" fill="#FFDF00" />
      {/* Círculo azul */}
      <circle cx="60" cy="42" r="18" fill="#002776" />
      {/* Faixa branca */}
      <path d="M 42 48 Q 60 38 78 48" stroke="white" strokeWidth="3.5" fill="none" />
      {/* ORDEM E PROGRESSO */}
      <text x="60" y="50" textAnchor="middle" fill="white" fontSize="4.2" fontFamily="Arial, sans-serif" fontWeight="700" letterSpacing="0.8">
        ORDEM E PROGRESSO
      </text>
      {/* Estrelinhas estilizadas */}
      {[
        [55,33],[65,33],[51,37],[69,37],[47,42],[73,42],[51,47],[69,47],[55,51],[65,51],
        [60,31],[60,53]
      ].map(([cx, cy], i) => (
        <circle key={i} cx={cx} cy={cy} r="0.9" fill="white" />
      ))}
    </svg>
  );
}

// ── Card de módulo ─────────────────────────────────────────────────────────────
function ModuleCard({ category, songs, index }) {
  const navigate = useNavigate();
  const audioCount = songs.filter(s => (s.contentType || 'audio') === 'audio').length;
  const videoCount = songs.filter(s => s.contentType === 'video').length;

  return (
    <div
      className={`fade-up fade-up-${Math.min(index + 1, 5)}`}
      onClick={() => navigate(`/modulo/${category._id}`)}
      style={{
        background: 'var(--bg-card)', border: '1px solid var(--border)',
        borderRadius: 14, padding: '18px 20px', cursor: 'pointer',
        transition: 'all 0.22s', marginBottom: 10,
      }}
      onMouseEnter={e => {
        e.currentTarget.style.borderColor = 'var(--border-strong)';
        e.currentTarget.style.transform = 'translateX(4px)';
        e.currentTarget.style.background = '#172010';
      }}
      onMouseLeave={e => {
        e.currentTarget.style.borderColor = 'var(--border)';
        e.currentTarget.style.transform = 'translateX(0)';
        e.currentTarget.style.background = 'var(--bg-card)';
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
        <IconPreview iconName={category.icon} colorKey={category.iconColor} />
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap', marginBottom: 3 }}>
            <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 19, letterSpacing: '0.06em', color: 'var(--white)' }}>
              {category.name}
            </h3>
            {category.isNew && <span className="badge badge-new">NOVO</span>}
          </div>
          {category.description && (
            <p style={{ color: 'var(--white-dim)', fontSize: 13, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', marginBottom: 6 }}>
              {category.description}
            </p>
          )}
          <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
            {audioCount > 0 && (
              <span style={{ fontSize: 11, color: 'var(--gold)', fontWeight: 600 }}>🎵 {audioCount} música{audioCount > 1 ? 's' : ''}</span>
            )}
            {videoCount > 0 && (
              <span style={{ fontSize: 11, color: '#86c645', fontWeight: 600 }}>🎬 {videoCount} vídeo{videoCount > 1 ? 's' : ''}</span>
            )}
          </div>
          <div className="progress-bar-wrap" style={{ marginTop: 8 }}>
            <div className="progress-bar-fill" style={{ width: `${Math.min(100, (songs.length / 10) * 100)}%` }} />
          </div>
        </div>
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--white-faint)" strokeWidth="2" strokeLinecap="round">
          <polyline points="9,18 15,12 9,6" />
        </svg>
      </div>

      {/* Preview das 3 primeiras músicas */}
      {songs.length > 0 && (
        <div style={{ marginTop: 14, borderTop: '1px solid var(--border)', paddingTop: 12, display: 'flex', flexDirection: 'column', gap: 2 }}
          onClick={e => e.stopPropagation()}>
          {songs.slice(0, 3).map(song => {
            const isVideo = song.contentType === 'video';
            return (
              <Link
                key={song._id}
                to={isVideo ? `/video/${song._id}` : `/play/${song._id}`}
                style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 10, padding: '7px 10px', borderRadius: 8, transition: 'background 0.15s', color: 'var(--white)' }}
                onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.05)'}
                onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
              >
                <div style={{
                  width: 30, height: 30, borderRadius: 7, flexShrink: 0,
                  background: isVideo ? 'rgba(134,198,69,0.12)' : 'var(--bg-dark)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  {isVideo
                    ? <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="#86c645" strokeWidth="2"><polygon points="23,7 16,12 23,17"/><rect x="1" y="5" width="15" height="14" rx="2"/></svg>
                    : <svg width="11" height="11" viewBox="0 0 24 24" fill="var(--gold)" stroke="none"><polygon points="5,3 19,12 5,21"/></svg>}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 13, fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{song.title}</div>
                </div>
                {!isVideo && song.lyrics?.length > 0 && (
                  <span style={{ fontSize: 10, fontWeight: 700, padding: '2px 6px', borderRadius: 4, background: 'rgba(134,198,69,0.1)', color: '#86c645', flexShrink: 0 }}>SYNC</span>
                )}
                {isVideo && (
                  <span style={{ fontSize: 10, fontWeight: 700, padding: '2px 6px', borderRadius: 4, background: 'rgba(134,198,69,0.1)', color: '#86c645', flexShrink: 0 }}>VÍDEO</span>
                )}
              </Link>
            );
          })}
          {songs.length > 3 && (
            <div style={{ padding: '5px 10px', fontSize: 12, color: 'var(--white-faint)', textAlign: 'center' }}>
              + {songs.length - 3} mais →
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ── Home ──────────────────────────────────────────────────────────────────────
export default function Home() {
  const [categories, setCategories] = useState([]);
  const [songsByCategory, setSongsByCategory] = useState({});
  const [loading, setLoading] = useState(true);
  const secret = useSecretTrigger(5, 3000);

  useEffect(() => {
    const load = async () => {
      try {
        const { data } = await api.get('/categories');
        setCategories(data.categories);
        const songsMap = {};
        await Promise.all(data.categories.map(async cat => {
          const { data: sd } = await api.get(`/songs/category/${cat._id}`);
          songsMap[cat._id] = sd.songs;
        }));
        setSongsByCategory(songsMap);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-dark)' }}>
      <Navbar />

      {/* ══ HERO ═══════════════════════════════════════════════════════════════ */}
      <div style={{
        position: 'relative', overflow: 'hidden',
        background: 'linear-gradient(180deg, #0a1f07 0%, #0c1a09 60%, var(--bg-dark) 100%)',
        borderBottom: '1px solid var(--border)',
        padding: '48px 16px 40px',
      }}>
        {/* Fundo decorativo */}
        <div style={{
          position: 'absolute', inset: 0, opacity: 0.06,
          backgroundImage: 'radial-gradient(circle at 15% 50%, #3a7c20 0%, transparent 55%), radial-gradient(circle at 85% 30%, #C9A227 0%, transparent 45%)',
          pointerEvents: 'none',
        }} />

        <div className="container" style={{ position: 'relative', textAlign: 'center' }}>

          {/* Bandeira grande centralizada — SECRET TRIGGER */}
          <div onClick={secret.open} style={{ cursor: 'default', userSelect: 'none', marginBottom: 20 }}>
            <BandeiraBrasil size={200} />
          </div>

          {/* Linha separadora dourada */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, justifyContent: 'center', marginBottom: 10 }}>
            <div style={{ height: 1, width: 70, background: 'linear-gradient(90deg, transparent, var(--gold))' }} />
            <div style={{ width: 6, height: 6, background: 'var(--gold)', borderRadius: '50%', opacity: 0.8 }} />
            <div style={{ height: 1, width: 70, background: 'linear-gradient(90deg, var(--gold), transparent)' }} />
          </div>

          <p style={{ fontSize: 12, letterSpacing: '0.22em', textTransform: 'uppercase', color: 'var(--white-faint)' }}>
            Sistema de Aprendizagem e Treinamento
          </p>
        </div>
      </div>

      {/* ══ MÓDULOS ════════════════════════════════════════════════════════════ */}
      <div className="container" style={{ padding: '28px 16px 60px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 22 }}>
          <div style={{ width: 3, height: 16, background: 'var(--gold)', borderRadius: 2 }} />
          <span style={{ fontFamily: 'var(--font-body)', fontWeight: 700, fontSize: 11, letterSpacing: '0.18em', textTransform: 'uppercase', color: 'var(--gold)' }}>
            MÓDULOS DE APRENDIZAGEM
          </span>
        </div>

        {loading ? (
          <div style={{ display: 'flex', justifyContent: 'center', padding: '60px 0' }}>
            <div className="spinner" />
          </div>
        ) : categories.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '60px 20px', color: 'var(--white-dim)' }}>
            <p style={{ fontSize: 16 }}>Nenhum módulo disponível no momento.</p>
          </div>
        ) : (
          categories.map((cat, i) => (
            <ModuleCard
              key={cat._id}
              category={cat}
              songs={songsByCategory[cat._id] || []}
              index={i}
            />
          ))
        )}
      </div>

      {/* ══ RODAPÉ ═══════════════════════════════════════════════════════════ */}
      <div style={{
        textAlign: 'center', padding: '20px 16px',
        borderTop: '1px solid rgba(201,162,39,0.08)',
        color: 'rgba(255,255,255,0.18)', fontSize: 11, letterSpacing: '0.1em',
      }}>
        C.H.D.I · 1º RCG · Brasília – DF &nbsp;·&nbsp; v2.0
      </div>

      {secret.show && <AdminLoginModal onClose={secret.close} />}
    </div>
  );
}

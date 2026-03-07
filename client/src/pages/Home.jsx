import { useEffect, useState, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { IconPreview } from '../components/Icons';
import AdminLoginModal from '../components/AdminLoginModal';
import api from '../api/axios';

// ─── Secret trigger: 5 clicks on the logo within 3 seconds ───────────────────
function useSecretTrigger(threshold = 5, windowMs = 3000) {
  const [show, setShow] = useState(false);
  const clicks = useRef([]);

  const handleClick = () => {
    const now = Date.now();
    clicks.current = clicks.current.filter(t => now - t < windowMs);
    clicks.current.push(now);
    if (clicks.current.length >= threshold) {
      clicks.current = [];
      setShow(true);
    }
  };

  return { show, open: handleClick, close: () => setShow(false) };
}

function ModuleCard({ category, songs, index }) {
  const navigate = useNavigate();
  return (
    <div className={`card fade-up fade-up-${Math.min(index + 1, 5)}`}
      style={{ marginBottom: 12, cursor: 'pointer', borderColor: 'rgba(201,162,39,0.12)', transition: 'border-color 0.2s, transform 0.2s, background 0.2s' }}
      onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--border-strong)'; e.currentTarget.style.transform = 'translateX(3px)'; e.currentTarget.style.background = 'var(--card-hover)'; }}
      onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(201,162,39,0.12)'; e.currentTarget.style.transform = 'translateX(0)'; e.currentTarget.style.background = 'var(--card-bg)'; }}
      onClick={() => navigate(`/modulo/${category._id}`)}>

      <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
        <IconPreview iconName={category.icon} colorKey={category.iconColor} />
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
            <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 19, letterSpacing: '0.06em', color: 'var(--white)' }}>{category.name}</h3>
            {category.isNew && <span className="badge badge-new">NOVO</span>}
          </div>
          {category.description && (
            <p style={{ color: 'var(--white-dim)', fontSize: 13, marginTop: 3, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{category.description}</p>
          )}
          <p style={{ color: 'var(--gold)', fontSize: 12, marginTop: 4, fontWeight: 600 }}>{category.songCount} canção(ões)</p>
          <div className="progress-bar-wrap" style={{ marginTop: 8 }}>
            <div className="progress-bar-fill" style={{ width: `${Math.min(100, (category.songCount / 10) * 100)}%` }} />
          </div>
        </div>
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--white-faint)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="9,18 15,12 9,6" />
        </svg>
      </div>

      {songs && songs.length > 0 && (
        <div style={{ marginTop: 14, borderTop: '1px solid var(--border)', paddingTop: 12, display: 'flex', flexDirection: 'column', gap: 4 }}
          onClick={e => e.stopPropagation()}>
          {songs.slice(0, 3).map(song => (
            <Link key={song._id} to={`/play/${song._id}`}
              style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 10, padding: '8px 10px', borderRadius: 8, transition: 'background 0.15s', color: 'var(--white)' }}
              onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.04)'}
              onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
              <div style={{ width: 32, height: 32, borderRadius: 8, background: 'var(--bg-dark)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <svg width="12" height="12" viewBox="0 0 24 24" fill="var(--gold)" stroke="none"><polygon points="5,3 19,12 5,21" /></svg>
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 13, fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{song.title}</div>
                {song.description && <div style={{ fontSize: 12, color: 'var(--white-dim)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{song.description}</div>}
              </div>
              {song.lyrics?.length > 0 && (
                <span style={{ fontSize: 10, fontWeight: 700, padding: '2px 6px', borderRadius: 4, background: 'rgba(134,198,69,0.1)', color: '#86c645' }}>SYNC</span>
              )}
            </Link>
          ))}
          {songs.length > 3 && (
            <div style={{ padding: '6px 10px', fontSize: 12, color: 'var(--white-dim)', textAlign: 'center' }}>
              + {songs.length - 3} mais canções →
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

      {/* Hero Header — logo is the hidden trigger */}
      <div style={{ background: 'linear-gradient(180deg, rgba(45,80,22,0.18) 0%, transparent 100%)', borderBottom: '1px solid var(--border)', padding: '36px 16px 28px', textAlign: 'center' }}>

        {/* ★ SECRET TRIGGER: click 5× rápido */}
        <div
          onClick={secret.open}
          style={{ width: 72, height: 72, margin: '0 auto 14px', cursor: 'default', userSelect: 'none' }}
          title="">
          <svg viewBox="0 0 72 72" fill="none">
            <polygon points="36,6 45,27 68,27 50,43 57,65 36,52 15,65 22,43 4,27 27,27" fill="none" stroke="#C9A227" strokeWidth="2"/>
            <polygon points="36,18 41,30 54,30 44,38 48,51 36,43 24,51 28,38 18,30 31,30" fill="rgba(201,162,39,0.12)" stroke="rgba(201,162,39,0.4)" strokeWidth="1"/>
          </svg>
        </div>

        <h1 className="fade-up" style={{ fontFamily: 'var(--font-display)', fontSize: 42, letterSpacing: '0.2em', color: 'var(--gold)', marginBottom: 6 }}>C.H.D.I</h1>
        <p className="fade-up" style={{ color: 'var(--white-dim)', fontSize: 13, letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 4 }}>Centro de Hinos e Danças Institucionais</p>
        <div style={{ width: 48, height: 2, background: 'var(--gold)', margin: '14px auto 0', opacity: 0.6 }} />
      </div>

      <div className="container" style={{ padding: '28px 16px 40px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20 }}>
          <div style={{ width: 3, height: 16, background: 'var(--gold)', borderRadius: 2 }} />
          <span style={{ fontFamily: 'var(--font-body)', fontWeight: 700, fontSize: 11, letterSpacing: '0.18em', textTransform: 'uppercase', color: 'var(--gold)' }}>MÓDULOS DE APRENDIZAGEM</span>
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
            <ModuleCard key={cat._id} category={cat} songs={songsByCategory[cat._id] || []} index={i} />
          ))
        )}
      </div>

      <div style={{ textAlign: 'center', padding: '20px 16px', color: 'rgba(255,255,255,0.18)', fontSize: 12, letterSpacing: '0.08em', borderTop: '1px solid rgba(201,162,39,0.06)' }}>
        C.H.D.I v2.0 — by SAYOZ
      </div>

      {/* Hidden admin login modal */}
      {secret.show && <AdminLoginModal onClose={secret.close} />}
    </div>
  );
}

import { useEffect, useState, useRef, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { IconPreview } from '../components/Icons';
import api from '../api/axios';

function formatTime(s) {
  if (!s || isNaN(s)) return '0:00';
  const m = Math.floor(s / 60);
  const sec = Math.floor(s % 60);
  return `${m}:${sec.toString().padStart(2, '0')}`;
}

export default function Player() {
  const { id } = useParams();
  const [song, setSong]           = useState(null);
  const [loading, setLoading]     = useState(true);
  const [error, setError]         = useState('');
  const [playing, setPlaying]     = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration]   = useState(0);
  const [activeLine, setActiveLine] = useState(-1);

  // <audio> está SEMPRE no DOM — nunca é desmontado
  const audioRef  = useRef(null);
  const lyricsRef = useRef(null);
  const lineRefs  = useRef([]);
  const rafRef    = useRef(null);
  const songRef   = useRef(null);
  const activeRef = useRef(-1);

  useEffect(() => { songRef.current = song; }, [song]);

  // ── Carrega a música ──────────────────────────────────────────────────────
  useEffect(() => {
    api.get(`/songs/${id}`)
      .then(({ data }) => setSong(data.song))
      .catch(() => setError('Música não encontrada.'))
      .finally(() => setLoading(false));
  }, [id]);

  // ── Atualiza src quando song.audioUrl fica disponível ────────────────────
  // FIX PRINCIPAL: os event listeners são attachados no mount (audio sempre existe).
  // Aqui só atualizamos o src.
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio || !song?.audioUrl) return;
    if (audio.src !== song.audioUrl) {
      audio.src = song.audioUrl;
      audio.load();
    }
  }, [song?.audioUrl]);

  // ── RAF loop ──────────────────────────────────────────────────────────────
  const stopRaf = useCallback(() => {
    if (rafRef.current) { cancelAnimationFrame(rafRef.current); rafRef.current = null; }
  }, []);

  const startRaf = useCallback(() => {
    stopRaf();
    const tick = () => {
      const audio = audioRef.current;
      if (!audio || audio.paused) return;
      const t = audio.currentTime;
      setCurrentTime(t);
      const lyrics = songRef.current?.lyrics;
      if (lyrics?.length) {
        const ms = t * 1000;
        let idx = -1;
        for (let i = 0; i < lyrics.length; i++) {
          if (ms >= lyrics[i].timeMs) idx = i; else break;
        }
        if (idx !== activeRef.current) {
          activeRef.current = idx;
          setActiveLine(idx);
          if (idx >= 0 && lineRefs.current[idx]) {
            lineRefs.current[idx].scrollIntoView({ behavior: 'smooth', block: 'center' });
          }
        }
      }
      rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);
  }, [stopRaf]);

  // ── Event listeners — attachados UMA VEZ no mount no elemento estático ───
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const onMeta  = () => setDuration(audio.duration);
    const onPlay  = () => { setPlaying(true);  startRaf(); };
    const onPause = () => { setPlaying(false); stopRaf(); };
    const onEnd   = () => {
      setPlaying(false); stopRaf();
      setActiveLine(-1); activeRef.current = -1;
      setCurrentTime(0);
    };

    audio.addEventListener('loadedmetadata', onMeta);
    audio.addEventListener('play',   onPlay);
    audio.addEventListener('pause',  onPause);
    audio.addEventListener('ended',  onEnd);

    return () => {
      audio.removeEventListener('loadedmetadata', onMeta);
      audio.removeEventListener('play',   onPlay);
      audio.removeEventListener('pause',  onPause);
      audio.removeEventListener('ended',  onEnd);
      stopRaf();
    };
  // [] = apenas no mount. O <audio> nunca desmonta, src é atualizado via outro useEffect.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── Controles ─────────────────────────────────────────────────────────────
  const togglePlay = () => {
    const audio = audioRef.current;
    if (!audio) return;
    if (audio.paused) audio.play().catch(() => {});
    else              audio.pause();
  };

  const handleSeek = (e) => {
    const audio = audioRef.current;
    if (!audio || !duration) return;
    const t = (e.target.value / 100) * duration;
    audio.currentTime = t;
    setCurrentTime(t);
    const lyrics = songRef.current?.lyrics;
    if (lyrics?.length) {
      const ms = t * 1000;
      let idx = -1;
      for (let i = 0; i < lyrics.length; i++) {
        if (ms >= lyrics[i].timeMs) idx = i; else break;
      }
      activeRef.current = idx;
      setActiveLine(idx);
    }
  };

  const handleRestart = () => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.currentTime = 0;
    setCurrentTime(0);
    setActiveLine(-1);
    activeRef.current = -1;
    audio.play().catch(() => {});
  };

  const seekToLine = (line) => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.currentTime = line.timeMs / 1000;
    if (audio.paused) audio.play().catch(() => {});
  };

  const seekPct = duration ? (currentTime / duration) * 100 : 0;
  const backTo  = song?.category ? `/modulo/${song.category._id || song.category}` : '/';
  const lyrics  = song?.lyrics || [];

  if (!loading && !error && song?.contentType === 'video') {
    window.location.replace(`/video/${id}`);
    return null;
  }

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-dark)' }}>

      {/* SEMPRE no DOM — event listeners dependem disto */}
      <audio ref={audioRef} preload="metadata" style={{ display: 'none' }} />

      <Navbar />

      {loading && <div className="page-loader"><div className="spinner" /></div>}

      {!loading && (error || !song) && (
        <div style={{ textAlign: 'center', padding: '80px 20px', color: 'var(--white-dim)' }}>
          <p>{error || 'Música não encontrada.'}</p>
          <Link to="/" className="btn btn-gold" style={{ marginTop: 20, display: 'inline-block' }}>Voltar</Link>
        </div>
      )}

      {!loading && !error && song && (
        <>
          {/* ── Header ── */}
          <div style={{
            background: 'linear-gradient(180deg, rgba(20,40,10,0.95) 0%, rgba(10,18,8,0.7) 100%)',
            borderBottom: '1px solid var(--border)', padding: '24px 16px 20px',
          }}>
            <div className="container">
              <Link to={backTo} style={{
                display: 'inline-flex', alignItems: 'center', gap: 6,
                color: 'var(--white-dim)', textDecoration: 'none', fontSize: 13, fontWeight: 600, marginBottom: 16,
              }}
                onMouseEnter={e => e.currentTarget.style.color = 'var(--gold)'}
                onMouseLeave={e => e.currentTarget.style.color = 'var(--white-dim)'}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                  <polyline points="15,18 9,12 15,6"/>
                </svg>
                Voltar ao módulo
              </Link>
              <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                {song.category && <IconPreview iconName={song.category.icon} colorKey={song.category.iconColor} />}
                <div>
                  <h1 style={{
                    fontFamily: 'var(--font-display)', fontSize: 'clamp(22px, 5vw, 30px)',
                    letterSpacing: '0.08em', color: 'var(--white)', marginBottom: 4,
                  }}>{song.title}</h1>
                  {song.category && <p style={{ color: 'var(--white-dim)', fontSize: 13, fontWeight: 600 }}>{song.category.name}</p>}
                </div>
              </div>
            </div>
          </div>

          <div className="container" style={{ padding: '20px 16px 80px' }}>

            {/* ── Player Bar ── */}
            <div className="player-bar fade-up" style={{ marginBottom: 28 }}>
              {!song.audioUrl ? (
                <div style={{ padding: '14px 16px', textAlign: 'center', color: '#f87171', fontSize: 13 }}>
                  ⚠️ Áudio não disponível para esta música.
                </div>
              ) : (
                <div className="player-controls">
                  <button onClick={handleRestart} title="Reiniciar"
                    style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 6, borderRadius: 8, display: 'flex', alignItems: 'center', color: 'var(--white-dim)', transition: 'color 0.15s' }}
                    onMouseEnter={e => e.currentTarget.style.color = 'var(--gold)'}
                    onMouseLeave={e => e.currentTarget.style.color = 'var(--white-dim)'}>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                      <polyline points="1,4 1,10 7,10"/><path d="M3.51 15a9 9 0 1 0 .49-3.1"/>
                    </svg>
                  </button>

                  <button className="play-btn" onClick={togglePlay}>
                    {playing
                      ? <svg width="20" height="20" viewBox="0 0 24 24" fill="#0A1208"><rect x="6" y="4" width="4" height="16"/><rect x="14" y="4" width="4" height="16"/></svg>
                      : <svg width="20" height="20" viewBox="0 0 24 24" fill="#0A1208"><polygon points="5,3 19,12 5,21"/></svg>}
                  </button>

                  <div style={{ flex: 1 }}>
                    <input type="range" className="seek-bar" min="0" max="100" step="0.05"
                      value={seekPct} style={{ '--seek-pct': `${seekPct}%` }} onChange={handleSeek} />
                  </div>

                  <span className="time-display">{formatTime(currentTime)} / {formatTime(duration)}</span>
                </div>
              )}
            </div>

            {/* ── Letra Sincronizada ── */}
            {lyrics.length > 0 ? (
              <div className="fade-up">
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
                  <div style={{ width: 3, height: 16, background: 'var(--gold)', borderRadius: 2 }} />
                  <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.18em', textTransform: 'uppercase', color: 'var(--gold)' }}>
                    LETRA SINCRONIZADA
                  </span>
                  {!playing && activeLine < 0 && (
                    <span style={{ fontSize: 11, color: 'var(--white-faint)', marginLeft: 4 }}>
                      ▶ Pressione play para iniciar
                    </span>
                  )}
                </div>

                <div ref={lyricsRef} style={{
                  background: 'rgba(0,0,0,0.25)', border: '1px solid var(--border)',
                  borderRadius: 14, padding: '12px 8px', maxHeight: '60vh', overflowY: 'auto',
                }}>
                  {lyrics.map((line, i) => {
                    const isActive = i === activeLine;
                    const isPast   = i < activeLine;
                    return (
                      <div key={i} ref={el => lineRefs.current[i] = el}
                        onClick={() => seekToLine(line)}
                        style={{
                          padding: '10px 18px', marginBottom: 2, borderRadius: 10, cursor: 'pointer',
                          transition: 'background 0.25s, border-left-color 0.25s, transform 0.25s, opacity 0.25s',
                          fontSize:   isActive ? 19 : 15,
                          fontWeight: isActive ? 700 : isPast ? 400 : 500,
                          color:      isActive ? '#FFFFFF' : isPast ? 'rgba(255,255,255,0.28)' : 'rgba(255,255,255,0.55)',
                          background: isActive ? 'rgba(201,162,39,0.14)' : 'transparent',
                          borderLeft: isActive ? '4px solid var(--gold)' : '4px solid transparent',
                          transform:  isActive ? 'translateX(6px)' : 'none',
                          boxShadow:  isActive ? '0 2px 20px rgba(201,162,39,0.08)' : 'none',
                          lineHeight: 1.5, userSelect: 'none',
                        }}
                      >
                        {line.text}
                        {isActive && (
                          <span style={{
                            display: 'inline-block', width: 7, height: 7, borderRadius: '50%',
                            background: 'var(--gold)', marginLeft: 9, verticalAlign: 'middle',
                            animation: 'lyrPulse 1s ease-in-out infinite',
                          }} />
                        )}
                      </div>
                    );
                  })}
                </div>

                <style>{`
                  @keyframes lyrPulse {
                    0%, 100% { opacity: 1; transform: scale(1); }
                    50%      { opacity: 0.3; transform: scale(0.65); }
                  }
                `}</style>
              </div>
            ) : (
              <div style={{ textAlign: 'center', padding: '60px 20px', color: 'var(--white-faint)', fontSize: 14 }}>
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"
                  style={{ display: 'block', margin: '0 auto 14px', opacity: 0.5 }}>
                  <path d="M9 18V5l12-2v13"/><circle cx="6" cy="18" r="3"/><circle cx="18" cy="16" r="3"/>
                </svg>
                Letra não disponível para esta música.
              </div>
            )}

            {song.description && (
              <div style={{ marginTop: 28, padding: '16px 20px', background: 'rgba(0,0,0,0.2)', borderRadius: 12, border: '1px solid var(--border)' }}>
                <p style={{ fontSize: 12, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--gold)', marginBottom: 8 }}>Sobre</p>
                <p style={{ fontSize: 14, color: 'var(--white-dim)', lineHeight: 1.7 }}>{song.description}</p>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}

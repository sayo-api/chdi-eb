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
  const [song, setSong] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [playing, setPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [activeLine, setActiveLine] = useState(-1);
  const audioRef = useRef(null);
  const lyricsRef = useRef(null);
  const lineRefs = useRef([]);

  useEffect(() => {
    api.get(`/songs/${id}`)
      .then(({ data }) => setSong(data.song))
      .catch(() => setError('Música não encontrada.'))
      .finally(() => setLoading(false));
  }, [id]);

  const updateLyrics = useCallback((time) => {
    if (!song?.lyrics?.length) return;
    const ms = time * 1000;
    let idx = -1;
    for (let i = 0; i < song.lyrics.length; i++) {
      if (ms >= song.lyrics[i].timeMs) idx = i;
    }
    if (idx !== activeLine) {
      setActiveLine(idx);
      if (idx >= 0 && lineRefs.current[idx]) {
        lineRefs.current[idx].scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }
  }, [song, activeLine]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    const onTime = () => { setCurrentTime(audio.currentTime); updateLyrics(audio.currentTime); };
    const onMeta = () => setDuration(audio.duration);
    const onEnd = () => { setPlaying(false); setActiveLine(-1); };
    audio.addEventListener('timeupdate', onTime);
    audio.addEventListener('loadedmetadata', onMeta);
    audio.addEventListener('ended', onEnd);
    return () => {
      audio.removeEventListener('timeupdate', onTime);
      audio.removeEventListener('loadedmetadata', onMeta);
      audio.removeEventListener('ended', onEnd);
    };
  }, [updateLyrics]);

  const togglePlay = () => {
    const audio = audioRef.current;
    if (!audio) return;
    if (playing) { audio.pause(); setPlaying(false); }
    else { audio.play(); setPlaying(true); }
  };

  const handleSeek = (e) => {
    const audio = audioRef.current;
    if (!audio || !duration) return;
    const t = (e.target.value / 100) * duration;
    audio.currentTime = t;
    setCurrentTime(t);
  };

  const handleRestart = () => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.currentTime = 0;
    audio.play();
    setPlaying(true);
    setActiveLine(-1);
  };

  const seekPct = duration ? (currentTime / duration) * 100 : 0;

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
        <p>{error || 'Música não encontrada.'}</p>
        <Link to="/" className="btn btn-gold" style={{ marginTop: 20, display: 'inline-block' }}>Voltar</Link>
      </div>
    </div>
  );

  const backTo = song.category ? `/modulo/${song.category._id || song.category}` : '/';

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-dark)' }}>
      <Navbar />
      {song.audioUrl && <audio ref={audioRef} src={song.audioUrl} preload="metadata" />}

      {/* Header gradient */}
      <div style={{ background: 'linear-gradient(180deg, rgba(45,80,22,0.2) 0%, transparent 100%)', borderBottom: '1px solid var(--border)', padding: '24px 16px 20px' }}>
        <div className="container">
          <Link to={backTo} style={{ display: 'inline-flex', alignItems: 'center', gap: 6, color: 'var(--white-dim)', textDecoration: 'none', fontSize: 13, fontWeight: 600, marginBottom: 18 }}
            onMouseEnter={e => e.currentTarget.style.color = 'var(--gold)'}
            onMouseLeave={e => e.currentTarget.style.color = 'var(--white-dim)'}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><polyline points="15,18 9,12 15,6"/></svg>
            Voltar ao módulo
          </Link>
          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            {song.category && <IconPreview iconName={song.category.icon} colorKey={song.category.iconColor} />}
            <div>
              <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 28, letterSpacing: '0.08em', color: 'var(--white)', marginBottom: 4 }}>{song.title}</h1>
              {song.category && <p style={{ color: 'var(--white-dim)', fontSize: 13, fontWeight: 600 }}>{song.category.name}</p>}
            </div>
          </div>
        </div>
      </div>

      <div className="container" style={{ padding: '24px 16px 80px' }}>

        {/* ── Player Bar ── */}
        <div className="player-bar fade-up" style={{ marginBottom: 28 }}>
          <div className="player-controls">
            <button onClick={handleRestart} title="Reiniciar"
              style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 6, borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'background 0.15s' }}
              onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.06)'}
              onMouseLeave={e => e.currentTarget.style.background = 'none'}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--white-dim)" strokeWidth="2" strokeLinecap="round"><polyline points="1,4 1,10 7,10"/><path d="M3.51 15a9 9 0 1 0 .49-3.1"/></svg>
            </button>
            <button className="play-btn" onClick={togglePlay} disabled={!song.audioUrl}>
              {playing
                ? <svg width="20" height="20" viewBox="0 0 24 24" fill="#0A1208"><rect x="6" y="4" width="4" height="16"/><rect x="14" y="4" width="4" height="16"/></svg>
                : <svg width="20" height="20" viewBox="0 0 24 24" fill="#0A1208"><polygon points="5,3 19,12 5,21"/></svg>}
            </button>
            <div style={{ flex: 1 }}>
              <input type="range" className="seek-bar" min="0" max="100" value={seekPct}
                style={{ '--seek-pct': `${seekPct}%` }} onChange={handleSeek} />
            </div>
            <span className="time-display">{formatTime(currentTime)} / {formatTime(duration)}</span>
          </div>
        </div>

        {/* ── Lyrics / Learning Animation ── */}
        {song.lyrics && song.lyrics.length > 0 ? (
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
              <div style={{ width: 3, height: 14, background: 'var(--gold)', borderRadius: 2 }} />
              <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.18em', textTransform: 'uppercase', color: 'var(--gold)' }}>APRENDIZADO — LETRA SINCRONIZADA</span>
              {!playing && activeLine < 0 && (
                <span style={{ fontSize: 11, color: 'var(--white-faint)', marginLeft: 4 }}>▶ Pressione play para iniciar</span>
              )}
            </div>
            <div className="lyrics-container fade-up" ref={lyricsRef}>
              {song.lyrics.map((line, i) => {
                const isActive = i === activeLine;
                const isPast = i < activeLine;
                const isFuture = i > activeLine;
                return (
                  <div key={i} ref={el => lineRefs.current[i] = el}
                    onClick={() => {
                      if (audioRef.current) {
                        audioRef.current.currentTime = line.timeMs / 1000;
                        audioRef.current.play();
                        setPlaying(true);
                      }
                    }}
                    style={{
                      padding: '11px 16px',
                      marginBottom: 4,
                      borderRadius: 10,
                      cursor: 'pointer',
                      transition: 'all 0.25s cubic-bezier(0.4,0,0.2,1)',
                      fontSize: isActive ? 18 : 14,
                      fontWeight: isActive ? 700 : 400,
                      lineHeight: isActive ? 1.4 : 1.5,
                      color: isActive ? '#FFFFFF' : isPast ? 'rgba(255,255,255,0.35)' : 'rgba(255,255,255,0.5)',
                      background: isActive ? 'rgba(212,175,55,0.14)' : 'transparent',
                      borderLeft: isActive ? '4px solid var(--gold)' : '4px solid transparent',
                      transform: isActive ? 'translateX(8px)' : 'none',
                      boxShadow: isActive ? '0 2px 20px rgba(212,175,55,0.1)' : 'none',
                    }}>
                    {line.text}
                    {isActive && (
                      <span style={{
                        display: 'inline-block', width: 8, height: 8, borderRadius: '50%',
                        background: 'var(--gold)', marginLeft: 8,
                        animation: 'pulse 1s infinite',
                        verticalAlign: 'middle',
                      }} />
                    )}
                  </div>
                );
              })}
            </div>
            <style>{`
              @keyframes pulse {
                0%, 100% { opacity: 1; transform: scale(1); }
                50% { opacity: 0.4; transform: scale(0.7); }
              }
            `}</style>
          </div>
        ) : (
          <div style={{ textAlign: 'center', padding: '60px 20px', color: 'var(--white-faint)', fontSize: 14 }}>
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" style={{ display: 'block', margin: '0 auto 14px' }}>
              <path d="M9 18V5l12-2v13"/><circle cx="6" cy="18" r="3"/><circle cx="18" cy="16" r="3"/>
            </svg>
            Letra não disponível para esta música.
          </div>
        )}
      </div>
    </div>
  );
}

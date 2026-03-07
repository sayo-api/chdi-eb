import { useState, useRef, useEffect, useCallback } from 'react';

function formatTime(ms) {
  if (!ms && ms !== 0) return '--';
  const s = ms / 1000;
  const m = Math.floor(s / 60);
  const sec = (s % 60).toFixed(1);
  return `${m}:${sec.padStart(4, '0')}`;
}

function formatTimeSec(s) {
  if (!s && s !== 0) return '--';
  const m = Math.floor(s / 60);
  const sec = Math.floor(s % 60);
  return `${m}:${sec.toString().padStart(2, '0')}`;
}

export default function SyncEditor({ audioFile, audioUrl, initialLyrics = [], onChange }) {
  const [lines, setLines] = useState(() =>
    initialLyrics.map(l => ({ text: l.text, timeMs: l.timeMs, stamped: true }))
  );
  const [rawText, setRawText] = useState(() => initialLyrics.map(l => l.text).join('\n'));
  const [mode, setMode] = useState(initialLyrics.length > 0 ? 'sync' : 'text'); // 'text' | 'sync' | 'preview'
  const [playing, setPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [activeLine, setActiveLine] = useState(-1);
  const [nextLineIdx, setNextLineIdx] = useState(0);
  const [speed, setSpeed] = useState(1);
  const audioRef = useRef(null);
  const syncListRef = useRef(null);
  const lineRefs = useRef([]);
  const objectUrlRef = useRef(null);

  // Build audio source URL
  const audioSrc = audioFile
    ? (() => { if (objectUrlRef.current) URL.revokeObjectURL(objectUrlRef.current); objectUrlRef.current = URL.createObjectURL(audioFile); return objectUrlRef.current; })()
    : audioUrl || null;

  useEffect(() => () => { if (objectUrlRef.current) URL.revokeObjectURL(objectUrlRef.current); }, []);

  // Parse text lines when switching to sync mode
  const handleGoToSync = () => {
    const parsed = rawText.split('\n').map(t => t.trim()).filter(Boolean);
    const existingMap = {};
    lines.forEach(l => { existingMap[l.text] = l.timeMs; });
    const newLines = parsed.map(text => ({
      text,
      timeMs: existingMap[text] ?? null,
      stamped: existingMap[text] != null,
    }));
    setLines(newLines);
    setMode('sync');
    setNextLineIdx(newLines.findIndex(l => !l.stamped) >= 0 ? newLines.findIndex(l => !l.stamped) : 0);
  };

  const handleGoToPreview = () => {
    const stamped = lines.filter(l => l.stamped && l.timeMs !== null);
    onChange(stamped.map(l => ({ text: l.text, timeMs: l.timeMs })));
    setMode('preview');
  };

  // Audio events
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    const onTime = () => {
      setCurrentTime(audio.currentTime);
      const ms = audio.currentTime * 1000;
      // Find active line (for preview mode)
      let idx = -1;
      for (let i = 0; i < lines.length; i++) {
        if (lines[i].stamped && lines[i].timeMs !== null && ms >= lines[i].timeMs) idx = i;
      }
      setActiveLine(idx);
      // Auto scroll in preview
      if (mode === 'preview' && idx >= 0 && lineRefs.current[idx]) {
        lineRefs.current[idx].scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    };
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
  }, [lines, mode]);

  const togglePlay = () => {
    const audio = audioRef.current;
    if (!audio) return;
    if (playing) { audio.pause(); setPlaying(false); }
    else { audio.play(); setPlaying(true); }
  };

  const handleSeek = (e) => {
    const audio = audioRef.current;
    if (!audio) return;
    const t = (e.target.value / 100) * duration;
    audio.currentTime = t;
    setCurrentTime(t);
  };

  const handleChangeSpeed = (s) => {
    const audio = audioRef.current;
    if (audio) audio.playbackRate = s;
    setSpeed(s);
  };

  // STAMP: set current time as timestamp for a line
  const stamp = useCallback((idx) => {
    const audio = audioRef.current;
    if (!audio) return;
    const ms = Math.round(audio.currentTime * 1000);
    setLines(prev => {
      const updated = [...prev];
      updated[idx] = { ...updated[idx], timeMs: ms, stamped: true };
      // Call onChange with all stamped lines
      const stamped = updated.filter(l => l.stamped && l.timeMs !== null);
      onChange(stamped.map(l => ({ text: l.text, timeMs: l.timeMs })));
      return updated;
    });
    // Advance nextLineIdx
    setNextLineIdx(idx + 1 < lines.length ? idx + 1 : idx);
    // Scroll to next line
    if (idx + 1 < lines.length && lineRefs.current[idx + 1]) {
      lineRefs.current[idx + 1].scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }, [lines.length, onChange]);

  // SPACE key to stamp next line during sync
  useEffect(() => {
    if (mode !== 'sync') return;
    const handler = (e) => {
      if (e.code === 'Space' && e.target.tagName !== 'INPUT' && e.target.tagName !== 'TEXTAREA') {
        e.preventDefault();
        if (nextLineIdx < lines.length) stamp(nextLineIdx);
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [mode, nextLineIdx, lines.length, stamp]);

  const clearStamp = (idx) => {
    setLines(prev => {
      const updated = [...prev];
      updated[idx] = { ...updated[idx], timeMs: null, stamped: false };
      const stamped = updated.filter(l => l.stamped && l.timeMs !== null);
      onChange(stamped.map(l => ({ text: l.text, timeMs: l.timeMs })));
      return updated;
    });
  };

  const editTime = (idx, val) => {
    const sec = parseFloat(val);
    if (isNaN(sec)) return;
    const ms = Math.round(sec * 1000);
    setLines(prev => {
      const updated = [...prev];
      updated[idx] = { ...updated[idx], timeMs: ms, stamped: true };
      const stamped = updated.filter(l => l.stamped && l.timeMs !== null);
      onChange(stamped.map(l => ({ text: l.text, timeMs: l.timeMs })));
      return updated;
    });
  };

  const seekToLine = (idx) => {
    const audio = audioRef.current;
    if (!audio || lines[idx].timeMs == null) return;
    audio.currentTime = lines[idx].timeMs / 1000;
    setCurrentTime(lines[idx].timeMs / 1000);
  };

  const stampedCount = lines.filter(l => l.stamped).length;
  const seekPct = duration ? (currentTime / duration) * 100 : 0;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
      {audioSrc && <audio ref={audioRef} src={audioSrc} preload="metadata" style={{ display: 'none' }} />}

      {/* ─── Mode Tabs ─────────────────────────────────────── */}
      <div style={{ display: 'flex', gap: 0, borderBottom: '1px solid var(--border)', marginBottom: 20 }}>
        {[
          { key: 'text', label: '① Letras', icon: '✏️' },
          { key: 'sync', label: '② Sincronizar', icon: '🎵' },
          { key: 'preview', label: '③ Pré-visualizar', icon: '▶' },
        ].map(({ key, label, icon }) => (
          <button key={key} type="button"
            onClick={() => {
              if (key === 'sync') handleGoToSync();
              else if (key === 'preview') handleGoToPreview();
              else setMode('text');
            }}
            style={{
              padding: '10px 18px', background: 'none', border: 'none',
              borderBottom: mode === key ? '2px solid var(--gold)' : '2px solid transparent',
              color: mode === key ? 'var(--gold)' : 'var(--white-dim)',
              fontSize: 13, fontWeight: 700, cursor: 'pointer',
              letterSpacing: '0.06em', transition: 'all 0.15s',
              marginBottom: -1,
            }}>
            {icon} {label}
          </button>
        ))}
        {lines.length > 0 && (
          <span style={{ marginLeft: 'auto', alignSelf: 'center', fontSize: 12, color: 'var(--gold)', paddingRight: 4 }}>
            {stampedCount}/{lines.length} sincronizadas
          </span>
        )}
      </div>

      {/* ─── Step 1: Enter Lyrics Text ─────────────────────── */}
      {mode === 'text' && (
        <div>
          <p style={{ fontSize: 13, color: 'var(--white-dim)', marginBottom: 10 }}>
            Cole ou escreva todas as linhas da letra. Uma linha por verso.
          </p>
          <textarea
            value={rawText}
            onChange={e => setRawText(e.target.value)}
            placeholder={"Ouviram do Ipiranga as margens plácidas\nDe um povo heróico o brado retumbante,\n..."}
            style={{
              width: '100%', minHeight: 220, resize: 'vertical',
              background: 'rgba(0,0,0,0.3)', border: '1px solid var(--border)',
              borderRadius: 8, padding: 12, color: 'var(--white)',
              fontFamily: 'var(--font-mono)', fontSize: 13, lineHeight: 1.7,
            }}
          />
          <div style={{ marginTop: 12, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: 12, color: 'var(--white-faint)' }}>
              {rawText.split('\n').filter(l => l.trim()).length} linhas detectadas
            </span>
            <button type="button" className="btn btn-gold"
              onClick={handleGoToSync}
              disabled={!rawText.trim() || !audioSrc}>
              Próximo: Sincronizar →
            </button>
          </div>
          {!audioSrc && (
            <p style={{ fontSize: 12, color: '#f87171', marginTop: 8 }}>⚠️ Faça upload do áudio na aba "Áudio" antes de sincronizar.</p>
          )}
        </div>
      )}

      {/* ─── Step 2: Sync Mode ─────────────────────────────── */}
      {mode === 'sync' && (
        <div>
          {/* Mini player */}
          <div style={{ background: 'rgba(0,0,0,0.4)', border: '1px solid var(--border)', borderRadius: 12, padding: 16, marginBottom: 16 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
              <button type="button" onClick={togglePlay}
                style={{ width: 44, height: 44, borderRadius: '50%', background: 'var(--gold)', border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                {playing
                  ? <svg width="16" height="16" viewBox="0 0 24 24" fill="#0A1208"><rect x="6" y="4" width="4" height="16"/><rect x="14" y="4" width="4" height="16"/></svg>
                  : <svg width="16" height="16" viewBox="0 0 24 24" fill="#0A1208"><polygon points="5,3 19,12 5,21"/></svg>}
              </button>
              <div style={{ flex: 1 }}>
                <input type="range" min="0" max="100" value={seekPct}
                  onChange={handleSeek}
                  style={{ width: '100%', accentColor: 'var(--gold)', cursor: 'pointer' }} />
              </div>
              <span style={{ fontFamily: 'monospace', fontSize: 12, color: 'var(--white-dim)', minWidth: 80, textAlign: 'right' }}>
                {formatTimeSec(currentTime)} / {formatTimeSec(duration)}
              </span>
              <select value={speed} onChange={e => handleChangeSpeed(parseFloat(e.target.value))}
                style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid var(--border)', color: 'var(--white)', padding: '4px 8px', borderRadius: 6, fontSize: 12, cursor: 'pointer' }}>
                <option value="0.5">0.5×</option>
                <option value="0.75">0.75×</option>
                <option value="1">1×</option>
                <option value="1.25">1.25×</option>
              </select>
            </div>
            <div style={{ padding: '8px 12px', background: 'rgba(212,175,55,0.08)', borderRadius: 8, borderLeft: '3px solid var(--gold)', fontSize: 12, color: 'var(--white-dim)' }}>
              🎯 <strong style={{ color: 'var(--gold)' }}>Como sincronizar:</strong> Toque o áudio e pressione <kbd style={{ background: 'rgba(255,255,255,0.1)', padding: '2px 6px', borderRadius: 4, fontFamily: 'monospace' }}>ESPAÇO</kbd> no momento em que cada verso começa. Ou clique no botão <strong>⊕</strong> ao lado de cada linha.
            </div>
          </div>

          {/* Lines list */}
          <div ref={syncListRef} style={{ maxHeight: 380, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 4 }}>
            {lines.map((line, i) => (
              <div key={i} ref={el => lineRefs.current[i] = el}
                style={{
                  display: 'flex', alignItems: 'center', gap: 8, padding: '8px 12px',
                  borderRadius: 8, transition: 'background 0.15s',
                  background: i === nextLineIdx
                    ? 'rgba(212,175,55,0.12)'
                    : line.stamped ? 'rgba(134,198,69,0.06)' : 'rgba(255,255,255,0.03)',
                  border: i === nextLineIdx ? '1px solid rgba(212,175,55,0.4)' : '1px solid transparent',
                }}>
                {/* Line number */}
                <span style={{ fontSize: 11, color: 'var(--white-faint)', minWidth: 22, textAlign: 'right' }}>{i + 1}</span>

                {/* Stamp button */}
                <button type="button" onClick={() => stamp(i)}
                  title="Carimbar no tempo atual"
                  style={{
                    width: 28, height: 28, borderRadius: '50%', flexShrink: 0,
                    background: line.stamped ? 'rgba(134,198,69,0.2)' : 'rgba(212,175,55,0.15)',
                    border: `1px solid ${line.stamped ? '#86c645' : 'var(--gold)'}`,
                    color: line.stamped ? '#86c645' : 'var(--gold)',
                    fontSize: 14, display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}>
                  {line.stamped ? '✓' : '⊕'}
                </button>

                {/* Text */}
                <span style={{ flex: 1, fontSize: 13, color: line.stamped ? 'var(--white)' : 'var(--white-dim)' }}>
                  {line.text}
                </span>

                {/* Timestamp display / edit */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                  {line.stamped && line.timeMs !== null ? (
                    <>
                      <button type="button" onClick={() => seekToLine(i)}
                        style={{ background: 'none', border: 'none', color: '#86c645', fontFamily: 'monospace', fontSize: 12, cursor: 'pointer', padding: '2px 4px' }}>
                        {formatTime(line.timeMs)}
                      </button>
                      <button type="button" onClick={() => clearStamp(i)}
                        style={{ background: 'none', border: 'none', color: '#f87171', cursor: 'pointer', fontSize: 14, padding: '2px 4px' }}>×</button>
                    </>
                  ) : (
                    <input type="number" placeholder="s" step="0.1" min="0"
                      onChange={e => editTime(i, e.target.value)}
                      style={{ width: 58, padding: '4px 6px', fontSize: 12, background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border)', borderRadius: 6, color: 'var(--white)' }} />
                  )}
                </div>
              </div>
            ))}
          </div>

          <div style={{ marginTop: 14, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <button type="button" className="btn btn-ghost" onClick={() => setMode('text')}>← Editar Letras</button>
            <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
              <span style={{ fontSize: 12, color: stampedCount === lines.length ? '#86c645' : 'var(--white-dim)' }}>
                {stampedCount}/{lines.length} sincronizadas
              </span>
              <button type="button" className="btn btn-gold" onClick={handleGoToPreview}>
                Pré-visualizar →
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ─── Step 3: Preview Mode ──────────────────────────── */}
      {mode === 'preview' && (
        <div>
          {/* Player */}
          <div style={{ background: 'rgba(0,0,0,0.4)', border: '1px solid var(--border)', borderRadius: 12, padding: 16, marginBottom: 16 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
              <button type="button" onClick={togglePlay}
                style={{ width: 44, height: 44, borderRadius: '50%', background: 'var(--gold)', border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                {playing
                  ? <svg width="16" height="16" viewBox="0 0 24 24" fill="#0A1208"><rect x="6" y="4" width="4" height="16"/><rect x="14" y="4" width="4" height="16"/></svg>
                  : <svg width="16" height="16" viewBox="0 0 24 24" fill="#0A1208"><polygon points="5,3 19,12 5,21"/></svg>}
              </button>
              <div style={{ flex: 1 }}>
                <input type="range" min="0" max="100" value={seekPct}
                  onChange={handleSeek}
                  style={{ width: '100%', accentColor: 'var(--gold)', cursor: 'pointer' }} />
              </div>
              <span style={{ fontFamily: 'monospace', fontSize: 12, color: 'var(--white-dim)', minWidth: 80, textAlign: 'right' }}>
                {formatTimeSec(currentTime)} / {formatTimeSec(duration)}
              </span>
            </div>
          </div>

          {/* Animated lyrics preview */}
          <div style={{ background: 'rgba(0,0,0,0.5)', border: '1px solid var(--border)', borderRadius: 12, padding: 16, maxHeight: 340, overflowY: 'auto' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
              <div style={{ width: 3, height: 14, background: 'var(--gold)', borderRadius: 2 }} />
              <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.18em', textTransform: 'uppercase', color: 'var(--gold)' }}>PRÉVIA DA ANIMAÇÃO</span>
            </div>
            {lines.filter(l => l.stamped).map((line, i) => (
              <div key={i} ref={el => lineRefs.current[i] = el}
                onClick={() => { if (audioRef.current) { audioRef.current.currentTime = line.timeMs / 1000; audioRef.current.play(); setPlaying(true); } }}
                style={{
                  padding: '10px 14px', marginBottom: 4, borderRadius: 8,
                  cursor: 'pointer', transition: 'all 0.2s',
                  fontSize: i === activeLine ? 17 : 14,
                  fontWeight: i === activeLine ? 700 : 400,
                  color: i === activeLine ? '#FFFFFF' : 'rgba(255,255,255,0.4)',
                  background: i === activeLine ? 'rgba(212,175,55,0.15)' : 'transparent',
                  borderLeft: i === activeLine ? '3px solid var(--gold)' : '3px solid transparent',
                  transform: i === activeLine ? 'translateX(6px)' : 'none',
                }}>
                {line.text}
              </div>
            ))}
          </div>

          <div style={{ marginTop: 14, display: 'flex', gap: 8, justifyContent: 'space-between' }}>
            <button type="button" className="btn btn-ghost" onClick={() => setMode('sync')}>← Voltar ao Sync</button>
            <span style={{ fontSize: 12, color: '#86c645', alignSelf: 'center' }}>✓ {stampedCount} linhas salvas</span>
          </div>
        </div>
      )}
    </div>
  );
}

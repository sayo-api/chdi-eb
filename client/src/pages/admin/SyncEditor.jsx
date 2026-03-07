import { useState, useRef, useEffect, useCallback, useMemo } from 'react';

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

// ─── TimeInput ─────────────────────────────────────────────────────────────────
function TimeInput({ line, idx, onApply, onSeek, onClear }) {
  const [val, setVal] = useState(
    line.stamped && line.timeMs !== null ? (line.timeMs / 1000).toFixed(2) : ''
  );
  const inputRef = useRef(null);
  const prevTimeMs = useRef(line.timeMs);

  useEffect(() => {
    if (line.timeMs !== prevTimeMs.current) {
      prevTimeMs.current = line.timeMs;
      if (document.activeElement !== inputRef.current) {
        setVal(line.stamped && line.timeMs !== null ? (line.timeMs / 1000).toFixed(2) : '');
      }
    }
  }, [line.timeMs, line.stamped]);

  const applyValue = () => {
    const n = parseFloat(val);
    if (!isNaN(n) && n >= 0) onApply(idx, n);
  };

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 4, flexShrink: 0 }}>
      <input
        ref={inputRef}
        type="number"
        placeholder="seg"
        step="0.01"
        min="0"
        value={val}
        onChange={e => setVal(e.target.value)}
        onBlur={applyValue}
        onKeyDown={e => {
          if (e.key === 'Enter') { e.preventDefault(); applyValue(); inputRef.current?.blur(); }
        }}
        title="Tempo em segundos. Enter para aplicar."
        style={{
          width: 68, padding: '4px 6px', fontSize: 12,
          background: 'rgba(255,255,255,0.05)',
          border: `1px solid ${line.stamped ? '#86c645' : 'var(--border)'}`,
          borderRadius: 6, color: 'var(--white)', outline: 'none', boxSizing: 'border-box',
        }}
      />
      {line.stamped && line.timeMs !== null && (
        <>
          <button type="button" onClick={() => onSeek(idx)} title={`Ir para ${formatTime(line.timeMs)}`}
            style={{ background: 'none', border: 'none', color: '#86c645', fontFamily: 'monospace', fontSize: 11, cursor: 'pointer', padding: '2px 4px', whiteSpace: 'nowrap' }}>
            ▶{formatTime(line.timeMs)}
          </button>
          <button type="button" onClick={() => { onClear(idx); setVal(''); }} title="Remover timestamp"
            style={{ background: 'none', border: 'none', color: '#f87171', cursor: 'pointer', fontSize: 14, padding: '2px 4px' }}>
            ×
          </button>
        </>
      )}
    </div>
  );
}

// ─── MiniPlayer ────────────────────────────────────────────────────────────────
function MiniPlayer({ playing, currentTime, duration, seekPct, onTogglePlay, onSeek, onChangeSpeed, speed, showSpeed, hint }) {
  return (
    <div style={{ background: 'rgba(0,0,0,0.4)', border: '1px solid var(--border)', borderRadius: 12, padding: 16, marginBottom: 16 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: hint ? 12 : 0 }}>
        <button
          type="button"
          onClick={onTogglePlay}
          style={{ width: 44, height: 44, borderRadius: '50%', background: 'var(--gold)', border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, cursor: 'pointer' }}
        >
          {playing
            ? <svg width="16" height="16" viewBox="0 0 24 24" fill="#0A1208"><rect x="6" y="4" width="4" height="16"/><rect x="14" y="4" width="4" height="16"/></svg>
            : <svg width="16" height="16" viewBox="0 0 24 24" fill="#0A1208"><polygon points="5,3 19,12 5,21"/></svg>}
        </button>
        <div style={{ flex: 1 }}>
          <input type="range" min="0" max="100" step="0.01" value={seekPct}
            onChange={onSeek}
            style={{ width: '100%', accentColor: 'var(--gold)', cursor: 'pointer' }} />
        </div>
        <span style={{ fontFamily: 'monospace', fontSize: 12, color: 'var(--white-dim)', minWidth: 80, textAlign: 'right' }}>
          {formatTimeSec(currentTime)} / {formatTimeSec(duration)}
        </span>
        {showSpeed && (
          <select value={speed} onChange={e => onChangeSpeed(parseFloat(e.target.value))}
            style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid var(--border)', color: 'var(--white)', padding: '4px 8px', borderRadius: 6, fontSize: 12, cursor: 'pointer' }}>
            <option value="0.5">0.5×</option>
            <option value="0.75">0.75×</option>
            <option value="1">1×</option>
            <option value="1.25">1.25×</option>
          </select>
        )}
      </div>
      {hint && (
        <div style={{ padding: '8px 12px', background: 'rgba(212,175,55,0.08)', borderRadius: 8, borderLeft: '3px solid var(--gold)', fontSize: 12, color: 'var(--white-dim)' }}>
          {hint}
        </div>
      )}
    </div>
  );
}

// ─── TapSync — modo de batida em tempo real ─────────────────────────────────
// O usuário toca a música e aperta ESPAÇO no começo de cada verso.
// Cada batida registra o tempo atual e avança para o próximo verso.
// Depois pode ajustar individualmente com +/- ou campo numérico.
function TapSync({ lines, audioRef, playing, currentTime, duration, seekPct,
                   onTogglePlay, onSeek, onChangeSpeed, speed, onDone }) {

  // tapTimes[i] = timeMs ou null
  const [tapTimes, setTapTimes] = useState(() => lines.map(l => l.timeMs ?? null));
  const [cursor, setCursor]     = useState(0);   // próximo verso a carimbar
  const [lastFlash, setLastFlash] = useState(-1); // animar batida
  const listRef  = useRef(null);
  const rowRefs  = useRef([]);
  const tapRef   = useRef(tapTimes);
  useEffect(() => { tapRef.current = tapTimes; }, [tapTimes]);

  // Scroll para manter cursor visível
  useEffect(() => {
    if (rowRefs.current[cursor]) {
      rowRefs.current[cursor].scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }, [cursor]);

  const doTap = useCallback(() => {
    const audio = audioRef.current;
    if (!audio) return;
    const ms = Math.round(audio.currentTime * 1000);
    const idx = cursor;
    setTapTimes(prev => {
      const next = [...prev];
      next[idx] = ms;
      return next;
    });
    setLastFlash(idx);
    setTimeout(() => setLastFlash(-1), 300);
    setCursor(c => Math.min(c + 1, lines.length - 1));
  }, [audioRef, cursor, lines.length]);

  // ESPAÇO = tap; ← = recuar cursor; → = avançar cursor; Backspace = apagar
  useEffect(() => {
    const handler = (e) => {
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;
      if (e.code === 'Space') { e.preventDefault(); doTap(); }
      if (e.code === 'ArrowRight') { e.preventDefault(); setCursor(c => Math.min(c + 1, lines.length - 1)); }
      if (e.code === 'ArrowLeft')  { e.preventDefault(); setCursor(c => Math.max(c - 1, 0)); }
      if (e.code === 'Backspace')  {
        e.preventDefault();
        const idx = Math.max(cursor - 1, 0);
        setTapTimes(prev => { const n = [...prev]; n[idx] = null; return n; });
        setCursor(idx);
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [doTap, cursor, lines.length]);

  // Ajuste fino: +/- 100ms
  const nudge = (idx, deltaMs) => {
    setTapTimes(prev => {
      const n = [...prev];
      if (n[idx] != null) n[idx] = Math.max(0, n[idx] + deltaMs);
      return n;
    });
  };

  const editDirect = (idx, seconds) => {
    const ms = Math.round(seconds * 1000);
    setTapTimes(prev => { const n = [...prev]; n[idx] = ms; return n; });
  };

  const seekToTap = (idx) => {
    const audio = audioRef.current;
    if (!audio || tapTimes[idx] == null) return;
    audio.currentTime = tapTimes[idx] / 1000;
  };

  const stamped = tapTimes.filter(t => t !== null).length;

  const handleDone = () => {
    const result = lines.map((l, i) => ({
      text: l.text,
      timeMs: tapTimes[i] ?? l.timeMs ?? null,
      stamped: tapTimes[i] != null || l.stamped,
    }));
    onDone(result);
  };

  return (
    <div>
      {/* Player compacto */}
      <MiniPlayer
        playing={playing} currentTime={currentTime} duration={duration}
        seekPct={seekPct} onTogglePlay={onTogglePlay} onSeek={onSeek}
        onChangeSpeed={onChangeSpeed} speed={speed} showSpeed={true}
        hint={null}
      />

      {/* Instruções compactas */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12,
        padding: '8px 14px', borderRadius: 8,
        background: 'rgba(212,175,55,0.08)', border: '1px solid rgba(212,175,55,0.2)',
        fontSize: 12, color: 'var(--white-dim)', flexWrap: 'wrap', gap: 12,
      }}>
        <span>🥁 <strong style={{ color: 'var(--gold)' }}>Tap Sync:</strong> toque Play e bata</span>
        {[
          ['ESPAÇO', 'carimbar verso'],
          ['← →', 'mover cursor'],
          ['⌫', 'apagar'],
        ].map(([k, v]) => (
          <span key={k}>
            <kbd style={{ background: 'rgba(255,255,255,0.12)', padding: '2px 6px', borderRadius: 4, fontFamily: 'monospace', fontSize: 11 }}>{k}</kbd>
            {' '}{v}
          </span>
        ))}
      </div>

      {/* Lista de versos */}
      <div ref={listRef} style={{ maxHeight: 400, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 3 }}>
        {lines.map((line, i) => {
          const t       = tapTimes[i];
          const isCur   = i === cursor;
          const isFlash = i === lastFlash;
          const isDone  = t !== null;

          return (
            <div key={i} ref={el => rowRefs.current[i] = el}
              onClick={() => setCursor(i)}
              style={{
                display: 'flex', alignItems: 'center', gap: 8,
                padding: '7px 10px', borderRadius: 8, cursor: 'pointer',
                transition: 'background 0.12s, transform 0.08s',
                transform: isFlash ? 'scale(1.012)' : 'scale(1)',
                background: isFlash
                  ? 'rgba(212,175,55,0.28)'
                  : isCur
                    ? 'rgba(212,175,55,0.13)'
                    : isDone
                      ? 'rgba(134,198,69,0.06)'
                      : 'rgba(255,255,255,0.025)',
                border: isCur
                  ? '1px solid rgba(212,175,55,0.5)'
                  : isFlash
                    ? '1px solid rgba(212,175,55,0.6)'
                    : '1px solid transparent',
              }}>

              {/* Número / indicador */}
              <span style={{
                fontSize: 10, minWidth: 20, textAlign: 'right', flexShrink: 0,
                color: isCur ? 'var(--gold)' : 'var(--white-faint)',
                fontFamily: 'monospace',
              }}>
                {isCur ? '▶' : String(i + 1).padStart(2, '0')}
              </span>

              {/* Texto do verso */}
              <span style={{
                flex: 1, fontSize: 13, minWidth: 0,
                overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                color: isDone ? 'var(--white)' : isCur ? 'var(--gold)' : 'var(--white-dim)',
                fontWeight: isCur ? 600 : 400,
              }}>
                {line.text}
              </span>

              {/* Controles de tempo */}
              {isDone && (
                <div style={{ display: 'flex', alignItems: 'center', gap: 3, flexShrink: 0 }}>
                  <button type="button" onClick={e => { e.stopPropagation(); nudge(i, -100); }}
                    title="-100ms"
                    style={{ ...nudgeBtn, opacity: 0.7 }}>−</button>
                  <button type="button" onClick={e => { e.stopPropagation(); seekToTap(i); }}
                    style={{ background: 'none', border: 'none', color: '#86c645', fontFamily: 'monospace', fontSize: 11, cursor: 'pointer', padding: '2px 4px', whiteSpace: 'nowrap' }}>
                    ▶{formatTime(t)}
                  </button>
                  <button type="button" onClick={e => { e.stopPropagation(); nudge(i, +100); }}
                    title="+100ms"
                    style={{ ...nudgeBtn, opacity: 0.7 }}>+</button>
                  <button type="button" onClick={e => {
                    e.stopPropagation();
                    setTapTimes(prev => { const n = [...prev]; n[i] = null; return n; });
                    setCursor(i);
                  }} title="Apagar"
                    style={{ background: 'none', border: 'none', color: '#f87171', cursor: 'pointer', fontSize: 13, padding: '2px 4px' }}>×</button>
                </div>
              )}

              {/* Campo numérico para ajuste fino */}
              <TapTimeInput
                timeMs={t}
                onApply={s => editDirect(i, s)}
                onStop={e => e.stopPropagation()}
              />
            </div>
          );
        })}
      </div>

      {/* Rodapé */}
      <div style={{ marginTop: 14, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 8 }}>
        <span style={{ fontSize: 12, color: stamped === lines.length ? '#86c645' : 'var(--gold)' }}>
          {stamped}/{lines.length} carimbados
        </span>
        <button type="button" className="btn btn-gold" onClick={handleDone}>
          Aplicar e revisar →
        </button>
      </div>
    </div>
  );
}

const nudgeBtn = {
  background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.12)',
  color: 'var(--white-dim)', borderRadius: 4, width: 20, height: 20,
  display: 'flex', alignItems: 'center', justifyContent: 'center',
  fontSize: 13, cursor: 'pointer', flexShrink: 0, padding: 0,
};

function TapTimeInput({ timeMs, onApply, onStop }) {
  const [val, setVal] = useState(timeMs != null ? (timeMs / 1000).toFixed(2) : '');
  const ref = useRef(null);

  useEffect(() => {
    if (document.activeElement !== ref.current) {
      setVal(timeMs != null ? (timeMs / 1000).toFixed(2) : '');
    }
  }, [timeMs]);

  return (
    <input
      ref={ref}
      type="number"
      step="0.01"
      min="0"
      value={val}
      placeholder="seg"
      onClick={onStop}
      onChange={e => setVal(e.target.value)}
      onBlur={() => { const n = parseFloat(val); if (!isNaN(n) && n >= 0) onApply(n); }}
      onKeyDown={e => {
        e.stopPropagation();
        if (e.key === 'Enter') { const n = parseFloat(val); if (!isNaN(n) && n >= 0) onApply(n); ref.current?.blur(); }
      }}
      style={{
        width: 64, padding: '3px 5px', fontSize: 11,
        background: 'rgba(255,255,255,0.04)',
        border: `1px solid ${timeMs != null ? '#86c645' : 'var(--border)'}`,
        borderRadius: 5, color: 'var(--white)', outline: 'none', flexShrink: 0,
      }}
    />
  );
}

// ─── SyncEditor principal ──────────────────────────────────────────────────────
export default function SyncEditor({ audioFile, audioUrl, initialLyrics = [], onChange }) {
  const [lines, setLines] = useState(() =>
    initialLyrics.map(l => ({ text: l.text, timeMs: l.timeMs, stamped: true }))
  );
  const [rawText, setRawText]     = useState(() => initialLyrics.map(l => l.text).join('\n'));
  const [mode, setMode]           = useState(initialLyrics.length > 0 ? 'sync' : 'text');
  const [playing, setPlaying]     = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration]   = useState(0);
  const [activeLine, setActiveLine] = useState(-1);
  const [nextLineIdx, setNextLineIdx] = useState(0);
  const [speed, setSpeed]         = useState(1);

  const audioRef    = useRef(null);
  const syncListRef = useRef(null);
  const lineRefs    = useRef([]);
  const objectUrlRef = useRef(null);
  const rafRef      = useRef(null);
  const linesRef    = useRef(lines);

  useEffect(() => { linesRef.current = lines; }, [lines]);

  const audioSrc = useMemo(() => {
    if (audioFile) {
      if (objectUrlRef.current) URL.revokeObjectURL(objectUrlRef.current);
      objectUrlRef.current = URL.createObjectURL(audioFile);
      return objectUrlRef.current;
    }
    return audioUrl || null;
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [audioFile, audioUrl]);

  useEffect(() => () => { if (objectUrlRef.current) URL.revokeObjectURL(objectUrlRef.current); }, []);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    if (audioSrc) { audio.src = audioSrc; audio.load(); }
    else audio.src = '';
  }, [audioSrc]);

  // RAF
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
      const ms = t * 1000;
      const ls = linesRef.current;
      let idx = -1;
      for (let i = 0; i < ls.length; i++) {
        if (ls[i].stamped && ls[i].timeMs !== null && ms >= ls[i].timeMs) idx = i;
        else if (ls[i].stamped && ls[i].timeMs !== null && ms < ls[i].timeMs) break;
      }
      setActiveLine(idx);
      rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);
  }, [stopRaf]);

  useEffect(() => {
    if (mode === 'preview' && activeLine >= 0 && lineRefs.current[activeLine]) {
      lineRefs.current[activeLine].scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }, [activeLine, mode]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    const onMeta  = () => setDuration(audio.duration);
    const onEnd   = () => { setPlaying(false); setActiveLine(-1); stopRaf(); };
    const onPause = () => { setPlaying(false); stopRaf(); };
    const onPlay  = () => { setPlaying(true);  startRaf(); };
    audio.addEventListener('loadedmetadata', onMeta);
    audio.addEventListener('ended',  onEnd);
    audio.addEventListener('pause',  onPause);
    audio.addEventListener('play',   onPlay);
    return () => {
      audio.removeEventListener('loadedmetadata', onMeta);
      audio.removeEventListener('ended',  onEnd);
      audio.removeEventListener('pause',  onPause);
      audio.removeEventListener('play',   onPlay);
      stopRaf();
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const togglePlay = useCallback(() => {
    const audio = audioRef.current;
    if (!audio) return;
    if (audio.paused) audio.play().catch(() => {});
    else              audio.pause();
  }, []);

  const handleSeek = useCallback((e) => {
    const audio = audioRef.current;
    if (!audio || !duration) return;
    const t = (e.target.value / 100) * duration;
    audio.currentTime = t;
    setCurrentTime(t);
  }, [duration]);

  const handleChangeSpeed = useCallback((s) => {
    const audio = audioRef.current;
    if (audio) audio.playbackRate = s;
    setSpeed(s);
  }, []);

  // Stamp / edit / clear (modo sync clássico)
  const stamp = useCallback((idx) => {
    const audio = audioRef.current;
    if (!audio) return;
    const ms = Math.round(audio.currentTime * 1000);
    setLines(prev => {
      const updated = [...prev];
      updated[idx] = { ...updated[idx], timeMs: ms, stamped: true };
      const stamped = updated.filter(l => l.stamped && l.timeMs !== null);
      onChange(stamped.map(l => ({ text: l.text, timeMs: l.timeMs })));
      return updated;
    });
    setNextLineIdx(() => {
      const len = linesRef.current.length;
      const next = idx + 1 < len ? idx + 1 : idx;
      if (lineRefs.current[next]) lineRefs.current[next].scrollIntoView({ behavior: 'smooth', block: 'center' });
      return next;
    });
  }, [onChange]);

  const clearStamp = useCallback((idx) => {
    setLines(prev => {
      const updated = [...prev];
      updated[idx] = { ...updated[idx], timeMs: null, stamped: false };
      const stamped = updated.filter(l => l.stamped && l.timeMs !== null);
      onChange(stamped.map(l => ({ text: l.text, timeMs: l.timeMs })));
      return updated;
    });
  }, [onChange]);

  const editTime = useCallback((idx, seconds) => {
    const ms = Math.round(seconds * 1000);
    setLines(prev => {
      const updated = [...prev];
      updated[idx] = { ...updated[idx], timeMs: ms, stamped: true };
      const stamped = updated.filter(l => l.stamped && l.timeMs !== null);
      onChange(stamped.map(l => ({ text: l.text, timeMs: l.timeMs })));
      return updated;
    });
  }, [onChange]);

  const seekToLine = useCallback((idx) => {
    const audio = audioRef.current;
    if (!audio || lines[idx].timeMs == null) return;
    audio.currentTime = lines[idx].timeMs / 1000;
    setCurrentTime(lines[idx].timeMs / 1000);
  }, [lines]);

  // Espaço no modo sync clássico
  useEffect(() => {
    if (mode !== 'sync') return;
    const handler = (e) => {
      if (e.code === 'Space' && e.target.tagName !== 'INPUT' && e.target.tagName !== 'TEXTAREA') {
        e.preventDefault();
        if (nextLineIdx < linesRef.current.length) stamp(nextLineIdx);
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [mode, nextLineIdx, stamp]);

  // Navegação entre modos
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
    const first = newLines.findIndex(l => !l.stamped);
    setNextLineIdx(first >= 0 ? first : 0);
  };

  const handleGoToTap = () => {
    const parsed = rawText.split('\n').map(t => t.trim()).filter(Boolean);
    const existingMap = {};
    lines.forEach(l => { existingMap[l.text] = l.timeMs; });
    const newLines = parsed.map(text => ({
      text,
      timeMs: existingMap[text] ?? null,
      stamped: existingMap[text] != null,
    }));
    setLines(newLines);
    setMode('tap');
  };

  // Retorno do TapSync: mescla resultados de volta em lines e vai para sync (revisão)
  const handleTapDone = (result) => {
    setLines(result);
    const stamped = result.filter(l => l.stamped && l.timeMs !== null);
    onChange(stamped.map(l => ({ text: l.text, timeMs: l.timeMs })));
    setMode('sync');
    setNextLineIdx(result.findIndex(l => !l.stamped || l.timeMs == null));
  };

  const handleGoToPreview = () => {
    const stamped = lines.filter(l => l.stamped && l.timeMs !== null);
    onChange(stamped.map(l => ({ text: l.text, timeMs: l.timeMs })));
    setMode('preview');
  };

  const stampedCount = lines.filter(l => l.stamped).length;
  const seekPct      = duration ? (currentTime / duration) * 100 : 0;

  const TABS = [
    { key: 'text',    label: '① Letras',        icon: '✏️' },
    { key: 'tap',     label: '② Tap Sync',       icon: '🥁' },
    { key: 'sync',    label: '③ Ajuste Fino',    icon: '🎵' },
    { key: 'preview', label: '④ Pré-visualizar', icon: '▶'  },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>

      {/* Áudio sempre no DOM */}
      <audio ref={audioRef} preload="metadata" style={{ display: 'none' }} />

      {/* Abas */}
      <div style={{ display: 'flex', gap: 0, borderBottom: '1px solid var(--border)', marginBottom: 20 }}>
        {TABS.map(({ key, label, icon }) => (
          <button key={key} type="button"
            onClick={() => {
              if (key === 'text')    setMode('text');
              else if (key === 'tap')     handleGoToTap();
              else if (key === 'sync')    handleGoToSync();
              else if (key === 'preview') handleGoToPreview();
            }}
            style={{
              padding: '10px 16px', background: 'none', border: 'none',
              borderBottom: mode === key ? '2px solid var(--gold)' : '2px solid transparent',
              color: mode === key ? 'var(--gold)' : 'var(--white-dim)',
              fontSize: 12, fontWeight: 700, cursor: 'pointer',
              letterSpacing: '0.06em', transition: 'all 0.15s', marginBottom: -1,
            }}>
            {icon} {label}
          </button>
        ))}
        {lines.length > 0 && (
          <span style={{ marginLeft: 'auto', alignSelf: 'center', fontSize: 12, color: stampedCount === lines.length ? '#86c645' : 'var(--gold)', paddingRight: 4 }}>
            {stampedCount}/{lines.length} sincronizadas
          </span>
        )}
      </div>

      {/* ── Passo 1: Letras ── */}
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
              boxSizing: 'border-box',
            }}
          />
          <div style={{ marginTop: 12, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 10 }}>
            <span style={{ fontSize: 12, color: 'var(--white-faint)' }}>
              {rawText.split('\n').filter(l => l.trim()).length} linhas detectadas
            </span>
            <div style={{ display: 'flex', gap: 8 }}>
              <button type="button" className="btn btn-gold"
                onClick={handleGoToTap}
                disabled={!rawText.trim() || !audioSrc}
                title="Tap Sync: toque o ritmo em tempo real">
                🥁 Tap Sync →
              </button>
              <button type="button" className="btn btn-ghost"
                onClick={handleGoToSync}
                disabled={!rawText.trim() || !audioSrc}>
                Ajuste Fino →
              </button>
            </div>
          </div>
          {!audioSrc && (
            <p style={{ fontSize: 12, color: '#f87171', marginTop: 8 }}>⚠️ Faça upload do áudio antes de sincronizar.</p>
          )}
        </div>
      )}

      {/* ── Passo 2: Tap Sync ── */}
      {mode === 'tap' && (
        <TapSync
          lines={lines}
          audioRef={audioRef}
          playing={playing}
          currentTime={currentTime}
          duration={duration}
          seekPct={seekPct}
          onTogglePlay={togglePlay}
          onSeek={handleSeek}
          onChangeSpeed={handleChangeSpeed}
          speed={speed}
          onDone={handleTapDone}
        />
      )}

      {/* ── Passo 3: Ajuste Fino (sync clássico) ── */}
      {mode === 'sync' && (
        <div>
          <MiniPlayer
            playing={playing} currentTime={currentTime} duration={duration}
            seekPct={seekPct} onTogglePlay={togglePlay} onSeek={handleSeek}
            onChangeSpeed={handleChangeSpeed} speed={speed} showSpeed={true}
            hint={
              <>🎯 <strong style={{ color: 'var(--gold)' }}>Ajuste fino:</strong> pressione{' '}
              <kbd style={{ background: 'rgba(255,255,255,0.1)', padding: '2px 5px', borderRadius: 4, fontFamily: 'monospace' }}>ESPAÇO</kbd>
              {' '}ou clique <strong>⊕</strong> para carimbar. Digite o tempo e pressione{' '}
              <kbd style={{ background: 'rgba(255,255,255,0.1)', padding: '2px 5px', borderRadius: 4, fontFamily: 'monospace' }}>Enter</kbd> para ajuste exato.</>
            }
          />
          <div ref={syncListRef} style={{ maxHeight: 420, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 4 }}>
            {lines.map((line, i) => (
              <div key={i} ref={el => lineRefs.current[i] = el}
                style={{
                  display: 'flex', alignItems: 'center', gap: 8, padding: '8px 10px',
                  borderRadius: 8, transition: 'background 0.15s',
                  background: i === nextLineIdx
                    ? 'rgba(212,175,55,0.12)'
                    : line.stamped ? 'rgba(134,198,69,0.06)' : 'rgba(255,255,255,0.03)',
                  border: i === nextLineIdx ? '1px solid rgba(212,175,55,0.4)' : '1px solid transparent',
                }}>
                <span style={{ fontSize: 11, color: 'var(--white-faint)', minWidth: 22, textAlign: 'right', flexShrink: 0 }}>{i + 1}</span>
                <button type="button" onClick={() => stamp(i)} title="Carimbar no tempo atual"
                  style={{
                    width: 28, height: 28, borderRadius: '50%', flexShrink: 0,
                    background: line.stamped ? 'rgba(134,198,69,0.2)' : 'rgba(212,175,55,0.15)',
                    border: `1px solid ${line.stamped ? '#86c645' : 'var(--gold)'}`,
                    color: line.stamped ? '#86c645' : 'var(--gold)',
                    fontSize: 14, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer',
                  }}>
                  {line.stamped ? '✓' : '⊕'}
                </button>
                <span style={{ flex: 1, fontSize: 13, color: line.stamped ? 'var(--white)' : 'var(--white-dim)', minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {line.text}
                </span>
                <TimeInput line={line} idx={i} onApply={editTime} onSeek={seekToLine} onClear={clearStamp} />
              </div>
            ))}
          </div>
          <div style={{ marginTop: 14, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <button type="button" className="btn btn-ghost" onClick={handleGoToTap}>← Tap Sync</button>
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

      {/* ── Passo 4: Pré-visualizar ── */}
      {mode === 'preview' && (
        <div>
          <MiniPlayer
            playing={playing} currentTime={currentTime} duration={duration}
            seekPct={seekPct} onTogglePlay={togglePlay} onSeek={handleSeek}
            onChangeSpeed={handleChangeSpeed} speed={speed} showSpeed={false}
            hint={null}
          />
          <div style={{ background: 'rgba(0,0,0,0.5)', border: '1px solid var(--border)', borderRadius: 12, padding: 16, maxHeight: 360, overflowY: 'auto' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
              <div style={{ width: 3, height: 14, background: 'var(--gold)', borderRadius: 2 }} />
              <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.18em', textTransform: 'uppercase', color: 'var(--gold)' }}>PRÉVIA DA ANIMAÇÃO</span>
            </div>
            {lines.filter(l => l.stamped).map((line, i) => (
              <div key={i} ref={el => lineRefs.current[i] = el}
                onClick={() => {
                  const audio = audioRef.current;
                  if (audio) { audio.currentTime = line.timeMs / 1000; audio.play().catch(() => {}); }
                }}
                style={{
                  padding: '10px 14px', marginBottom: 4, borderRadius: 8,
                  cursor: 'pointer', transition: 'all 0.2s',
                  fontSize:   i === activeLine ? 17 : 14,
                  fontWeight: i === activeLine ? 700 : 400,
                  color:      i === activeLine ? '#FFFFFF' : 'rgba(255,255,255,0.4)',
                  background: i === activeLine ? 'rgba(212,175,55,0.15)' : 'transparent',
                  borderLeft: i === activeLine ? '3px solid var(--gold)' : '3px solid transparent',
                  transform:  i === activeLine ? 'translateX(6px)' : 'none',
                }}>
                {line.text}
              </div>
            ))}
          </div>
          <div style={{ marginTop: 14, display: 'flex', gap: 8, justifyContent: 'space-between' }}>
            <button type="button" className="btn btn-ghost" onClick={() => setMode('sync')}>← Voltar ao Ajuste</button>
            <span style={{ fontSize: 12, color: '#86c645', alignSelf: 'center' }}>✓ {stampedCount} linhas salvas</span>
          </div>
        </div>
      )}
    </div>
  );
}

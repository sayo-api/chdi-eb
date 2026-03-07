import { useEffect, useState, useRef } from 'react';
import api from '../../api/axios';
import SyncEditor from './SyncEditor';

// ─── Editor de Cards (para módulos de vídeo) ──────────────────────────────────
function CardsEditor({ cards, onChange }) {
  const addCard = () => onChange([...cards, { title: '', steps: [''] }]);

  const updateCard = (i, field, val) => {
    const updated = [...cards];
    updated[i] = { ...updated[i], [field]: val };
    onChange(updated);
  };

  const updateStep = (ci, si, val) => {
    const updated = [...cards];
    const steps = [...updated[ci].steps];
    steps[si] = val;
    updated[ci] = { ...updated[ci], steps };
    onChange(updated);
  };

  const addStep = (ci) => {
    const updated = [...cards];
    updated[ci] = { ...updated[ci], steps: [...updated[ci].steps, ''] };
    onChange(updated);
  };

  const removeStep = (ci, si) => {
    const updated = [...cards];
    const steps = updated[ci].steps.filter((_, i) => i !== si);
    updated[ci] = { ...updated[ci], steps };
    onChange(updated);
  };

  const removeCard = (i) => onChange(cards.filter((_, idx) => idx !== i));

  return (
    <div>
      <p style={{ fontSize: 13, color: 'var(--white-dim)', marginBottom: 14 }}>
        Adicione cards com título e lista de passos de execução.<br />
        Cada card é exibido abaixo do vídeo no app.
      </p>

      {cards.map((card, ci) => (
        <div key={ci} style={{ background: 'rgba(0,0,0,0.3)', border: '1px solid var(--border)', borderRadius: 10, padding: 16, marginBottom: 12 }}>
          <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 10 }}>
            <input
              className="form-input"
              placeholder="Título do card (ex: Posição Inicial)"
              value={card.title}
              onChange={e => updateCard(ci, 'title', e.target.value)}
              style={{ flex: 1, fontSize: 13 }}
            />
            <button type="button" onClick={() => removeCard(ci)}
              style={{ background: 'none', border: '1px solid rgba(248,113,113,0.4)', color: '#f87171', borderRadius: 6, padding: '6px 10px', cursor: 'pointer', fontSize: 13 }}>
              ✕
            </button>
          </div>

          {card.steps.map((step, si) => (
            <div key={si} style={{ display: 'flex', gap: 6, alignItems: 'center', marginBottom: 6 }}>
              <span style={{ fontSize: 11, color: 'var(--white-faint)', minWidth: 18, textAlign: 'right' }}>{si + 1}.</span>
              <input
                className="form-input"
                placeholder={`Passo ${si + 1}`}
                value={step}
                onChange={e => updateStep(ci, si, e.target.value)}
                style={{ flex: 1, fontSize: 13 }}
              />
              <button type="button" onClick={() => removeStep(ci, si)}
                style={{ background: 'none', border: 'none', color: 'var(--white-faint)', cursor: 'pointer', fontSize: 16, padding: '4px 6px' }}>
                ×
              </button>
            </div>
          ))}

          <button type="button" onClick={() => addStep(ci)}
            style={{ marginTop: 6, background: 'none', border: '1px dashed var(--border)', color: 'var(--white-dim)', borderRadius: 6, padding: '6px 12px', cursor: 'pointer', fontSize: 12, width: '100%' }}>
            + Adicionar passo
          </button>
        </div>
      ))}

      <button type="button" onClick={addCard}
        className="btn btn-ghost" style={{ width: '100%', justifyContent: 'center' }}>
        + Adicionar card
      </button>
    </div>
  );
}

// ─── Upload Area ───────────────────────────────────────────────────────────────
function UploadArea({ file, onFile, accept, icon, label, hint, existingUrl, existingType }) {
  const ref = useRef();
  return (
    <div>
      <div style={{ border: '2px dashed var(--border)', borderRadius: 12, padding: 36, textAlign: 'center', cursor: 'pointer', transition: 'all 0.2s' }}
        onClick={() => ref.current?.click()}
        onDragOver={e => { e.preventDefault(); e.currentTarget.style.borderColor = 'var(--gold)'; }}
        onDragLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; }}
        onDrop={e => { e.preventDefault(); const f = e.dataTransfer.files[0]; if (f) onFile(f); e.currentTarget.style.borderColor = 'var(--border)'; }}>
        <input ref={ref} type="file" accept={accept} style={{ display: 'none' }} onChange={e => onFile(e.target.files[0])} />
        {icon}
        {file ? (
          <div>
            <p style={{ color: 'var(--gold)', fontWeight: 700, marginBottom: 4 }}>{file.name}</p>
            <p style={{ color: 'var(--white-dim)', fontSize: 12 }}>{(file.size / 1024 / 1024).toFixed(2)} MB</p>
          </div>
        ) : (
          <div>
            <p style={{ color: 'var(--white-dim)', fontWeight: 600, marginBottom: 4 }}>{label}</p>
            <p style={{ color: 'var(--white-faint)', fontSize: 12 }}>{hint}</p>
          </div>
        )}
      </div>
      {existingUrl && !file && (
        <div style={{ marginTop: 14, padding: 14, background: 'rgba(255,255,255,0.03)', borderRadius: 8 }}>
          <p style={{ fontSize: 12, color: 'var(--white-dim)', marginBottom: 8 }}>Arquivo atual:</p>
          {existingType === 'video'
            ? <video controls src={existingUrl} style={{ width: '100%', maxHeight: 200, borderRadius: 6 }} />
            : <audio controls src={existingUrl} style={{ width: '100%' }} />}
          <p style={{ fontSize: 11, color: 'var(--white-faint)', marginTop: 6 }}>Deixe em branco para manter.</p>
        </div>
      )}
    </div>
  );
}

// ─── Modal de Conteúdo ─────────────────────────────────────────────────────────
function ContentModal({ song, categories, onClose, onSaved }) {
  const isEdit = !!song?._id;
  const defaultType = song?.contentType || 'audio';

  const [contentType, setContentType] = useState(defaultType);
  const [form, setForm] = useState({
    title:      song?.title || '',
    description: song?.description || '',
    categoryId: song?.category?._id || song?.category || '',
    order:      song?.order ?? 0,
  });
  const [lyrics, setLyrics] = useState(song?.lyrics || []);
  const [cards,  setCards]  = useState(song?.cards  || []);
  const [mediaFile, setMediaFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState('');
  const [tab,     setTab]     = useState('info');
  const [uploadProgress, setUploadProgress] = useState(0);

  const tabs = contentType === 'video'
    ? [['info','📋 Informações'],['media','🎬 Vídeo'],['cards','📝 Cards de Texto']]
    : [['info','📋 Informações'],['media','🎵 Áudio'],['sync','🎯 Sync Letras']];

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isEdit && !mediaFile) { setError(`Selecione um arquivo de ${contentType === 'video' ? 'vídeo' : 'áudio'}.`); return; }
    if (!form.categoryId)      { setError('Selecione um módulo.'); return; }
    setLoading(true); setError(''); setUploadProgress(0);

    try {
      const fd = new FormData();
      fd.append('contentType', contentType);
      Object.entries(form).forEach(([k, v]) => fd.append(k, v));
      fd.append('lyrics', JSON.stringify(lyrics));
      fd.append('cards',  JSON.stringify(cards));
      if (mediaFile) fd.append('media', mediaFile);

      const cfg = {
        headers: { 'Content-Type': 'multipart/form-data' },
        onUploadProgress: e => setUploadProgress(Math.round((e.loaded / e.total) * 100)),
      };

      if (isEdit) await api.put(`/songs/${song._id}`, fd, cfg);
      else        await api.post('/songs', fd, cfg);

      onSaved(); onClose();
    } catch (err) {
      setError(err.response?.data?.message || 'Erro ao salvar.');
    } finally { setLoading(false); }
  };

  return (
    <div className="modal-backdrop" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal" style={{ maxWidth: 700, maxHeight: '94vh', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
        <div className="modal-header">
          <span className="modal-title">{isEdit ? 'EDITAR CONTEÚDO' : 'NOVO CONTEÚDO'}</span>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: 'var(--white-dim)', cursor: 'pointer', fontSize: 22 }}>×</button>
        </div>

        {/* Seletor de tipo (só na criação) */}
        {!isEdit && (
          <div style={{ display: 'flex', gap: 10, padding: '12px 20px', borderBottom: '1px solid var(--border)' }}>
            {[['audio','🎵 Música / Hino'],['video','🎬 Módulo de Vídeo']].map(([t, label]) => (
              <button key={t} type="button"
                onClick={() => { setContentType(t); setTab('info'); }}
                style={{
                  flex: 1, padding: '10px 0', borderRadius: 8, cursor: 'pointer', fontWeight: 700, fontSize: 13,
                  background: contentType === t ? (t === 'video' ? 'rgba(134,198,69,0.15)' : 'rgba(212,175,55,0.15)') : 'rgba(255,255,255,0.04)',
                  border: `1px solid ${contentType === t ? (t === 'video' ? 'rgba(134,198,69,0.5)' : 'rgba(212,175,55,0.5)') : 'var(--border)'}`,
                  color: contentType === t ? (t === 'video' ? '#86c645' : 'var(--gold)') : 'var(--white-dim)',
                }}>
                {label}
              </button>
            ))}
          </div>
        )}

        {/* Abas */}
        <div style={{ display: 'flex', borderBottom: '1px solid var(--border)', padding: '0 20px', flexShrink: 0 }}>
          {tabs.map(([key, label]) => (
            <button key={key} type="button" onClick={() => setTab(key)}
              style={{ padding: '10px 14px', background: 'none', border: 'none', borderBottom: tab === key ? '2px solid var(--gold)' : '2px solid transparent', color: tab === key ? 'var(--gold)' : 'var(--white-dim)', fontSize: 12, fontWeight: 700, cursor: 'pointer', marginBottom: -1 }}>
              {label}
            </button>
          ))}
        </div>

        <form onSubmit={handleSubmit} style={{ flex: 1, overflow: 'auto', padding: '20px' }}>

          {/* Informações */}
          {tab === 'info' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div className="form-group">
                <label className="form-label">Título *</label>
                <input className="form-input" required value={form.title}
                  onChange={e => setForm(p => ({ ...p, title: e.target.value }))}
                  placeholder={contentType === 'video' ? 'Ex: Ordem Unida — Completo' : 'Ex: Hino Nacional Brasileiro'} />
              </div>
              <div className="form-group">
                <label className="form-label">Descrição</label>
                <textarea className="form-input" rows={3} value={form.description}
                  onChange={e => setForm(p => ({ ...p, description: e.target.value }))}
                  placeholder="Descrição breve do conteúdo..."
                  style={{ resize: 'vertical' }} />
              </div>
              <div className="form-group">
                <label className="form-label">Módulo / Categoria *</label>
                <select className="form-input" required value={form.categoryId}
                  onChange={e => setForm(p => ({ ...p, categoryId: e.target.value }))}>
                  <option value="">Selecione um módulo...</option>
                  {categories.map(c => <option key={c._id} value={c._id}>{c.name}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Ordem</label>
                <input className="form-input" type="number" min="0" value={form.order}
                  onChange={e => setForm(p => ({ ...p, order: e.target.value }))}
                  style={{ width: 100 }} />
              </div>
            </div>
          )}

          {/* Arquivo de mídia */}
          {tab === 'media' && (
            <UploadArea
              file={mediaFile}
              onFile={setMediaFile}
              accept={contentType === 'video' ? '.mp4,.mov,.avi,.mkv,.webm,video/*' : '.mp3,.wav,.ogg,.m4a,audio/*'}
              existingUrl={contentType === 'video' ? song?.videoUrl : song?.audioUrl}
              existingType={contentType}
              icon={contentType === 'video' ? (
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="var(--white-dim)" strokeWidth="1.5" style={{ display: 'block', margin: '0 auto 14px' }}>
                  <polygon points="23,7 16,12 23,17"/><rect x="1" y="5" width="15" height="14" rx="2"/>
                </svg>
              ) : (
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="var(--white-dim)" strokeWidth="1.5" style={{ display: 'block', margin: '0 auto 14px' }}>
                  <path d="M9 18V5l12-2v13"/><circle cx="6" cy="18" r="3"/><circle cx="18" cy="16" r="3"/>
                </svg>
              )}
              label={`Arraste ou clique para selecionar`}
              hint={contentType === 'video' ? 'MP4, MOV, AVI, MKV, WEBM — máx. 500MB' : 'MP3, WAV, OGG, M4A — máx. 50MB'}
            />
          )}

          {/* Sync letras (áudio) */}
          {tab === 'sync' && contentType === 'audio' && (
            <SyncEditor audioFile={mediaFile} audioUrl={song?.audioUrl} initialLyrics={lyrics} onChange={setLyrics} />
          )}

          {/* Cards (vídeo) */}
          {tab === 'cards' && contentType === 'video' && (
            <CardsEditor cards={cards} onChange={setCards} />
          )}

          {/* Upload progress */}
          {loading && uploadProgress > 0 && uploadProgress < 100 && (
            <div style={{ margin: '14px 0', padding: 14, background: 'rgba(212,175,55,0.08)', borderRadius: 8 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6, fontSize: 12, color: 'var(--white-dim)' }}>
                <span>Enviando arquivo...</span>
                <span style={{ color: 'var(--gold)', fontWeight: 700 }}>{uploadProgress}%</span>
              </div>
              <div style={{ height: 6, borderRadius: 3, background: 'rgba(255,255,255,0.1)', overflow: 'hidden' }}>
                <div style={{ height: '100%', borderRadius: 3, background: 'var(--gold)', width: `${uploadProgress}%`, transition: 'width 0.3s' }} />
              </div>
            </div>
          )}

          {error && (
            <div style={{ margin: '14px 0 0', padding: '10px 14px', background: 'rgba(248,113,113,0.1)', border: '1px solid rgba(248,113,113,0.3)', borderRadius: 8, color: '#f87171', fontSize: 13 }}>
              {error}
            </div>
          )}

          <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', marginTop: 20, paddingTop: 16, borderTop: '1px solid var(--border)' }}>
            <button type="button" className="btn btn-ghost" onClick={onClose}>Cancelar</button>
            <button type="submit" className="btn btn-gold" disabled={loading}>
              {loading ? `Enviando${uploadProgress > 0 ? ` ${uploadProgress}%` : '...'}` : 'Salvar'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ─── AdminSongs (lista principal) ─────────────────────────────────────────────
export default function AdminSongs() {
  const [songs,      setSongs]     = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading,    setLoading]   = useState(true);
  const [modal,      setModal]     = useState(null);
  const [filterCat,  setFilterCat] = useState('');
  const [filterType, setFilterType] = useState('');
  const [toast,      setToast]     = useState('');

  const load = async () => {
    setLoading(true);
    try {
      const [s, c] = await Promise.all([api.get('/songs/all'), api.get('/categories')]);
      setSongs(s.data.songs ?? []); setCategories(c.data.categories ?? []);
    } finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);
  useEffect(() => { if (toast) { const t = setTimeout(() => setToast(''), 3500); return () => clearTimeout(t); } }, [toast]);

  const handleDelete = async (song) => {
    if (!window.confirm(`Remover "${song.title}"?`)) return;
    try { await api.delete(`/songs/${song._id}`); setToast('✓ Conteúdo removido.'); load(); }
    catch (err) { setToast('✗ ' + (err.response?.data?.message || 'Erro ao remover.')); }
  };

  let filtered = songs;
  if (filterCat)  filtered = filtered.filter(s => (s.category?._id || s.category) === filterCat);
  if (filterType) filtered = filtered.filter(s => (s.contentType || 'audio') === filterType);

  const catName = s => categories.find(c => c._id === (s.category?._id || s.category))?.name || s.category?.name || '—';

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24, flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 26, letterSpacing: '0.1em', color: 'var(--white)', marginBottom: 4 }}>CONTEÚDO</h2>
          <p style={{ color: 'var(--white-dim)', fontSize: 14 }}>Músicas e módulos de vídeo disponíveis no app</p>
        </div>
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
          <select className="form-input" style={{ width: 'auto', fontSize: 13 }} value={filterType} onChange={e => setFilterType(e.target.value)}>
            <option value="">Todos os tipos</option>
            <option value="audio">🎵 Áudio</option>
            <option value="video">🎬 Vídeo</option>
          </select>
          <select className="form-input" style={{ width: 'auto', fontSize: 13 }} value={filterCat} onChange={e => setFilterCat(e.target.value)}>
            <option value="">Todos os módulos</option>
            {categories.map(c => <option key={c._id} value={c._id}>{c.name}</option>)}
          </select>
          <button className="btn btn-gold" onClick={() => setModal({})}>+ Novo Conteúdo</button>
        </div>
      </div>

      {toast && (
        <div style={{ marginBottom: 16, padding: '12px 16px', background: toast.startsWith('✓') ? 'rgba(134,198,69,0.1)' : 'rgba(248,113,113,0.1)', border: `1px solid ${toast.startsWith('✓') ? 'rgba(134,198,69,0.3)' : 'rgba(248,113,113,0.3)'}`, borderRadius: 8, fontSize: 14, color: toast.startsWith('✓') ? '#86c645' : '#f87171' }}>
          {toast}
        </div>
      )}

      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: 60 }}><div className="spinner" /></div>
      ) : filtered.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '80px 20px', color: 'var(--white-dim)' }}>
          <p style={{ marginBottom: 16, fontSize: 16 }}>Nenhum conteúdo encontrado.</p>
          <button className="btn btn-gold" onClick={() => setModal({})}>Adicionar primeiro conteúdo</button>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {filtered.map(song => {
            const isVideo = (song.contentType || 'audio') === 'video';
            return (
              <div key={song._id}
                style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '14px 18px', background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 10, transition: 'border-color 0.15s' }}
                onMouseEnter={e => e.currentTarget.style.borderColor = 'rgba(212,175,55,0.3)'}
                onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--border)'}>

                {/* Ícone tipo */}
                <div style={{ width: 40, height: 40, borderRadius: 8, flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', background: isVideo ? 'rgba(134,198,69,0.1)' : 'rgba(212,175,55,0.1)', border: `1px solid ${isVideo ? 'rgba(134,198,69,0.25)' : 'rgba(212,175,55,0.25)'}` }}>
                  {isVideo
                    ? <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#86c645" strokeWidth="2"><polygon points="23,7 16,12 23,17"/><rect x="1" y="5" width="15" height="14" rx="2"/></svg>
                    : <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--gold)" strokeWidth="2"><path d="M9 18V5l12-2v13"/><circle cx="6" cy="18" r="3"/><circle cx="18" cy="16" r="3"/></svg>}
                </div>

                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontWeight: 700, fontSize: 14, color: 'var(--white)', marginBottom: 3 }}>{song.title}</div>
                  <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
                    <span style={{ fontSize: 12, color: 'var(--white-dim)' }}>{catName(song)}</span>
                    <span style={{ fontSize: 11, padding: '2px 7px', borderRadius: 5, fontWeight: 700, background: isVideo ? 'rgba(134,198,69,0.1)' : 'rgba(212,175,55,0.1)', color: isVideo ? '#86c645' : 'var(--gold)', border: `1px solid ${isVideo ? 'rgba(134,198,69,0.2)' : 'rgba(212,175,55,0.2)'}` }}>
                      {isVideo ? '🎬 vídeo' : '🎵 áudio'}
                    </span>
                    {!isVideo && song.lyrics?.length > 0 && (
                      <span style={{ fontSize: 11, padding: '2px 7px', borderRadius: 5, background: 'rgba(134,198,69,0.1)', color: '#86c645', border: '1px solid rgba(134,198,69,0.2)' }}>✓ {song.lyrics.length} linhas</span>
                    )}
                    {isVideo && song.cards?.length > 0 && (
                      <span style={{ fontSize: 11, padding: '2px 7px', borderRadius: 5, background: 'rgba(134,198,69,0.1)', color: '#86c645', border: '1px solid rgba(134,198,69,0.2)' }}>✓ {song.cards.length} cards</span>
                    )}
                  </div>
                </div>

                <span style={{ fontSize: 11, color: 'var(--white-faint)', flexShrink: 0 }}>▶ {song.playCount ?? 0}</span>

                <div style={{ display: 'flex', gap: 6, flexShrink: 0 }}>
                  <button className="btn btn-ghost btn-sm" onClick={() => setModal(song)}>Editar</button>
                  <button className="btn btn-danger btn-sm" onClick={() => handleDelete(song)}>✕</button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {modal !== null && (
        <ContentModal song={modal?._id ? modal : undefined} categories={categories} onClose={() => setModal(null)} onSaved={load} />
      )}
    </div>
  );
}

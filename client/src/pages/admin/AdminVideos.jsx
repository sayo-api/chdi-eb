import { useEffect, useState, useRef } from 'react';
import api from '../../api/axios';

// ─── CardsEditor ──────────────────────────────────────────────────────────────
function CardsEditor({ cards, onChange }) {
  const addCard = () => onChange([...cards, { title: '', steps: [''] }]);
  const updateCard = (i, field, val) => { const u = [...cards]; u[i] = { ...u[i], [field]: val }; onChange(u); };
  const updateStep = (ci, si, val) => { const u = [...cards]; const s = [...u[ci].steps]; s[si] = val; u[ci] = { ...u[ci], steps: s }; onChange(u); };
  const addStep = (ci) => { const u = [...cards]; u[ci] = { ...u[ci], steps: [...u[ci].steps, ''] }; onChange(u); };
  const removeStep = (ci, si) => { const u = [...cards]; u[ci] = { ...u[ci], steps: u[ci].steps.filter((_, i) => i !== si) }; onChange(u); };
  const removeCard = (i) => onChange(cards.filter((_, idx) => idx !== i));

  return (
    <div>
      <p style={{ fontSize: 13, color: 'var(--white-dim)', marginBottom: 14 }}>
        Cards de instrução exibidos abaixo do vídeo no app.<br />
        Cada card tem um título e passos de execução.
      </p>
      {cards.map((card, ci) => (
        <div key={ci} style={{ background: 'rgba(0,0,0,0.3)', border: '1px solid var(--border)', borderRadius: 10, padding: 16, marginBottom: 12 }}>
          <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 10 }}>
            <input className="form-input" placeholder="Título do card (ex: Posição Inicial)"
              value={card.title} onChange={e => updateCard(ci, 'title', e.target.value)} style={{ flex: 1, fontSize: 13 }} />
            <button type="button" onClick={() => removeCard(ci)}
              style={{ background: 'none', border: '1px solid rgba(248,113,113,0.4)', color: '#f87171', borderRadius: 6, padding: '6px 10px', cursor: 'pointer', fontSize: 13 }}>✕</button>
          </div>
          {card.steps.map((step, si) => (
            <div key={si} style={{ display: 'flex', gap: 6, alignItems: 'center', marginBottom: 6 }}>
              <span style={{ fontSize: 11, color: 'var(--white-faint)', minWidth: 18, textAlign: 'right' }}>{si + 1}.</span>
              <input className="form-input" placeholder={`Passo ${si + 1}`} value={step}
                onChange={e => updateStep(ci, si, e.target.value)} style={{ flex: 1, fontSize: 13 }} />
              <button type="button" onClick={() => removeStep(ci, si)}
                style={{ background: 'none', border: 'none', color: 'var(--white-faint)', cursor: 'pointer', fontSize: 16, padding: '4px 6px' }}>×</button>
            </div>
          ))}
          <button type="button" onClick={() => addStep(ci)}
            style={{ marginTop: 6, background: 'none', border: '1px dashed var(--border)', color: 'var(--white-dim)', borderRadius: 6, padding: '6px 12px', cursor: 'pointer', fontSize: 12, width: '100%' }}>
            + Adicionar passo
          </button>
        </div>
      ))}
      <button type="button" onClick={addCard} className="btn btn-ghost" style={{ width: '100%', justifyContent: 'center' }}>
        + Adicionar card
      </button>
    </div>
  );
}

// ─── UploadArea ───────────────────────────────────────────────────────────────
function UploadArea({ file, onFile, existingUrl }) {
  const ref = useRef();
  return (
    <div>
      <div style={{ border: '2px dashed var(--border)', borderRadius: 12, padding: 36, textAlign: 'center', cursor: 'pointer', transition: 'all 0.2s' }}
        onClick={() => ref.current?.click()}
        onDragOver={e => { e.preventDefault(); e.currentTarget.style.borderColor = 'var(--gold)'; }}
        onDragLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; }}
        onDrop={e => { e.preventDefault(); const f = e.dataTransfer.files[0]; if (f) onFile(f); e.currentTarget.style.borderColor = 'var(--border)'; }}>
        <input ref={ref} type="file" accept=".mp4,.mov,.avi,.mkv,.webm,video/*" style={{ display: 'none' }} onChange={e => onFile(e.target.files[0])} />
        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="var(--white-dim)" strokeWidth="1.5" style={{ display: 'block', margin: '0 auto 14px' }}>
          <polygon points="23,7 16,12 23,17"/><rect x="1" y="5" width="15" height="14" rx="2"/>
        </svg>
        {file ? (
          <div>
            <p style={{ color: 'var(--gold)', fontWeight: 700, marginBottom: 4 }}>{file.name}</p>
            <p style={{ color: 'var(--white-dim)', fontSize: 12 }}>{(file.size / 1024 / 1024).toFixed(2)} MB</p>
          </div>
        ) : (
          <div>
            <p style={{ color: 'var(--white-dim)', fontWeight: 600, marginBottom: 4 }}>Arraste ou clique para selecionar o vídeo</p>
            <p style={{ color: 'var(--white-faint)', fontSize: 12 }}>MP4, MOV, AVI, MKV, WEBM — máx. 500MB</p>
          </div>
        )}
      </div>
      {existingUrl && !file && (
        <div style={{ marginTop: 14, padding: 14, background: 'rgba(255,255,255,0.03)', borderRadius: 8 }}>
          <p style={{ fontSize: 12, color: 'var(--white-dim)', marginBottom: 8 }}>Vídeo atual:</p>
          <video controls src={existingUrl} style={{ width: '100%', maxHeight: 220, borderRadius: 6 }} />
          <p style={{ fontSize: 11, color: 'var(--white-faint)', marginTop: 6 }}>Deixe em branco para manter.</p>
        </div>
      )}
    </div>
  );
}

// ─── VideoModal ───────────────────────────────────────────────────────────────
function VideoModal({ video, categories, onClose, onSaved }) {
  const isEdit = !!video?._id;
  const [form, setForm] = useState({
    title:       video?.title || '',
    description: video?.description || '',
    categoryId:  video?.category?._id || video?.category || '',
    order:       video?.order ?? 0,
  });
  const [cards,    setCards]    = useState(video?.cards || []);
  const [videoFile, setVideoFile] = useState(null);
  const [loading,  setLoading]  = useState(false);
  const [error,    setError]    = useState('');
  const [tab,      setTab]      = useState('info');
  const [uploadProgress, setUploadProgress] = useState(0);

  const tabs = [['info','📋 Informações'],['media','🎬 Vídeo'],['cards','📝 Cards de Texto']];

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isEdit && !videoFile) { setError('Selecione um arquivo de vídeo.'); return; }
    if (!form.categoryId)      { setError('Selecione um módulo.'); return; }
    setLoading(true); setError(''); setUploadProgress(0);
    try {
      const fd = new FormData();
      fd.append('contentType', 'video');
      Object.entries(form).forEach(([k, v]) => fd.append(k, v));
      fd.append('lyrics', JSON.stringify([]));
      fd.append('cards',  JSON.stringify(cards));
      if (videoFile) fd.append('media', videoFile);
      const cfg = {
        headers: { 'Content-Type': 'multipart/form-data' },
        onUploadProgress: e => setUploadProgress(Math.round((e.loaded / e.total) * 100)),
      };
      if (isEdit) await api.put(`/songs/${video._id}`, fd, cfg);
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
          <span className="modal-title">{isEdit ? 'EDITAR VÍDEO' : 'NOVO VÍDEO'}</span>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: 'var(--white-dim)', cursor: 'pointer', fontSize: 22 }}>×</button>
        </div>

        {/* Abas */}
        <div style={{ display: 'flex', borderBottom: '1px solid var(--border)', padding: '0 20px', flexShrink: 0 }}>
          {tabs.map(([key, label]) => (
            <button key={key} type="button" onClick={() => setTab(key)}
              style={{ padding: '10px 14px', background: 'none', border: 'none', borderBottom: tab === key ? '2px solid #86c645' : '2px solid transparent', color: tab === key ? '#86c645' : 'var(--white-dim)', fontSize: 12, fontWeight: 700, cursor: 'pointer', marginBottom: -1 }}>
              {label}
            </button>
          ))}
        </div>

        <form onSubmit={handleSubmit} style={{ flex: 1, overflow: 'auto', padding: '20px' }}>
          {tab === 'info' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div className="form-group">
                <label className="form-label">Título *</label>
                <input className="form-input" required value={form.title}
                  onChange={e => setForm(p => ({ ...p, title: e.target.value }))}
                  placeholder="Ex: Ordem Unida — Posição de Sentido" />
              </div>
              <div className="form-group">
                <label className="form-label">Descrição</label>
                <textarea className="form-input" rows={3} value={form.description}
                  onChange={e => setForm(p => ({ ...p, description: e.target.value }))}
                  placeholder="Descrição breve do conteúdo..." style={{ resize: 'vertical' }} />
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
                  onChange={e => setForm(p => ({ ...p, order: e.target.value }))} style={{ width: 100 }} />
              </div>
            </div>
          )}

          {tab === 'media' && (
            <UploadArea file={videoFile} onFile={setVideoFile} existingUrl={video?.videoUrl} />
          )}

          {tab === 'cards' && (
            <CardsEditor cards={cards} onChange={setCards} />
          )}

          {loading && uploadProgress > 0 && uploadProgress < 100 && (
            <div style={{ margin: '14px 0', padding: 14, background: 'rgba(134,198,69,0.08)', borderRadius: 8 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6, fontSize: 12, color: 'var(--white-dim)' }}>
                <span>Enviando vídeo...</span>
                <span style={{ color: '#86c645', fontWeight: 700 }}>{uploadProgress}%</span>
              </div>
              <div style={{ height: 6, borderRadius: 3, background: 'rgba(255,255,255,0.1)', overflow: 'hidden' }}>
                <div style={{ height: '100%', borderRadius: 3, background: '#86c645', width: `${uploadProgress}%`, transition: 'width 0.3s' }} />
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
            <button type="submit" className="btn btn-gold" disabled={loading}
              style={{ background: '#86c645', borderColor: '#86c645', color: '#0a1a07' }}>
              {loading ? `Enviando${uploadProgress > 0 ? ` ${uploadProgress}%` : '...'}` : 'Salvar Vídeo'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ─── AdminVideos (lista principal) ────────────────────────────────────────────
export default function AdminVideos() {
  const [videos,     setVideos]     = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading,    setLoading]    = useState(true);
  const [modal,      setModal]      = useState(null);
  const [filterCat,  setFilterCat]  = useState('');
  const [toast,      setToast]      = useState('');

  const load = async () => {
    setLoading(true);
    try {
      const [s, c] = await Promise.all([api.get('/songs/all'), api.get('/categories')]);
      // Filtra só vídeos
      setVideos((s.data.songs ?? []).filter(s => s.contentType === 'video'));
      setCategories(c.data.categories ?? []);
    } finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);
  useEffect(() => { if (toast) { const t = setTimeout(() => setToast(''), 3500); return () => clearTimeout(t); } }, [toast]);

  const handleDelete = async (video) => {
    if (!window.confirm(`Remover "${video.title}"?`)) return;
    try { await api.delete(`/songs/${video._id}`); setToast('✓ Vídeo removido.'); load(); }
    catch (err) { setToast('✗ ' + (err.response?.data?.message || 'Erro ao remover.')); }
  };

  const filtered = filterCat ? videos.filter(v => (v.category?._id || v.category) === filterCat) : videos;
  const catName  = v => categories.find(c => c._id === (v.category?._id || v.category))?.name || v.category?.name || '—';

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24, flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 26, letterSpacing: '0.1em', color: 'var(--white)', marginBottom: 4 }}>VÍDEOS</h2>
          <p style={{ color: 'var(--white-dim)', fontSize: 14 }}>Módulos de vídeo e instruções disponíveis no app</p>
        </div>
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
          <select className="form-input" style={{ width: 'auto', fontSize: 13 }} value={filterCat} onChange={e => setFilterCat(e.target.value)}>
            <option value="">Todos os módulos</option>
            {categories.map(c => <option key={c._id} value={c._id}>{c.name}</option>)}
          </select>
          <button className="btn btn-gold"
            style={{ background: 'rgba(134,198,69,0.15)', borderColor: 'rgba(134,198,69,0.5)', color: '#86c645' }}
            onClick={() => setModal({})}>
            + Novo Vídeo
          </button>
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
          <svg width="56" height="56" viewBox="0 0 24 24" fill="none" stroke="var(--white-faint)" strokeWidth="1.5" style={{ margin: '0 auto 16px', display: 'block' }}>
            <polygon points="23,7 16,12 23,17"/><rect x="1" y="5" width="15" height="14" rx="2"/>
          </svg>
          <p style={{ marginBottom: 16, fontSize: 16 }}>Nenhum vídeo encontrado.</p>
          <button className="btn btn-gold"
            style={{ background: 'rgba(134,198,69,0.15)', borderColor: 'rgba(134,198,69,0.5)', color: '#86c645' }}
            onClick={() => setModal({})}>
            Adicionar primeiro vídeo
          </button>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {filtered.map(video => (
            <div key={video._id}
              style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '14px 18px', background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 10, transition: 'border-color 0.15s' }}
              onMouseEnter={e => e.currentTarget.style.borderColor = 'rgba(134,198,69,0.3)'}
              onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--border)'}>

              {/* Ícone vídeo */}
              <div style={{ width: 40, height: 40, borderRadius: 8, flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(134,198,69,0.1)', border: '1px solid rgba(134,198,69,0.25)' }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#86c645" strokeWidth="2"><polygon points="23,7 16,12 23,17"/><rect x="1" y="5" width="15" height="14" rx="2"/></svg>
              </div>

              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontWeight: 700, fontSize: 14, color: 'var(--white)', marginBottom: 3 }}>{video.title}</div>
                <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
                  <span style={{ fontSize: 12, color: 'var(--white-dim)' }}>{catName(video)}</span>
                  {video.cards?.length > 0 && (
                    <span style={{ fontSize: 11, padding: '2px 7px', borderRadius: 5, background: 'rgba(134,198,69,0.1)', color: '#86c645', border: '1px solid rgba(134,198,69,0.2)' }}>
                      ✓ {video.cards.length} card{video.cards.length > 1 ? 's' : ''}
                    </span>
                  )}
                </div>
              </div>

              <span style={{ fontSize: 11, color: 'var(--white-faint)', flexShrink: 0 }}>▶ {video.playCount ?? 0}</span>

              <div style={{ display: 'flex', gap: 6, flexShrink: 0 }}>
                <button className="btn btn-ghost btn-sm" onClick={() => setModal(video)}>Editar</button>
                <button className="btn btn-danger btn-sm" onClick={() => handleDelete(video)}>✕</button>
              </div>
            </div>
          ))}
        </div>
      )}

      {modal !== null && (
        <VideoModal video={modal?._id ? modal : undefined} categories={categories} onClose={() => setModal(null)} onSaved={load} />
      )}
    </div>
  );
}

import { useEffect, useState, useRef } from 'react';
import api from '../../api/axios';
import SyncEditor from './SyncEditor';

function SongModal({ song, categories, onClose, onSaved }) {
  const [form, setForm] = useState({
    title: song?.title || '',
    description: song?.description || '',
    categoryId: song?.category?._id || song?.category || '',
    order: song?.order ?? 0,
  });
  const [lyrics, setLyrics] = useState(song?.lyrics || []);
  const [audioFile, setAudioFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [tab, setTab] = useState('info');
  const fileRef = useRef();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!song && !audioFile) { setError('Selecione um arquivo de áudio.'); return; }
    if (!form.categoryId) { setError('Selecione uma categoria.'); return; }
    setLoading(true); setError('');
    try {
      const fd = new FormData();
      Object.entries(form).forEach(([k, v]) => fd.append(k, v));
      fd.append('lyrics', JSON.stringify(lyrics));
      if (audioFile) fd.append('audio', audioFile);
      if (song?._id) {
        await api.put(`/songs/${song._id}`, fd, { headers: { 'Content-Type': 'multipart/form-data' } });
      } else {
        await api.post('/songs', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
      }
      onSaved(); onClose();
    } catch (err) {
      setError(err.response?.data?.message || 'Erro ao salvar.');
    } finally { setLoading(false); }
  };

  return (
    <div className="modal-backdrop" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal" style={{ maxWidth: 680, maxHeight: '92vh', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
        <div className="modal-header">
          <span className="modal-title">{song ? 'EDITAR MÚSICA' : 'NOVA MÚSICA'}</span>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: 'var(--white-dim)', cursor: 'pointer', fontSize: 22 }}>×</button>
        </div>

        <div style={{ display: 'flex', borderBottom: '1px solid var(--border)', padding: '0 20px', flexShrink: 0 }}>
          {[['info','Informações'],['audio','🎵 Áudio'],['sync','🎯 Sync Letras']].map(([key, label]) => (
            <button key={key} type="button" onClick={() => setTab(key)}
              style={{ padding: '10px 16px', background: 'none', border: 'none', borderBottom: tab === key ? '2px solid var(--gold)' : '2px solid transparent', color: tab === key ? 'var(--gold)' : 'var(--white-dim)', fontSize: 13, fontWeight: 700, cursor: 'pointer', marginBottom: -1, letterSpacing: '0.04em' }}>
              {label}
            </button>
          ))}
        </div>

        <form onSubmit={handleSubmit} style={{ flex: 1, overflow: 'auto', padding: '20px' }}>
          {tab === 'info' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div className="form-group">
                <label className="form-label">Título *</label>
                <input className="form-input" required value={form.title} onChange={e => setForm(p => ({ ...p, title: e.target.value }))} placeholder="Ex: Hino Nacional Brasileiro" />
              </div>
              <div className="form-group">
                <label className="form-label">Descrição</label>
                <input className="form-input" value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))} placeholder="Breve descrição (opcional)" />
              </div>
              <div className="form-group">
                <label className="form-label">Módulo / Categoria *</label>
                <select className="form-input" required value={form.categoryId} onChange={e => setForm(p => ({ ...p, categoryId: e.target.value }))}>
                  <option value="">Selecione um módulo...</option>
                  {categories.map(c => <option key={c._id} value={c._id}>{c.name}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Ordem na lista</label>
                <input className="form-input" type="number" min="0" value={form.order} onChange={e => setForm(p => ({ ...p, order: e.target.value }))} style={{ width: 100 }} />
              </div>
            </div>
          )}

          {tab === 'audio' && (
            <div>
              <div style={{ border: '2px dashed var(--border)', borderRadius: 12, padding: 36, textAlign: 'center', cursor: 'pointer', transition: 'all 0.2s' }}
                onClick={() => fileRef.current?.click()}
                onDragOver={e => { e.preventDefault(); e.currentTarget.style.borderColor = 'var(--gold)'; e.currentTarget.style.background = 'rgba(212,175,55,0.04)'; }}
                onDragLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.background = 'transparent'; }}
                onDrop={e => { e.preventDefault(); const f = e.dataTransfer.files[0]; if (f) setAudioFile(f); e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.background = 'transparent'; }}>
                <input ref={fileRef} type="file" accept=".mp3,.wav,.ogg,.m4a,audio/*" style={{ display: 'none' }} onChange={e => setAudioFile(e.target.files[0])} />
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="var(--white-dim)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ display: 'block', margin: '0 auto 14px' }}>
                  <path d="M9 18V5l12-2v13"/><circle cx="6" cy="18" r="3"/><circle cx="18" cy="16" r="3"/>
                </svg>
                {audioFile ? (
                  <div><p style={{ color: 'var(--gold)', fontWeight: 700, marginBottom: 4 }}>{audioFile.name}</p><p style={{ color: 'var(--white-dim)', fontSize: 12 }}>{(audioFile.size/1024/1024).toFixed(2)} MB</p></div>
                ) : (
                  <div><p style={{ color: 'var(--white-dim)', fontWeight: 600, marginBottom: 4 }}>Arraste ou clique para selecionar</p><p style={{ color: 'var(--white-faint)', fontSize: 12 }}>MP3, WAV, OGG, M4A — máx. 50MB</p></div>
                )}
              </div>
              {song?.audioUrl && !audioFile && (
                <div style={{ marginTop: 14, padding: 14, background: 'rgba(255,255,255,0.03)', borderRadius: 8 }}>
                  <p style={{ fontSize: 13, color: 'var(--white-dim)', marginBottom: 8 }}>Áudio atual:</p>
                  <audio controls src={song.audioUrl} style={{ width: '100%' }} />
                  <p style={{ fontSize: 12, color: 'var(--white-faint)', marginTop: 6 }}>Deixe em branco para manter.</p>
                </div>
              )}
            </div>
          )}

          {tab === 'sync' && (
            <SyncEditor audioFile={audioFile} audioUrl={song?.audioUrl} initialLyrics={lyrics} onChange={setLyrics} />
          )}

          {error && <div style={{ margin: '14px 0 0', padding: '10px 14px', background: 'rgba(248,113,113,0.1)', border: '1px solid rgba(248,113,113,0.3)', borderRadius: 8, color: '#f87171', fontSize: 13 }}>{error}</div>}

          <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', marginTop: 20, paddingTop: 16, borderTop: '1px solid var(--border)' }}>
            <button type="button" className="btn btn-ghost" onClick={onClose}>Cancelar</button>
            <button type="submit" className="btn btn-gold" disabled={loading}>{loading ? 'Enviando...' : 'Salvar Música'}</button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function AdminSongs() {
  const [songs, setSongs] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(null);
  const [filterCat, setFilterCat] = useState('');
  const [toast, setToast] = useState('');

  const load = async () => {
    try {
      const [s, c] = await Promise.all([api.get('/songs/all'), api.get('/categories')]);
      setSongs(s.data.songs); setCategories(c.data.categories);
    } finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);
  useEffect(() => { if (toast) { const t = setTimeout(() => setToast(''), 3200); return () => clearTimeout(t); } }, [toast]);

  const handleDelete = async (song) => {
    if (!window.confirm(`Remover "${song.title}"?`)) return;
    try { await api.delete(`/songs/${song._id}`); setToast('✓ Música removida.'); load(); }
    catch (err) { setToast(err.response?.data?.message || 'Erro ao remover.'); }
  };

  const filtered = filterCat ? songs.filter(s => (s.category?._id || s.category) === filterCat) : songs;
  const catName = (song) => categories.find(c => c._id === (song.category?._id || song.category))?.name || song.category?.name || '—';

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24, flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 26, letterSpacing: '0.1em', color: 'var(--white)', marginBottom: 4 }}>MÚSICAS</h2>
          <p style={{ color: 'var(--white-dim)', fontSize: 14 }}>Faça upload dos hinos e sincronize a letra com o áudio</p>
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <select className="form-input" style={{ width: 'auto', fontSize: 13 }} value={filterCat} onChange={e => setFilterCat(e.target.value)}>
            <option value="">Todos os módulos</option>
            {categories.map(c => <option key={c._id} value={c._id}>{c.name}</option>)}
          </select>
          <button className="btn btn-gold" onClick={() => setModal({})}>+ Nova Música</button>
        </div>
      </div>

      {toast && <div style={{ marginBottom: 16, padding: '12px 16px', background: 'rgba(134,198,69,0.1)', border: '1px solid rgba(134,198,69,0.3)', borderRadius: 8, fontSize: 14, color: '#86c645' }}>{toast}</div>}

      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: 60 }}><div className="spinner" /></div>
      ) : filtered.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '80px 20px', color: 'var(--white-dim)' }}>
          <svg width="56" height="56" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.15)" strokeWidth="1.5" style={{ display: 'block', margin: '0 auto 16px' }}><path d="M9 18V5l12-2v13"/><circle cx="6" cy="18" r="3"/><circle cx="18" cy="16" r="3"/></svg>
          <p style={{ marginBottom: 16, fontSize: 16 }}>Nenhuma música encontrada.</p>
          <button className="btn btn-gold" onClick={() => setModal({})}>Adicionar primeira música</button>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {filtered.map(song => (
            <div key={song._id} style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '14px 18px', background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 10, transition: 'border-color 0.15s' }}
              onMouseEnter={e => e.currentTarget.style.borderColor = 'rgba(212,175,55,0.3)'}
              onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--border)'}>
              <div style={{ width: 40, height: 40, borderRadius: 8, background: 'var(--bg-dark)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="var(--gold)"><polygon points="5,3 19,12 5,21"/></svg>
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontWeight: 700, fontSize: 14, color: 'var(--white)', marginBottom: 2 }}>{song.title}</div>
                <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                  <span style={{ fontSize: 12, color: 'var(--white-dim)' }}>{catName(song)}</span>
                  {song.description && <span style={{ fontSize: 12, color: 'var(--white-faint)' }}>· {song.description}</span>}
                </div>
              </div>
              <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexShrink: 0 }}>
                {song.lyrics?.length > 0 ? (
                  <span style={{ fontSize: 11, fontWeight: 700, padding: '3px 8px', borderRadius: 6, background: 'rgba(134,198,69,0.12)', color: '#86c645', border: '1px solid rgba(134,198,69,0.2)' }}>✓ {song.lyrics.length} linhas</span>
                ) : (
                  <span style={{ fontSize: 11, padding: '3px 8px', borderRadius: 6, background: 'rgba(255,255,255,0.04)', color: 'var(--white-faint)' }}>sem letra</span>
                )}
                <span style={{ fontSize: 11, color: 'var(--white-faint)' }}>▶ {song.playCount}</span>
              </div>
              <div style={{ display: 'flex', gap: 6, flexShrink: 0 }}>
                <button className="btn btn-ghost btn-sm" onClick={() => setModal(song)}>Editar</button>
                <a href={`/play/${song._id}`} target="_blank" rel="noreferrer" className="btn btn-ghost btn-sm" style={{ textDecoration: 'none' }}>Ver</a>
                <button className="btn btn-danger btn-sm" onClick={() => handleDelete(song)}>✕</button>
              </div>
            </div>
          ))}
        </div>
      )}

      {modal !== null && (
        <SongModal song={modal._id ? modal : undefined} categories={categories} onClose={() => setModal(null)} onSaved={load} />
      )}
    </div>
  );
}

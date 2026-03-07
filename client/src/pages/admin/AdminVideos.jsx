import { useEffect, useState, useRef } from 'react';
import api from '../../api/axios';

// ─── CardsEditor ──────────────────────────────────────────────────────────────
function CardsEditor({ cards, onChange }) {
  const addCard    = () => onChange([...cards, { title: '', steps: [''] }]);
  const updCard    = (i, f, v) => { const u=[...cards]; u[i]={...u[i],[f]:v}; onChange(u); };
  const updStep    = (ci,si,v) => { const u=[...cards]; const s=[...u[ci].steps]; s[si]=v; u[ci]={...u[ci],steps:s}; onChange(u); };
  const addStep    = (ci)   => { const u=[...cards]; u[ci]={...u[ci],steps:[...u[ci].steps,'']}; onChange(u); };
  const removeStep = (ci,si)=> { const u=[...cards]; u[ci]={...u[ci],steps:u[ci].steps.filter((_,i)=>i!==si)}; onChange(u); };
  const removeCard = (i)    => onChange(cards.filter((_,idx)=>idx!==i));
  return (
    <div>
      {cards.map((card, ci) => (
        <div key={ci} style={{ background:'rgba(0,0,0,0.3)', border:'1px solid var(--border)', borderRadius:10, padding:16, marginBottom:12 }}>
          <div style={{ display:'flex', gap:8, alignItems:'center', marginBottom:10 }}>
            <input className="form-input" placeholder="Título do card" value={card.title}
              onChange={e=>updCard(ci,'title',e.target.value)} style={{ flex:1, fontSize:13 }} />
            <button type="button" onClick={()=>removeCard(ci)}
              style={{ background:'none', border:'1px solid rgba(248,113,113,0.4)', color:'#f87171', borderRadius:6, padding:'6px 10px', cursor:'pointer', fontSize:13 }}>✕</button>
          </div>
          {card.steps.map((step, si) => (
            <div key={si} style={{ display:'flex', gap:6, alignItems:'center', marginBottom:6 }}>
              <span style={{ fontSize:11, color:'var(--white-faint)', minWidth:18, textAlign:'right' }}>{si+1}.</span>
              <input className="form-input" placeholder={`Passo ${si+1}`} value={step}
                onChange={e=>updStep(ci,si,e.target.value)} style={{ flex:1, fontSize:13 }} />
              <button type="button" onClick={()=>removeStep(ci,si)}
                style={{ background:'none', border:'none', color:'var(--white-faint)', cursor:'pointer', fontSize:16, padding:'4px 6px' }}>×</button>
            </div>
          ))}
          <button type="button" onClick={()=>addStep(ci)}
            style={{ marginTop:6, background:'none', border:'1px dashed var(--border)', color:'var(--white-dim)', borderRadius:6, padding:'6px 12px', cursor:'pointer', fontSize:12, width:'100%' }}>
            + Adicionar passo
          </button>
        </div>
      ))}
      <button type="button" onClick={addCard} className="btn btn-ghost" style={{ width:'100%', justifyContent:'center' }}>+ Adicionar card</button>
    </div>
  );
}

// ─── UploadArea ───────────────────────────────────────────────────────────────
function UploadArea({ file, onFile, existingUrl, label = 'Arraste ou clique para selecionar o vídeo' }) {
  const ref = useRef();
  return (
    <div>
      <div style={{ border:'2px dashed var(--border)', borderRadius:12, padding:28, textAlign:'center', cursor:'pointer', transition:'all 0.2s' }}
        onClick={()=>ref.current?.click()}
        onDragOver={e=>{e.preventDefault();e.currentTarget.style.borderColor='var(--gold)';}}
        onDragLeave={e=>{e.currentTarget.style.borderColor='var(--border)';}}
        onDrop={e=>{e.preventDefault();const f=e.dataTransfer.files[0];if(f)onFile(f);e.currentTarget.style.borderColor='var(--border)';}}>
        <input ref={ref} type="file" accept=".mp4,.mov,.avi,.mkv,.webm,video/*" style={{ display:'none' }} onChange={e=>onFile(e.target.files[0])} />
        <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="var(--white-dim)" strokeWidth="1.5" style={{ display:'block', margin:'0 auto 12px' }}>
          <polygon points="23,7 16,12 23,17"/><rect x="1" y="5" width="15" height="14" rx="2"/>
        </svg>
        {file ? (
          <div><p style={{ color:'var(--gold)', fontWeight:700, marginBottom:4 }}>{file.name}</p>
               <p style={{ color:'var(--white-dim)', fontSize:12 }}>{(file.size/1024/1024).toFixed(2)} MB</p></div>
        ) : (
          <div><p style={{ color:'var(--white-dim)', fontWeight:600, marginBottom:4 }}>{label}</p>
               <p style={{ color:'var(--white-faint)', fontSize:12 }}>MP4, MOV, AVI, MKV, WEBM</p></div>
        )}
      </div>
      {existingUrl && !file && (
        <div style={{ marginTop:14, padding:14, background:'rgba(255,255,255,0.03)', borderRadius:8 }}>
          <p style={{ fontSize:12, color:'var(--white-dim)', marginBottom:8 }}>Vídeo atual:</p>
          <video controls src={existingUrl} style={{ width:'100%', maxHeight:180, borderRadius:6 }} />
          <p style={{ fontSize:11, color:'var(--white-faint)', marginTop:6 }}>Deixe em branco para manter.</p>
        </div>
      )}
    </div>
  );
}

// ─── MultiVideoEditor — adicionar/remover vídeos com cards próprios ───────────
function MultiVideoEditor({ videos, onChange }) {
  const addVideo    = () => onChange([...videos, { label:'', videoUrl:'', _file:null, cards:[] }]);
  const removeVideo = (i) => onChange(videos.filter((_,idx)=>idx!==i));
  const updLabel    = (i,v) => { const u=[...videos]; u[i]={...u[i],label:v}; onChange(u); };
  const updFile     = (i,f) => { const u=[...videos]; u[i]={...u[i],_file:f}; onChange(u); };
  const updCards    = (i,c) => { const u=[...videos]; u[i]={...u[i],cards:c}; onChange(u); };

  return (
    <div>
      <p style={{ fontSize:13, color:'var(--white-dim)', marginBottom:14 }}>
        Adicione múltiplos vídeos ao mesmo conteúdo. No app aparecerá um botão "▶ Próximo" para navegar entre eles.
      </p>
      {videos.map((v, i) => (
        <div key={i} style={{ background:'rgba(0,0,0,0.3)', border:'1px solid var(--border)', borderRadius:12, padding:16, marginBottom:14 }}>
          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:12 }}>
            <span style={{ fontSize:12, color:'var(--gold)', fontWeight:700, letterSpacing:'0.08em' }}>VÍDEO {i+1}</span>
            <button type="button" onClick={()=>removeVideo(i)}
              style={{ background:'none', border:'1px solid rgba(248,113,113,0.4)', color:'#f87171', borderRadius:6, padding:'4px 10px', cursor:'pointer', fontSize:12 }}>Remover</button>
          </div>

          <div className="form-group">
            <label className="form-label" style={{ fontSize:12 }}>Título deste vídeo (ex: Parte 1 — Posição Inicial)</label>
            <input className="form-input" value={v.label} placeholder="Ex: Parte 1"
              onChange={e=>updLabel(i,e.target.value)} style={{ fontSize:13 }} />
          </div>

          <UploadArea file={v._file} onFile={f=>updFile(i,f)} existingUrl={v.videoUrl}
            label={`Selecionar vídeo ${i+1}`} />

          {/* Cards específicos deste vídeo */}
          <div style={{ marginTop:14 }}>
            <p style={{ fontSize:12, color:'var(--white-dim)', marginBottom:8, fontWeight:600 }}>Cards de instrução deste vídeo:</p>
            <CardsEditor cards={v.cards||[]} onChange={c=>updCards(i,c)} />
          </div>
        </div>
      ))}
      <button type="button" onClick={addVideo} className="btn btn-ghost"
        style={{ width:'100%', justifyContent:'center', borderStyle:'dashed' }}>
        + Adicionar vídeo
      </button>
    </div>
  );
}

// ─── VideoModal ───────────────────────────────────────────────────────────────
function VideoModal({ video, categories, onClose, onSaved }) {
  const isEdit = !!video?._id;

  // Detecta se tem múltiplos vídeos ao editar
  const hasMulti = video?.videos?.length > 0;

  const [form, setForm] = useState({
    title:       video?.title       || '',
    description: video?.description || '',
    categoryId:  video?.category?._id || video?.category || '',
    cardsLabel:  video?.cardsLabel  || 'INSTRUÇÕES DE EXECUÇÃO',
    order:       video?.order       ?? 0,
  });
  const [multiMode,  setMultiMode]  = useState(hasMulti);
  const [multiVideos,setMultiVideos]= useState(
    hasMulti ? video.videos.map(v=>({ label:v.label||'', videoUrl:v.videoUrl||'', _file:null, cards:v.cards||[] })) : []
  );
  const [cards,      setCards]      = useState(video?.cards || []);
  const [videoFile,  setVideoFile]  = useState(null);
  const [loading,    setLoading]    = useState(false);
  const [error,      setError]      = useState('');
  const [tab,        setTab]        = useState('info');
  const [uploadProgress, setUploadProgress] = useState(0);

  const set = (k,v) => setForm(p=>({...p,[k]:v}));

  const tabs = [
    ['info',   '📋 Informações'],
    ['media',  multiMode ? '🎬 Vídeos' : '🎬 Vídeo'],
    ['cards',  '📝 Cards Globais'],
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.categoryId) { setError('Selecione um módulo.'); return; }

    // Validação: precisa de pelo menos 1 vídeo
    const hasMainFile   = !!videoFile;
    const hasExisting   = isEdit && !!video?.videoUrl;
    const hasMultiFiles = multiVideos.some(v=>v._file || v.videoUrl);
    if (!hasMainFile && !hasExisting && !multiMode && !hasMultiFiles) {
      setError('Selecione ao menos um vídeo.'); return;
    }

    setLoading(true); setError(''); setUploadProgress(0);
    try {
      // Se multiMode, faz upload de cada vídeo extra via FormData separado ou envia os URLs existentes
      // Abordagem: para vídeos novos (com _file), precisa fazer upload individual, então usamos
      // uma rota de upload avulso ou incluímos todos como fields distintos.
      // Simplificação: se vídeo tem _file fazemos upload antes e guardamos URL
      let videosPayload = [];
      if (multiMode) {
        // Upload sequencial de cada vídeo que tem _file
        for (let i = 0; i < multiVideos.length; i++) {
          const mv = multiVideos[i];
          if (mv._file) {
            const fd2 = new FormData();
            fd2.append('media', mv._file);
            fd2.append('contentType', 'video');
            fd2.append('title', `${form.title} — upload_temp`);
            fd2.append('categoryId', form.categoryId);
            const r = await api.post('/songs/upload-temp', fd2, {
              headers: { 'Content-Type': 'multipart/form-data' },
              onUploadProgress: ev => setUploadProgress(Math.round((ev.loaded/ev.total)*100 * (i+1) / multiVideos.length)),
            });
            videosPayload.push({ label: mv.label, videoUrl: r.data.url, cards: mv.cards });
          } else if (mv.videoUrl) {
            videosPayload.push({ label: mv.label, videoUrl: mv.videoUrl, cards: mv.cards });
          }
        }
      }

      const fd = new FormData();
      fd.append('contentType', 'video');
      Object.entries(form).forEach(([k,v]) => fd.append(k,v));
      fd.append('cards',  JSON.stringify(cards));
      fd.append('videos', JSON.stringify(videosPayload));
      if (videoFile && !multiMode) fd.append('media', videoFile);

      const cfg = {
        headers: { 'Content-Type': 'multipart/form-data' },
        onUploadProgress: e => setUploadProgress(Math.round((e.loaded/e.total)*100)),
      };

      if (isEdit) await api.put(`/songs/${video._id}`, fd, cfg);
      else        await api.post('/songs', fd, cfg);

      onSaved(); onClose();
    } catch (err) {
      setError(err.response?.data?.message || 'Erro ao salvar.');
    } finally { setLoading(false); }
  };

  return (
    <div className="modal-backdrop" onClick={e=>e.target===e.currentTarget&&onClose()}>
      <div className="modal" style={{ maxWidth:720, maxHeight:'94vh', overflow:'hidden', display:'flex', flexDirection:'column' }}>
        <div className="modal-header">
          <span className="modal-title">{isEdit ? 'EDITAR VÍDEO' : 'NOVO VÍDEO'}</span>
          <button onClick={onClose} style={{ background:'none', border:'none', color:'var(--white-dim)', cursor:'pointer', fontSize:22 }}>×</button>
        </div>

        {/* Abas */}
        <div style={{ display:'flex', borderBottom:'1px solid var(--border)', padding:'0 20px', flexShrink:0 }}>
          {tabs.map(([key, label]) => (
            <button key={key} type="button" onClick={()=>setTab(key)}
              style={{ padding:'10px 14px', background:'none', border:'none', borderBottom: tab===key ? '2px solid #86c645' : '2px solid transparent', color: tab===key ? '#86c645' : 'var(--white-dim)', fontSize:12, fontWeight:700, cursor:'pointer', marginBottom:-1 }}>
              {label}
            </button>
          ))}
        </div>

        <form onSubmit={handleSubmit} style={{ flex:1, overflow:'auto', padding:'20px' }}>

          {/* ── Informações ── */}
          {tab === 'info' && (
            <div style={{ display:'flex', flexDirection:'column', gap:16 }}>
              <div className="form-group">
                <label className="form-label">Título *</label>
                <input className="form-input" required value={form.title}
                  onChange={e=>set('title',e.target.value)} placeholder="Ex: Ordem Unida — Posição de Sentido" />
              </div>
              <div className="form-group">
                <label className="form-label">Descrição</label>
                <textarea className="form-input" rows={3} value={form.description}
                  onChange={e=>set('description',e.target.value)} placeholder="Descrição breve..." style={{ resize:'vertical' }} />
              </div>
              <div className="form-group">
                <label className="form-label">Módulo / Categoria *</label>
                <select className="form-input" required value={form.categoryId} onChange={e=>set('categoryId',e.target.value)}>
                  <option value="">Selecione um módulo...</option>
                  {categories.map(c=><option key={c._id} value={c._id}>{c.name}</option>)}
                </select>
              </div>

              {/* NOVO: nome editável da seção de instruções */}
              <div className="form-group">
                <label className="form-label">
                  Título da seção de instruções{' '}
                  <span style={{ fontSize:11, color:'var(--white-faint)', fontWeight:400 }}>
                    (aparece como cabeçalho dos cards no app)
                  </span>
                </label>
                <input className="form-input" value={form.cardsLabel}
                  onChange={e=>set('cardsLabel',e.target.value)}
                  placeholder="INSTRUÇÕES DE EXECUÇÃO" />
              </div>

              <div className="form-group">
                <label className="form-label">Ordem</label>
                <input className="form-input" type="number" min="0" value={form.order}
                  onChange={e=>set('order',e.target.value)} style={{ width:100 }} />
              </div>
            </div>
          )}

          {/* ── Vídeo(s) ── */}
          {tab === 'media' && (
            <div>
              {/* Toggle modo múltiplo */}
              <div style={{ display:'flex', gap:10, marginBottom:20 }}>
                <button type="button" onClick={()=>setMultiMode(false)}
                  style={{ flex:1, padding:'10px 0', borderRadius:8, cursor:'pointer', fontWeight:700, fontSize:13,
                    background: !multiMode ? 'rgba(134,198,69,0.15)' : 'rgba(255,255,255,0.04)',
                    border: `1px solid ${!multiMode ? 'rgba(134,198,69,0.5)' : 'var(--border)'}`,
                    color: !multiMode ? '#86c645' : 'var(--white-dim)' }}>
                  🎬 1 Vídeo
                </button>
                <button type="button" onClick={()=>setMultiMode(true)}
                  style={{ flex:1, padding:'10px 0', borderRadius:8, cursor:'pointer', fontWeight:700, fontSize:13,
                    background: multiMode ? 'rgba(212,175,55,0.15)' : 'rgba(255,255,255,0.04)',
                    border: `1px solid ${multiMode ? 'rgba(212,175,55,0.5)' : 'var(--border)'}`,
                    color: multiMode ? 'var(--gold)' : 'var(--white-dim)' }}>
                  📚 Múltiplos vídeos
                </button>
              </div>

              {!multiMode ? (
                <UploadArea file={videoFile} onFile={setVideoFile} existingUrl={video?.videoUrl} />
              ) : (
                <MultiVideoEditor videos={multiVideos} onChange={setMultiVideos} />
              )}
            </div>
          )}

          {/* ── Cards Globais ── */}
          {tab === 'cards' && (
            <div>
              <p style={{ fontSize:13, color:'var(--white-dim)', marginBottom:14 }}>
                Cards globais — exibidos quando não há cards específicos por vídeo.
              </p>
              <CardsEditor cards={cards} onChange={setCards} />
            </div>
          )}

          {/* Progresso de upload */}
          {loading && uploadProgress > 0 && uploadProgress < 100 && (
            <div style={{ margin:'14px 0', padding:14, background:'rgba(134,198,69,0.08)', borderRadius:8 }}>
              <div style={{ display:'flex', justifyContent:'space-between', marginBottom:6, fontSize:12, color:'var(--white-dim)' }}>
                <span>Enviando vídeo{multiMode ? 's' : ''}...</span>
                <span style={{ color:'#86c645', fontWeight:700 }}>{uploadProgress}%</span>
              </div>
              <div style={{ height:6, borderRadius:3, background:'rgba(255,255,255,0.1)', overflow:'hidden' }}>
                <div style={{ height:'100%', borderRadius:3, background:'#86c645', width:`${uploadProgress}%`, transition:'width 0.3s' }} />
              </div>
            </div>
          )}

          {error && (
            <div style={{ margin:'14px 0 0', padding:'10px 14px', background:'rgba(248,113,113,0.1)', border:'1px solid rgba(248,113,113,0.3)', borderRadius:8, color:'#f87171', fontSize:13 }}>
              {error}
            </div>
          )}

          <div style={{ display:'flex', gap:10, justifyContent:'flex-end', marginTop:20, paddingTop:16, borderTop:'1px solid var(--border)' }}>
            <button type="button" className="btn btn-ghost" onClick={onClose}>Cancelar</button>
            <button type="submit" className="btn btn-gold" disabled={loading}
              style={{ background:'#86c645', borderColor:'#86c645', color:'#0a1a07' }}>
              {loading ? `Enviando${uploadProgress>0?` ${uploadProgress}%`:'...'}` : 'Salvar Vídeo'}
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
      setVideos((s.data.songs ?? []).filter(s => s.contentType === 'video'));
      setCategories(c.data.categories ?? []);
    } finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);
  useEffect(() => { if (toast) { const t = setTimeout(()=>setToast(''), 3500); return ()=>clearTimeout(t); } }, [toast]);

  const handleDelete = async (video) => {
    if (!window.confirm(`Remover "${video.title}"?`)) return;
    try { await api.delete(`/songs/${video._id}`); setToast('✓ Vídeo removido.'); load(); }
    catch (err) { setToast('✗ '+(err.response?.data?.message || 'Erro ao remover.')); }
  };

  const filtered = filterCat ? videos.filter(v=>(v.category?._id||v.category)===filterCat) : videos;
  const catName  = v => categories.find(c=>c._id===(v.category?._id||v.category))?.name || v.category?.name || '—';

  return (
    <div>
      <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:24, flexWrap:'wrap', gap:12 }}>
        <div>
          <h2 style={{ fontFamily:'var(--font-display)', fontSize:26, letterSpacing:'0.1em', color:'var(--white)', marginBottom:4 }}>VÍDEOS</h2>
          <p style={{ color:'var(--white-dim)', fontSize:14 }}>Módulos de vídeo e instruções disponíveis no app</p>
        </div>
        <div style={{ display:'flex', gap:10, flexWrap:'wrap' }}>
          <select className="form-input" style={{ width:'auto', fontSize:13 }} value={filterCat} onChange={e=>setFilterCat(e.target.value)}>
            <option value="">Todos os módulos</option>
            {categories.map(c=><option key={c._id} value={c._id}>{c.name}</option>)}
          </select>
          <button className="btn btn-gold"
            style={{ background:'rgba(134,198,69,0.15)', borderColor:'rgba(134,198,69,0.5)', color:'#86c645' }}
            onClick={()=>setModal({})}>+ Novo Vídeo</button>
        </div>
      </div>

      {toast && (
        <div style={{ marginBottom:16, padding:'12px 16px', background: toast.startsWith('✓') ? 'rgba(134,198,69,0.1)' : 'rgba(248,113,113,0.1)', border:`1px solid ${toast.startsWith('✓')?'rgba(134,198,69,0.3)':'rgba(248,113,113,0.3)'}`, borderRadius:8, fontSize:14, color: toast.startsWith('✓')?'#86c645':'#f87171' }}>
          {toast}
        </div>
      )}

      {loading ? (
        <div style={{ display:'flex', justifyContent:'center', padding:60 }}><div className="spinner" /></div>
      ) : filtered.length === 0 ? (
        <div style={{ textAlign:'center', padding:'80px 20px', color:'var(--white-dim)' }}>
          <svg width="56" height="56" viewBox="0 0 24 24" fill="none" stroke="var(--white-faint)" strokeWidth="1.5" style={{ margin:'0 auto 16px', display:'block' }}>
            <polygon points="23,7 16,12 23,17"/><rect x="1" y="5" width="15" height="14" rx="2"/>
          </svg>
          <p style={{ marginBottom:16, fontSize:16 }}>Nenhum vídeo encontrado.</p>
          <button className="btn btn-gold" style={{ background:'rgba(134,198,69,0.15)', borderColor:'rgba(134,198,69,0.5)', color:'#86c645' }} onClick={()=>setModal({})}>Adicionar primeiro vídeo</button>
        </div>
      ) : (
        <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
          {filtered.map(video => (
            <div key={video._id}
              style={{ display:'flex', alignItems:'center', gap:14, padding:'14px 18px', background:'var(--bg-card)', border:'1px solid var(--border)', borderRadius:10, transition:'border-color 0.15s' }}
              onMouseEnter={e=>e.currentTarget.style.borderColor='rgba(134,198,69,0.3)'}
              onMouseLeave={e=>e.currentTarget.style.borderColor='var(--border)'}>
              <div style={{ width:40, height:40, borderRadius:8, flexShrink:0, display:'flex', alignItems:'center', justifyContent:'center', background:'rgba(134,198,69,0.1)', border:'1px solid rgba(134,198,69,0.25)' }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#86c645" strokeWidth="2"><polygon points="23,7 16,12 23,17"/><rect x="1" y="5" width="15" height="14" rx="2"/></svg>
              </div>
              <div style={{ flex:1, minWidth:0 }}>
                <div style={{ fontWeight:700, fontSize:14, color:'var(--white)', marginBottom:3 }}>{video.title}</div>
                <div style={{ display:'flex', gap:8, alignItems:'center', flexWrap:'wrap' }}>
                  <span style={{ fontSize:12, color:'var(--white-dim)' }}>{catName(video)}</span>
                  {video.videos?.length > 0 && (
                    <span style={{ fontSize:11, padding:'2px 7px', borderRadius:5, background:'rgba(212,175,55,0.1)', color:'var(--gold)', border:'1px solid rgba(212,175,55,0.25)' }}>
                      📚 {video.videos.length} vídeos
                    </span>
                  )}
                  {video.cards?.length > 0 && (
                    <span style={{ fontSize:11, padding:'2px 7px', borderRadius:5, background:'rgba(134,198,69,0.1)', color:'#86c645', border:'1px solid rgba(134,198,69,0.2)' }}>
                      ✓ {video.cards.length} card{video.cards.length>1?'s':''}
                    </span>
                  )}
                </div>
              </div>
              <span style={{ fontSize:11, color:'var(--white-faint)', flexShrink:0 }}>▶ {video.playCount??0}</span>
              <div style={{ display:'flex', gap:6, flexShrink:0 }}>
                <button className="btn btn-ghost btn-sm" onClick={()=>setModal(video)}>Editar</button>
                <button className="btn btn-danger btn-sm" onClick={()=>handleDelete(video)}>✕</button>
              </div>
            </div>
          ))}
        </div>
      )}

      {modal !== null && (
        <VideoModal video={modal?._id ? modal : undefined} categories={categories} onClose={()=>setModal(null)} onSaved={load} />
      )}
    </div>
  );
}

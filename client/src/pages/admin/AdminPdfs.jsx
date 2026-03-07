import { useEffect, useState, useRef } from 'react';
import api from '../../api/axios';

// ─── CardsEditor ──────────────────────────────────────────────────────────────
function CardsEditor({ cards, onChange }) {
  const add    = ()      => onChange([...cards, { title: '', steps: [''] }]);
  const upd    = (i,f,v) => { const u=[...cards]; u[i]={...u[i],[f]:v}; onChange(u); };
  const updStep= (ci,si,v)=> { const u=[...cards]; const s=[...u[ci].steps]; s[si]=v; u[ci]={...u[ci],steps:s}; onChange(u); };
  const addStep= (ci)    => { const u=[...cards]; u[ci]={...u[ci],steps:[...u[ci].steps,'']}; onChange(u); };
  const rmStep = (ci,si) => { const u=[...cards]; u[ci]={...u[ci],steps:u[ci].steps.filter((_,i)=>i!==si)}; onChange(u); };
  const rmCard = i       => onChange(cards.filter((_,idx)=>idx!==i));
  return (
    <div>
      {cards.map((card,ci)=>(
        <div key={ci} style={{background:'rgba(0,0,0,0.3)',border:'1px solid var(--border)',borderRadius:10,padding:16,marginBottom:12}}>
          <div style={{display:'flex',gap:8,alignItems:'center',marginBottom:10}}>
            <input className="form-input" placeholder="Título do card" value={card.title}
              onChange={e=>upd(ci,'title',e.target.value)} style={{flex:1,fontSize:13}} />
            <button type="button" onClick={()=>rmCard(ci)}
              style={{background:'none',border:'1px solid rgba(248,113,113,0.4)',color:'#f87171',borderRadius:6,padding:'6px 10px',cursor:'pointer',fontSize:13}}>✕</button>
          </div>
          {card.steps.map((step,si)=>(
            <div key={si} style={{display:'flex',gap:6,alignItems:'center',marginBottom:6}}>
              <span style={{fontSize:11,color:'var(--white-faint)',minWidth:18,textAlign:'right'}}>{si+1}.</span>
              <input className="form-input" placeholder={`Linha ${si+1}`} value={step}
                onChange={e=>updStep(ci,si,e.target.value)} style={{flex:1,fontSize:13}} />
              <button type="button" onClick={()=>rmStep(ci,si)}
                style={{background:'none',border:'none',color:'var(--white-faint)',cursor:'pointer',fontSize:16,padding:'4px 6px'}}>×</button>
            </div>
          ))}
          <button type="button" onClick={()=>addStep(ci)}
            style={{marginTop:6,background:'none',border:'1px dashed var(--border)',color:'var(--white-dim)',borderRadius:6,padding:'6px 12px',cursor:'pointer',fontSize:12,width:'100%'}}>
            + Adicionar linha
          </button>
        </div>
      ))}
      <button type="button" onClick={add} className="btn btn-ghost" style={{width:'100%',justifyContent:'center'}}>+ Adicionar card</button>
    </div>
  );
}

// ─── UploadArea ───────────────────────────────────────────────────────────────
function UploadArea({ file, onFile, existingUrl, accept, label, icon }) {
  const ref = useRef();
  const name = file?.name || (existingUrl ? '✓ Arquivo atual' : null);
  return (
    <div>
      <div
        style={{border:'2px dashed var(--border)',borderRadius:12,padding:28,textAlign:'center',cursor:'pointer',transition:'all 0.2s'}}
        onClick={()=>ref.current?.click()}
        onDragOver={e=>{e.preventDefault();e.currentTarget.style.borderColor='var(--gold)';}}
        onDragLeave={e=>{e.currentTarget.style.borderColor='var(--border)';}}
        onDrop={e=>{e.preventDefault();e.currentTarget.style.borderColor='var(--border)';const f=e.dataTransfer.files[0];if(f)onFile(f);}}>
        <div style={{fontSize:32,marginBottom:8}}>{icon}</div>
        <p style={{color:name?'var(--gold)':'var(--white-dim)',fontWeight:700,fontSize:14}}>
          {name || label}
        </p>
        {!name && <p style={{color:'var(--white-faint)',fontSize:12,marginTop:4}}>Arraste ou clique para selecionar</p>}
        <input ref={ref} type="file" accept={accept} style={{display:'none'}} onChange={e=>{if(e.target.files[0])onFile(e.target.files[0]);}} />
      </div>
    </div>
  );
}

// ─── Modal PDF ────────────────────────────────────────────────────────────────
function PdfModal({ pdf, categories, onClose, onSaved }) {
  const [form, setForm] = useState({
    title:      pdf?.title      || '',
    subtitle:   pdf?.subtitle   || '',
    description:pdf?.description|| '',
    categoryId: pdf?.category?._id || pdf?.category || '',
    cardsLabel: pdf?.cardsLabel || 'NOTAS DE INSTRUÇÃO',
    pageCount:  pdf?.pageCount  || '',
    order:      pdf?.order      ?? 0,
  });
  const [cards,    setCards]    = useState(pdf?.cards || []);
  const [pdfFile,  setPdfFile]  = useState(null);
  const [coverFile,setCoverFile]= useState(null);
  const [loading,  setLoading]  = useState(false);
  const [error,    setError]    = useState('');
  const [uploadPct,setUploadPct]= useState(0);
  const set = (k,v) => setForm(p=>({...p,[k]:v}));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.title.trim())     { setError('Título obrigatório.'); return; }
    if (!form.categoryId)       { setError('Selecione uma categoria.'); return; }
    if (!pdf?._id && !pdfFile)  { setError('Selecione o arquivo PDF.'); return; }
    setLoading(true); setError(''); setUploadPct(0);

    try {
      const fd = new FormData();
      Object.entries(form).forEach(([k,v]) => fd.append(k, v));
      fd.append('cards', JSON.stringify(cards));
      if (pdfFile)   fd.append('pdf',   pdfFile);
      if (coverFile) fd.append('cover', coverFile);

      const cfg = { headers:{'Content-Type':'multipart/form-data'}, onUploadProgress: e => {
        setUploadPct(Math.round(e.loaded*100/e.total));
      }};

      if (pdf?._id) await api.put(`/pdfs/${pdf._id}`, fd, cfg);
      else          await api.post('/pdfs', fd, cfg);

      onSaved(); onClose();
    } catch (err) {
      setError(err.response?.data?.message || 'Erro ao salvar.');
    } finally { setLoading(false); }
  };

  return (
    <div className="modal-backdrop" onClick={e=>e.target===e.currentTarget&&onClose()}>
      <div className="modal" style={{maxWidth:680,maxHeight:'90vh',overflowY:'auto'}}>
        <div className="modal-header">
          <span className="modal-title">{pdf?._id?'EDITAR PDF':'NOVO PDF'}</span>
          <button onClick={onClose} style={{background:'none',border:'none',color:'var(--white-dim)',cursor:'pointer',fontSize:20,padding:4}}>×</button>
        </div>

        <form onSubmit={handleSubmit}>
          {/* Arquivo PDF */}
          <div className="form-group">
            <label className="form-label">Arquivo PDF {pdf?.pdfUrl && <span style={{color:'var(--gold)',fontSize:10}}>— já possui arquivo</span>}</label>
            <UploadArea file={pdfFile} onFile={setPdfFile} existingUrl={pdf?.pdfUrl}
              accept=".pdf,application/pdf" label="Selecionar PDF (até 200 MB)" icon="📄" />
          </div>

          {/* Capa */}
          <div className="form-group">
            <label className="form-label">Imagem de capa <span style={{fontSize:10,color:'var(--white-faint)',fontWeight:400}}>(opcional)</span></label>
            <UploadArea file={coverFile} onFile={setCoverFile} existingUrl={pdf?.coverUrl}
              accept="image/*" label="Selecionar capa (JPG, PNG)" icon="🖼️" />
            {pdf?.coverUrl && !coverFile && (
              <img src={pdf.coverUrl} alt="capa atual" style={{width:80,height:106,objectFit:'cover',borderRadius:6,marginTop:6,border:'1px solid var(--border)'}} />
            )}
          </div>

          {/* Info básica */}
          <div className="form-group">
            <label className="form-label">Título *</label>
            <input className="form-input" required value={form.title} onChange={e=>set('title',e.target.value)} placeholder="Ex: Manual de Instrução Militares" />
          </div>
          <div className="form-group">
            <label className="form-label">Subtítulo</label>
            <input className="form-input" value={form.subtitle} onChange={e=>set('subtitle',e.target.value)} placeholder="Ex: Edição 2024 — C.H.D.I" />
          </div>
          <div className="form-group">
            <label className="form-label">Descrição</label>
            <textarea className="form-input" value={form.description} onChange={e=>set('description',e.target.value)} placeholder="Breve descrição do conteúdo" rows={3} />
          </div>

          {/* Categoria + info */}
          <div style={{display:'grid',gridTemplateColumns:'1fr 1fr 1fr',gap:12}}>
            <div className="form-group" style={{gridColumn:'1/3'}}>
              <label className="form-label">Categoria *</label>
              <select className="form-input" value={form.categoryId} onChange={e=>set('categoryId',e.target.value)} required>
                <option value="">Selecione...</option>
                {categories.map(c=><option key={c._id} value={c._id}>{c.name}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Nº de páginas</label>
              <input className="form-input" type="number" min="0" value={form.pageCount} onChange={e=>set('pageCount',e.target.value)} placeholder="0" />
            </div>
          </div>

          <div style={{display:'grid',gridTemplateColumns:'1fr 80px',gap:12}}>
            <div className="form-group">
              <label className="form-label">Rótulo da seção de cards</label>
              <input className="form-input" value={form.cardsLabel} onChange={e=>set('cardsLabel',e.target.value)} placeholder="NOTAS DE INSTRUÇÃO" />
            </div>
            <div className="form-group">
              <label className="form-label">Ordem</label>
              <input className="form-input" type="number" min="0" value={form.order} onChange={e=>set('order',parseInt(e.target.value)||0)} />
            </div>
          </div>

          {/* Cards */}
          <div className="form-group">
            <label className="form-label" style={{marginBottom:8}}>Cards / Notas de instrução</label>
            <CardsEditor cards={cards} onChange={setCards} />
          </div>

          {/* Upload progress */}
          {loading && uploadPct > 0 && uploadPct < 100 && (
            <div style={{marginBottom:16}}>
              <div style={{height:4,background:'rgba(255,255,255,0.1)',borderRadius:2,overflow:'hidden'}}>
                <div style={{height:'100%',background:'var(--gold)',width:`${uploadPct}%`,transition:'width 0.3s'}} />
              </div>
              <p style={{fontSize:12,color:'var(--white-dim)',marginTop:4,textAlign:'center'}}>Enviando... {uploadPct}%</p>
            </div>
          )}

          {error && <div className="form-error" style={{marginBottom:14,padding:'10px 14px',background:'rgba(248,113,113,0.08)',borderRadius:8}}>{error}</div>}

          <div style={{display:'flex',gap:10,justifyContent:'flex-end'}}>
            <button type="button" className="btn btn-ghost" onClick={onClose}>Cancelar</button>
            <button type="submit" className="btn btn-gold" disabled={loading}>
              {loading ? (uploadPct > 0 ? `Enviando ${uploadPct}%...` : 'Processando...') : 'Salvar PDF'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ─── Página principal ─────────────────────────────────────────────────────────
export default function AdminPdfs() {
  const [pdfs,       setPdfs]       = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading,    setLoading]    = useState(true);
  const [modal,      setModal]      = useState(null);
  const [toast,      setToast]      = useState('');
  const [search,     setSearch]     = useState('');

  const load = async () => {
    try {
      const [pRes, cRes] = await Promise.all([api.get('/pdfs'), api.get('/categories')]);
      setPdfs(pRes.data.pdfs);
      setCategories(cRes.data.categories);
    } finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const handleDelete = async (pdf) => {
    if (!window.confirm(`Remover "${pdf.title}"?`)) return;
    try { await api.delete(`/pdfs/${pdf._id}`); setToast('PDF removido.'); load(); }
    catch (err) { setToast(err.response?.data?.message || 'Erro ao remover.'); }
  };

  useEffect(() => { if (toast) setTimeout(()=>setToast(''), 3500); }, [toast]);

  const filtered = pdfs.filter(p =>
    p.title.toLowerCase().includes(search.toLowerCase()) ||
    (p.subtitle||'').toLowerCase().includes(search.toLowerCase())
  );

  function fmtSize(bytes) {
    if (!bytes) return '—';
    if (bytes < 1024*1024) return `${(bytes/1024).toFixed(0)} KB`;
    return `${(bytes/(1024*1024)).toFixed(1)} MB`;
  }

  return (
    <div>
      {/* Header */}
      <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:24}}>
        <div>
          <h2 style={{fontFamily:'var(--font-display)',fontSize:26,letterSpacing:'0.1em',color:'var(--white)',marginBottom:4}}>
            📄 PDFs
          </h2>
          <p style={{color:'var(--white-dim)',fontSize:14}}>Documentos, manuais e cartilhas</p>
        </div>
        <div style={{display:'flex',gap:10,alignItems:'center'}}>
          <input className="form-input" placeholder="Buscar PDF..." value={search}
            onChange={e=>setSearch(e.target.value)}
            style={{width:220,padding:'8px 14px',fontSize:13}} />
          <button className="btn btn-gold" onClick={()=>setModal({})}>+ Novo PDF</button>
        </div>
      </div>

      {toast && (
        <div style={{marginBottom:16,padding:'12px 16px',background:'var(--bg-card)',border:'1px solid var(--border)',borderRadius:8,fontSize:14}}>{toast}</div>
      )}

      {loading ? (
        <div style={{display:'flex',justifyContent:'center',padding:60}}><div className="spinner" /></div>
      ) : filtered.length === 0 ? (
        <div style={{textAlign:'center',padding:'60px 20px',color:'var(--white-dim)'}}>
          <div style={{fontSize:48,marginBottom:16}}>📄</div>
          <p style={{marginBottom:16}}>Nenhum PDF encontrado.</p>
          <button className="btn btn-gold" onClick={()=>setModal({})}>Adicionar primeiro PDF</button>
        </div>
      ) : (
        <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(300px,1fr))',gap:16}}>
          {filtered.map(pdf => (
            <div key={pdf._id} className="card" style={{padding:0,overflow:'hidden',display:'flex',flexDirection:'column'}}>
              {/* Capa */}
              <div style={{position:'relative',height:160,background:'linear-gradient(135deg,rgba(45,80,22,0.3),rgba(10,18,8,0.9))'}}>
                {pdf.coverUrl ? (
                  <img src={pdf.coverUrl} alt="" style={{width:'100%',height:'100%',objectFit:'cover',opacity:0.7}} />
                ) : (
                  <div style={{height:'100%',display:'flex',alignItems:'center',justifyContent:'center'}}>
                    <span style={{fontSize:64,opacity:0.3}}>📄</span>
                  </div>
                )}
                <div style={{position:'absolute',inset:0,background:'linear-gradient(to top,rgba(10,18,8,0.95) 0%,transparent 60%)'}} />
                <div style={{position:'absolute',bottom:0,left:0,right:0,padding:'12px 14px'}}>
                  <div style={{fontFamily:'var(--font-display)',fontSize:18,letterSpacing:'0.05em',color:'var(--white)',marginBottom:2,lineHeight:1.2}}>
                    {pdf.title}
                  </div>
                  {pdf.subtitle && (
                    <div style={{fontSize:11,color:'var(--gold)',fontWeight:600,letterSpacing:'0.06em'}}>{pdf.subtitle}</div>
                  )}
                </div>
                {/* Badges */}
                <div style={{position:'absolute',top:10,right:10,display:'flex',gap:5}}>
                  {pdf.pageCount > 0 && (
                    <span style={{background:'rgba(0,0,0,0.8)',color:'var(--gold)',fontSize:10,fontWeight:700,padding:'3px 7px',borderRadius:4,border:'1px solid var(--border)'}}>
                      {pdf.pageCount}p
                    </span>
                  )}
                  <span style={{background:'rgba(0,0,0,0.8)',color:'var(--white-dim)',fontSize:10,fontWeight:700,padding:'3px 7px',borderRadius:4,border:'1px solid var(--border)'}}>
                    {fmtSize(pdf.fileSize)}
                  </span>
                </div>
              </div>

              {/* Info */}
              <div style={{padding:'12px 14px',flex:1,display:'flex',flexDirection:'column',gap:8}}>
                {pdf.description && (
                  <p style={{color:'var(--white-dim)',fontSize:12,lineHeight:1.5,overflow:'hidden',display:'-webkit-box',WebkitLineClamp:2,WebkitBoxOrient:'vertical'}}>
                    {pdf.description}
                  </p>
                )}
                <div style={{display:'flex',gap:6,flexWrap:'wrap'}}>
                  <span style={{fontSize:10,fontWeight:700,padding:'3px 7px',borderRadius:4,background:'var(--gold-dim)',color:'var(--gold)',border:'1px solid var(--border-strong)'}}>
                    {pdf.category?.name || '—'}
                  </span>
                  {pdf.cards?.length > 0 && (
                    <span style={{fontSize:10,fontWeight:700,padding:'3px 7px',borderRadius:4,background:'rgba(134,198,69,0.1)',color:'#86c645'}}>
                      {pdf.cards.length} card{pdf.cards.length>1?'s':''}
                    </span>
                  )}
                </div>

                <div style={{display:'flex',gap:8,marginTop:'auto'}}>
                  <a href={pdf.pdfUrl} target="_blank" rel="noopener" className="btn btn-ghost btn-sm" style={{flex:1,justifyContent:'center'}}>
                    👁 Ver PDF
                  </a>
                  <button className="btn btn-ghost btn-sm" onClick={()=>setModal(pdf)} style={{flex:1}}>Editar</button>
                  <button className="btn btn-danger btn-sm" onClick={()=>handleDelete(pdf)}>🗑</button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {modal !== null && (
        <PdfModal
          pdf={modal._id ? modal : undefined}
          categories={categories}
          onClose={()=>setModal(null)}
          onSaved={load}
        />
      )}
    </div>
  );
}

import { useEffect, useState, useRef, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import api from '../api/axios';

// ─── Load PDF.js from CDN ─────────────────────────────────────────────────────
function usePdfJs() {
  const [ready, setReady] = useState(!!window.pdfjsLib);
  useEffect(() => {
    if (window.pdfjsLib) { setReady(true); return; }
    const workerScript = document.createElement('script');
    workerScript.src = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';
    const script = document.createElement('script');
    script.src   = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js';
    script.onload = () => {
      window.pdfjsLib.GlobalWorkerOptions.workerSrc =
        'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';
      setReady(true);
    };
    document.head.appendChild(workerScript);
    document.head.appendChild(script);
  }, []);
  return ready;
}

// ─── Single Page Renderer ─────────────────────────────────────────────────────
function PdfPage({ pdfDoc, pageNum, scale, onTextCopy, visible }) {
  const canvasRef  = useRef();
  const textRef    = useRef();
  const renderTask = useRef(null);

  useEffect(() => {
    if (!pdfDoc || !visible) return;
    let cancelled = false;

    (async () => {
      const page     = await pdfDoc.getPage(pageNum);
      const viewport = page.getViewport({ scale });

      const canvas = canvasRef.current;
      if (!canvas || cancelled) return;

      canvas.width  = viewport.width;
      canvas.height = viewport.height;

      if (renderTask.current) {
        try { renderTask.current.cancel(); } catch(_) {}
      }

      const ctx = canvas.getContext('2d');
      renderTask.current = page.render({ canvasContext: ctx, viewport });
      try { await renderTask.current.promise; } catch(_) { return; }
      if (cancelled) return;

      // Text layer for copy
      if (textRef.current) {
        textRef.current.innerHTML = '';
        textRef.current.style.width  = `${viewport.width}px`;
        textRef.current.style.height = `${viewport.height}px`;

        const textContent = await page.getTextContent();
        textContent.items.forEach(item => {
          if (!item.str?.trim()) return;
          const span = document.createElement('span');
          span.textContent = item.str + ' ';
          span.style.cssText = `position:absolute;left:${item.transform[4]}px;bottom:${item.transform[5]}px;font-size:${item.height}px;white-space:pre;color:transparent;cursor:text;user-select:text;`;
          textRef.current.appendChild(span);
        });
      }
    })();

    return () => { cancelled = true; if (renderTask.current) try { renderTask.current.cancel(); } catch(_) {} };
  }, [pdfDoc, pageNum, scale, visible]);

  return (
    <div style={{ position: 'relative', display: 'inline-block', boxShadow: '0 8px 40px rgba(0,0,0,0.7)', borderRadius: 4 }}>
      <canvas ref={canvasRef} style={{ display: 'block', maxWidth: '100%' }} />
      <div ref={textRef} style={{ position: 'absolute', top: 0, left: 0, overflow: 'hidden', lineHeight: 1 }} />
    </div>
  );
}

// ─── Thumbnail ────────────────────────────────────────────────────────────────
function Thumbnail({ pdfDoc, pageNum, active, onClick }) {
  const canvasRef = useRef();
  useEffect(() => {
    if (!pdfDoc) return;
    (async () => {
      const page     = await pdfDoc.getPage(pageNum);
      const viewport = page.getViewport({ scale: 0.2 });
      const canvas   = canvasRef.current;
      if (!canvas) return;
      canvas.width  = viewport.width;
      canvas.height = viewport.height;
      await page.render({ canvasContext: canvas.getContext('2d'), viewport }).promise;
    })();
  }, [pdfDoc, pageNum]);

  return (
    <div onClick={onClick} style={{
      cursor: 'pointer', padding: 4, borderRadius: 6,
      border: `2px solid ${active ? 'var(--gold)' : 'transparent'}`,
      background: active ? 'var(--gold-dim)' : 'transparent',
      transition: 'all 0.15s',
    }}>
      <canvas ref={canvasRef} style={{ display: 'block', borderRadius: 3 }} />
      <div style={{ fontSize: 9, textAlign: 'center', color: active ? 'var(--gold)' : 'var(--white-faint)', marginTop: 3, fontWeight: 700 }}>
        {pageNum}
      </div>
    </div>
  );
}

// ─── Main Viewer ──────────────────────────────────────────────────────────────
export default function PdfViewer() {
  const { id }     = useParams();
  const pdfJsReady = usePdfJs();

  const [pdfMeta,    setPdfMeta]    = useState(null);
  const [pdfDoc,     setPdfDoc]     = useState(null);
  const [totalPages, setTotalPages] = useState(0);
  const [currentPage,setCurrentPage]= useState(1);
  const [scale,      setScale]      = useState(1.4);
  const [loading,    setLoading]    = useState(true);
  const [pdfLoading, setPdfLoading] = useState(false);
  const [error,      setError]      = useState('');
  const [showThumb,  setShowThumb]  = useState(false);
  const [showCards,  setShowCards]  = useState(false);
  const [jumpInput,  setJumpInput]  = useState('');
  const [showJump,   setShowJump]   = useState(false);
  const [flipDir,    setFlipDir]    = useState(null); // 'forward' | 'backward'
  const [isFlipping, setIsFlipping] = useState(false);

  const mainRef  = useRef();
  const thumbRef = useRef();

  // Load PDF metadata
  useEffect(() => {
    (async () => {
      try {
        const { data } = await api.get(`/pdfs/${id}`);
        setPdfMeta(data.pdf);
      } catch { setError('PDF não encontrado.'); }
      finally  { setLoading(false); }
    })();
  }, [id]);

  // Load PDF.js document
  useEffect(() => {
    if (!pdfJsReady || !pdfMeta?.pdfUrl) return;
    setPdfLoading(true);
    (async () => {
      try {
        const doc = await window.pdfjsLib.getDocument({
          url: pdfMeta.pdfUrl,
          cMapUrl: 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/cmaps/',
          cMapPacked: true,
        }).promise;
        setPdfDoc(doc);
        setTotalPages(doc.numPages);
        setCurrentPage(1);
      } catch(e) {
        setError('Erro ao carregar o PDF. Verifique sua conexão.');
      } finally {
        setPdfLoading(false);
      }
    })();
  }, [pdfJsReady, pdfMeta]);

  // Scroll thumbnail into view
  useEffect(() => {
    if (!showThumb) return;
    const el = thumbRef.current?.querySelector(`[data-page="${currentPage}"]`);
    el?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }, [currentPage, showThumb]);

  const navigate = useCallback((dir) => {
    if (isFlipping) return;
    const next = currentPage + dir;
    if (next < 1 || next > totalPages) return;
    setFlipDir(dir > 0 ? 'forward' : 'backward');
    setIsFlipping(true);
    setTimeout(() => {
      setCurrentPage(next);
      setFlipDir(null);
      setIsFlipping(false);
    }, 320);
  }, [currentPage, totalPages, isFlipping]);

  // Keyboard navigation
  useEffect(() => {
    const handler = (e) => {
      if (e.target.tagName === 'INPUT') return;
      if (e.key === 'ArrowRight' || e.key === 'ArrowDown') navigate(1);
      if (e.key === 'ArrowLeft'  || e.key === 'ArrowUp')   navigate(-1);
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [navigate]);

  if (loading) return (
    <div style={{ minHeight: '100vh', background: '#060d04' }}>
      <Navbar />
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh' }}>
        <div className="spinner" />
      </div>
    </div>
  );

  if (error) return (
    <div style={{ minHeight: '100vh', background: '#060d04' }}>
      <Navbar />
      <div style={{ textAlign: 'center', padding: '80px 20px', color: 'var(--white-dim)' }}>
        <div style={{ fontSize: 48, marginBottom: 16 }}>📄</div>
        <p style={{ marginBottom: 20 }}>{error}</p>
        <Link to="/" className="btn btn-gold">Voltar</Link>
      </div>
    </div>
  );

  const pdf = pdfMeta;
  const progressPct = totalPages > 0 ? ((currentPage / totalPages) * 100).toFixed(0) : 0;

  return (
    <div style={{ minHeight: '100vh', background: '#060d04', display: 'flex', flexDirection: 'column' }}>
      {/* ── Top Bar ─────────────────────────────────────────────── */}
      <div style={{
        background: 'rgba(10,18,8,0.98)',
        borderBottom: '1px solid var(--border)',
        padding: '0 16px',
        display: 'flex',
        alignItems: 'center',
        gap: 12,
        height: 56,
        flexShrink: 0,
        backdropFilter: 'blur(12px)',
        position: 'sticky',
        top: 0,
        zIndex: 100,
      }}>
        <Link to={`/modulo/${pdf.category?._id}`} style={{ display:'flex',alignItems:'center',gap:6,color:'var(--white-dim)',textDecoration:'none',fontWeight:700,fontSize:13,padding:'6px 10px',borderRadius:7,border:'1px solid var(--border)',transition:'all 0.15s' }}
          onMouseEnter={e=>{e.currentTarget.style.color='var(--gold)';e.currentTarget.style.borderColor='var(--gold)';}}
          onMouseLeave={e=>{e.currentTarget.style.color='var(--white-dim)';e.currentTarget.style.borderColor='var(--border)';}}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="15,18 9,12 15,6"/></svg>
          Voltar
        </Link>

        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontFamily: 'var(--font-display)', fontSize: 16, letterSpacing: '0.06em', color: 'var(--white)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {pdf.title}
          </div>
          {pdf.subtitle && (
            <div style={{ fontSize: 11, color: 'var(--gold)', fontWeight: 600, letterSpacing: '0.08em' }}>{pdf.subtitle}</div>
          )}
        </div>

        {/* Controls */}
        <div style={{ display: 'flex', gap: 6, alignItems: 'center', flexShrink: 0 }}>
          {/* Zoom */}
          <button onClick={() => setScale(s => Math.max(0.5, s - 0.2))} title="Diminuir zoom"
            style={{ width:32,height:32,display:'flex',alignItems:'center',justifyContent:'center',background:'rgba(255,255,255,0.05)',border:'1px solid var(--border)',borderRadius:7,color:'var(--white-dim)',cursor:'pointer',fontSize:16 }}>−</button>
          <span style={{ fontSize:12,color:'var(--gold)',fontWeight:700,minWidth:38,textAlign:'center' }}>{Math.round(scale*100)}%</span>
          <button onClick={() => setScale(s => Math.min(3, s + 0.2))} title="Aumentar zoom"
            style={{ width:32,height:32,display:'flex',alignItems:'center',justifyContent:'center',background:'rgba(255,255,255,0.05)',border:'1px solid var(--border)',borderRadius:7,color:'var(--white-dim)',cursor:'pointer',fontSize:16 }}>+</button>

          <div style={{ width: 1, height: 24, background: 'var(--border)', margin: '0 4px' }} />

          {/* Thumbnails toggle */}
          <button onClick={() => setShowThumb(v => !v)} title="Miniaturas"
            style={{ width:32,height:32,display:'flex',alignItems:'center',justifyContent:'center',background:showThumb?'var(--gold-dim)':'rgba(255,255,255,0.05)',border:`1px solid ${showThumb?'var(--gold)':'var(--border)'}`,borderRadius:7,cursor:'pointer' }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={showThumb?'var(--gold)':'var(--white-dim)'} strokeWidth="2"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/></svg>
          </button>

          {/* Cards toggle */}
          {pdf.cards?.length > 0 && (
            <button onClick={() => setShowCards(v => !v)} title="Notas / Cards"
              style={{ width:32,height:32,display:'flex',alignItems:'center',justifyContent:'center',background:showCards?'var(--gold-dim)':'rgba(255,255,255,0.05)',border:`1px solid ${showCards?'var(--gold)':'var(--border)'}`,borderRadius:7,cursor:'pointer' }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={showCards?'var(--gold)':'var(--white-dim)'} strokeWidth="2"><rect x="2" y="3" width="20" height="14" rx="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/></svg>
            </button>
          )}

          {/* Download */}
          <a href={pdf.pdfUrl} download target="_blank" rel="noopener" title="Baixar PDF"
            style={{ width:32,height:32,display:'flex',alignItems:'center',justifyContent:'center',background:'rgba(255,255,255,0.05)',border:'1px solid var(--border)',borderRadius:7,color:'var(--white-dim)',textDecoration:'none',cursor:'pointer' }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7,10 12,15 17,10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
          </a>
        </div>
      </div>

      {/* ── Body ──────────────────────────────────────────────────── */}
      <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>

        {/* Thumbnail strip */}
        {showThumb && (
          <div ref={thumbRef} style={{
            width: 100, background: 'rgba(10,18,8,0.98)', borderRight: '1px solid var(--border)',
            overflowY: 'auto', padding: '12px 8px', display: 'flex', flexDirection: 'column', gap: 6, flexShrink: 0,
          }}>
            {pdfDoc && Array.from({ length: totalPages }, (_, i) => i + 1).map(n => (
              <div key={n} data-page={n}>
                <Thumbnail pdfDoc={pdfDoc} pageNum={n} active={n === currentPage} onClick={() => setCurrentPage(n)} />
              </div>
            ))}
          </div>
        )}

        {/* Main viewer */}
        <div ref={mainRef} style={{ flex: 1, overflow: 'auto', display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '32px 24px 120px', gap: 0, position: 'relative' }}>

          {pdfLoading && (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16, paddingTop: 80 }}>
              <div className="spinner" />
              <p style={{ color: 'var(--white-dim)', fontSize: 14 }}>Carregando PDF...</p>
            </div>
          )}

          {pdfDoc && !pdfLoading && (
            <>
              {/* Page flip container */}
              <div style={{
                perspective: 1200,
                animation: flipDir
                  ? `${flipDir === 'forward' ? 'flipForward' : 'flipBackward'} 0.32s ease-in-out`
                  : 'none',
              }}>
                <style>{`
                  @keyframes flipForward {
                    0%   { transform: rotateY(0deg); opacity: 1; }
                    50%  { transform: rotateY(-45deg) scaleX(0.85); opacity: 0.5; }
                    100% { transform: rotateY(0deg); opacity: 1; }
                  }
                  @keyframes flipBackward {
                    0%   { transform: rotateY(0deg); opacity: 1; }
                    50%  { transform: rotateY(45deg) scaleX(0.85); opacity: 0.5; }
                    100% { transform: rotateY(0deg); opacity: 1; }
                  }
                `}</style>
                <PdfPage pdfDoc={pdfDoc} pageNum={currentPage} scale={scale} visible={true} />
              </div>

              {/* Pre-render adjacent pages invisibly */}
              {currentPage > 1 && (
                <div style={{ position: 'absolute', left: -9999 }}>
                  <PdfPage pdfDoc={pdfDoc} pageNum={currentPage - 1} scale={scale} visible={true} />
                </div>
              )}
              {currentPage < totalPages && (
                <div style={{ position: 'absolute', left: -9999 }}>
                  <PdfPage pdfDoc={pdfDoc} pageNum={currentPage + 1} scale={scale} visible={true} />
                </div>
              )}
            </>
          )}
        </div>

        {/* Cards panel */}
        {showCards && pdf.cards?.length > 0 && (
          <div style={{
            width: 300, background: 'rgba(10,18,8,0.98)', borderLeft: '1px solid var(--border)',
            overflowY: 'auto', padding: 20, flexShrink: 0,
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
              <span style={{ fontFamily: 'var(--font-display)', fontSize: 16, letterSpacing: '0.1em', color: 'var(--gold)' }}>
                {pdf.cardsLabel || 'NOTAS DE INSTRUÇÃO'}
              </span>
              <button onClick={() => setShowCards(false)}
                style={{ background: 'none', border: 'none', color: 'var(--white-dim)', cursor: 'pointer', fontSize: 18 }}>×</button>
            </div>
            {pdf.cards.map((card, i) => (
              <div key={i} style={{ background: 'rgba(201,162,39,0.07)', border: '1px solid var(--border)', borderRadius: 10, padding: 14, marginBottom: 12 }}>
                {card.title && (
                  <div style={{ fontWeight: 700, fontSize: 13, color: 'var(--gold)', marginBottom: 8, letterSpacing: '0.05em' }}>
                    {card.title}
                  </div>
                )}
                {card.steps?.filter(s=>s.trim()).map((step, si) => (
                  <div key={si} style={{ display: 'flex', gap: 8, marginBottom: 6 }}>
                    <span style={{ flexShrink: 0, width: 18, height: 18, borderRadius: '50%', background: 'var(--gold)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, fontWeight: 700, color: '#0A1208' }}>{si+1}</span>
                    <span style={{ fontSize: 12, color: 'var(--white-dim)', lineHeight: 1.5 }}>{step}</span>
                  </div>
                ))}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ── Bottom Navigation Bar ────────────────────────────────── */}
      {pdfDoc && (
        <div style={{
          position: 'fixed', bottom: 0, left: 0, right: 0,
          background: 'rgba(10,18,8,0.97)', borderTop: '1px solid var(--border)',
          backdropFilter: 'blur(16px)', padding: '12px 20px',
          display: 'flex', alignItems: 'center', gap: 16, zIndex: 100,
        }}>
          {/* Prev */}
          <button onClick={() => navigate(-1)} disabled={currentPage <= 1 || isFlipping}
            style={{ width:44,height:44,display:'flex',alignItems:'center',justifyContent:'center',background:currentPage<=1?'rgba(255,255,255,0.03)':'rgba(201,162,39,0.12)',border:`1px solid ${currentPage<=1?'var(--border)':'var(--gold)'}`,borderRadius:10,cursor:currentPage<=1?'not-allowed':'pointer',transition:'all 0.15s',color:currentPage<=1?'var(--white-faint)':'var(--gold)' }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="15,18 9,12 15,6"/></svg>
          </button>

          {/* Progress + jump */}
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 6 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
              {showJump ? (
                <form onSubmit={e => {
                  e.preventDefault();
                  const n = parseInt(jumpInput);
                  if (n >= 1 && n <= totalPages) setCurrentPage(n);
                  setShowJump(false); setJumpInput('');
                }} style={{ display: 'flex', gap: 6 }}>
                  <input autoFocus type="number" min="1" max={totalPages} value={jumpInput}
                    onChange={e => setJumpInput(e.target.value)}
                    style={{ width: 70, padding: '6px 10px', background: 'var(--bg-card)', border: '1px solid var(--gold)', borderRadius: 7, color: 'var(--white)', textAlign: 'center', fontFamily: 'var(--font-mono)', fontSize: 14 }} />
                  <button type="submit" className="btn btn-gold btn-sm">Ir</button>
                  <button type="button" className="btn btn-ghost btn-sm" onClick={() => { setShowJump(false); setJumpInput(''); }}>×</button>
                </form>
              ) : (
                <button onClick={() => setShowJump(true)}
                  style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{ fontFamily: 'var(--font-mono)', fontSize: 14, color: 'var(--white)', fontWeight: 700 }}>
                    {currentPage}
                  </span>
                  <span style={{ fontSize: 12, color: 'var(--white-faint)' }}>/ {totalPages}</span>
                  <span style={{ fontSize: 10, color: 'var(--white-faint)', border: '1px solid var(--border)', borderRadius: 4, padding: '1px 5px' }}>ir para</span>
                </button>
              )}
            </div>

            {/* Progress bar */}
            <div style={{ height: 3, background: 'rgba(255,255,255,0.08)', borderRadius: 2, overflow: 'hidden', cursor: 'pointer' }}
              onClick={e => {
                const rect = e.currentTarget.getBoundingClientRect();
                const ratio = (e.clientX - rect.left) / rect.width;
                setCurrentPage(Math.max(1, Math.min(totalPages, Math.round(ratio * totalPages))));
              }}>
              <div style={{ height: '100%', background: 'var(--gold)', width: `${progressPct}%`, borderRadius: 2, transition: 'width 0.3s' }} />
            </div>
          </div>

          {/* Next */}
          <button onClick={() => navigate(1)} disabled={currentPage >= totalPages || isFlipping}
            style={{ width:44,height:44,display:'flex',alignItems:'center',justifyContent:'center',background:currentPage>=totalPages?'rgba(255,255,255,0.03)':'rgba(201,162,39,0.12)',border:`1px solid ${currentPage>=totalPages?'var(--border)':'var(--gold)'}`,borderRadius:10,cursor:currentPage>=totalPages?'not-allowed':'pointer',transition:'all 0.15s',color:currentPage>=totalPages?'var(--white-faint)':'var(--gold)' }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="9,18 15,12 9,6"/></svg>
          </button>

          {/* Page info badges */}
          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            <span style={{ fontSize: 11, color: 'var(--gold)', fontWeight: 700, padding: '4px 10px', background: 'var(--gold-dim)', border: '1px solid var(--border)', borderRadius: 6 }}>
              {progressPct}%
            </span>
          </div>
        </div>
      )}
    </div>
  );
}

import { useEffect, useState, useRef } from 'react';
import { RankChip, RANK_MAP, InsigniaInner, RANKS } from '../../components/RankBadge';
import api from '../../api/axios';

function getRankColor(rank) {
  const r = RANK_MAP[rank];
  if (!r) return '#6EBF48';
  const isGen = ['General de Brigada','General de Divisão','General de Exército','Marechal','Comandante'].includes(rank);
  return isGen ? '#C0C0C0' : r.color;
}

const MONTHS = ['Janeiro','Fevereiro','Março','Abril','Maio','Junho','Julho','Agosto','Setembro','Outubro','Novembro','Dezembro'];
const DAY_NAMES = ['Dom','Seg','Ter','Qua','Qui','Sex','Sáb'];
const DAY_NAMES_FULL = ['Domingo','Segunda-feira','Terça-feira','Quarta-feira','Quinta-feira','Sexta-feira','Sábado'];

function Toast({ msg, type, onClose }) {
  useEffect(() => { const t = setTimeout(onClose, 3500); return () => clearTimeout(t); }, []);
  return (
    <div style={{ position: 'fixed', bottom: 24, right: 24, padding: '12px 20px', borderRadius: 10, zIndex: 9999, fontWeight: 600, fontSize: 13, display: 'flex', alignItems: 'center', gap: 10, boxShadow: '0 4px 20px rgba(0,0,0,0.4)', background: type === 'error' ? 'rgba(192,57,43,0.95)' : 'rgba(40,80,30,0.95)', color: 'white' }}>
      {type === 'error' ? '⚠️' : '✓'} {msg}
    </div>
  );
}

/* ── Export helpers ──────────────────────────────────────────────────────── */
function downloadExcel(schedules) {
  import('xlsx').then(XLSX => {
    const now = new Date();
    const generatedAt = now.toLocaleDateString('pt-BR', { weekday:'long', day:'2-digit', month:'long', year:'numeric' });
    const rows = [
      ['★  1º REGIMENTO DE CAVALARIA DE GUARDA  ★', '', '', '', '', ''],
      ['C.H.D.I  —  COMPANHIA DE HONRA E DEFESA INTERNA', '', '', '', '', ''],
      ['ESCALA DE SERVIÇO', '', '', '', '', ''],
      [`Gerado em: ${generatedAt}`, '', '', '', '', ''],
      ['', '', '', '', '', ''],
      ['Data', 'Dia da Semana', 'Patente', 'Nome', 'Horário', 'Observação'],
    ];
    schedules.forEach(s => {
      const d = new Date(s.date);
      const dateStr = `${d.getDate().toString().padStart(2,'0')}/${(d.getMonth()+1).toString().padStart(2,'0')}/${d.getFullYear()}`;
      const dayStr = DAY_NAMES_FULL[d.getDay()];
      if (!s.entries.length) {
        rows.push([dateStr, dayStr, '-', 'SEM ESCALA', '-', '-']);
      } else {
        s.entries.forEach((e, i) => {
          rows.push([
            i === 0 ? dateStr : '',
            i === 0 ? dayStr : '',
            e.soldier?.rank || '-',
            e.soldier?.name || '-',
            e.timeSlot || '00h–24h',
            e.notes || ''
          ]);
        });
      }
    });
    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.aoa_to_sheet(rows);
    // Column widths
    ws['!cols'] = [{ wch: 13 }, { wch: 19 }, { wch: 22 }, { wch: 32 }, { wch: 13 }, { wch: 32 }];
    // Merges for header rows
    ws['!merges'] = [
      { s: { r: 0, c: 0 }, e: { r: 0, c: 5 } },
      { s: { r: 1, c: 0 }, e: { r: 1, c: 5 } },
      { s: { r: 2, c: 0 }, e: { r: 2, c: 5 } },
      { s: { r: 3, c: 0 }, e: { r: 3, c: 5 } },
    ];
    // Style header cells
    const headerStyle = { font: { bold: true, sz: 14, color: { rgb: 'C9A227' } }, alignment: { horizontal: 'center' }, fill: { fgColor: { rgb: '0D1A0A' } } };
    const subStyle    = { font: { bold: true, sz: 11, color: { rgb: 'F4F2EC' } }, alignment: { horizontal: 'center' }, fill: { fgColor: { rgb: '111908' } } };
    const colStyle    = { font: { bold: true, sz: 10, color: { rgb: 'F4F2EC' } }, alignment: { horizontal: 'center' }, fill: { fgColor: { rgb: '1A2E10' } } };
    ['A1','B1','C1','D1','E1','F1'].forEach(c => { if(ws[c]) ws[c].s = headerStyle; });
    ['A2','B2','C2','D2','E2','F2'].forEach(c => { if(ws[c]) ws[c].s = subStyle; });
    ['A3','B3','C3','D3','E3','F3'].forEach(c => { if(ws[c]) ws[c].s = subStyle; });
    ['A6','B6','C6','D6','E6','F6'].forEach(c => { if(ws[c]) ws[c].s = colStyle; });
    XLSX.utils.book_append_sheet(wb, ws, 'Escala de Serviço');
    XLSX.writeFile(wb, 'escala-1rcg-chdi.xlsx');
  });
}

function downloadPDF(targetRef) {
  Promise.all([import('jspdf'), import('html2canvas')]).then(([{ jsPDF }, { default: html2canvas }]) => {
    html2canvas(targetRef.current, { scale: 2, backgroundColor: '#0d1a0a' }).then(canvas => {
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF({ orientation: 'p', unit: 'mm', format: 'a4' });
      const pdfW = pdf.internal.pageSize.getWidth();
      const pdfH = (canvas.height * pdfW) / canvas.width;
      let left = pdfH;
      pdf.addImage(imgData, 'PNG', 0, 0, pdfW, pdfH);
      left -= pdf.internal.pageSize.getHeight();
      while (left > 0) {
        pdf.addPage();
        pdf.addImage(imgData, 'PNG', 0, left - pdfH, pdfW, pdfH);
        left -= pdf.internal.pageSize.getHeight();
      }
      pdf.save('escala-1rcg-chdi.pdf');
    });
  });
}

function downloadImage(targetRef) {
  import('html2canvas').then(({ default: html2canvas }) => {
    html2canvas(targetRef.current, { scale: 2, backgroundColor: '#0d1a0a' }).then(canvas => {
      const a = document.createElement('a');
      a.download = 'escala-1rcg-chdi.png';
      a.href = canvas.toDataURL('image/png');
      a.click();
    });
  });
}

/* ── Printable Schedule ───────────────────────────────────────────────────── */
function PrintableSchedule({ schedules, forwardRef }) {
  return (
    <div ref={forwardRef} style={{ background: '#0d1a0a', padding: 28, fontFamily: 'Georgia, serif', color: '#f4f2ec', minWidth: 520 }}>
      <div style={{ textAlign: 'center', marginBottom: 20, borderBottom: '2px solid #C9A227', paddingBottom: 16 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 16, marginBottom: 10 }}>
          <svg width="34" height="34" viewBox="0 0 24 24" fill="#C9A227"><polygon points="12,2 15,9 22,9 17,14 19,21 12,17 5,21 7,14 2,9 9,9"/></svg>
          <div>
            <div style={{ fontSize: 22, fontWeight: 900, letterSpacing: '0.26em', color: '#C9A227', textTransform: 'uppercase' }}>1º RCG · C.H.D.I</div>
            <div style={{ fontSize: 10, letterSpacing: '0.2em', color: 'rgba(201,162,39,0.55)', fontFamily: 'monospace', marginTop: 2 }}>REGIMENTO DE CAVALARIA DE GUARDA · BRASÍLIA-DF</div>
          </div>
          <svg width="34" height="34" viewBox="0 0 24 24" fill="#C9A227"><polygon points="12,2 15,9 22,9 17,14 19,21 12,17 5,21 7,14 2,9 9,9"/></svg>
        </div>
        <div style={{ fontSize: 14, fontWeight: 700, letterSpacing: '0.18em', color: '#f4f2ec', textTransform: 'uppercase', borderTop: '1px solid rgba(201,162,39,0.3)', paddingTop: 10 }}>
          ESCALA DE SERVIÇO
        </div>
      </div>
      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
        <thead>
          <tr style={{ background: '#1a2a14', borderBottom: '2px solid #C9A227' }}>
            {['DATA', 'DIA', 'PATENTE', 'NOME', 'HORÁRIO', 'OBS'].map(h => (
              <th key={h} style={{ padding: '8px 10px', textAlign: 'left', fontSize: 9, letterSpacing: '0.16em', color: '#C9A227', fontFamily: 'monospace', fontWeight: 800 }}>{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {schedules.map(s => {
            const d = new Date(s.date);
            const dateStr = `${d.getDate().toString().padStart(2,'0')}/${(d.getMonth()+1).toString().padStart(2,'0')}/${d.getFullYear()}`;
            const dayStr = DAY_NAMES_FULL[d.getDay()].replace('-feira','').toUpperCase();
            const entries = s.entries.length ? s.entries : [{ soldier: null }];
            return entries.map((e, i) => (
              <tr key={`${s._id}-${i}`} style={{ borderBottom: '1px solid rgba(201,162,39,0.1)', background: i % 2 === 0 ? 'rgba(255,255,255,0.02)' : 'transparent' }}>
                <td style={{ padding: '7px 10px', fontFamily: 'monospace', fontSize: 11, color: '#C9A227', fontWeight: 700 }}>{i === 0 ? dateStr : ''}</td>
                <td style={{ padding: '7px 10px', fontSize: 10, color: 'rgba(244,242,236,0.55)' }}>{i === 0 ? dayStr : ''}</td>
                <td style={{ padding: '7px 10px' }}>
                  {e.soldier ? (
                    <span style={{ fontSize: 11, fontWeight: 700, color: getRankColor(e.soldier?.rank) }}>{e.soldier?.rank}</span>
                  ) : <span style={{ color: 'rgba(244,242,236,0.2)', fontSize: 11 }}>–</span>}
                </td>
                <td style={{ padding: '7px 10px', fontWeight: 700, color: e.soldier ? '#f4f2ec' : 'rgba(244,242,236,0.25)', fontSize: 13 }}>{e.soldier?.name || 'SEM ESCALA'}</td>
                <td style={{ padding: '7px 10px', fontFamily: 'monospace', fontSize: 11, color: 'rgba(244,242,236,0.55)' }}>{e.soldier ? (e.timeSlot || '00h–24h') : ''}</td>
                <td style={{ padding: '7px 10px', fontSize: 11, color: 'rgba(244,242,236,0.45)', maxWidth: 100 }}>{e.notes || ''}</td>
              </tr>
            ));
          })}
        </tbody>
      </table>
      <div style={{ marginTop: 16, borderTop: '1px solid rgba(201,162,39,0.18)', paddingTop: 10, display: 'flex', justifyContent: 'space-between', fontSize: 9, color: 'rgba(244,242,236,0.28)', fontFamily: 'monospace', letterSpacing: '0.1em' }}>
        <span>1º RCG · C.H.D.I · BRASÍLIA-DF</span>
        <span>Gerado em {new Date().toLocaleDateString('pt-BR', { day:'2-digit', month:'2-digit', year:'numeric', hour:'2-digit', minute:'2-digit' })}</span>
      </div>
    </div>
  );
}

/* ── Day Editor Modal ─────────────────────────────────────────────────────── */
function DayEditorModal({ date, schedule, allUsers, onClose, onSaved }) {
  const [entries, setEntries] = useState(
    (schedule?.entries || []).map(e => ({
      soldier: e.soldier?._id || e.soldier || '',
      timeSlot: e.timeSlot || '00h–24h',
      notes: e.notes || '',
    }))
  );
  const [title, setTitle] = useState(schedule?.title || '');
  const [notes, setNotes] = useState(schedule?.notes || '');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const addEntry = () => setEntries(p => [...p, { soldier: '', timeSlot: '00h–24h', notes: '' }]);
  const removeEntry = i => setEntries(p => p.filter((_,idx) => idx !== i));
  const updateEntry = (i, field, val) => setEntries(p => p.map((e,idx) => idx === i ? { ...e, [field]: val } : e));

  const d = new Date(date + 'T00:00:00');
  const dateLabel = `${DAY_NAMES_FULL[d.getDay()]}, ${d.getDate().toString().padStart(2,'0')}/${(d.getMonth()+1).toString().padStart(2,'0')}/${d.getFullYear()}`;

  const handleSave = async () => {
    setLoading(true); setError('');
    try {
      const validEntries = entries.filter(e => e.soldier);
      await api.post('/schedule', { date: d.toISOString(), entries: validEntries, title, notes });
      onSaved(); onClose();
    } catch (err) {
      setError(err.response?.data?.message || 'Erro ao salvar escala.');
    } finally { setLoading(false); }
  };

  return (
    <div className="modal-backdrop" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal" style={{ maxWidth: 580, maxHeight: '90vh', overflow: 'auto' }}>
        <div className="modal-header">
          <div>
            <div className="modal-title">EDITAR ESCALA</div>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--gold)', marginTop: 3, letterSpacing: '0.1em' }}>{dateLabel}</div>
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: 'var(--white-dim)', cursor: 'pointer', fontSize: 22 }}>×</button>
        </div>
        <div style={{ padding: 24 }}>
          <div className="form-group">
            <label className="form-label">Título / Tipo de serviço (opcional)</label>
            <input className="form-input" placeholder="Ex: Serviço de Guarda, Sobreaviso..." value={title} onChange={e => setTitle(e.target.value)} />
          </div>

          <div style={{ marginBottom: 16 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
              <label className="form-label" style={{ margin: 0 }}>Soldados Escalados</label>
              <button className="btn btn-ghost btn-sm" onClick={addEntry} style={{ gap: 6 }}>
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M12 5v14m-7-7h14"/></svg>
                Adicionar
              </button>
            </div>

            {entries.length === 0 && (
              <div style={{ textAlign: 'center', padding: '20px', background: 'rgba(244,242,236,0.03)', border: '1px dashed var(--border)', borderRadius: 8, color: 'var(--white-faint)', fontSize: 13 }}>
                Clique em "Adicionar" para escalar um soldado.
              </div>
            )}

            {entries.map((entry, i) => {
              const selected = allUsers.find(u => u._id === entry.soldier);
              return (
                <div key={i} style={{ background: 'rgba(244,242,236,0.03)', border: '1px solid var(--border)', borderRadius: 10, padding: '12px 14px', marginBottom: 8 }}>
                  <div style={{ display: 'flex', gap: 8, marginBottom: 8, alignItems: 'flex-end' }}>
                    <div style={{ flex: 2 }}>
                      <label className="form-label" style={{ fontSize: 10 }}>Soldado</label>
                      <select className="form-input" value={entry.soldier} onChange={e => updateEntry(i, 'soldier', e.target.value)} style={{ fontSize: 13 }}>
                        <option value="">Selecionar...</option>
                        {allUsers.map(u => (
                          <option key={u._id} value={u._id}>{u.rank} {u.name} (#{u.soldierNumber})</option>
                        ))}
                      </select>
                    </div>
                    <div style={{ flex: 1 }}>
                      <label className="form-label" style={{ fontSize: 10 }}>Horário</label>
                      <input className="form-input" placeholder="00h–24h" value={entry.timeSlot} onChange={e => updateEntry(i, 'timeSlot', e.target.value)} style={{ fontSize: 13 }} />
                    </div>
                    <button onClick={() => removeEntry(i)} style={{ background: 'none', border: 'none', color: '#E05A4A', cursor: 'pointer', padding: '0 4px', flexShrink: 0, marginBottom: 2 }}>
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><polyline points="3,6 5,6 21,6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6"/></svg>
                    </button>
                  </div>
                  {selected && (
                    <div style={{ marginBottom: 8 }}>
                      <RankChip rank={selected.rank} size="sm" />
                    </div>
                  )}
                  <div>
                    <label className="form-label" style={{ fontSize: 10 }}>Observação</label>
                    <input className="form-input" placeholder="Portão principal, ronda, etc..." value={entry.notes} onChange={e => updateEntry(i, 'notes', e.target.value)} style={{ fontSize: 12 }} />
                  </div>
                </div>
              );
            })}
          </div>

          <div className="form-group">
            <label className="form-label">Observações gerais do dia</label>
            <textarea className="form-input" rows={2} placeholder="Anotações gerais sobre este dia..." value={notes} onChange={e => setNotes(e.target.value)} style={{ resize: 'none' }} />
          </div>

          {error && <div style={{ marginBottom: 12, padding: '10px 14px', background: 'rgba(192,57,43,0.1)', border: '1px solid rgba(192,57,43,0.3)', borderRadius: 8, color: '#E05A4A', fontSize: 13 }}>{error}</div>}
          <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
            <button className="btn btn-ghost" onClick={onClose}>Cancelar</button>
            <button className="btn btn-gold" onClick={handleSave} disabled={loading}>{loading ? 'Salvando...' : '✓ Salvar Escala'}</button>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ── Main component ───────────────────────────────────────────────────────── */
export default function AdminSchedule() {
  const today = new Date();
  const [viewMonth, setViewMonth] = useState(today.getMonth());
  const [viewYear, setViewYear] = useState(today.getFullYear());
  const [schedules, setSchedules] = useState([]);
  const [allUsers, setAllUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editDate, setEditDate] = useState(null);
  const [toast, setToast] = useState(null);
  const [showExport, setShowExport] = useState(false);
  const [exportRange, setExportRange] = useState('month');
  const printRef = useRef();

  const showToast = (msg, type = 'success') => setToast({ msg, type });

  const load = async () => {
    setLoading(true);
    try {
      const [sched, users] = await Promise.all([
        api.get(`/schedule?year=${viewYear}&month=${viewMonth + 1}`),
        api.get('/app-users'),
      ]);
      setSchedules(sched.data.schedules || []);
      setAllUsers(users.data.users || []);
    } catch { showToast('Erro ao carregar dados.', 'error'); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, [viewMonth, viewYear]);

  const handleDelete = async (id) => {
    if (!confirm('Remover esta escala? Os soldados serão notificados.')) return;
    try { await api.delete(`/schedule/${id}`); showToast('Escala removida.'); load(); }
    catch { showToast('Erro ao remover.', 'error'); }
  };

  const scheduleMap = {};
  schedules.forEach(s => {
    const d = new Date(s.date);
    const key = `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
    scheduleMap[key] = s;
  });

  const firstDay = new Date(viewYear, viewMonth, 1).getDay();
  const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
  const cells = [];
  for (let i = 0; i < firstDay; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);

  const getExportSchedules = () => {
    if (exportRange === 'week') {
      const start = new Date(today); start.setDate(today.getDate() - today.getDay());
      const end = new Date(start); end.setDate(start.getDate() + 6);
      return schedules.filter(s => { const d = new Date(s.date); return d >= start && d <= end; });
    }
    return schedules;
  };

  const prevMonth = () => { if (viewMonth === 0) { setViewMonth(11); setViewYear(y => y-1); } else setViewMonth(m => m-1); };
  const nextMonth = () => { if (viewMonth === 11) { setViewMonth(0); setViewYear(y => y+1); } else setViewMonth(m => m+1); };

  return (
    <div>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 28, flexWrap: 'wrap', gap: 16 }}>
        <div>
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 28, fontWeight: 800, letterSpacing: '0.12em', color: 'var(--white)', marginBottom: 4 }}>ESCALA DE SERVIÇO</h2>
          <p style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--white-faint)', letterSpacing: '0.1em' }}>
            // CONTROLE DE ESCALAS · {schedules.length} DIAS COM ESCALA NESTE MÊS
          </p>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button className="btn btn-ghost" onClick={() => setShowExport(true)} style={{ gap: 8 }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7,10 12,15 17,10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
            Exportar
          </button>
          <button className="btn btn-gold" onClick={() => setEditDate(`${viewYear}-${String(viewMonth+1).padStart(2,'0')}-${String(today.getDate()).padStart(2,'0')}`)} style={{ gap: 8 }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M12 5v14m-7-7h14"/></svg>
            Nova Escala
          </button>
        </div>
      </div>

      {/* Month nav */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 18 }}>
        <button className="btn btn-ghost btn-sm" onClick={prevMonth}>← Anterior</button>
        <div style={{ fontFamily: 'var(--font-display)', fontSize: 20, fontWeight: 800, letterSpacing: '0.1em', color: 'var(--white)' }}>
          {MONTHS[viewMonth]} {viewYear}
        </div>
        <button className="btn btn-ghost btn-sm" onClick={nextMonth}>Próximo →</button>
      </div>

      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: 60 }}><div className="spinner" /></div>
      ) : (
        <>
          {/* Calendar */}
          <div className="card" style={{ padding: 14, marginBottom: 28 }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7,1fr)', marginBottom: 6 }}>
              {DAY_NAMES.map(d => <div key={d} style={{ textAlign: 'center', fontFamily: 'var(--font-mono)', fontSize: 10, letterSpacing: '0.1em', color: 'var(--white-faint)', padding: '6px 0' }}>{d}</div>)}
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7,1fr)', gap: 3 }}>
              {cells.map((day, i) => {
                if (!day) return <div key={i} />;
                const dateKey = `${viewYear}-${String(viewMonth+1).padStart(2,'0')}-${String(day).padStart(2,'0')}`;
                const sched = scheduleMap[dateKey];
                const isToday = day === today.getDate() && viewMonth === today.getMonth() && viewYear === today.getFullYear();
                return (
                  <div key={i} onClick={() => setEditDate(dateKey)}
                    style={{ minHeight: 68, padding: '5px 5px', borderRadius: 8, cursor: 'pointer', border: isToday ? '2px solid rgba(201,162,39,0.6)' : '1px solid rgba(244,242,236,0.06)', background: sched ? 'rgba(110,191,72,0.07)' : 'transparent', transition: 'all 0.15s' }}
                    onMouseEnter={e => e.currentTarget.style.background = sched ? 'rgba(110,191,72,0.14)' : 'rgba(201,162,39,0.05)'}
                    onMouseLeave={e => e.currentTarget.style.background = sched ? 'rgba(110,191,72,0.07)' : 'transparent'}
                  >
                    <div style={{ fontSize: 12, fontWeight: isToday ? 800 : 600, color: isToday ? 'var(--gold)' : sched ? '#6EBF48' : 'var(--white-dim)', textAlign: 'right', marginBottom: 3 }}>{day}</div>
                    {sched?.entries?.length > 0 && (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                        {sched.entries.slice(0,2).map((e,j) => (
                          <div key={j} style={{ fontSize: 8, fontFamily: 'var(--font-mono)', color: getRankColor(e.soldier?.rank), overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                            {e.soldier?.name?.split(' ')[0]}
                          </div>
                        ))}
                        {sched.entries.length > 2 && <div style={{ fontSize: 7, color: 'var(--white-faint)', fontFamily: 'var(--font-mono)' }}>+{sched.entries.length-2}</div>}
                      </div>
                    )}
                    {!sched && <div style={{ fontSize: 9, color: 'rgba(201,162,39,0.25)', textAlign: 'center', marginTop: 4 }}>+</div>}
                  </div>
                );
              })}
            </div>
          </div>

          {/* List view */}
          <div>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, letterSpacing: '0.18em', color: 'var(--white-faint)', marginBottom: 10 }}>// LISTA DE ESCALAS DO MÊS</div>
            {schedules.length === 0 ? (
              <div className="card" style={{ textAlign: 'center', padding: '40px 20px' }}>
                <p style={{ color: 'var(--white-dim)' }}>Nenhuma escala cadastrada para {MONTHS[viewMonth]} {viewYear}.</p>
                <p style={{ color: 'var(--white-faint)', fontSize: 12, marginTop: 6 }}>Clique em qualquer dia no calendário para criar.</p>
              </div>
            ) : schedules.map(s => {
              const d = new Date(s.date);
              return (
                <div key={s._id} className="card" style={{ padding: '14px 18px', marginBottom: 10 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 10 }}>
                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8, flexWrap: 'wrap' }}>
                        <span style={{ fontFamily: 'var(--font-mono)', fontSize: 13, color: 'var(--gold)', fontWeight: 700 }}>
                          {d.getDate().toString().padStart(2,'0')}/{(d.getMonth()+1).toString().padStart(2,'0')}/{d.getFullYear()}
                        </span>
                        <span style={{ fontSize: 11, color: 'var(--white-faint)', fontFamily: 'var(--font-mono)' }}>{DAY_NAMES_FULL[d.getDay()]}</span>
                        {s.title && <span style={{ fontSize: 11, color: 'var(--white-dim)', fontStyle: 'italic' }}>{s.title}</span>}
                      </div>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                        {s.entries.map((e, i) => (
                          <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '4px 10px', borderRadius: 8, background: 'rgba(244,242,236,0.04)', border: '1px solid var(--border)' }}>
                            <RankChip rank={e.soldier?.rank} size="xs" />
                            <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--white)' }}>{e.soldier?.name}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                    <div style={{ display: 'flex', gap: 6 }}>
                      <button className="btn btn-ghost btn-sm" onClick={() => {
                        const key = `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
                        setEditDate(key);
                      }}>✏️ Editar</button>
                      <button className="btn btn-danger btn-sm" onClick={() => handleDelete(s._id)}>🗑</button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}

      {editDate && (
        <DayEditorModal date={editDate} schedule={scheduleMap[editDate]} allUsers={allUsers}
          onClose={() => setEditDate(null)}
          onSaved={() => { load(); showToast('Escala salva! Soldados notificados.'); }}
        />
      )}

      {/* Export Modal */}
      {showExport && (
        <div className="modal-backdrop" onClick={e => e.target === e.currentTarget && setShowExport(false)}>
          <div className="modal" style={{ maxWidth: 540 }}>
            <div className="modal-header">
              <div className="modal-title">EXPORTAR ESCALA</div>
              <button onClick={() => setShowExport(false)} style={{ background: 'none', border: 'none', color: 'var(--white-dim)', cursor: 'pointer', fontSize: 22 }}>×</button>
            </div>
            <div style={{ padding: 24 }}>
              <div className="form-group">
                <label className="form-label">Período</label>
                <select className="form-input" value={exportRange} onChange={e => setExportRange(e.target.value)}>
                  <option value="month">Mês atual ({MONTHS[viewMonth]} {viewYear})</option>
                  <option value="week">Semana atual</option>
                </select>
              </div>
              <div style={{ marginBottom: 16, border: '1px solid var(--border)', borderRadius: 8, overflow: 'hidden', maxHeight: 260, overflowY: 'auto' }}>
                <PrintableSchedule schedules={getExportSchedules()} forwardRef={printRef} />
              </div>
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                <button className="btn btn-gold" onClick={() => downloadExcel(getExportSchedules())} style={{ gap: 8, flex: 1 }}>
                  📊 Baixar Excel (.xlsx)
                </button>
                <button className="btn btn-ghost" onClick={() => downloadPDF(printRef)} style={{ gap: 8, flex: 1 }}>
                  📄 Baixar PDF
                </button>
                <button className="btn btn-ghost" onClick={() => downloadImage(printRef)} style={{ gap: 8, flex: 1 }}>
                  🖼 Baixar Imagem
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {toast && <Toast msg={toast.msg} type={toast.type} onClose={() => setToast(null)} />}
    </div>
  );
}

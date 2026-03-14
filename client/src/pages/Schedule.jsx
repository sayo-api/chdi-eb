import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';
import { useAppAuth } from '../context/AppAuthContext';
import Navbar from '../components/Navbar';
import { RankChip, RANK_MAP, InsigniaInner } from '../components/RankBadge';

const MONTH_NAMES = ['Janeiro','Fevereiro','Março','Abril','Maio','Junho','Julho','Agosto','Setembro','Outubro','Novembro','Dezembro'];
const DAY_NAMES = ['Dom','Seg','Ter','Qua','Qui','Sex','Sáb'];
const DAY_NAMES_FULL = ['Domingo','Segunda-feira','Terça-feira','Quarta-feira','Quinta-feira','Sexta-feira','Sábado'];

function getRankColor(rank) {
  const r = RANK_MAP[rank];
  if (!r) return '#6EBF48';
  const isGeneral = ['General de Brigada','General de Divisão','General de Exército','Marechal','Comandante'].includes(rank);
  return isGeneral ? '#C0C0C0' : r.color;
}

function CalendarDay({ day, month, year, scheduleMap, appUserId, isToday, onClick }) {
  const dateKey = `${year}-${String(month+1).padStart(2,'0')}-${String(day).padStart(2,'0')}`;
  const sched = scheduleMap[dateKey];
  const isMyDay = sched?.entries.some(e => (e.soldier?._id || e.soldier) === appUserId);
  const hasEntries = sched?.entries.length > 0;

  return (
    <div onClick={() => onClick(day)} style={{
      minHeight: 60, padding: '5px 4px', borderRadius: 7, cursor: hasEntries ? 'pointer' : 'default',
      background: isMyDay ? 'rgba(201,162,39,0.14)' : hasEntries ? 'rgba(110,191,72,0.07)' : 'transparent',
      border: isToday ? '2px solid rgba(201,162,39,0.6)' : isMyDay ? '1px solid rgba(201,162,39,0.35)' : '1px solid rgba(244,242,236,0.05)',
      transition: 'all 0.15s',
    }}
    onMouseEnter={e => hasEntries && (e.currentTarget.style.background = isMyDay ? 'rgba(201,162,39,0.2)' : 'rgba(110,191,72,0.12)')}
    onMouseLeave={e => (e.currentTarget.style.background = isMyDay ? 'rgba(201,162,39,0.14)' : hasEntries ? 'rgba(110,191,72,0.07)' : 'transparent')}
    >
      <div style={{ fontSize: 12, fontWeight: isToday ? 800 : 600, color: isMyDay ? 'var(--gold)' : isToday ? 'var(--gold)' : 'var(--white-dim)', textAlign: 'right', paddingRight: 2 }}>{day}</div>
      {isMyDay && <div style={{ fontSize: 7, color: 'var(--gold)', fontFamily: 'var(--font-mono)', textAlign: 'center', letterSpacing: '0.06em', marginTop: 2 }}>VOCÊ</div>}
      {hasEntries && !isMyDay && (
        <div style={{ marginTop: 3, display: 'flex', flexWrap: 'wrap', gap: 2, justifyContent: 'center' }}>
          {sched.entries.slice(0,3).map((e,i) => (
            <div key={i} style={{ width: 6, height: 6, borderRadius: '50%', background: getRankColor(e.soldier?.rank) }} />
          ))}
          {sched.entries.length > 3 && <div style={{ fontSize: 7, color: 'var(--white-faint)', fontFamily: 'var(--font-mono)' }}>+{sched.entries.length-3}</div>}
        </div>
      )}
    </div>
  );
}

export default function Schedule() {
  const { appUser, isAppLoggedIn } = useAppAuth();
  const navigate = useNavigate();
  const [tab, setTab] = useState('mine');
  const [schedules, setSchedules] = useState([]);
  const [allSchedules, setAllSchedules] = useState([]);
  const [loading, setLoading] = useState(true);
  const today = new Date();
  const [viewMonth, setViewMonth] = useState(today.getMonth());
  const [viewYear, setViewYear] = useState(today.getFullYear());
  const [selectedDay, setSelectedDay] = useState(null);

  useEffect(() => {
    if (!isAppLoggedIn) return;
    const token = localStorage.getItem('appToken');
    const h = { Authorization: `Bearer ${token}` };
    Promise.all([
      api.get('/schedule/mine', { headers: h }),
      api.get(`/schedule/all-active?year=${viewYear}&month=${viewMonth+1}`, { headers: h }),
    ]).then(([r1, r2]) => {
      setSchedules(r1.data.schedules || []);
      setAllSchedules(r2.data.schedules || []);
    }).catch(console.error).finally(() => setLoading(false));
  }, [isAppLoggedIn, viewMonth, viewYear]);

  if (!isAppLoggedIn) {
    return (
      <div style={{ minHeight: '100vh', background: 'var(--bg-dark)' }}>
        <Navbar />
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '80px 20px', textAlign: 'center' }}>
          <div style={{ fontSize: 56, marginBottom: 20 }}>🔒</div>
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 22, color: 'var(--white)', marginBottom: 8, letterSpacing: '0.1em' }}>ACESSO RESTRITO</h2>
          <p style={{ color: 'var(--white-dim)', marginBottom: 24, maxWidth: 300, fontSize: 14 }}>Faça login no aplicativo para visualizar sua escala de serviço.</p>
          <button className="btn btn-gold" onClick={() => navigate('/app-login')}>Fazer Login →</button>
        </div>
      </div>
    );
  }

  const scheduleMap = {};
  allSchedules.forEach(s => {
    const d = new Date(s.date);
    const key = `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
    scheduleMap[key] = s;
  });

  const firstDay = new Date(viewYear, viewMonth, 1).getDay();
  const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
  const cells = [];
  for (let i = 0; i < firstDay; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);

  const selectedDateKey = selectedDay ? `${viewYear}-${String(viewMonth+1).padStart(2,'0')}-${String(selectedDay).padStart(2,'0')}` : null;
  const selectedSched = selectedDateKey ? scheduleMap[selectedDateKey] : null;
  const isMyScheduleDay = selectedSched?.entries.some(e => (e.soldier?._id || e.soldier) === appUser?.id);

  const upcoming = schedules
    .filter(s => new Date(s.date) >= new Date(today.toDateString()))
    .sort((a, b) => new Date(a.date) - new Date(b.date))
    .slice(0, 15);

  const prevMonth = () => { if (viewMonth === 0) { setViewMonth(11); setViewYear(y => y-1); } else setViewMonth(m => m-1); };
  const nextMonth = () => { if (viewMonth === 11) { setViewMonth(0); setViewYear(y => y+1); } else setViewMonth(m => m+1); };

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-dark)' }}>
      <Navbar />
      <div className="container" style={{ padding: '24px 16px 60px', maxWidth: 820 }}>
        {/* Header */}
        <div style={{ marginBottom: 22 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--gold)" strokeWidth="2" strokeLinecap="round"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
            <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 24, fontWeight: 800, letterSpacing: '0.1em', color: 'var(--white)' }}>ESCALA DE SERVIÇO</h1>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <RankChip rank={appUser?.rank} size="sm" />
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--white-faint)', letterSpacing: '0.08em' }}>
              {appUser?.name} · #{appUser?.soldierNumber}
            </span>
          </div>
        </div>

        {/* Tabs */}
        <div style={{ display: 'flex', gap: 4, marginBottom: 22, background: 'rgba(244,242,236,0.04)', borderRadius: 10, padding: 4 }}>
          {[['mine','📋 Minha Escala'], ['all','👥 Escala Geral']].map(([key, label]) => (
            <button key={key} onClick={() => setTab(key)} style={{
              flex: 1, padding: '8px 12px', borderRadius: 8, border: 'none', cursor: 'pointer',
              background: tab === key ? 'rgba(201,162,39,0.18)' : 'transparent',
              color: tab === key ? 'var(--gold)' : 'var(--white-dim)',
              fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 13, letterSpacing: '0.06em',
              transition: 'all 0.15s',
            }}>{label}</button>
          ))}
        </div>

        {loading ? (
          <div style={{ display: 'flex', justifyContent: 'center', padding: 60 }}><div className="spinner" /></div>
        ) : tab === 'mine' ? (
          /* ── MINHA ESCALA ── */
          <div>
            {upcoming.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '50px 20px', background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 14 }}>
                <div style={{ fontSize: 42, marginBottom: 12 }}>📭</div>
                <p style={{ color: 'var(--white-dim)', fontFamily: 'var(--font-display)', letterSpacing: '0.06em' }}>Nenhuma escala futura para você</p>
                <p style={{ color: 'var(--white-faint)', fontSize: 12, marginTop: 6 }}>Você será notificado quando for escalado</p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {upcoming.map(s => {
                  const d = new Date(s.date);
                  const isToday = d.toDateString() === today.toDateString();
                  const myEntry = s.entries.find(e => (e.soldier?._id || e.soldier) === appUser?.id);
                  return (
                    <div key={s._id} style={{ background: isToday ? 'rgba(201,162,39,0.1)' : 'var(--bg-card)', border: `1px solid ${isToday ? 'rgba(201,162,39,0.4)' : 'var(--border)'}`, borderRadius: 12, padding: '14px 18px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 8 }}>
                        <div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6, flexWrap: 'wrap' }}>
                            {isToday && <span style={{ fontSize: 10, fontFamily: 'var(--font-mono)', padding: '2px 8px', borderRadius: 4, background: 'rgba(201,162,39,0.2)', color: 'var(--gold)', border: '1px solid rgba(201,162,39,0.4)', letterSpacing: '0.1em' }}>HOJE</span>}
                            <span style={{ fontFamily: 'var(--font-display)', fontSize: 15, fontWeight: 700, color: 'var(--white)' }}>
                              {DAY_NAMES_FULL[d.getDay()]}, {d.getDate().toString().padStart(2,'0')}/{(d.getMonth()+1).toString().padStart(2,'0')}/{d.getFullYear()}
                            </span>
                          </div>
                          {s.title && <div style={{ fontSize: 11, color: 'var(--white-faint)', fontFamily: 'var(--font-mono)' }}>{s.title}</div>}
                        </div>
                        <div style={{ fontFamily: 'var(--font-mono)', fontSize: 12, color: 'var(--gold)', fontWeight: 700 }}>
                          ⏱ {myEntry?.timeSlot || '00h–24h'}
                        </div>
                      </div>
                      {myEntry?.notes && (
                        <div style={{ marginTop: 8, padding: '8px 12px', background: 'rgba(201,162,39,0.06)', borderRadius: 6, fontSize: 12, color: 'var(--white-dim)', borderLeft: '2px solid rgba(201,162,39,0.3)' }}>
                          {myEntry.notes}
                        </div>
                      )}
                      {s.entries.length > 1 && (
                        <div style={{ marginTop: 10, borderTop: '1px solid var(--border)', paddingTop: 8 }}>
                          <div style={{ fontSize: 10, fontFamily: 'var(--font-mono)', color: 'var(--white-faint)', letterSpacing: '0.1em', marginBottom: 6 }}>EQUIPE DO DIA</div>
                          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                            {s.entries.map((e, i) => {
                              const isSelf = (e.soldier?._id || e.soldier) === appUser?.id;
                              return (
                                <span key={i} style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '4px 10px', borderRadius: 8, background: isSelf ? 'rgba(201,162,39,0.15)' : 'rgba(244,242,236,0.05)', border: isSelf ? '1px solid rgba(201,162,39,0.3)' : '1px solid var(--border)' }}>
                                  <RankChip rank={e.soldier?.rank} size="xs" />
                                  <span style={{ fontSize: 12, fontWeight: isSelf ? 800 : 600, color: isSelf ? 'var(--gold)' : 'var(--white-dim)' }}>
                                    {e.soldier?.name} {isSelf ? '(Você)' : ''}
                                  </span>
                                </span>
                              );
                            })}
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        ) : (
          /* ── ESCALA GERAL ── */
          <div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
              <button onClick={prevMonth} style={{ background: 'none', border: '1px solid var(--border)', borderRadius: 8, color: 'var(--white-dim)', padding: '6px 12px', cursor: 'pointer', fontSize: 13 }}>←</button>
              <div style={{ fontFamily: 'var(--font-display)', fontSize: 18, fontWeight: 800, letterSpacing: '0.1em', color: 'var(--white)' }}>
                {MONTH_NAMES[viewMonth]} {viewYear}
              </div>
              <button onClick={nextMonth} style={{ background: 'none', border: '1px solid var(--border)', borderRadius: 8, color: 'var(--white-dim)', padding: '6px 12px', cursor: 'pointer', fontSize: 13 }}>→</button>
            </div>

            {/* Calendar */}
            <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 14, overflow: 'hidden' }}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7,1fr)', background: 'rgba(201,162,39,0.06)', borderBottom: '1px solid var(--border)' }}>
                {DAY_NAMES.map(d => <div key={d} style={{ padding: '9px 4px', textAlign: 'center', fontFamily: 'var(--font-mono)', fontSize: 10, letterSpacing: '0.1em', color: 'var(--white-faint)' }}>{d}</div>)}
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7,1fr)', gap: 3, padding: 6 }}>
                {cells.map((day, i) => day ? (
                  <CalendarDay key={i} day={day} month={viewMonth} year={viewYear}
                    scheduleMap={scheduleMap} appUserId={appUser?.id}
                    isToday={day === today.getDate() && viewMonth === today.getMonth() && viewYear === today.getFullYear()}
                    onClick={setSelectedDay}
                  />
                ) : <div key={i} />)}
              </div>
            </div>

            {/* Day detail */}
            {selectedDay && (
              <div style={{ marginTop: 14, background: isMyScheduleDay ? 'rgba(201,162,39,0.07)' : 'var(--bg-card)', border: `1px solid ${isMyScheduleDay ? 'rgba(201,162,39,0.28)' : 'var(--border)'}`, borderRadius: 12, padding: 18 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
                  <div>
                    <div style={{ fontFamily: 'var(--font-display)', fontSize: 16, fontWeight: 800, color: 'var(--white)' }}>
                      {DAY_NAMES_FULL[new Date(viewYear, viewMonth, selectedDay).getDay()]}, {selectedDay.toString().padStart(2,'0')}/{(viewMonth+1).toString().padStart(2,'0')}/{viewYear}
                    </div>
                    {selectedSched?.title && <div style={{ fontSize: 11, color: 'var(--white-faint)', fontFamily: 'var(--font-mono)', marginTop: 2 }}>{selectedSched.title}</div>}
                  </div>
                  <button onClick={() => setSelectedDay(null)} style={{ background: 'none', border: 'none', color: 'var(--white-faint)', cursor: 'pointer', fontSize: 20, lineHeight: 1 }}>×</button>
                </div>
                {!selectedSched?.entries?.length ? (
                  <p style={{ color: 'var(--white-faint)', fontSize: 13 }}>Sem escalas para este dia.</p>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    {selectedSched.entries.map((e, i) => {
                      const isSelf = (e.soldier?._id || e.soldier) === appUser?.id;
                      const rankColor = getRankColor(e.soldier?.rank);
                      return (
                        <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 14px', borderRadius: 10, background: isSelf ? 'rgba(201,162,39,0.1)' : 'rgba(244,242,236,0.04)', border: isSelf ? '1px solid rgba(201,162,39,0.28)' : '1px solid var(--border)' }}>
                          {/* SVG insignia */}
                          <div style={{ width: 40, height: 40, borderRadius: 10, background: `${rankColor}18`, border: `1.5px solid ${rankColor}40`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                            <svg viewBox="0 0 32 32" width="24" height="24">
                              <InsigniaInner rank={e.soldier?.rank} />
                            </svg>
                          </div>
                          <div style={{ flex: 1 }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap', marginBottom: 3 }}>
                              <RankChip rank={e.soldier?.rank} size="xs" />
                              <span style={{ fontWeight: 700, color: isSelf ? 'var(--gold)' : 'var(--white)', fontSize: 14 }}>
                                {e.soldier?.name} {isSelf ? <span style={{ fontSize: 10, color: 'var(--gold)', fontFamily: 'var(--font-mono)' }}>(VOCÊ)</span> : null}
                              </span>
                            </div>
                            <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--white-faint)' }}>
                              #{e.soldier?.soldierNumber} · ⏱ {e.timeSlot || '00h–24h'}
                            </div>
                            {e.notes && <div style={{ fontSize: 11, color: 'var(--white-dim)', marginTop: 3 }}>{e.notes}</div>}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

import { useEffect, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import api from '../../api/axios';
import { useAuth } from '../../context/AuthContext';

function StatCard({ label, value, color, icon, sub }) {
  return (
    <div style={{ flex: '1 1 160px', minWidth: 140, background: 'var(--bg-card)', border: `1px solid rgba(${color},0.15)`, borderRadius: 12, padding: '18px 20px', transition: 'all 0.22s' }}
      onMouseEnter={e => { e.currentTarget.style.borderColor = `rgba(${color},0.35)`; e.currentTarget.style.transform = 'translateY(-2px)'; }}
      onMouseLeave={e => { e.currentTarget.style.borderColor = `rgba(${color},0.15)`; e.currentTarget.style.transform = 'none'; }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
        <span style={{ fontFamily: 'var(--font-mono)', fontSize: 9, letterSpacing: '0.2em', textTransform: 'uppercase', color: 'var(--white-faint)' }}>{label}</span>
        <div style={{ width: 30, height: 30, borderRadius: 8, background: `rgba(${color},0.1)`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{icon}</div>
      </div>
      <div style={{ fontFamily: 'var(--font-display)', fontSize: 40, fontWeight: 800, color: `rgb(${color})`, lineHeight: 1 }}>{value}</div>
      {sub && <div style={{ fontSize: 11, color: 'var(--white-faint)', marginTop: 6, fontFamily: 'var(--font-mono)' }}>{sub}</div>}
    </div>
  );
}

function SyncBadge({ status }) {
  if (!status) return null;
  const cfg = {
    publishing: { bg: 'rgba(201,162,39,0.12)', color: 'var(--gold)', border: 'rgba(201,162,39,0.3)', label: '⏳ Publicando...' },
    success:    { bg: 'rgba(90,158,58,0.12)',  color: '#6EBF48',       border: 'rgba(90,158,58,0.3)',  label: '✓ Publicado!' },
    error:      { bg: 'rgba(192,57,43,0.12)',  color: '#E05A4A',       border: 'rgba(192,57,43,0.3)',  label: '✗ Erro ao publicar' },
  }[status];
  if (!cfg) return null;
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, padding: '3px 10px', borderRadius: 100, fontSize: 11, fontWeight: 700, fontFamily: 'var(--font-mono)', letterSpacing: '0.08em', background: cfg.bg, color: cfg.color, border: `1px solid ${cfg.border}` }}>
      {cfg.label}
    </span>
  );
}

export default function Dashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState({ categories: 0, songs: 0, appUsers: 0 });
  const [recentSongs, setRecentSongs] = useState([]);
  const [syncInfo, setSyncInfo] = useState(null);
  const [publishNote, setPublishNote] = useState('');
  const [publishStatus, setPublishStatus] = useState(null);
  const [publishMsg, setPublishMsg] = useState('');
  const [showNote, setShowNote] = useState(false);

  const load = useCallback(() => {
    Promise.all([
      api.get('/categories'),
      api.get('/songs/all'),
      api.get('/sync/status'),
      api.get('/app-users').catch(() => ({ data: { users: [] } })),
    ]).then(([cats, songs, sync, appUsers]) => {
      setStats({
        categories: cats.data.categories?.length ?? 0,
        songs: songs.data.songs?.length ?? 0,
        appUsers: appUsers.data.users?.length ?? 0,
      });
      setRecentSongs((songs.data.songs ?? []).slice(0, 5));
      setSyncInfo(sync.data);
    }).catch(() => {});
  }, []);

  useEffect(() => { load(); }, [load]);

  const handlePublish = async () => {
    setPublishStatus('publishing'); setPublishMsg('');
    try {
      const res = await api.post('/sync/publish', { note: publishNote.trim() });
      setSyncInfo(res.data);
      setPublishStatus('success');
      setPublishMsg(res.data.message || 'Conteúdo publicado com sucesso.');
      setPublishNote(''); setShowNote(false);
      setTimeout(() => setPublishStatus(null), 5000);
    } catch (err) {
      setPublishStatus('error');
      setPublishMsg(err?.response?.data?.message || 'Erro ao publicar.');
      setTimeout(() => setPublishStatus(null), 5000);
    }
  };

  const fmt = d => d ? new Date(d).toLocaleString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : '—';

  return (
    <div>
      {/* Header */}
      <div style={{ marginBottom: 28 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
          <div style={{ width: 3, height: 24, background: 'var(--gold)', borderRadius: 2 }} />
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 30, fontWeight: 800, letterSpacing: '0.12em', color: 'var(--white)' }}>DASHBOARD</h2>
        </div>
        <p style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--white-faint)', letterSpacing: '0.12em', paddingLeft: 13 }}>
          // BEM-VINDO, {user?.name?.toUpperCase()} · VISÃO GERAL DO SISTEMA C.H.D.I
        </p>
      </div>

      {/* Stats */}
      <div style={{ display: 'flex', gap: 14, flexWrap: 'wrap', marginBottom: 28 }}>
        <StatCard label="Módulos" value={stats.categories} color="201,162,39"
          icon={<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#C9A227" strokeWidth="2" strokeLinecap="round"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/></svg>}
        />
        <StatCard label="Músicas" value={stats.songs} color="90,158,58"
          icon={<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#6EBF48" strokeWidth="2" strokeLinecap="round"><path d="M9 18V5l12-2v13"/><circle cx="6" cy="18" r="3"/><circle cx="18" cy="16" r="3"/></svg>}
        />
        <StatCard label="Usuários App" value={stats.appUsers} color="90,158,58"
          sub="soldados cadastrados"
          icon={<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#6EBF48" strokeWidth="2" strokeLinecap="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>}
        />
        {syncInfo && (
          <StatCard label="Versão App" value={`v${syncInfo.version}`} color="90,158,58"
            sub={`publicado ${fmt(syncInfo.publishedAt)}`}
            icon={<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#6EBF48" strokeWidth="2" strokeLinecap="round"><circle cx="12" cy="12" r="10"/><polyline points="12,6 12,12 16,14"/></svg>}
          />
        )}
      </div>

      {/* Quick links */}
      <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginBottom: 28 }}>
        <Link to="/admin/usuarios-app" className="btn btn-gold" style={{ gap: 8 }}>
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M12 5v14m-7-7h14"/></svg>
          Adicionar Usuário
        </Link>
        <Link to="/admin/categorias" className="btn btn-ghost" style={{ gap: 8 }}>+ Novo Módulo</Link>
        <Link to="/admin/musicas" className="btn btn-ghost" style={{ gap: 8 }}>+ Adicionar Música</Link>
      </div>

      {/* Publish panel */}
      <div style={{ background: 'var(--bg-card)', border: '1px solid rgba(201,162,39,0.2)', borderRadius: 14, padding: 24, marginBottom: 28 }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 14, marginBottom: 16, flexWrap: 'wrap' }}>
          <div style={{ width: 40, height: 40, borderRadius: 10, background: 'rgba(201,162,39,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--gold)" strokeWidth="2" strokeLinecap="round"><path d="M12 19V5m-7 7 7-7 7 7"/></svg>
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
              <span style={{ fontFamily: 'var(--font-display)', fontSize: 16, fontWeight: 700, letterSpacing: '0.06em', color: 'var(--white)' }}>PUBLICAR CONTEÚDO PARA O APP</span>
              {publishStatus && <SyncBadge status={publishStatus} />}
            </div>
            <p style={{ fontSize: 12, color: 'var(--white-dim)', marginTop: 4 }}>Após adicionar módulos ou músicas, publique para que os usuários recebam a atualização.</p>
          </div>
        </div>

        {syncInfo && (
          <div style={{ background: 'rgba(0,0,0,0.2)', borderRadius: 10, padding: '12px 16px', marginBottom: 14, display: 'flex', gap: 24, flexWrap: 'wrap' }}>
            <div>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: 9, color: 'var(--white-faint)', marginBottom: 4, letterSpacing: '0.15em' }}>VERSÃO ATUAL</div>
              <div style={{ fontFamily: 'var(--font-display)', fontSize: 28, fontWeight: 800, color: 'var(--gold)' }}>v{syncInfo.version}</div>
            </div>
            <div>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: 9, color: 'var(--white-faint)', marginBottom: 4, letterSpacing: '0.15em' }}>ÚLTIMA PUBLICAÇÃO</div>
              <div style={{ fontSize: 13, color: 'var(--white-dim)' }}>{fmt(syncInfo.publishedAt)}</div>
              {syncInfo.publishedBy && <div style={{ fontSize: 11, color: 'var(--white-faint)', marginTop: 2 }}>por {syncInfo.publishedBy}</div>}
            </div>
            {syncInfo.note && (
              <div style={{ flex: 1, minWidth: 160 }}>
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: 9, color: 'var(--white-faint)', marginBottom: 4, letterSpacing: '0.15em' }}>NOTA</div>
                <div style={{ fontSize: 13, color: 'var(--white-dim)', fontStyle: 'italic' }}>{syncInfo.note}</div>
              </div>
            )}
          </div>
        )}

        {publishMsg && (
          <div style={{ padding: '10px 14px', borderRadius: 8, marginBottom: 14, fontSize: 13, fontWeight: 600, background: publishStatus === 'success' ? 'rgba(90,158,58,0.08)' : 'rgba(192,57,43,0.08)', border: `1px solid ${publishStatus === 'success' ? 'rgba(90,158,58,0.25)' : 'rgba(192,57,43,0.25)'}`, color: publishStatus === 'success' ? '#6EBF48' : '#E05A4A' }}>
            {publishMsg}
          </div>
        )}

        {showNote && (
          <input type="text" placeholder="Nota sobre o que mudou (opcional)... ex: Adicionadas 3 músicas novas"
            value={publishNote} onChange={e => setPublishNote(e.target.value)} maxLength={120}
            className="form-input" style={{ marginBottom: 14 }} />
        )}

        <div style={{ padding: '10px 14px', background: 'rgba(90,158,58,0.04)', borderRadius: 8, borderLeft: '2px solid rgba(90,158,58,0.4)', fontSize: 12, color: 'var(--white-dim)', marginBottom: 16, lineHeight: 1.6 }}>
          📱 <strong style={{ color: 'var(--white)' }}>Como funciona:</strong> ao publicar, a versão é incrementada. O app detecta automaticamente e baixa apenas os arquivos novos.
        </div>

        <div style={{ display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap' }}>
          <button className="btn btn-gold" onClick={handlePublish} disabled={publishStatus === 'publishing'} style={{ gap: 8 }}>
            {publishStatus === 'publishing'
              ? <><div style={{ width: 13, height: 13, border: '2px solid rgba(0,0,0,0.3)', borderTopColor: '#0A0F08', borderRadius: '50%', animation: 'spin 0.7s linear infinite' }} />Publicando...</>
              : <><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M12 19V5m-7 7 7-7 7 7"/></svg>Publicar para App</>
            }
          </button>
          <button className="btn btn-ghost btn-sm" onClick={() => setShowNote(v => !v)}>
            {showNote ? 'Ocultar nota' : '+ Adicionar nota'}
          </button>
        </div>
      </div>

      {/* Recent songs */}
      {recentSongs.length > 0 && (
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
            <div style={{ width: 2, height: 12, background: 'var(--gold)', borderRadius: 1 }} />
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: 9, fontWeight: 700, letterSpacing: '0.2em', textTransform: 'uppercase', color: 'var(--gold)' }}>MÚSICAS RECENTES</span>
          </div>
          <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
            <div className="table-wrap">
              <table>
                <thead><tr><th>Título</th><th>Categoria</th><th>Reproduções</th></tr></thead>
                <tbody>
                  {recentSongs.map(song => (
                    <tr key={song._id}>
                      <td style={{ fontWeight: 600, color: 'var(--white)' }}>{song.title}</td>
                      <td style={{ color: 'var(--white-dim)' }}>{song.category?.name || '—'}</td>
                      <td style={{ color: 'var(--gold)', fontFamily: 'var(--font-mono)', fontSize: 13 }}>{song.playCount ?? 0}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

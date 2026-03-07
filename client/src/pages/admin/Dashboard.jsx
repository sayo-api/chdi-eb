import { useEffect, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import api from '../../api/axios';
import { useAuth } from '../../context/AuthContext';

function StatCard({ label, value, color, icon }) {
  return (
    <div className="card" style={{ borderColor: `rgba(${color},0.25)`, flex: '1 1 160px', minWidth: 140 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
        <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--white-dim)' }}>{label}</span>
        <div style={{ width: 32, height: 32, borderRadius: 8, background: `rgba(${color},0.12)`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{icon}</div>
      </div>
      <div style={{ fontFamily: 'var(--font-display)', fontSize: 36, color: `rgb(${color})`, letterSpacing: '0.05em' }}>{value}</div>
    </div>
  );
}

function SyncStatusBadge({ status }) {
  if (!status) return null;
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 5,
      padding: '3px 10px', borderRadius: 20,
      fontSize: 11, fontWeight: 700, letterSpacing: '0.08em',
      background: status === 'publishing' ? 'rgba(212,175,55,0.15)'
        : status === 'success' ? 'rgba(134,198,69,0.15)'
        : 'rgba(248,113,113,0.15)',
      color: status === 'publishing' ? 'var(--gold)'
        : status === 'success' ? '#86c645'
        : '#f87171',
      border: `1px solid ${status === 'publishing' ? 'rgba(212,175,55,0.3)'
        : status === 'success' ? 'rgba(134,198,69,0.3)'
        : 'rgba(248,113,113,0.3)'}`,
    }}>
      {status === 'publishing' ? '⏳ Publicando...'
        : status === 'success' ? '✓ Publicado!'
        : '✗ Erro ao publicar'}
    </span>
  );
}

export default function Dashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState({ categories: 0, songs: 0 });
  const [recentSongs, setRecentSongs] = useState([]);
  const [syncInfo, setSyncInfo] = useState(null);
  const [publishNote, setPublishNote] = useState('');
  const [publishStatus, setPublishStatus] = useState(null); // null | 'publishing' | 'success' | 'error'
  const [publishMsg, setPublishMsg] = useState('');
  const [showNoteInput, setShowNoteInput] = useState(false);

  const loadData = useCallback(() => {
    Promise.all([
      api.get('/categories'),
      api.get('/songs/all'),
      api.get('/sync/status'),
    ]).then(([cats, songs, sync]) => {
      setStats({ categories: cats.data.categories?.length ?? 0, songs: songs.data.songs?.length ?? 0 });
      setRecentSongs((songs.data.songs ?? []).slice(0, 5));
      setSyncInfo(sync.data);
    }).catch(() => {});
  }, []);

  useEffect(() => { loadData(); }, [loadData]);

  const handlePublish = async () => {
    setPublishStatus('publishing');
    setPublishMsg('');
    try {
      const res = await api.post('/sync/publish', { note: publishNote.trim() });
      setSyncInfo(res.data);
      setPublishStatus('success');
      setPublishMsg(res.data.message || 'Conteúdo publicado com sucesso.');
      setPublishNote('');
      setShowNoteInput(false);
      // Limpa o badge de sucesso após 5s
      setTimeout(() => setPublishStatus(null), 5000);
    } catch (err) {
      setPublishStatus('error');
      setPublishMsg(err?.response?.data?.message || 'Erro ao publicar.');
      setTimeout(() => setPublishStatus(null), 5000);
    }
  };

  const fmt = (d) => {
    if (!d) return '—';
    return new Date(d).toLocaleString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div>
      <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 28, letterSpacing: '0.1em', color: 'var(--white)', marginBottom: 6 }}>DASHBOARD</h2>
      <p style={{ color: 'var(--white-dim)', fontSize: 14, marginBottom: 28 }}>Visão geral do sistema C.H.D.I</p>

      {/* Stats */}
      <div style={{ display: 'flex', gap: 14, flexWrap: 'wrap', marginBottom: 32 }}>
        <StatCard label="Categorias" value={stats.categories} color="201,162,39"
          icon={<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#C9A227" strokeWidth="2" strokeLinecap="round"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/></svg>}
        />
        <StatCard label="Músicas" value={stats.songs} color="134,198,69"
          icon={<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#86c645" strokeWidth="2" strokeLinecap="round"><path d="M9 18V5l12-2v13"/><circle cx="6" cy="18" r="3"/><circle cx="18" cy="16" r="3"/></svg>}
        />
        {syncInfo && (
          <StatCard label="Versão App" value={`v${syncInfo.version}`} color="134,198,69"
            icon={<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#86c645" strokeWidth="2" strokeLinecap="round"><path d="M12 2v4m0 12v4M4.93 4.93l2.83 2.83m8.48 8.48 2.83 2.83M2 12h4m12 0h4M4.93 19.07l2.83-2.83m8.48-8.48 2.83-2.83"/></svg>}
          />
        )}
      </div>

      {/* Links rápidos */}
      <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', marginBottom: 32 }}>
        <Link to="/admin/categorias" className="btn btn-ghost">+ Nova Categoria</Link>
        <Link to="/admin/musicas" className="btn btn-gold">+ Adicionar Música</Link>
      </div>

      {/* ─── Painel de Publicação para o App ─────────────────────── */}
      <div className="card" style={{ marginBottom: 32, borderColor: 'rgba(212,175,55,0.3)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
          <div style={{ width: 36, height: 36, borderRadius: 10, background: 'rgba(212,175,55,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--gold)" strokeWidth="2" strokeLinecap="round"><path d="M12 2a10 10 0 1 0 10 10"/><path d="M12 8v4l3 3"/><path d="M18 2v6m3-3-3 3-3-3"/></svg>
          </div>
          <div>
            <div style={{ fontWeight: 700, color: 'var(--white)', fontSize: 15 }}>Publicar Conteúdo para o App</div>
            <div style={{ fontSize: 12, color: 'var(--white-dim)', marginTop: 2 }}>
              Após adicionar músicas ou categorias, publique para que os usuários recebam a atualização
            </div>
          </div>
          {publishStatus && <SyncStatusBadge status={publishStatus} />}
        </div>

        {/* Info da última publicação */}
        {syncInfo && (
          <div style={{ background: 'rgba(0,0,0,0.25)', borderRadius: 10, padding: '12px 16px', marginBottom: 16, display: 'flex', gap: 24, flexWrap: 'wrap' }}>
            <div>
              <div style={{ fontSize: 11, color: 'var(--white-faint)', marginBottom: 3 }}>VERSÃO ATUAL</div>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: 20, color: 'var(--gold)', fontWeight: 700 }}>v{syncInfo.version}</div>
            </div>
            <div>
              <div style={{ fontSize: 11, color: 'var(--white-faint)', marginBottom: 3 }}>ÚLTIMA PUBLICAÇÃO</div>
              <div style={{ fontSize: 13, color: 'var(--white-dim)' }}>{fmt(syncInfo.publishedAt)}</div>
              {syncInfo.publishedBy && <div style={{ fontSize: 11, color: 'var(--white-faint)' }}>por {syncInfo.publishedBy}</div>}
            </div>
            {syncInfo.note && (
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 11, color: 'var(--white-faint)', marginBottom: 3 }}>NOTA</div>
                <div style={{ fontSize: 13, color: 'var(--white-dim)', fontStyle: 'italic' }}>{syncInfo.note}</div>
              </div>
            )}
          </div>
        )}

        {/* Mensagem de resultado */}
        {publishMsg && (
          <div style={{
            padding: '10px 14px', borderRadius: 8, marginBottom: 14, fontSize: 13,
            background: publishStatus === 'success' ? 'rgba(134,198,69,0.08)' : 'rgba(248,113,113,0.08)',
            border: `1px solid ${publishStatus === 'success' ? 'rgba(134,198,69,0.25)' : 'rgba(248,113,113,0.25)'}`,
            color: publishStatus === 'success' ? '#86c645' : '#f87171',
          }}>
            {publishMsg}
          </div>
        )}

        {/* Campo nota opcional */}
        {showNoteInput && (
          <div style={{ marginBottom: 14 }}>
            <input
              type="text"
              placeholder="Nota sobre o que mudou (opcional)... ex: Adicionadas 3 músicas novas"
              value={publishNote}
              onChange={e => setPublishNote(e.target.value)}
              maxLength={120}
              style={{
                width: '100%', padding: '10px 14px', borderRadius: 8, boxSizing: 'border-box',
                background: 'rgba(0,0,0,0.3)', border: '1px solid var(--border)',
                color: 'var(--white)', fontSize: 13, outline: 'none',
              }}
            />
          </div>
        )}

        {/* Como funciona */}
        <div style={{ padding: '10px 14px', background: 'rgba(134,198,69,0.05)', borderRadius: 8, borderLeft: '3px solid rgba(134,198,69,0.4)', fontSize: 12, color: 'var(--white-dim)', marginBottom: 16, lineHeight: 1.6 }}>
          📱 <strong style={{ color: 'var(--white)' }}>Como funciona:</strong> ao publicar, a versão é incrementada no servidor.
          Quando o usuário abrir o app com internet, ele detecta automaticamente que há conteúdo novo e baixa
          <strong style={{ color: 'var(--gold)' }}> somente os arquivos que ainda não tem</strong>. Conteúdo já baixado não é rebaixado.
        </div>

        <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
          <button
            type="button"
            className="btn btn-gold"
            onClick={handlePublish}
            disabled={publishStatus === 'publishing'}
            style={{ display: 'flex', alignItems: 'center', gap: 8 }}
          >
            {publishStatus === 'publishing' ? (
              <>⏳ Publicando...</>
            ) : (
              <>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M12 19V5m-7 7 7-7 7 7"/></svg>
                Publicar para App
              </>
            )}
          </button>
          <button
            type="button"
            className="btn btn-ghost"
            onClick={() => setShowNoteInput(v => !v)}
            style={{ fontSize: 12 }}
          >
            {showNoteInput ? 'Ocultar nota' : '+ Adicionar nota'}
          </button>
        </div>
      </div>

      {/* Músicas recentes */}
      {recentSongs.length > 0 && (
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
            <div style={{ width: 3, height: 14, background: 'var(--gold)', borderRadius: 2 }} />
            <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.15em', textTransform: 'uppercase', color: 'var(--gold)' }}>MÚSICAS RECENTES</span>
          </div>
          <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
            <div className="table-wrap">
              <table>
                <thead><tr><th>Título</th><th>Categoria</th><th>Reproduções</th></tr></thead>
                <tbody>
                  {recentSongs.map(song => (
                    <tr key={song._id}>
                      <td style={{ fontWeight: 600 }}>{song.title}</td>
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

import { useEffect, useState } from 'react';
import api from '../../api/axios';
import { RANKS, RANK_MAP, RankChip, RankSelector } from '../../components/RankBadge';

function Toast({ msg, type, onClose }) {
  useEffect(() => { const t = setTimeout(onClose, 3500); return () => clearTimeout(t); }, []);
  return (
    <div style={{ position: 'fixed', bottom: 24, right: 24, padding: '12px 20px', borderRadius: 10, zIndex: 9999, fontWeight: 600, fontSize: 13, boxShadow: '0 4px 20px rgba(0,0,0,0.4)', background: type === 'error' ? 'rgba(192,57,43,0.95)' : 'rgba(40,80,30,0.95)', color: 'white' }}>
      {type === 'error' ? '⚠️' : '✓'} {msg}
    </div>
  );
}

function UserModal({ user, onClose, onSaved }) {
  const isEdit = !!user;
  const [form, setForm] = useState({
    name: user?.name || '',
    soldierNumber: user?.soldierNumber || '',
    rank: user?.rank || 'Soldado',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name.trim() || (!isEdit && !form.soldierNumber.trim())) return setError('Preencha todos os campos.');
    setLoading(true); setError('');
    try {
      if (isEdit) await api.put(`/app-users/${user._id}`, { name: form.name, rank: form.rank });
      else await api.post('/app-users', form);
      onSaved(); onClose();
    } catch (err) { setError(err.response?.data?.message || 'Erro ao salvar.'); }
    finally { setLoading(false); }
  };

  const rankInfo = RANK_MAP[form.rank];
  const isGeneral = ['General de Brigada','General de Divisão','General de Exército','Marechal','Comandante'].includes(form.rank);

  return (
    <div className="modal-backdrop" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal" style={{ maxWidth: 560, maxHeight: '92vh', overflow: 'auto' }}>
        <div className="modal-header">
          <div>
            <div className="modal-title">{isEdit ? 'EDITAR USUÁRIO' : 'ADICIONAR USUÁRIO'}</div>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--white-faint)', marginTop: 3, letterSpacing: '0.1em' }}>
              // CADASTRO PARA ACESSO AO APP · {isEdit ? `#${user.soldierNumber}` : 'NOVO SOLDADO'}
            </div>
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: 'var(--white-dim)', cursor: 'pointer', fontSize: 22 }}>×</button>
        </div>

        <form onSubmit={handleSubmit} style={{ padding: 24 }}>
          {!isEdit && (
            <div style={{ padding: '10px 14px', background: 'rgba(201,162,39,0.06)', border: '1px solid rgba(201,162,39,0.2)', borderRadius: 8, marginBottom: 20 }}>
              <p style={{ fontSize: 12, color: 'var(--gold)', fontWeight: 600, lineHeight: 1.5 }}>
                📱 No 1º login, o soldado criará a própria senha usando este número.
              </p>
            </div>
          )}

          {/* Preview da patente selecionada */}
          {form.rank && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '12px 16px', background: isGeneral ? 'rgba(50,50,50,0.2)' : `${rankInfo?.color}12`, border: `1px solid ${isGeneral ? '#55555555' : rankInfo?.color + '35'}`, borderRadius: 10, marginBottom: 20 }}>
              <RankChip rank={form.rank} size="md" />
              <div>
                <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--white)' }}>{form.name || 'Nome do soldado'}</div>
                {!isEdit && <div style={{ fontSize: 11, color: 'var(--white-faint)', fontFamily: 'var(--font-mono)' }}>#{form.soldierNumber || '----'}</div>}
              </div>
            </div>
          )}

          <div className="form-group">
            <label className="form-label">Nome completo</label>
            <input className="form-input" required placeholder="Ex: Pereira Matos" value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} />
          </div>

          {!isEdit && (
            <div className="form-group">
              <label className="form-label">Número do soldado</label>
              <div style={{ position: 'relative' }}>
                <span style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', fontFamily: 'var(--font-mono)', fontSize: 12, color: 'var(--white-faint)' }}>#</span>
                <input className="form-input" required placeholder="5004" value={form.soldierNumber} onChange={e => setForm(p => ({ ...p, soldierNumber: e.target.value }))} style={{ paddingLeft: 28, fontFamily: 'var(--font-mono)', letterSpacing: '0.1em' }} />
              </div>
              <span style={{ fontSize: 11, color: 'var(--white-faint)', marginTop: 5, display: 'block' }}>Número único para login no aplicativo</span>
            </div>
          )}

          {/* Rank selector */}
          <div className="form-group">
            <label className="form-label">Patente</label>
            <div style={{ background: 'rgba(0,0,0,0.2)', border: '1px solid var(--border)', borderRadius: 10, padding: '14px 16px', maxHeight: 320, overflowY: 'auto' }}>
              <RankSelector value={form.rank} onChange={rank => setForm(p => ({ ...p, rank }))} />
            </div>
          </div>

          {error && (
            <div style={{ marginBottom: 16, padding: '10px 14px', background: 'rgba(192,57,43,0.1)', border: '1px solid rgba(192,57,43,0.3)', borderRadius: 8, color: '#E05A4A', fontSize: 13 }}>
              {error}
            </div>
          )}

          <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', marginTop: 8 }}>
            <button type="button" className="btn btn-ghost" onClick={onClose}>Cancelar</button>
            <button type="submit" className="btn btn-gold" disabled={loading}>
              {loading ? 'Salvando...' : isEdit ? '✓ Salvar alterações' : '+ Adicionar soldado'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(null);
  const [toast, setToast] = useState(null);
  const [search, setSearch] = useState('');
  const [confirmDelete, setConfirmDelete] = useState(null);
  const [filterRank, setFilterRank] = useState('');
  const [filterGroup, setFilterGroup] = useState('');

  const showToast = (msg, type = 'success') => setToast({ msg, type });

  const load = async () => {
    try { const { data } = await api.get('/app-users'); setUsers(data.users || []); }
    catch { showToast('Erro ao carregar.', 'error'); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const handleDelete = async (user) => {
    try { await api.delete(`/app-users/${user._id}`); showToast(`"${user.rank} ${user.name}" removido.`); load(); }
    catch { showToast('Erro ao remover.', 'error'); }
    setConfirmDelete(null);
  };

  const handleResetPassword = async (user) => {
    try { await api.post(`/app-users/${user._id}/reset-password`); showToast(`Senha de "${user.name}" resetada.`); }
    catch { showToast('Erro ao resetar.', 'error'); }
  };

  // Groups for filter
  const GROUPS = ['Praças','Oficiais Subalternos','Oficiais Intermediários','Oficiais Superiores','Generais','Cargo Máximo'];

  const filtered = users.filter(u => {
    const rankInfo = RANK_MAP[u.rank];
    return (
      (u.name.toLowerCase().includes(search.toLowerCase()) || u.soldierNumber.includes(search)) &&
      (!filterRank || u.rank === filterRank) &&
      (!filterGroup || rankInfo?.group === filterGroup)
    );
  });

  return (
    <div>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 28, flexWrap: 'wrap', gap: 16 }}>
        <div>
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 28, fontWeight: 800, letterSpacing: '0.12em', color: 'var(--white)', marginBottom: 4 }}>USUÁRIOS DO APP</h2>
          <p style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--white-faint)', letterSpacing: '0.1em' }}>
            // EFETIVO COM ACESSO · {users.length} CADASTRADOS
          </p>
        </div>
        <button className="btn btn-gold" onClick={() => setModal('new')} style={{ gap: 8 }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M12 5v14m-7-7h14"/></svg>
          ADICIONAR USUÁRIO
        </button>
      </div>

      {/* Stats by group */}
      <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginBottom: 24 }}>
        {[
          { label: 'Total', value: users.length, color: 'var(--gold)' },
          { label: 'Ativos', value: users.filter(u => u.hasSetPassword).length, color: '#6EBF48' },
          { label: 'Praças', value: users.filter(u => ['Recruta','Soldado','Cabo','3º Sargento','2º Sargento','1º Sargento','Subtenente'].includes(u.rank)).length, color: '#C9A227' },
          { label: 'Oficiais', value: users.filter(u => ['Aspirante','2º Tenente','1º Tenente','Capitão','Major','Tenente-Coronel','Coronel'].includes(u.rank)).length, color: '#D4A820' },
          { label: 'Generais', value: users.filter(u => ['General de Brigada','General de Divisão','General de Exército','Marechal','Comandante'].includes(u.rank)).length, color: '#E0E0E0' },
        ].map(s => (
          <div key={s.label} style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 10, padding: '10px 16px', display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ fontFamily: 'var(--font-display)', fontSize: 24, fontWeight: 800, color: s.color }}>{s.value}</span>
            <span style={{ fontSize: 11, color: 'var(--white-dim)' }}>{s.label}</span>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div style={{ display: 'flex', gap: 10, marginBottom: 20, flexWrap: 'wrap' }}>
        <div style={{ position: 'relative', flex: 1, minWidth: 180 }}>
          <svg style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', opacity: 0.4, pointerEvents: 'none' }} width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
          <input className="form-input" placeholder="Buscar nome ou número..." value={search} onChange={e => setSearch(e.target.value)} style={{ paddingLeft: 36 }} />
        </div>
        <select className="form-input" value={filterGroup} onChange={e => { setFilterGroup(e.target.value); setFilterRank(''); }} style={{ width: 'auto', minWidth: 160 }}>
          <option value="">Todos os grupos</option>
          {GROUPS.map(g => <option key={g} value={g}>{g}</option>)}
        </select>
        <select className="form-input" value={filterRank} onChange={e => setFilterRank(e.target.value)} style={{ width: 'auto', minWidth: 160 }}>
          <option value="">Todas as patentes</option>
          {RANKS.filter(r => !filterGroup || r.group === filterGroup).map(r => (
            <option key={r.key} value={r.key}>{r.key}</option>
          ))}
        </select>
      </div>

      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: 60 }}><div className="spinner" /></div>
      ) : filtered.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: '50px 20px' }}>
          <div style={{ fontSize: 40, marginBottom: 16 }}>👥</div>
          <p style={{ color: 'var(--white-dim)', fontFamily: 'var(--font-display)', letterSpacing: '0.06em' }}>
            {search || filterRank || filterGroup ? 'Nenhum usuário encontrado' : 'Nenhum usuário cadastrado'}
          </p>
          {!search && !filterRank && !filterGroup && (
            <button className="btn btn-gold" style={{ marginTop: 16 }} onClick={() => setModal('new')}>+ Adicionar primeiro usuário</button>
          )}
        </div>
      ) : (
        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>#</th>
                  <th>Nome</th>
                  <th>Patente</th>
                  <th>Nº Soldado</th>
                  <th>Status</th>
                  <th>Cadastrado</th>
                  <th>Ações</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((user, idx) => (
                  <tr key={user._id}>
                    <td style={{ fontFamily: 'var(--font-mono)', fontSize: 12, color: 'var(--white-faint)' }}>{idx + 1}</td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <div style={{ width: 34, height: 34, borderRadius: '50%', background: 'rgba(201,162,39,0.1)', border: '1px solid rgba(201,162,39,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'var(--font-display)', fontSize: 13, fontWeight: 700, color: 'var(--gold)', flexShrink: 0 }}>
                          {user.name[0].toUpperCase()}
                        </div>
                        <span style={{ fontWeight: 700, color: 'var(--white)', fontSize: 13 }}>{user.name}</span>
                      </div>
                    </td>
                    <td><RankChip rank={user.rank} size="sm" /></td>
                    <td>
                      <span style={{ fontFamily: 'var(--font-mono)', fontSize: 14, color: 'var(--gold)', letterSpacing: '0.1em' }}>#{user.soldierNumber}</span>
                    </td>
                    <td>
                      {user.hasSetPassword ? (
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, padding: '3px 10px', borderRadius: 100, background: 'rgba(90,158,58,0.12)', border: '1px solid rgba(90,158,58,0.3)', color: '#6EBF48', fontSize: 11, fontFamily: 'var(--font-mono)' }}>
                          <div style={{ width: 5, height: 5, borderRadius: '50%', background: '#6EBF48' }} /> ATIVO
                        </span>
                      ) : (
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, padding: '3px 10px', borderRadius: 100, background: 'rgba(201,162,39,0.08)', border: '1px solid rgba(201,162,39,0.25)', color: 'var(--gold)', fontSize: 11, fontFamily: 'var(--font-mono)' }}>
                          <div style={{ width: 5, height: 5, borderRadius: '50%', background: 'var(--gold)', animation: 'pulse 1.5s ease infinite' }} /> 1º ACESSO
                        </span>
                      )}
                    </td>
                    <td style={{ fontSize: 12, color: 'var(--white-faint)', fontFamily: 'var(--font-mono)' }}>
                      {new Date(user.createdAt).toLocaleDateString('pt-BR')}
                    </td>
                    <td>
                      <div style={{ display: 'flex', gap: 5 }}>
                        <button className="btn btn-ghost btn-sm" title="Editar" onClick={() => setModal(user)}>✏️ Editar</button>
                        {user.hasSetPassword && (
                          <button className="btn btn-ghost btn-sm" title="Resetar senha" onClick={() => handleResetPassword(user)}>🔄</button>
                        )}
                        <button className="btn btn-danger btn-sm" onClick={() => setConfirmDelete(user)}>🗑</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {modal && (
        <UserModal user={modal === 'new' ? null : modal} onClose={() => setModal(null)} onSaved={() => { load(); showToast('Usuário salvo com sucesso!'); }} />
      )}

      {confirmDelete && (
        <div className="modal-backdrop" onClick={() => setConfirmDelete(null)}>
          <div className="modal" style={{ maxWidth: 400 }} onClick={e => e.stopPropagation()}>
            <div style={{ padding: 28, textAlign: 'center' }}>
              <div style={{ width: 52, height: 52, borderRadius: '50%', background: 'rgba(192,57,43,0.12)', border: '1px solid rgba(192,57,43,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#E05A4A" strokeWidth="2" strokeLinecap="round"><polyline points="3,6 5,6 21,6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/></svg>
              </div>
              <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 20, letterSpacing: '0.08em', color: 'var(--white)', marginBottom: 10 }}>REMOVER USUÁRIO</h3>
              <div style={{ marginBottom: 10 }}><RankChip rank={confirmDelete.rank} /></div>
              <p style={{ color: 'var(--white-dim)', fontSize: 14, marginBottom: 6 }}>
                Remover <strong style={{ color: 'var(--white)' }}>{confirmDelete.name}</strong>?
              </p>
              <p style={{ color: 'var(--white-faint)', fontSize: 12, marginBottom: 24 }}>
                O soldado #{confirmDelete.soldierNumber} perderá acesso ao aplicativo.
              </p>
              <div style={{ display: 'flex', gap: 10, justifyContent: 'center' }}>
                <button className="btn btn-ghost" onClick={() => setConfirmDelete(null)}>Cancelar</button>
                <button className="btn btn-danger" onClick={() => handleDelete(confirmDelete)}>Sim, Remover</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {toast && <Toast msg={toast.msg} type={toast.type} onClose={() => setToast(null)} />}
    </div>
  );
}

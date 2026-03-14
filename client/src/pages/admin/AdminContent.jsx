import { RankChip } from '../../components/RankBadge';
import { useEffect, useState } from 'react';
import api from '../../api/axios';

const TYPES = [
  { value: 'announcement', label: '📢 Aviso', color: '#C9A227' },
  { value: 'info', label: 'ℹ️ Informação', color: '#6BA3E0' },
  { value: 'warning', label: '⚠️ Atenção', color: '#E8A020' },
  { value: 'success', label: '✅ Sucesso', color: '#6EBF48' },
];
const VISIBILITY = [
  { value: 'all', label: '🌐 Todos (inclusive não logados)', desc: 'Aparece para qualquer visitante do app/web' },
  { value: 'loggedIn', label: '🔒 Usuários logados', desc: 'Somente soldados com login ativo' },
  { value: 'specific', label: '👤 Usuários específicos', desc: 'Selecione quais soldados vão ver' },
];

function Toast({ msg, type, onClose }) {
  useEffect(() => { const t = setTimeout(onClose, 3500); return () => clearTimeout(t); }, []);
  return (
    <div style={{ position: 'fixed', bottom: 24, right: 24, padding: '12px 20px', borderRadius: 10, zIndex: 9999, fontWeight: 600, fontSize: 13, display: 'flex', alignItems: 'center', gap: 10, background: type === 'error' ? 'rgba(192,57,43,0.95)' : 'rgba(40,80,30,0.95)', color: 'white', boxShadow: '0 4px 20px rgba(0,0,0,0.4)' }}>
      {type === 'error' ? '⚠️' : '✓'} {msg}
    </div>
  );
}

function ContentModal({ content, allUsers, onClose, onSaved }) {
  const isEdit = !!content;
  const [form, setForm] = useState({
    title: content?.title || '',
    body: content?.body || '',
    type: content?.type || 'info',
    visibility: content?.visibility || 'all',
    targetUsers: (content?.targetUsers || []).map(u => u._id || u),
    imageUrl: content?.imageUrl || '',
    pinned: content?.pinned || false,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const toggleUser = (id) => {
    setForm(p => ({ ...p, targetUsers: p.targetUsers.includes(id) ? p.targetUsers.filter(u => u !== id) : [...p.targetUsers, id] }));
  };

  const handleSave = async () => {
    if (!form.title.trim() || !form.body.trim()) return setError('Título e conteúdo são obrigatórios.');
    setLoading(true); setError('');
    try {
      if (isEdit) await api.put(`/content/${content._id}`, form);
      else await api.post('/content', form);
      onSaved();
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || 'Erro ao salvar.');
    } finally { setLoading(false); }
  };

  return (
    <div className="modal-backdrop" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal" style={{ maxWidth: 560, maxHeight: '90vh', overflow: 'auto' }}>
        <div className="modal-header">
          <div>
            <div className="modal-title">{isEdit ? 'EDITAR CONTEÚDO' : 'NOVO CONTEÚDO'}</div>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--white-faint)', marginTop: 3 }}>// AVISOS · INFORMAÇÕES · ANÚNCIOS</div>
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: 'var(--white-dim)', cursor: 'pointer', fontSize: 22 }}>×</button>
        </div>
        <div style={{ padding: 24 }}>
          <div className="form-group">
            <label className="form-label">Tipo</label>
            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
              {TYPES.map(t => (
                <button key={t.value} onClick={() => setForm(p => ({ ...p, type: t.value }))} style={{
                  padding: '6px 12px', borderRadius: 8, border: `1px solid ${form.type === t.value ? t.color : 'var(--border)'}`,
                  background: form.type === t.value ? `${t.color}18` : 'transparent',
                  color: form.type === t.value ? t.color : 'var(--white-dim)',
                  cursor: 'pointer', fontSize: 12, fontWeight: 600,
                }}>{t.label}</button>
              ))}
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Título</label>
            <input className="form-input" placeholder="Ex: Atenção, mudança de horário..." value={form.title} onChange={e => setForm(p => ({ ...p, title: e.target.value }))} />
          </div>

          <div className="form-group">
            <label className="form-label">Conteúdo / Mensagem</label>
            <textarea className="form-input" rows={4} placeholder="Digite o conteúdo do aviso..." value={form.body} onChange={e => setForm(p => ({ ...p, body: e.target.value }))} style={{ resize: 'vertical' }} />
          </div>

          <div className="form-group">
            <label className="form-label">URL da Imagem (opcional)</label>
            <input className="form-input" placeholder="https://..." value={form.imageUrl} onChange={e => setForm(p => ({ ...p, imageUrl: e.target.value }))} />
            {form.imageUrl && <img src={form.imageUrl} alt="" style={{ marginTop: 8, maxHeight: 120, borderRadius: 6, objectFit: 'cover' }} onError={e => e.target.style.display='none'} />}
          </div>

          <div className="form-group">
            <label className="form-label">Visibilidade</label>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              {VISIBILITY.map(v => (
                <div key={v.value} onClick={() => setForm(p => ({ ...p, visibility: v.value, targetUsers: [] }))} style={{
                  padding: '10px 14px', borderRadius: 8, cursor: 'pointer',
                  border: `1px solid ${form.visibility === v.value ? 'rgba(201,162,39,0.4)' : 'var(--border)'}`,
                  background: form.visibility === v.value ? 'rgba(201,162,39,0.08)' : 'transparent',
                  transition: 'all 0.15s',
                }}>
                  <div style={{ fontWeight: 700, fontSize: 13, color: form.visibility === v.value ? 'var(--gold)' : 'var(--white-dim)', marginBottom: 2 }}>{v.label}</div>
                  <div style={{ fontSize: 11, color: 'var(--white-faint)' }}>{v.desc}</div>
                </div>
              ))}
            </div>
          </div>

          {form.visibility === 'specific' && (
            <div className="form-group">
              <label className="form-label">Selecionar soldados ({form.targetUsers.length} selecionados)</label>
              <div style={{ maxHeight: 200, overflowY: 'auto', border: '1px solid var(--border)', borderRadius: 8 }}>
                {allUsers.map(u => (
                  <div key={u._id} onClick={() => toggleUser(u._id)} style={{
                    display: 'flex', alignItems: 'center', gap: 10, padding: '10px 14px', cursor: 'pointer',
                    background: form.targetUsers.includes(u._id) ? 'rgba(201,162,39,0.08)' : 'transparent',
                    borderBottom: '1px solid var(--border)', transition: 'background 0.15s',
                  }}>
                    <div style={{ width: 18, height: 18, borderRadius: 4, border: `2px solid ${form.targetUsers.includes(u._id) ? 'var(--gold)' : 'var(--border)'}`, background: form.targetUsers.includes(u._id) ? 'var(--gold)' : 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      {form.targetUsers.includes(u._id) && <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="black" strokeWidth="3" strokeLinecap="round"><polyline points="20,6 9,17 4,12"/></svg>}
                    </div>
                    <div>
                      <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--white)' }}>{u.rank} {u.name}</div>
                      <div style={{ fontSize: 10, color: 'var(--white-faint)', fontFamily: 'var(--font-mono)' }}>#{u.soldierNumber}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20 }}>
            <div onClick={() => setForm(p => ({ ...p, pinned: !p.pinned }))} style={{
              width: 18, height: 18, borderRadius: 4, border: `2px solid ${form.pinned ? 'var(--gold)' : 'var(--border)'}`,
              background: form.pinned ? 'var(--gold)' : 'transparent', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
            }}>
              {form.pinned && <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="black" strokeWidth="3" strokeLinecap="round"><polyline points="20,6 9,17 4,12"/></svg>}
            </div>
            <label style={{ fontSize: 13, color: 'var(--white-dim)', cursor: 'pointer' }} onClick={() => setForm(p => ({ ...p, pinned: !p.pinned }))}>
              📌 Fixar no topo do feed
            </label>
          </div>

          {error && <div style={{ marginBottom: 12, padding: '10px 14px', background: 'rgba(192,57,43,0.1)', border: '1px solid rgba(192,57,43,0.3)', borderRadius: 8, color: '#E05A4A', fontSize: 13 }}>{error}</div>}
          <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
            <button className="btn btn-ghost" onClick={onClose}>Cancelar</button>
            <button className="btn btn-gold" onClick={handleSave} disabled={loading}>{loading ? 'Salvando...' : isEdit ? '✓ Salvar' : '+ Publicar'}</button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function AdminContent() {
  const [items, setItems] = useState([]);
  const [allUsers, setAllUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(null); // null | 'new' | content object
  const [toast, setToast] = useState(null);

  const showToast = (msg, type = 'success') => setToast({ msg, type });

  const load = async () => {
    try {
      const [c, u] = await Promise.all([api.get('/content/admin/list'), api.get('/app-users')]);
      setItems(c.data.content || []);
      setAllUsers(u.data.users || []);
    } catch { showToast('Erro ao carregar.', 'error'); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const handleToggleActive = async (item) => {
    try {
      await api.put(`/content/${item._id}`, { ...item, targetUsers: (item.targetUsers || []).map(u => u._id || u), active: !item.active });
      showToast(`Conteúdo ${!item.active ? 'ativado' : 'desativado'}.`);
      load();
    } catch { showToast('Erro.', 'error'); }
  };

  const handleDelete = async (id) => {
    if (!confirm('Remover este conteúdo?')) return;
    try { await api.delete(`/content/${id}`); showToast('Conteúdo removido.'); load(); }
    catch { showToast('Erro ao remover.', 'error'); }
  };

  const VISIBILITY_LABEL = { all: '🌐 Todos', loggedIn: '🔒 Logados', specific: '👤 Específico' };
  const TYPE_LABEL = { announcement: '📢', info: 'ℹ️', warning: '⚠️', success: '✅' };

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 28, flexWrap: 'wrap', gap: 16 }}>
        <div>
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 28, fontWeight: 800, letterSpacing: '0.12em', color: 'var(--white)', marginBottom: 4 }}>CONTEÚDOS</h2>
          <p style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--white-faint)', letterSpacing: '0.1em' }}>// AVISOS · INFORMAÇÕES · ANÚNCIOS</p>
        </div>
        <button className="btn btn-gold" onClick={() => setModal('new')} style={{ gap: 8 }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M12 5v14m-7-7h14"/></svg>
          NOVO CONTEÚDO
        </button>
      </div>

      {loading ? <div style={{ display: 'flex', justifyContent: 'center', padding: 60 }}><div className="spinner" /></div> : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {items.length === 0 && (
            <div className="card" style={{ textAlign: 'center', padding: '50px 20px' }}>
              <div style={{ fontSize: 40, marginBottom: 12 }}>📋</div>
              <p style={{ color: 'var(--white-dim)', fontFamily: 'var(--font-display)', letterSpacing: '0.06em' }}>Nenhum conteúdo criado</p>
              <p style={{ color: 'var(--white-faint)', fontSize: 12, marginTop: 6 }}>Crie avisos, informações ou anúncios</p>
              <button className="btn btn-gold" style={{ marginTop: 16 }} onClick={() => setModal('new')}>+ Criar primeiro conteúdo</button>
            </div>
          )}
          {items.map(item => {
            const typeInfo = TYPES.find(t => t.value === item.type) || TYPES[0];
            return (
              <div key={item._id} className="card" style={{ padding: '14px 18px', opacity: item.active ? 1 : 0.5, borderLeft: `3px solid ${typeInfo.color}` }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12, flexWrap: 'wrap' }}>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap', marginBottom: 4 }}>
                      <span style={{ fontSize: 16 }}>{TYPE_LABEL[item.type]}</span>
                      <span style={{ fontFamily: 'var(--font-display)', fontSize: 14, fontWeight: 700, color: 'var(--white)' }}>{item.title}</span>
                      {item.pinned && <span style={{ fontSize: 9, padding: '1px 6px', borderRadius: 3, background: 'rgba(201,162,39,0.15)', color: 'var(--gold)', fontFamily: 'var(--font-mono)' }}>FIXADO</span>}
                      {!item.active && <span style={{ fontSize: 9, padding: '1px 6px', borderRadius: 3, background: 'rgba(192,57,43,0.15)', color: '#E05A4A', fontFamily: 'var(--font-mono)' }}>INATIVO</span>}
                    </div>
                    <p style={{ fontSize: 12, color: 'var(--white-dim)', marginBottom: 6, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: 400 }}>{item.body}</p>
                    <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
                      <span style={{ fontSize: 10, padding: '2px 8px', borderRadius: 4, background: 'rgba(244,242,236,0.06)', border: '1px solid var(--border)', color: 'var(--white-faint)', fontFamily: 'var(--font-mono)' }}>
                        {VISIBILITY_LABEL[item.visibility]}
                        {item.visibility === 'specific' && ` (${item.targetUsers?.length || 0} soldados)`}
                      </span>
                      <span style={{ fontSize: 10, color: 'var(--white-faint)', fontFamily: 'var(--font-mono)' }}>
                        {new Date(item.createdAt).toLocaleDateString('pt-BR')}
                      </span>
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: 6, flexShrink: 0 }}>
                    <button className="btn btn-ghost btn-sm" onClick={() => handleToggleActive(item)}>{item.active ? '⏸ Desativar' : '▶ Ativar'}</button>
                    <button className="btn btn-ghost btn-sm" onClick={() => setModal(item)}>✏️ Editar</button>
                    <button className="btn btn-danger btn-sm" onClick={() => handleDelete(item._id)}>🗑</button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {modal && (
        <ContentModal
          content={modal === 'new' ? null : modal}
          allUsers={allUsers}
          onClose={() => setModal(null)}
          onSaved={() => { load(); showToast('Conteúdo salvo!'); }}
        />
      )}
      {toast && <Toast msg={toast.msg} type={toast.type} onClose={() => setToast(null)} />}
    </div>
  );
}

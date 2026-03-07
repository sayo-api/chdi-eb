import { useEffect, useState } from 'react';
import api from '../../api/axios';
import { Icon, ICON_LIST, IconPreview } from '../../components/Icons';

const COLOR_OPTIONS = ['green', 'gold', 'olive', 'dark-green', 'red', 'blue'];

function CategoryModal({ category, onClose, onSaved }) {
  const [form, setForm] = useState({
    name: category?.name || '',
    description: category?.description || '',
    icon: category?.icon || 'music-note',
    iconColor: category?.iconColor || 'green',
    order: category?.order ?? 0,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      if (category?._id) {
        await api.put(`/categories/${category._id}`, form);
      } else {
        await api.post('/categories', form);
      }
      onSaved();
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || 'Erro ao salvar.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-backdrop" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal">
        <div className="modal-header">
          <span className="modal-title">{category ? 'EDITAR CATEGORIA' : 'NOVA CATEGORIA'}</span>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: 'var(--white-dim)', cursor: 'pointer', fontSize: 20, padding: 4 }}>×</button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Nome</label>
            <input className="form-input" required value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} placeholder="Ex: Hinos Militares" />
          </div>
          <div className="form-group">
            <label className="form-label">Descrição</label>
            <input className="form-input" value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))} placeholder="Breve descrição do módulo" />
          </div>

          <div className="form-group">
            <label className="form-label">Ícone</label>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginTop: 4 }}>
              {ICON_LIST.map(name => (
                <div key={name} className={`icon-option ${form.icon === name ? 'selected' : ''}`}
                  style={{ background: form.icon === name ? 'var(--gold-dim)' : 'rgba(255,255,255,0.04)' }}
                  onClick={() => setForm(p => ({ ...p, icon: name }))}>
                  <Icon name={name} size={22} color={form.icon === name ? 'var(--gold)' : 'var(--white-dim)'} />
                </div>
              ))}
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Cor do ícone</label>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              {COLOR_OPTIONS.map(c => (
                <div key={c} onClick={() => setForm(p => ({ ...p, iconColor: c }))}
                  style={{ cursor: 'pointer', padding: '4px 12px', borderRadius: 6, fontSize: 12, fontWeight: 700, border: `2px solid ${form.iconColor === c ? 'var(--gold)' : 'var(--border)'}`, color: form.iconColor === c ? 'var(--gold)' : 'var(--white-dim)' }}>
                  {c}
                </div>
              ))}
            </div>
          </div>

          <div style={{ marginTop: 16, padding: 14, background: 'rgba(255,255,255,0.03)', borderRadius: 10, display: 'flex', alignItems: 'center', gap: 14 }}>
            <span style={{ fontSize: 12, color: 'var(--white-dim)', fontWeight: 600 }}>Pré-visualização:</span>
            <IconPreview iconName={form.icon} colorKey={form.iconColor} />
            <span style={{ fontFamily: 'var(--font-display)', fontSize: 16, letterSpacing: '0.05em', color: 'var(--white)' }}>{form.name || 'Nome da Categoria'}</span>
          </div>

          <div className="form-group" style={{ marginTop: 14 }}>
            <label className="form-label">Ordem</label>
            <input className="form-input" type="number" min="0" value={form.order} onChange={e => setForm(p => ({ ...p, order: parseInt(e.target.value) || 0 }))} />
          </div>

          {error && <div className="form-error" style={{ marginBottom: 14, padding: '10px 14px', background: 'rgba(248,113,113,0.08)', borderRadius: 8 }}>{error}</div>}

          <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
            <button type="button" className="btn btn-ghost" onClick={onClose}>Cancelar</button>
            <button type="submit" className="btn btn-gold" disabled={loading}>{loading ? 'Salvando...' : 'Salvar'}</button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function AdminCategories() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(null);
  const [toast, setToast] = useState('');

  const load = async () => {
    try {
      const { data } = await api.get('/categories');
      setCategories(data.categories);
    } finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const handleDelete = async (cat) => {
    if (!window.confirm(`Remover "${cat.name}"?`)) return;
    try {
      await api.delete(`/categories/${cat._id}`);
      setToast('Categoria removida.');
      load();
    } catch (err) {
      setToast(err.response?.data?.message || 'Erro ao remover.');
    }
  };

  useEffect(() => {
    if (toast) setTimeout(() => setToast(''), 3000);
  }, [toast]);

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
        <div>
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 26, letterSpacing: '0.1em', color: 'var(--white)', marginBottom: 4 }}>CATEGORIAS</h2>
          <p style={{ color: 'var(--white-dim)', fontSize: 14 }}>Módulos de aprendizagem</p>
        </div>
        <button className="btn btn-gold" onClick={() => setModal({})}> + Nova Categoria</button>
      </div>

      {toast && (
        <div style={{ marginBottom: 16, padding: '12px 16px', background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 8, fontSize: 14 }}>{toast}</div>
      )}

      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: 60 }}><div className="spinner" /></div>
      ) : categories.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '60px 20px', color: 'var(--white-dim)' }}>
          <p style={{ marginBottom: 16 }}>Nenhuma categoria criada ainda.</p>
          <button className="btn btn-gold" onClick={() => setModal({})}>Criar primeira categoria</button>
        </div>
      ) : (
        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
          <div className="table-wrap">
            <table>
              <thead><tr><th>Ícone</th><th>Nome</th><th>Descrição</th><th>Músicas</th><th>Ordem</th><th>Ações</th></tr></thead>
              <tbody>
                {categories.map(cat => (
                  <tr key={cat._id}>
                    <td><IconPreview iconName={cat.icon} colorKey={cat.iconColor} size={22} /></td>
                    <td style={{ fontWeight: 700 }}>{cat.name}</td>
                    <td style={{ color: 'var(--white-dim)', maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{cat.description || '—'}</td>
                    <td style={{ color: 'var(--gold)', fontFamily: 'var(--font-mono)' }}>{cat.songCount}</td>
                    <td style={{ color: 'var(--white-dim)', fontFamily: 'var(--font-mono)' }}>{cat.order}</td>
                    <td>
                      <div style={{ display: 'flex', gap: 6 }}>
                        <button className="btn btn-ghost btn-sm" onClick={() => setModal(cat)}>Editar</button>
                        <button className="btn btn-danger btn-sm" onClick={() => handleDelete(cat)}>Remover</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {modal !== null && (
        <CategoryModal category={modal._id ? modal : undefined} onClose={() => setModal(null)} onSaved={load} />
      )}
    </div>
  );
}

import { useEffect, useState } from 'react';
import api from '../../api/axios';
import { Icon, ICON_LIST, IconPreview } from '../../components/Icons';

const COLOR_OPTIONS = ['green', 'gold', 'olive', 'dark-green', 'red', 'blue'];

function Toggle({ checked, onChange, label, hint }) {
  return (
    <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12, padding: '12px 14px', background: checked ? 'rgba(201,162,39,0.06)' : 'rgba(244,242,236,0.02)', border: `1px solid ${checked ? 'rgba(201,162,39,0.25)' : 'var(--border)'}`, borderRadius: 8, cursor: 'pointer', transition: 'all 0.2s', userSelect: 'none' }} onClick={() => onChange(!checked)}>
      <div>
        <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--white)', marginBottom: 2 }}>{label}</div>
        {hint && <div style={{ fontSize: 11, color: 'var(--white-faint)', lineHeight: 1.4 }}>{hint}</div>}
      </div>
      <div style={{ width: 42, height: 24, borderRadius: 12, background: checked ? 'var(--gold)' : 'rgba(244,242,236,0.1)', position: 'relative', flexShrink: 0, transition: 'background 0.2s', border: `1px solid ${checked ? 'transparent' : 'var(--border-mid)'}` }}>
        <div style={{ width: 18, height: 18, borderRadius: '50%', background: '#fff', position: 'absolute', top: 2, left: checked ? 20 : 2, transition: 'left 0.2s', boxShadow: '0 1px 4px rgba(0,0,0,0.3)' }} />
      </div>
    </div>
  );
}

function CategoryModal({ category, onClose, onSaved }) {
  const [form, setForm] = useState({
    name:          category?.name          || '',
    description:   category?.description   || '',
    sectionLabel:  category?.sectionLabel  || '',
    icon:          category?.icon          || 'music-note',
    iconColor:     category?.iconColor     || 'green',
    order:         category?.order         ?? 0,
    requiresLogin: category?.requiresLogin ?? false,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const set = (k, v) => setForm(p => ({ ...p, [k]: v }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true); setError('');
    try {
      if (category?._id) await api.put(`/categories/${category._id}`, form);
      else                await api.post('/categories', form);
      onSaved(); onClose();
    } catch (err) {
      setError(err.response?.data?.message || 'Erro ao salvar.');
    } finally { setLoading(false); }
  };

  return (
    <div className="modal-backdrop" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal">
        <div className="modal-header">
          <div>
            <div className="modal-title">{category ? 'EDITAR MÓDULO' : 'NOVO MÓDULO'}</div>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--white-faint)', marginTop: 3, letterSpacing: '0.1em' }}>// CONFIGURAÇÃO DE CATEGORIA</div>
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: 'var(--white-dim)', cursor: 'pointer', fontSize: 22, lineHeight: 1 }}>×</button>
        </div>
        <form onSubmit={handleSubmit} style={{ padding: 24 }}>
          <div className="form-group">
            <label className="form-label">Nome do módulo</label>
            <input className="form-input" required value={form.name} onChange={e => set('name', e.target.value)} placeholder="Ex: Hinos Militares" />
          </div>

          <div className="form-group">
            <label className="form-label">Descrição</label>
            <input className="form-input" value={form.description} onChange={e => set('description', e.target.value)} placeholder="Breve descrição visível no app" />
          </div>

          <div className="form-group">
            <label className="form-label">
              Rótulo da seção no app
              <span style={{ fontSize: 10, color: 'var(--white-faint)', fontWeight: 400, marginLeft: 6 }}>(cabeçalho agrupador)</span>
            </label>
            <input className="form-input" value={form.sectionLabel} onChange={e => set('sectionLabel', e.target.value)} placeholder="Ex: MÓDULOS DE APRENDIZAGEM" />
          </div>

          {/* requiresLogin toggle */}
          <div className="form-group">
            <label className="form-label" style={{ marginBottom: 8 }}>Controle de acesso</label>
            <Toggle
              checked={form.requiresLogin}
              onChange={v => set('requiresLogin', v)}
              label="🔒 Requer login de soldado"
              hint="Somente usuários cadastrados no app poderão acessar este módulo. Conteúdo bloqueado para visitantes."
            />
          </div>

          {/* Icon picker */}
          <div className="form-group">
            <label className="form-label">Ícone</label>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: 4 }}>
              {ICON_LIST.map(name => (
                <div key={name}
                  style={{ background: form.icon === name ? 'var(--gold-dim)' : 'rgba(255,255,255,0.04)', padding: 6, borderRadius: 8, cursor: 'pointer', border: `1px solid ${form.icon === name ? 'var(--gold)' : 'var(--border)'}`, transition: 'all 0.15s' }}
                  onClick={() => set('icon', name)}
                  title={name}>
                  <Icon name={name} size={20} color={form.icon === name ? 'var(--gold)' : 'var(--white-dim)'} />
                </div>
              ))}
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Cor do ícone</label>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              {COLOR_OPTIONS.map(c => (
                <div key={c} onClick={() => set('iconColor', c)}
                  style={{ cursor: 'pointer', padding: '5px 14px', borderRadius: 6, fontSize: 12, fontWeight: 700, fontFamily: 'var(--font-display)', letterSpacing: '0.06em', border: `2px solid ${form.iconColor === c ? 'var(--gold)' : 'var(--border-mid)'}`, color: form.iconColor === c ? 'var(--gold)' : 'var(--white-dim)', transition: 'all 0.15s' }}>
                  {c}
                </div>
              ))}
            </div>
          </div>

          {/* Preview */}
          <div style={{ marginTop: 4, padding: 14, background: 'rgba(244,242,236,0.02)', borderRadius: 10, display: 'flex', alignItems: 'center', gap: 14, border: '1px solid var(--border)' }}>
            <span style={{ fontSize: 11, color: 'var(--white-faint)', fontFamily: 'var(--font-display)', letterSpacing: '0.1em' }}>PRÉVIA:</span>
            <IconPreview iconName={form.icon} colorKey={form.iconColor} />
            <div style={{ flex: 1 }}>
              <div style={{ fontFamily: 'var(--font-display)', fontSize: 17, letterSpacing: '0.05em', color: 'var(--white)', marginBottom: 2 }}>{form.name || 'Nome do Módulo'}</div>
              {form.sectionLabel && <div style={{ fontSize: 9, color: 'var(--gold)', letterSpacing: '0.14em', fontFamily: 'var(--font-mono)' }}>{form.sectionLabel.toUpperCase()}</div>}
            </div>
            {form.requiresLogin && (
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, padding: '3px 8px', borderRadius: 4, background: 'rgba(192,57,43,0.12)', border: '1px solid rgba(192,57,43,0.3)', color: '#E05A4A', fontSize: 10, fontFamily: 'var(--font-mono)', letterSpacing: '0.08em' }}>
                🔒 LOGIN
              </span>
            )}
          </div>

          <div className="form-group" style={{ marginTop: 16 }}>
            <label className="form-label">Ordem de exibição</label>
            <input className="form-input" type="number" min="0" value={form.order} onChange={e => set('order', parseInt(e.target.value) || 0)} style={{ maxWidth: 120 }} />
          </div>

          {error && <div className="form-error" style={{ marginBottom: 14, padding: '10px 14px', background: 'rgba(192,57,43,0.08)', borderRadius: 8 }}>{error}</div>}

          <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
            <button type="button" className="btn btn-ghost" onClick={onClose}>Cancelar</button>
            <button type="submit" className="btn btn-gold" disabled={loading}>{loading ? 'Salvando...' : 'Salvar Módulo'}</button>
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
    try { const { data } = await api.get('/categories'); setCategories(data.categories); }
    finally { setLoading(false); }
  };
  useEffect(() => { load(); }, []);

  const handleDelete = async (cat) => {
    if (!window.confirm(`Remover "${cat.name}"?`)) return;
    try { await api.delete(`/categories/${cat._id}`); setToast('Módulo removido.'); load(); }
    catch (err) { setToast(err.response?.data?.message || 'Erro ao remover.'); }
  };

  const handleToggleLogin = async (cat) => {
    try {
      await api.put(`/categories/${cat._id}`, { ...cat, requiresLogin: !cat.requiresLogin });
      load();
    } catch {}
  };

  useEffect(() => { if (toast) setTimeout(() => setToast(''), 3000); }, [toast]);

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 28, flexWrap: 'wrap', gap: 16 }}>
        <div>
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 28, fontWeight: 800, letterSpacing: '0.12em', color: 'var(--white)', marginBottom: 4 }}>MÓDULOS</h2>
          <p style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--white-faint)', letterSpacing: '0.1em' }}>
            // CATEGORIAS DE CONTEÚDO · {categories.length} MÓDULOS
          </p>
        </div>
        <button className="btn btn-gold" onClick={() => setModal({})} style={{ gap: 8 }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M12 5v14m-7-7h14"/></svg>
          NOVO MÓDULO
        </button>
      </div>

      {toast && (
        <div style={{ marginBottom: 16, padding: '12px 16px', background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 8, fontSize: 13 }}>{toast}</div>
      )}

      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: 60 }}><div className="spinner" /></div>
      ) : categories.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '60px 20px', background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 14 }}>
          <p style={{ color: 'var(--white-dim)', marginBottom: 16, fontSize: 16, fontFamily: 'var(--font-display)', letterSpacing: '0.06em' }}>Nenhum módulo criado ainda.</p>
          <button className="btn btn-gold" onClick={() => setModal({})}>Criar primeiro módulo</button>
        </div>
      ) : (
        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Ícone</th>
                  <th>Nome</th>
                  <th>Seção no app</th>
                  <th>Acesso</th>
                  <th>Itens</th>
                  <th>Ordem</th>
                  <th>Ações</th>
                </tr>
              </thead>
              <tbody>
                {categories.map(cat => (
                  <tr key={cat._id}>
                    <td><IconPreview iconName={cat.icon} colorKey={cat.iconColor} size={22} /></td>
                    <td style={{ fontWeight: 700, color: 'var(--white)' }}>{cat.name}</td>
                    <td style={{ color: 'var(--gold)', fontSize: 11, letterSpacing: '0.08em', fontFamily: 'var(--font-mono)' }}>
                      {cat.sectionLabel || <span style={{ color: 'var(--white-faint)', fontStyle: 'italic' }}>padrão</span>}
                    </td>
                    <td>
                      <button
                        onClick={() => handleToggleLogin(cat)}
                        style={{
                          display: 'inline-flex', alignItems: 'center', gap: 5, padding: '4px 10px', borderRadius: 6,
                          background: cat.requiresLogin ? 'rgba(192,57,43,0.12)' : 'rgba(90,158,58,0.1)',
                          border: `1px solid ${cat.requiresLogin ? 'rgba(192,57,43,0.3)' : 'rgba(90,158,58,0.3)'}`,
                          color: cat.requiresLogin ? '#E05A4A' : '#6EBF48',
                          fontSize: 11, fontFamily: 'var(--font-mono)', letterSpacing: '0.06em', cursor: 'pointer',
                          fontWeight: 700, transition: 'all 0.15s',
                        }}
                        title={cat.requiresLogin ? 'Clique para tornar público' : 'Clique para exigir login'}
                      >
                        {cat.requiresLogin ? '🔒 Login' : '🌐 Público'}
                      </button>
                    </td>
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

import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', email: '', password: '', confirm: '', adminSecret: '' });
  const [error, setError] = useState('');
  const [fieldErrors, setFieldErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [showAdminSecret, setShowAdminSecret] = useState(false);

  const validate = () => {
    const errs = {};
    if (form.name.length < 2) errs.name = 'Nome muito curto.';
    if (!/^\S+@\S+\.\S+$/.test(form.email)) errs.email = 'Email inválido.';
    if (form.password.length < 8) errs.password = 'Mínimo 8 caracteres.';
    else if (!/[A-Z]/.test(form.password)) errs.password = 'Precisa de letra maiúscula.';
    else if (!/[0-9]/.test(form.password)) errs.password = 'Precisa de número.';
    if (form.password !== form.confirm) errs.confirm = 'Senhas não coincidem.';
    return errs;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    const errs = validate();
    setFieldErrors(errs);
    if (Object.keys(errs).length > 0) return;
    setLoading(true);
    try {
      const user = await register(form.name, form.email, form.password, form.adminSecret || undefined);
      navigate(user.role === 'admin' ? '/admin' : '/');
    } catch (err) {
      const data = err.response?.data;
      if (data?.errors) {
        const fe = {};
        data.errors.forEach(e => { fe[e.path || e.param] = e.msg; });
        setFieldErrors(fe);
      } else {
        setError(data?.message || 'Erro ao cadastrar.');
      }
    } finally {
      setLoading(false);
    }
  };

  const pw = form.password;
  const strength = [pw.length >= 8, /[A-Z]/.test(pw), /[0-9]/.test(pw), /[^A-Za-z0-9]/.test(pw)].filter(Boolean).length;
  const strengthColors = ['#f87171', '#fb923c', '#facc15', '#4ade80'];
  const strengthLabels = ['Fraca', 'Regular', 'Boa', 'Forte'];

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-dark)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
      <div style={{ width: '100%', maxWidth: 440, animation: 'fadeUp 0.4s ease' }}>
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 32, letterSpacing: '0.15em', color: 'var(--gold)', marginBottom: 4 }}>C.H.D.I</h1>
          <p style={{ color: 'var(--white-dim)', fontSize: 13, textTransform: 'uppercase', letterSpacing: '0.08em' }}>Criar conta</p>
        </div>

        <div className="card" style={{ borderColor: 'var(--border-strong)' }}>
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 22, color: 'var(--white)', letterSpacing: '0.1em', marginBottom: 20 }}>CADASTRO</h2>

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label">Nome completo</label>
              <input className="form-input" required placeholder="Ex: João Silva" value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} />
              {fieldErrors.name && <span className="form-error">{fieldErrors.name}</span>}
            </div>
            <div className="form-group">
              <label className="form-label">Email</label>
              <input className="form-input" type="email" required placeholder="seu@email.com" value={form.email} onChange={e => setForm(p => ({ ...p, email: e.target.value }))} autoComplete="email" />
              {fieldErrors.email && <span className="form-error">{fieldErrors.email}</span>}
            </div>
            <div className="form-group">
              <label className="form-label">Senha</label>
              <input className="form-input" type="password" required placeholder="Mín. 8 caracteres, 1 maiúscula, 1 número" value={form.password} onChange={e => setForm(p => ({ ...p, password: e.target.value }))} autoComplete="new-password" />
              {pw && (
                <div style={{ marginTop: 6 }}>
                  <div style={{ display: 'flex', gap: 4, marginBottom: 4 }}>
                    {[0,1,2,3].map(i => (
                      <div key={i} style={{ flex: 1, height: 3, borderRadius: 2, background: i < strength ? strengthColors[strength - 1] : 'var(--border)' }} />
                    ))}
                  </div>
                  <span style={{ fontSize: 11, color: strength > 0 ? strengthColors[strength - 1] : 'var(--white-dim)' }}>{strength > 0 ? strengthLabels[strength - 1] : ''}</span>
                </div>
              )}
              {fieldErrors.password && <span className="form-error">{fieldErrors.password}</span>}
            </div>
            <div className="form-group">
              <label className="form-label">Confirmar senha</label>
              <input className="form-input" type="password" required placeholder="Repita a senha" value={form.confirm} onChange={e => setForm(p => ({ ...p, confirm: e.target.value }))} autoComplete="new-password" />
              {fieldErrors.confirm && <span className="form-error">{fieldErrors.confirm}</span>}
            </div>

            <div style={{ marginBottom: 18 }}>
              <button type="button" onClick={() => setShowAdminSecret(!showAdminSecret)} style={{ background: 'none', border: 'none', color: 'var(--white-faint)', fontSize: 12, cursor: 'pointer', padding: 0, fontFamily: 'var(--font-body)', letterSpacing: '0.06em' }}>
                {showAdminSecret ? '▲' : '▶'} Chave de administrador (opcional)
              </button>
              {showAdminSecret && (
                <div style={{ marginTop: 8 }}>
                  <input className="form-input" type="password" placeholder="Chave de administrador" value={form.adminSecret} onChange={e => setForm(p => ({ ...p, adminSecret: e.target.value }))} />
                </div>
              )}
            </div>

            {error && <div className="form-error" style={{ marginBottom: 16, padding: '10px 14px', background: 'rgba(248,113,113,0.08)', borderRadius: 8 }}>{error}</div>}

            <button type="submit" className="btn btn-gold" style={{ width: '100%', fontSize: 15 }} disabled={loading}>
              {loading ? 'Cadastrando...' : 'CRIAR CONTA'}
            </button>
          </form>

          <div className="divider" />
          <p style={{ textAlign: 'center', color: 'var(--white-dim)', fontSize: 14 }}>
            Já tem conta? <Link to="/login" style={{ color: 'var(--gold)', fontWeight: 700, textDecoration: 'none' }}>Entrar</Link>
          </p>
        </div>
      </div>
    </div>
  );
}

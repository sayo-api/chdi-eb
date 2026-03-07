import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const user = await login(form.email, form.password);
      navigate(user.role === 'admin' ? '/admin' : '/');
    } catch (err) {
      setError(err.response?.data?.message || 'Erro ao fazer login.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-dark)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20, position: 'relative', overflow: 'hidden' }}>
      {/* Background pattern */}
      <div style={{ position: 'absolute', inset: 0, backgroundImage: 'radial-gradient(circle at 30% 30%, rgba(45,80,22,0.12) 0%, transparent 60%), radial-gradient(circle at 70% 70%, rgba(201,162,39,0.06) 0%, transparent 60%)', pointerEvents: 'none' }} />
      
      <div style={{ width: '100%', maxWidth: 420, animation: 'fadeUp 0.4s ease' }}>
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: 36 }}>
          <div style={{ width: 64, height: 64, margin: '0 auto 16px' }}>
            <svg viewBox="0 0 64 64" fill="none">
              <polygon points="32,6 40,24 60,24 44,38 50,58 32,46 14,58 20,38 4,24 24,24" fill="none" stroke="#C9A227" strokeWidth="2"/>
              <circle cx="32" cy="32" r="8" fill="rgba(201,162,39,0.2)" stroke="#C9A227" strokeWidth="1.5"/>
            </svg>
          </div>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 36, letterSpacing: '0.15em', color: 'var(--gold)', marginBottom: 6 }}>C.H.D.I</h1>
          <p style={{ color: 'var(--white-dim)', fontSize: 13, letterSpacing: '0.08em', textTransform: 'uppercase' }}>Centro de Hinos e Danças Institucionais</p>
        </div>

        <div className="card" style={{ borderColor: 'var(--border-strong)' }}>
          <div style={{ marginBottom: 24 }}>
            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 24, color: 'var(--white)', letterSpacing: '0.1em', marginBottom: 4 }}>ACESSO</h2>
            <p style={{ color: 'var(--white-dim)', fontSize: 14 }}>Entre com suas credenciais</p>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label">Email</label>
              <input className="form-input" type="email" required placeholder="seu@email.com" value={form.email} onChange={e => setForm(p => ({ ...p, email: e.target.value }))} autoComplete="email" />
            </div>
            <div className="form-group">
              <label className="form-label">Senha</label>
              <input className="form-input" type="password" required placeholder="••••••••" value={form.password} onChange={e => setForm(p => ({ ...p, password: e.target.value }))} autoComplete="current-password" />
            </div>

            {error && <div className="form-error" style={{ marginBottom: 16, padding: '10px 14px', background: 'rgba(248,113,113,0.08)', borderRadius: 8 }}>{error}</div>}

            <button type="submit" className="btn btn-gold" style={{ width: '100%', fontSize: 15 }} disabled={loading}>
              {loading ? 'Entrando...' : 'ENTRAR'}
            </button>
          </form>

          <div className="divider" />
          <p style={{ textAlign: 'center', color: 'var(--white-dim)', fontSize: 14 }}>
            Não tem conta? <Link to="/register" style={{ color: 'var(--gold)', fontWeight: 700, textDecoration: 'none' }}>Cadastrar</Link>
          </p>
        </div>
      </div>
    </div>
  );
}

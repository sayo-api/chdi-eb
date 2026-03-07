import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function AdminLoginModal({ onClose }) {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [show, setShow] = useState(false);
  const emailRef = useRef(null);

  // Animate in
  useEffect(() => {
    const t = setTimeout(() => {
      setShow(true);
      emailRef.current?.focus();
    }, 20);
    return () => clearTimeout(t);
  }, []);

  // Close on ESC
  useEffect(() => {
    const handler = (e) => { if (e.key === 'Escape') handleClose(); };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, []);

  const handleClose = () => {
    setShow(false);
    setTimeout(onClose, 250);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const user = await login(form.email, form.password);
      if (user.role !== 'admin') {
        setError('Acesso restrito a administradores.');
        setLoading(false);
        return;
      }
      setShow(false);
      setTimeout(() => { onClose(); navigate('/admin'); }, 200);
    } catch (err) {
      setError(err.response?.data?.message || 'Credenciais inválidas.');
      setLoading(false);
    }
  };

  return (
    <div
      onClick={(e) => e.target === e.currentTarget && handleClose()}
      style={{
        position: 'fixed', inset: 0, zIndex: 9999,
        background: 'rgba(0,0,0,0.85)',
        backdropFilter: 'blur(8px)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: 20,
        opacity: show ? 1 : 0,
        transition: 'opacity 0.25s ease',
      }}>

      <div style={{
        width: '100%', maxWidth: 380,
        background: '#0D1808',
        border: '1px solid rgba(212,175,55,0.25)',
        borderRadius: 16,
        overflow: 'hidden',
        boxShadow: '0 32px 80px rgba(0,0,0,0.7), 0 0 0 1px rgba(212,175,55,0.08)',
        transform: show ? 'translateY(0) scale(1)' : 'translateY(20px) scale(0.97)',
        transition: 'transform 0.25s cubic-bezier(0.4,0,0.2,1)',
      }}>

        {/* Top stripe */}
        <div style={{ height: 3, background: 'linear-gradient(90deg, transparent, #D4AF37, transparent)' }} />

        {/* Header */}
        <div style={{ padding: '22px 24px 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            {/* Lock icon */}
            <div style={{ width: 36, height: 36, borderRadius: 8, background: 'rgba(212,175,55,0.1)', border: '1px solid rgba(212,175,55,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#D4AF37" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
                <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
              </svg>
            </div>
            <div>
              <p style={{ fontFamily: 'var(--font-display)', fontSize: 15, letterSpacing: '0.12em', color: '#D4AF37', lineHeight: 1.2 }}>ACESSO RESTRITO</p>
              <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.35)', letterSpacing: '0.06em' }}>PAINEL ADMINISTRATIVO</p>
            </div>
          </div>
          <button onClick={handleClose}
            style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.3)', cursor: 'pointer', padding: 4, borderRadius: 6, fontSize: 20, lineHeight: 1, transition: 'color 0.15s' }}
            onMouseEnter={e => e.currentTarget.style.color = 'rgba(255,255,255,0.7)'}
            onMouseLeave={e => e.currentTarget.style.color = 'rgba(255,255,255,0.3)'}>
            ×
          </button>
        </div>

        {/* Divider */}
        <div style={{ height: 1, background: 'rgba(255,255,255,0.06)', margin: '0 24px' }} />

        {/* Form */}
        <form onSubmit={handleSubmit} style={{ padding: '20px 24px 24px' }}>
          <div style={{ marginBottom: 14 }}>
            <label style={{ display: 'block', fontSize: 11, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.45)', marginBottom: 6 }}>
              Email
            </label>
            <input
              ref={emailRef}
              type="email"
              required
              autoComplete="email"
              value={form.email}
              onChange={e => setForm(p => ({ ...p, email: e.target.value }))}
              placeholder="admin@chdi.mil.br"
              style={{
                width: '100%', padding: '10px 14px',
                background: 'rgba(255,255,255,0.04)',
                border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: 8, color: '#fff',
                fontSize: 14, outline: 'none',
                transition: 'border-color 0.15s',
                fontFamily: 'inherit',
              }}
              onFocus={e => e.target.style.borderColor = 'rgba(212,175,55,0.5)'}
              onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.1)'}
            />
          </div>

          <div style={{ marginBottom: 20 }}>
            <label style={{ display: 'block', fontSize: 11, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.45)', marginBottom: 6 }}>
              Senha
            </label>
            <input
              type="password"
              required
              autoComplete="current-password"
              value={form.password}
              onChange={e => setForm(p => ({ ...p, password: e.target.value }))}
              placeholder="••••••••"
              style={{
                width: '100%', padding: '10px 14px',
                background: 'rgba(255,255,255,0.04)',
                border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: 8, color: '#fff',
                fontSize: 14, outline: 'none',
                transition: 'border-color 0.15s',
                fontFamily: 'inherit',
              }}
              onFocus={e => e.target.style.borderColor = 'rgba(212,175,55,0.5)'}
              onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.1)'}
            />
          </div>

          {error && (
            <div style={{ marginBottom: 16, padding: '9px 12px', background: 'rgba(248,113,113,0.08)', border: '1px solid rgba(248,113,113,0.2)', borderRadius: 7, fontSize: 13, color: '#f87171' }}>
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            style={{
              width: '100%', padding: '11px',
              background: loading ? 'rgba(212,175,55,0.4)' : 'linear-gradient(135deg, #D4AF37, #A08020)',
              border: 'none', borderRadius: 8,
              color: '#0A1208', fontWeight: 800, fontSize: 13,
              letterSpacing: '0.12em', cursor: loading ? 'not-allowed' : 'pointer',
              fontFamily: 'var(--font-display)',
              transition: 'all 0.2s',
              boxShadow: loading ? 'none' : '0 4px 16px rgba(212,175,55,0.2)',
            }}
            onMouseEnter={e => { if (!loading) e.currentTarget.style.transform = 'translateY(-1px)'; }}
            onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; }}>
            {loading ? (
              <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
                <span style={{ width: 13, height: 13, border: '2px solid rgba(0,0,0,0.3)', borderTopColor: '#0A1208', borderRadius: '50%', display: 'inline-block', animation: 'spin 0.7s linear infinite' }} />
                AUTENTICANDO...
              </span>
            ) : 'ENTRAR NO PAINEL'}
          </button>

          <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        </form>
      </div>
    </div>
  );
}

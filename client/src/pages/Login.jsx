import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPw, setShowPw] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const user = await login(form.email, form.password);
      navigate(user.role === 'admin' ? '/admin' : '/');
    } catch (err) {
      setError(err.response?.data?.message || 'Credenciais inválidas.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: 'var(--bg-dark)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '24px',
      position: 'relative',
      overflow: 'hidden',
    }}>
      {/* Decorative lines */}
      <div style={{ position:'absolute', inset:0, pointerEvents:'none', overflow:'hidden' }}>
        <div style={{ position:'absolute', top:'10%', left:0, right:0, height:'1px', background:'linear-gradient(90deg, transparent, rgba(201,162,39,0.08), transparent)' }} />
        <div style={{ position:'absolute', bottom:'15%', left:0, right:0, height:'1px', background:'linear-gradient(90deg, transparent, rgba(201,162,39,0.06), transparent)' }} />
        <div style={{ position:'absolute', top:0, bottom:0, left:'12%', width:'1px', background:'linear-gradient(180deg, transparent, rgba(244,242,236,0.03), transparent)' }} />
        <div style={{ position:'absolute', top:0, bottom:0, right:'12%', width:'1px', background:'linear-gradient(180deg, transparent, rgba(244,242,236,0.03), transparent)' }} />
        {/* Corner brackets */}
        {[['top:24px','left:24px','borderTop','borderLeft'],['top:24px','right:24px','borderTop','borderRight'],['bottom:24px','left:24px','borderBottom','borderLeft'],['bottom:24px','right:24px','borderBottom','borderRight']].map(([v,h,b1,b2],i) => (
          <div key={i} style={{ position:'absolute', [v.split(':')[0]]:v.split(':')[1], [h.split(':')[0]]:h.split(':')[1], width:28, height:28, [b1.replace('border','').toLowerCase()]:b1, [b2.replace('border','').toLowerCase()]:b2, borderWidth:1, borderStyle:'solid', borderColor:'rgba(201,162,39,0.2)', borderRadius:2 }} />
        ))}
      </div>

      <div style={{ width:'100%', maxWidth:400, animation:'fadeUp 0.5s cubic-bezier(0.4,0,0.2,1) both' }}>
        {/* Logo area */}
        <div style={{ textAlign:'center', marginBottom:36 }}>
          {/* Military star emblem */}
          <div style={{ position:'relative', width:72, height:72, margin:'0 auto 20px', display:'flex', alignItems:'center', justifyContent:'center' }}>
            <div style={{ position:'absolute', inset:0, borderRadius:'50%', border:'1px solid rgba(201,162,39,0.25)', animation:'glow 3s ease infinite' }} />
            <div style={{ position:'absolute', inset:6, borderRadius:'50%', border:'1px solid rgba(201,162,39,0.12)' }} />
            <svg width="38" height="38" viewBox="0 0 24 24" fill="none">
              <polygon points="12,2 15,9 22,9 17,14 19,21 12,17 5,21 7,14 2,9 9,9" stroke="#C9A227" strokeWidth="1.5" fill="rgba(201,162,39,0.15)" strokeLinejoin="round"/>
              <circle cx="12" cy="12" r="2" fill="#C9A227" opacity="0.8"/>
            </svg>
          </div>
          <h1 style={{ fontFamily:'var(--font-display)', fontSize:42, fontWeight:800, letterSpacing:'0.2em', color:'var(--gold)', marginBottom:6, lineHeight:1 }}>C.H.D.I</h1>
          <div style={{ display:'flex', alignItems:'center', justifyContent:'center', gap:8, marginBottom:6 }}>
            <div style={{ height:1, width:40, background:'linear-gradient(90deg, transparent, rgba(201,162,39,0.4))' }} />
            <span style={{ fontFamily:'var(--font-mono)', fontSize:9, letterSpacing:'0.25em', color:'var(--white-faint)', textTransform:'uppercase' }}>Exército Brasileiro</span>
            <div style={{ height:1, width:40, background:'linear-gradient(90deg, rgba(201,162,39,0.4), transparent)' }} />
          </div>
          <p style={{ fontFamily:'var(--font-display)', fontSize:12, letterSpacing:'0.2em', color:'var(--white-faint)', textTransform:'uppercase' }}>Centro de Hinos e Danças Institucionais</p>
        </div>

        {/* Card */}
        <div style={{
          background:'rgba(19,31,16,0.9)',
          border:'1px solid rgba(201,162,39,0.25)',
          borderRadius:16,
          padding:'32px',
          backdropFilter:'blur(10px)',
          boxShadow:'0 20px 60px rgba(0,0,0,0.6), 0 0 0 1px rgba(201,162,39,0.05)',
        }}>
          <div style={{ marginBottom:24 }}>
            <h2 style={{ fontFamily:'var(--font-display)', fontSize:26, fontWeight:800, letterSpacing:'0.15em', color:'var(--white)', marginBottom:4 }}>ACESSO ADMINISTRATIVO</h2>
            <p style={{ fontFamily:'var(--font-mono)', fontSize:11, color:'var(--white-faint)', letterSpacing:'0.1em' }}>// SISTEMA RESTRITO — CREDENCIAIS NECESSÁRIAS</p>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label">Email</label>
              <div style={{ position:'relative' }}>
                <div style={{ position:'absolute', left:12, top:'50%', transform:'translateY(-50%)', opacity:0.4, pointerEvents:'none' }}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>
                </div>
                <input
                  className="form-input"
                  type="email"
                  required
                  placeholder="admin@exercito.mil.br"
                  value={form.email}
                  onChange={e => setForm(p => ({ ...p, email: e.target.value }))}
                  autoComplete="email"
                  style={{ paddingLeft: 38 }}
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Senha</label>
              <div style={{ position:'relative' }}>
                <div style={{ position:'absolute', left:12, top:'50%', transform:'translateY(-50%)', opacity:0.4, pointerEvents:'none' }}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
                </div>
                <input
                  className="form-input"
                  type={showPw ? 'text' : 'password'}
                  required
                  placeholder="••••••••••"
                  value={form.password}
                  onChange={e => setForm(p => ({ ...p, password: e.target.value }))}
                  autoComplete="current-password"
                  style={{ paddingLeft: 38, paddingRight: 42 }}
                />
                <button type="button" onClick={() => setShowPw(v => !v)}
                  style={{ position:'absolute', right:12, top:'50%', transform:'translateY(-50%)', background:'none', border:'none', color:'var(--white-faint)', padding:4, cursor:'pointer' }}>
                  {showPw
                    ? <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/></svg>
                    : <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                  }
                </button>
              </div>
            </div>

            {error && (
              <div style={{ marginBottom:16, padding:'10px 14px', background:'rgba(192,57,43,0.1)', border:'1px solid rgba(192,57,43,0.3)', borderRadius:8, color:'#E05A4A', fontSize:13, fontWeight:600, display:'flex', alignItems:'center', gap:8 }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
                {error}
              </div>
            )}

            <button type="submit" className="btn btn-gold" style={{ width:'100%', fontSize:16, padding:'13px', letterSpacing:'0.2em' }} disabled={loading}>
              {loading ? (
                <span style={{ display:'flex', alignItems:'center', gap:10 }}>
                  <div style={{ width:16, height:16, border:'2px solid rgba(0,0,0,0.3)', borderTopColor:'#0A0F08', borderRadius:'50%', animation:'spin 0.7s linear infinite' }} />
                  AUTENTICANDO...
                </span>
              ) : (
                <span style={{ display:'flex', alignItems:'center', gap:10 }}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"/><polyline points="10,17 15,12 10,7"/><line x1="15" y1="12" x2="3" y2="12"/></svg>
                  ENTRAR NO SISTEMA
                </span>
              )}
            </button>
          </form>

          <div style={{ marginTop:20, paddingTop:20, borderTop:'1px solid var(--border)', textAlign:'center' }}>
            <p style={{ color:'var(--white-faint)', fontSize:12, fontFamily:'var(--font-mono)', letterSpacing:'0.08em' }}>
              Acesso ao painel administrativo
            </p>
            <p style={{ marginTop:6, color:'var(--white-dim)', fontSize:13 }}>
              Não tem conta? <Link to="/register" style={{ color:'var(--gold)', fontWeight:700 }}>Cadastrar Admin</Link>
            </p>
          </div>
        </div>

        {/* Footer */}
        <div style={{ textAlign:'center', marginTop:20 }}>
          <Link to="/" style={{ fontFamily:'var(--font-mono)', fontSize:10, letterSpacing:'0.15em', color:'var(--white-faint)', textDecoration:'none' }}>
            ← VOLTAR AO APLICATIVO
          </Link>
        </div>
      </div>
    </div>
  );
}

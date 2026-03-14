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
  const [showPw, setShowPw] = useState(false);
  const [showSecret, setShowSecret] = useState(false);

  const validate = () => {
    const errs = {};
    if (form.name.length < 2) errs.name = 'Nome muito curto.';
    if (!/^\S+@\S+\.\S+$/.test(form.email)) errs.email = 'Email inválido.';
    if (form.password.length < 8) errs.password = 'Mínimo 8 caracteres.';
    else if (!/[A-Z]/.test(form.password)) errs.password = 'Precisa de letra maiúscula.';
    else if (!/[0-9]/.test(form.password)) errs.password = 'Precisa de número.';
    if (form.password !== form.confirm) errs.confirm = 'Senhas não coincidem.';
    if (!form.adminSecret) errs.adminSecret = 'Código obrigatório para cadastro de administrador.';
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
      const user = await register(form.name, form.email, form.password, form.adminSecret);
      navigate('/admin');
    } catch (err) {
      const data = err.response?.data;
      if (data?.errors) {
        const fe = {};
        data.errors.forEach(e => { fe[e.path || e.param] = e.msg; });
        setFieldErrors(fe);
      } else {
        setError(data?.message || 'Erro ao cadastrar administrador.');
      }
    } finally { setLoading(false); }
  };

  const pw = form.password;
  const strength = [pw.length >= 8, /[A-Z]/.test(pw), /[0-9]/.test(pw), /[^A-Za-z0-9]/.test(pw)].filter(Boolean).length;
  const strengthColors = ['#E05A4A', '#fb923c', '#facc15', '#6EBF48'];
  const strengthLabels = ['Fraca', 'Regular', 'Boa', 'Forte'];

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
      {/* Corner decorations */}
      <div style={{ position:'absolute', inset:0, pointerEvents:'none' }}>
        {[['top:16px','left:16px','1px 0 0 1px'],['top:16px','right:16px','1px 1px 0 0'],['bottom:16px','left:16px','0 0 1px 1px'],['bottom:16px','right:16px','0 1px 1px 0']].map(([v,h,bw],i) => (
          <div key={i} style={{ position:'absolute', [v.split(':')[0]]:v.split(':')[1], [h.split(':')[0]]:h.split(':')[1], width:24, height:24, borderWidth:bw, borderStyle:'solid', borderColor:'rgba(201,162,39,0.15)' }} />
        ))}
      </div>

      <div style={{ width:'100%', maxWidth:440, animation:'fadeUp 0.5s ease both' }}>
        <div style={{ textAlign:'center', marginBottom:28 }}>
          <div style={{ display:'inline-flex', alignItems:'center', gap:8, padding:'6px 16px', borderRadius:100, border:'1px solid rgba(201,162,39,0.25)', background:'rgba(201,162,39,0.06)', marginBottom:16 }}>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#C9A227" strokeWidth="2.5" strokeLinecap="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
            <span style={{ fontFamily:'var(--font-mono)', fontSize:10, letterSpacing:'0.2em', color:'var(--gold)' }}>ACESSO RESTRITO — SOMENTE ADMIN</span>
          </div>
          <h1 style={{ fontFamily:'var(--font-display)', fontSize:38, fontWeight:800, letterSpacing:'0.15em', color:'var(--gold)', marginBottom:4 }}>C.H.D.I</h1>
          <p style={{ fontFamily:'var(--font-display)', fontSize:12, letterSpacing:'0.2em', color:'var(--white-faint)', textTransform:'uppercase' }}>Cadastro de Administrador</p>
        </div>

        <div style={{
          background:'rgba(19,31,16,0.95)',
          border:'1px solid rgba(201,162,39,0.2)',
          borderRadius:16, padding:'28px',
          backdropFilter:'blur(10px)',
          boxShadow:'0 20px 60px rgba(0,0,0,0.5)',
        }}>
          <div style={{ display:'flex', alignItems:'center', gap:10, padding:'10px 14px', background:'rgba(201,162,39,0.07)', border:'1px solid rgba(201,162,39,0.2)', borderRadius:8, marginBottom:24 }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#C9A227" strokeWidth="2" strokeLinecap="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
            <span style={{ fontSize:12, color:'var(--gold)', fontWeight:600 }}>Código de administrador obrigatório para criar conta</span>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label">Nome completo</label>
              <input className="form-input" required placeholder="Cap. João Pereira" value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} />
              {fieldErrors.name && <span className="form-error">{fieldErrors.name}</span>}
            </div>
            <div className="form-group">
              <label className="form-label">Email</label>
              <input className="form-input" type="email" required placeholder="admin@exercito.mil.br" value={form.email} onChange={e => setForm(p => ({ ...p, email: e.target.value }))} autoComplete="email" />
              {fieldErrors.email && <span className="form-error">{fieldErrors.email}</span>}
            </div>
            <div className="form-group">
              <label className="form-label">Senha</label>
              <div style={{ position:'relative' }}>
                <input className="form-input" type={showPw ? 'text' : 'password'} required placeholder="Mín. 8 chars, 1 maiúscula, 1 número" value={form.password} onChange={e => setForm(p => ({ ...p, password: e.target.value }))} autoComplete="new-password" style={{ paddingRight:40 }} />
                <button type="button" onClick={() => setShowPw(v=>!v)} style={{ position:'absolute',right:12,top:'50%',transform:'translateY(-50%)',background:'none',border:'none',color:'var(--white-faint)',padding:4,cursor:'pointer' }}>
                  {showPw ? <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/></svg>
                  : <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>}
                </button>
              </div>
              {pw && (
                <div style={{ marginTop:8 }}>
                  <div style={{ display:'flex', gap:3, marginBottom:4 }}>
                    {[0,1,2,3].map(i => (
                      <div key={i} style={{ flex:1, height:2, borderRadius:1, background: i < strength ? strengthColors[strength-1] : 'var(--border-mid)', transition:'background 0.3s' }} />
                    ))}
                  </div>
                  <span style={{ fontSize:11, fontFamily:'var(--font-mono)', color: strength > 0 ? strengthColors[strength-1] : 'var(--white-faint)' }}>
                    {strength > 0 ? `FORÇA: ${strengthLabels[strength-1].toUpperCase()}` : ''}
                  </span>
                </div>
              )}
              {fieldErrors.password && <span className="form-error">{fieldErrors.password}</span>}
            </div>
            <div className="form-group">
              <label className="form-label">Confirmar senha</label>
              <input className="form-input" type="password" required placeholder="Repita a senha" value={form.confirm} onChange={e => setForm(p => ({ ...p, confirm: e.target.value }))} autoComplete="new-password" />
              {fieldErrors.confirm && <span className="form-error">{fieldErrors.confirm}</span>}
            </div>

            {/* Admin secret - required */}
            <div className="form-group">
              <label className="form-label" style={{ color:'var(--gold)' }}>
                <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" style={{ marginRight:4 }}><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
                Código de Administrador *
              </label>
              <div style={{ position:'relative' }}>
                <input className="form-input" type={showSecret ? 'text' : 'password'} required placeholder="Insira o código de autorização" value={form.adminSecret} onChange={e => setForm(p => ({ ...p, adminSecret: e.target.value }))} style={{ borderColor: fieldErrors.adminSecret ? 'rgba(192,57,43,0.5)' : undefined, paddingRight:40 }} />
                <button type="button" onClick={() => setShowSecret(v=>!v)} style={{ position:'absolute',right:12,top:'50%',transform:'translateY(-50%)',background:'none',border:'none',color:'var(--white-faint)',padding:4,cursor:'pointer' }}>
                  {showSecret ? <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/></svg>
                  : <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>}
                </button>
              </div>
              {fieldErrors.adminSecret && <span className="form-error">{fieldErrors.adminSecret}</span>}
            </div>

            {error && (
              <div style={{ marginBottom:16, padding:'10px 14px', background:'rgba(192,57,43,0.1)', border:'1px solid rgba(192,57,43,0.3)', borderRadius:8, color:'#E05A4A', fontSize:13, fontWeight:600 }}>
                {error}
              </div>
            )}

            <button type="submit" className="btn btn-gold" style={{ width:'100%', fontSize:15, letterSpacing:'0.15em' }} disabled={loading}>
              {loading ? 'CADASTRANDO...' : 'CRIAR CONTA DE ADMINISTRADOR'}
            </button>
          </form>

          <div style={{ marginTop:20, paddingTop:20, borderTop:'1px solid var(--border)', textAlign:'center' }}>
            <p style={{ color:'var(--white-dim)', fontSize:13 }}>
              Já tem conta? <Link to="/login" style={{ color:'var(--gold)', fontWeight:700 }}>Entrar</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

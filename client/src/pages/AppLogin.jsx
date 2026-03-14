import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';
import { useAppAuth } from '../context/AppAuthContext';
import { RankChip } from '../components/RankBadge';

export default function AppLogin() {
  const [step, setStep] = useState('number');
  const [soldierNumber, setSoldierNumber] = useState('');
  const [userName, setUserName] = useState('');
  const [userRank, setUserRank] = useState('Soldado');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { loginApp } = useAppAuth();
  const navigate = useNavigate();

  const handleCheckNumber = async (e) => {
    e.preventDefault();
    if (!soldierNumber.trim()) return setError('Digite seu número de soldado.');
    setLoading(true); setError('');
    try {
      const { data } = await api.post('/app-users/check', { soldierNumber: soldierNumber.trim() });
      setUserName(data.name);
      setUserRank(data.rank || 'Soldado');
      setStep(data.hasSetPassword ? 'login' : 'setPassword');
    } catch (err) {
      setError(err.response?.data?.message || 'Número não encontrado. Solicite acesso ao seu superior.');
    } finally { setLoading(false); }
  };

  const handleSetPassword = async (e) => {
    e.preventDefault();
    if (password.length < 4) return setError('Senha deve ter pelo menos 4 caracteres.');
    if (password !== confirmPassword) return setError('As senhas não coincidem.');
    setLoading(true); setError('');
    try {
      const { data } = await api.post('/app-users/set-password', { soldierNumber, password });
      loginApp(data.accessToken, data.user);
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.message || 'Erro ao criar senha.');
    } finally { setLoading(false); }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!password) return setError('Digite sua senha.');
    setLoading(true); setError('');
    try {
      const { data } = await api.post('/app-users/login', { soldierNumber, password });
      loginApp(data.accessToken, data.user);
      navigate('/');
    } catch (err) {
      if (err.response?.data?.needsSetup) setStep('setPassword');
      else setError(err.response?.data?.message || 'Número ou senha incorretos.');
    } finally { setLoading(false); }
  };

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-dark)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
      <div style={{ width: '100%', maxWidth: 420 }}>
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: 28 }}>
          <div style={{ width: 68, height: 68, borderRadius: '50%', background: 'rgba(201,162,39,0.1)', border: '2px solid rgba(201,162,39,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px', boxShadow: '0 0 30px rgba(201,162,39,0.1)' }}>
            <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="#C9A227" strokeWidth="1.4" strokeLinecap="round">
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>
            </svg>
          </div>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 24, fontWeight: 800, letterSpacing: '0.14em', color: 'var(--white)', marginBottom: 4 }}>
            ACESSO MILITAR
          </h1>
          <p style={{ fontFamily: 'var(--font-mono)', fontSize: 10, letterSpacing: '0.2em', color: 'var(--white-faint)', textTransform: 'uppercase' }}>
            1º RCG · C.H.D.I · Sistema Seguro
          </p>
        </div>

        <div className="card" style={{ padding: 28 }}>
          {/* Step indicator */}
          <div style={{ display: 'flex', gap: 4, marginBottom: 24 }}>
            {['Identificação', 'Senha', 'Acesso'].map((label, i) => {
              const stepMap = { number: 0, setPassword: 1, login: 1 };
              const current = stepMap[step] ?? 0;
              const done = i < current;
              const active = i === current;
              return (
                <div key={label} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
                  <div style={{ height: 3, width: '100%', borderRadius: 2, background: done || active ? 'var(--gold)' : 'var(--border)', opacity: active ? 1 : done ? 0.7 : 0.3, transition: 'all 0.3s' }} />
                  <span style={{ fontSize: 9, fontFamily: 'var(--font-mono)', letterSpacing: '0.1em', color: active ? 'var(--gold)' : done ? 'rgba(201,162,39,0.5)' : 'var(--white-faint)', textTransform: 'uppercase' }}>{label}</span>
                </div>
              );
            })}
          </div>

          {/* ── Step 1: Number ── */}
          {step === 'number' && (
            <form onSubmit={handleCheckNumber}>
              <div style={{ marginBottom: 20 }}>
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: 9, letterSpacing: '0.2em', color: 'var(--gold)', marginBottom: 8, textTransform: 'uppercase' }}>// NÚMERO DE IDENTIFICAÇÃO</div>
                <label className="form-label">Número do Soldado</label>
                <div style={{ position: 'relative' }}>
                  <span style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', fontFamily: 'var(--font-mono)', color: 'var(--white-faint)', fontSize: 14 }}>#</span>
                  <input className="form-input" placeholder="Ex: 5004" value={soldierNumber}
                    onChange={e => setSoldierNumber(e.target.value)}
                    style={{ paddingLeft: 28, fontFamily: 'var(--font-mono)', letterSpacing: '0.12em', fontSize: 18 }}
                    autoFocus />
                </div>
                <p style={{ fontSize: 11, color: 'var(--white-faint)', marginTop: 6, lineHeight: 1.4 }}>
                  Use o número fornecido pelo seu superior hierárquico
                </p>
              </div>
              {error && <div style={{ marginBottom: 16, padding: '10px 14px', background: 'rgba(192,57,43,0.1)', border: '1px solid rgba(192,57,43,0.3)', borderRadius: 8, color: '#E05A4A', fontSize: 13 }}>{error}</div>}
              <button type="submit" className="btn btn-gold" style={{ width: '100%', justifyContent: 'center' }} disabled={loading}>
                {loading ? 'Verificando...' : 'Verificar Número →'}
              </button>
            </form>
          )}

          {/* ── Soldier info (shown on steps 2 and 3) ── */}
          {(step === 'setPassword' || step === 'login') && (
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 16px', background: 'rgba(201,162,39,0.06)', border: '1px solid rgba(201,162,39,0.2)', borderRadius: 10, marginBottom: 22 }}>
                <div style={{ width: 44, height: 44, borderRadius: '50%', background: 'rgba(201,162,39,0.12)', border: '2px solid rgba(201,162,39,0.25)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'var(--font-display)', fontSize: 18, fontWeight: 800, color: 'var(--gold)', flexShrink: 0 }}>
                  {userName[0]?.toUpperCase()}
                </div>
                <div>
                  <div style={{ fontSize: 15, fontWeight: 800, color: 'var(--white)', marginBottom: 4 }}>{userName}</div>
                  <RankChip rank={userRank} size="sm" />
                  <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--white-faint)', marginTop: 4, letterSpacing: '0.08em' }}>#{soldierNumber}</div>
                </div>
              </div>

              {/* ── Step 2: Create password ── */}
              {step === 'setPassword' && (
                <form onSubmit={handleSetPassword}>
                  <div style={{ padding: '10px 14px', background: 'rgba(90,158,58,0.07)', border: '1px solid rgba(90,158,58,0.25)', borderRadius: 8, marginBottom: 18 }}>
                    <p style={{ fontSize: 12, color: '#6EBF48', lineHeight: 1.5 }}>
                      🔐 <strong>Primeiro acesso!</strong> Crie uma senha pessoal para entrar no sistema.
                    </p>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Criar Senha</label>
                    <input className="form-input" type="password" placeholder="Mínimo 4 caracteres" value={password} onChange={e => setPassword(e.target.value)} autoFocus />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Confirmar Senha</label>
                    <input className="form-input" type="password" placeholder="Repita a senha" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} />
                  </div>
                  {error && <div style={{ marginBottom: 16, padding: '10px 14px', background: 'rgba(192,57,43,0.1)', border: '1px solid rgba(192,57,43,0.3)', borderRadius: 8, color: '#E05A4A', fontSize: 13 }}>{error}</div>}
                  <button type="submit" className="btn btn-gold" style={{ width: '100%', justifyContent: 'center' }} disabled={loading}>
                    {loading ? 'Criando conta...' : '✓ Criar Senha e Entrar'}
                  </button>
                </form>
              )}

              {/* ── Step 3: Login ── */}
              {step === 'login' && (
                <form onSubmit={handleLogin}>
                  <div className="form-group">
                    <label className="form-label">Senha</label>
                    <input className="form-input" type="password" placeholder="Digite sua senha" value={password} onChange={e => setPassword(e.target.value)} autoFocus />
                  </div>
                  {error && <div style={{ marginBottom: 16, padding: '10px 14px', background: 'rgba(192,57,43,0.1)', border: '1px solid rgba(192,57,43,0.3)', borderRadius: 8, color: '#E05A4A', fontSize: 13 }}>{error}</div>}
                  <button type="submit" className="btn btn-gold" style={{ width: '100%', justifyContent: 'center' }} disabled={loading}>
                    {loading ? 'Entrando...' : '→ Acessar Sistema'}
                  </button>
                </form>
              )}

              <button onClick={() => { setStep('number'); setError(''); setPassword(''); setConfirmPassword(''); }} style={{ background: 'none', border: 'none', color: 'var(--white-faint)', fontSize: 12, cursor: 'pointer', marginTop: 16, display: 'block', textAlign: 'center', width: '100%', fontFamily: 'var(--font-mono)', transition: 'color 0.15s' }}
                onMouseEnter={e => e.currentTarget.style.color = 'var(--white-dim)'}
                onMouseLeave={e => e.currentTarget.style.color = 'var(--white-faint)'}>
                ← Usar outro número
              </button>
            </div>
          )}
        </div>

        <p style={{ textAlign: 'center', marginTop: 18, fontSize: 11, color: 'var(--white-faint)', fontFamily: 'var(--font-mono)', letterSpacing: '0.08em', lineHeight: 1.5 }}>
          Sem acesso? Solicite ao seu superior hierárquico.<br />
          <span style={{ opacity: 0.5 }}>Acesso restrito ao efetivo do 1º RCG</span>
        </p>
      </div>
    </div>
  );
}

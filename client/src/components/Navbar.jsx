import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import AdminLoginModal from './AdminLoginModal';
import { useState, useRef } from 'react';

// Secret: 5 clicks on logo within 3s
function useSecretTrigger(threshold = 5, windowMs = 3000) {
  const [show, setShow] = useState(false);
  const clicks = useRef([]);
  const handleClick = () => {
    const now = Date.now();
    clicks.current = clicks.current.filter(t => now - t < windowMs);
    clicks.current.push(now);
    if (clicks.current.length >= threshold) {
      clicks.current = [];
      setShow(true);
    }
  };
  return { show, open: handleClick, close: () => setShow(false) };
}

export default function Navbar() {
  const { user, logout, isAdmin } = useAuth();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const secret = useSecretTrigger(5, 3000);

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  return (
    <>
      <nav style={{
        background: 'rgba(10,18,8,0.95)', backdropFilter: 'blur(12px)',
        borderBottom: '1px solid var(--border)', position: 'sticky', top: 0, zIndex: 100,
      }}>
        <div className="container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: 58, padding: '0 16px' }}>

          {/* Logo — SECRET TRIGGER: click 5× rápido */}
          <div
            onClick={secret.open}
            style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer', userSelect: 'none', textDecoration: 'none' }}>
            <Link to="/" onClick={e => e.stopPropagation()} style={{ display: 'flex', alignItems: 'center', gap: 10, textDecoration: 'none' }}>
              <div style={{ width: 32, height: 32 }}>
                <svg viewBox="0 0 32 32" fill="none">
                  <polygon points="16,3 20,12 30,12 22,19 25,29 16,23 7,29 10,19 2,12 12,12" fill="none" stroke="#C9A227" strokeWidth="1.5"/>
                  <circle cx="16" cy="16" r="4" fill="#C9A227" opacity="0.3"/>
                </svg>
              </div>
              <span style={{ fontFamily: 'var(--font-display)', fontSize: 22, letterSpacing: '0.15em', color: 'var(--gold)' }}>C.H.D.I</span>
            </Link>
          </div>

          {/* Right side */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            {user ? (
              <>
                {isAdmin && (
                  <Link to="/admin" className="btn btn-ghost btn-sm" style={{ fontSize: 12 }}>Painel Admin</Link>
                )}
                <div style={{ position: 'relative' }}>
                  <button onClick={() => setMenuOpen(!menuOpen)}
                    style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 8, padding: '6px 14px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8, color: 'var(--white)', fontFamily: 'var(--font-body)', fontWeight: 600, fontSize: 14 }}>
                    <div style={{ width: 28, height: 28, borderRadius: '50%', background: 'var(--gold-dim)', border: '1px solid var(--border-strong)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, color: 'var(--gold)', fontWeight: 700 }}>
                      {user.name[0].toUpperCase()}
                    </div>
                    <span>{user.name.split(' ')[0]}</span>
                  </button>
                  {menuOpen && (
                    <div style={{ position: 'absolute', right: 0, top: '110%', background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 10, minWidth: 160, overflow: 'hidden', boxShadow: '0 8px 32px rgba(0,0,0,0.5)' }}
                      onMouseLeave={() => setMenuOpen(false)}>
                      <div style={{ padding: '10px 14px', borderBottom: '1px solid var(--border)' }}>
                        <div style={{ fontSize: 12, color: 'var(--white-dim)', marginBottom: 2 }}>{user.email}</div>
                        {isAdmin && <span className="badge badge-gold">Admin</span>}
                      </div>
                      <button onClick={handleLogout}
                        style={{ width: '100%', padding: '10px 14px', background: 'none', border: 'none', color: '#f87171', cursor: 'pointer', textAlign: 'left', fontFamily: 'var(--font-body)', fontWeight: 600, fontSize: 14 }}>
                        Sair
                      </button>
                    </div>
                  )}
                </div>
              </>
            ) : (
              /* Sem usuário logado: nenhum link visível — acesso só pelo gatilho secreto */
              null
            )}
          </div>
        </div>
      </nav>

      {/* Hidden admin modal */}
      {secret.show && <AdminLoginModal onClose={secret.close} />}
    </>
  );
}

import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const navItems = [
  { to: '/admin', label: 'Dashboard', icon: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg>
  ), end: true },
  { to: '/admin/categorias', label: 'Categorias', icon: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/></svg>
  )},
  { to: '/admin/musicas', label: 'Músicas', icon: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 18V5l12-2v13"/><circle cx="6" cy="18" r="3"/><circle cx="18" cy="16" r="3"/></svg>
  )},
  { to: '/admin/videos', label: 'Vídeos', icon: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="23,7 16,12 23,17"/><rect x="1" y="5" width="15" height="14" rx="2"/></svg>
  )},
  { to: '/admin/pdfs', label: 'PDFs', icon: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14,2 14,8 20,8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10,9 9,9 8,9"/></svg>
  )},
];

export default function AdminLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-dark)', display: 'flex', flexDirection: 'column' }}>
      {/* Admin top bar */}
      <div style={{ background: 'var(--bg-card)', borderBottom: '1px solid var(--border)', padding: '12px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <NavLink to="/" style={{ color: 'var(--white-dim)', textDecoration: 'none', fontSize: 13 }}>← App</NavLink>
          <div style={{ width: 1, height: 16, background: 'var(--border)' }} />
          <span style={{ fontFamily: 'var(--font-display)', fontSize: 20, letterSpacing: '0.12em', color: 'var(--gold)' }}>PAINEL ADMIN</span>
          <span className="badge badge-gold">C.H.D.I</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <span style={{ fontSize: 13, color: 'var(--white-dim)' }}>{user?.name}</span>
          <button className="btn btn-ghost btn-sm" onClick={async () => { await logout(); navigate('/login'); }}>Sair</button>
        </div>
      </div>

      <div style={{ display: 'flex', flex: 1 }}>
        {/* Sidebar */}
        <aside style={{ width: 220, background: 'rgba(0,0,0,0.2)', borderRight: '1px solid var(--border)', padding: '20px 12px', flexShrink: 0 }}>
          <nav style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            {navItems.map(item => (
              <NavLink key={item.to} to={item.to} end={item.end}
                style={({ isActive }) => ({
                  display: 'flex', alignItems: 'center', gap: 10,
                  padding: '10px 14px', borderRadius: 8, textDecoration: 'none',
                  fontFamily: 'var(--font-body)', fontWeight: 700, fontSize: 14, letterSpacing: '0.05em',
                  color: isActive ? 'var(--gold)' : 'var(--white-dim)',
                  background: isActive ? 'var(--gold-dim)' : 'transparent',
                  border: isActive ? '1px solid var(--border-strong)' : '1px solid transparent',
                  transition: 'all 0.15s',
                })}>
                {item.icon}
                {item.label}
              </NavLink>
            ))}
          </nav>
        </aside>

        {/* Main content */}
        <main style={{ flex: 1, padding: '28px 24px', overflow: 'auto' }}>
          <Outlet />
        </main>
      </div>
    </div>
  );
}

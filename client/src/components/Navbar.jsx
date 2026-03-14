import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAppAuth } from '../context/AppAuthContext';
import NotificationBell from './NotificationBell';
import { RankChip } from './RankBadge';

export default function Navbar() {
  const { appUser, isAppLoggedIn, logoutApp } = useAppAuth();
  const navigate = useNavigate();
  const location = useLocation();

  return (
    <nav style={{
      background: 'rgba(8,13,6,0.97)', borderBottom: '1px solid rgba(201,162,39,0.15)',
      padding: '0 16px', height: 56, display: 'flex', alignItems: 'center',
      justifyContent: 'space-between', position: 'sticky', top: 0, zIndex: 100,
      backdropFilter: 'blur(12px)', boxShadow: '0 2px 16px rgba(0,0,0,0.4)',
    }}>
      {/* Logo */}
      <Link to="/" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 8 }}>
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#C9A227" strokeWidth="1.5" strokeLinecap="round">
          <polygon points="12,2 15,9 22,9 17,14 19,21 12,17 5,21 7,14 2,9 9,9"/>
        </svg>
        <span style={{ fontFamily: 'var(--font-display)', fontSize: 16, fontWeight: 800, letterSpacing: '0.18em', color: 'var(--gold)' }}>C.H.D.I</span>
        <span style={{ fontFamily: 'var(--font-mono)', fontSize: 9, letterSpacing: '0.12em', color: 'rgba(201,162,39,0.4)', marginLeft: 2 }}>1º RCG</span>
      </Link>

      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        {/* Schedule link */}
        {isAppLoggedIn && (
          <Link to="/escala" style={{
            display: 'flex', alignItems: 'center', gap: 5, textDecoration: 'none',
            padding: '5px 11px', borderRadius: 7,
            background: location.pathname === '/escala' ? 'rgba(201,162,39,0.14)' : 'transparent',
            border: location.pathname === '/escala' ? '1px solid rgba(201,162,39,0.3)' : '1px solid transparent',
            color: location.pathname === '/escala' ? 'var(--gold)' : 'var(--white-dim)',
            fontSize: 12, fontFamily: 'var(--font-display)', fontWeight: 700, letterSpacing: '0.06em',
            transition: 'all 0.15s',
          }}>
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/>
              <line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>
            </svg>
            Escala
          </Link>
        )}

        {/* Notification bell */}
        <NotificationBell />

        {/* User info / login button */}
        {isAppLoggedIn ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            {/* Rank chip with name */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 7, padding: '4px 10px', borderRadius: 8, background: 'rgba(201,162,39,0.06)', border: '1px solid rgba(201,162,39,0.15)' }}>
              <RankChip rank={appUser?.rank} size="xs" />
              <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--white)', maxWidth: 80, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {appUser?.name?.split(' ')[0]}
              </span>
            </div>
            <button onClick={logoutApp} style={{ background: 'none', border: '1px solid var(--border)', borderRadius: 7, color: 'var(--white-faint)', padding: '4px 9px', cursor: 'pointer', fontSize: 11, fontFamily: 'var(--font-mono)', transition: 'all 0.15s' }}
              onMouseEnter={e => e.currentTarget.style.borderColor = 'rgba(255,80,80,0.4)'}
              onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--border)'}>
              Sair
            </button>
          </div>
        ) : (
          <Link to="/app-login" style={{
            display: 'flex', alignItems: 'center', gap: 6, textDecoration: 'none',
            padding: '5px 12px', borderRadius: 8,
            background: 'rgba(201,162,39,0.1)', border: '1px solid rgba(201,162,39,0.3)',
            color: 'var(--gold)', fontSize: 12, fontFamily: 'var(--font-display)', fontWeight: 700, letterSpacing: '0.06em',
            transition: 'all 0.15s',
          }}
            onMouseEnter={e => e.currentTarget.style.background = 'rgba(201,162,39,0.18)'}
            onMouseLeave={e => e.currentTarget.style.background = 'rgba(201,162,39,0.1)'}>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"/><polyline points="10,17 15,12 10,7"/><line x1="15" y1="12" x2="3" y2="12"/>
            </svg>
            Login
          </Link>
        )}
      </div>
    </nav>
  );
}

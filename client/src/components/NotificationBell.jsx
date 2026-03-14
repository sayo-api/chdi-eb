import { useState, useEffect, useRef } from 'react';
import api from '../api/axios';
import { useAppAuth } from '../context/AppAuthContext';
import { usePushNotifications } from '../hooks/usePushNotifications';

const TYPE_COLOR = {
  schedule_added: '#6EBF48', schedule_changed: '#C9A227',
  schedule_removed: '#E05A4A', content: '#6BA3E0', info: '#888',
};
const TYPE_ICON = {
  schedule_added: '📋', schedule_changed: '🔄', schedule_removed: '❌', content: '📢', info: 'ℹ️',
};

export default function NotificationBell() {
  const { isAppLoggedIn } = useAppAuth();
  const [open, setOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unread, setUnread] = useState(0);
  const ref = useRef();
  const { supported: pushSupported, subscribed: pushSubscribed, permission: pushPermission,
          loading: pushLoading, subscribe: pushSubscribe, unsubscribe: pushUnsubscribe } =
    usePushNotifications(isAppLoggedIn);

  const load = async () => {
    if (!isAppLoggedIn) return;
    try {
      const token = localStorage.getItem('appToken');
      const { data } = await api.get('/notifications', { headers: { Authorization: `Bearer ${token}` } });
      setNotifications(data.notifications || []);
      setUnread(data.unread || 0);
    } catch {}
  };

  useEffect(() => {
    load();
    const interval = setInterval(load, 30000);
    return () => clearInterval(interval);
  }, [isAppLoggedIn]);

  useEffect(() => {
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const markAll = async () => {
    try {
      const token = localStorage.getItem('appToken');
      await api.put('/notifications/read-all', {}, { headers: { Authorization: `Bearer ${token}` } });
      setNotifications(n => n.map(x => ({ ...x, read: true })));
      setUnread(0);
    } catch {}
  };

  if (!isAppLoggedIn) return null;

  return (
    <div ref={ref} style={{ position: 'relative' }}>
      <button onClick={() => { setOpen(v => !v); if (!open) load(); }}
        style={{ position: 'relative', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--white-dim)', padding: 4, display: 'flex' }}>
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
          <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/>
        </svg>
        {unread > 0 && (
          <span style={{ position: 'absolute', top: -2, right: -2, width: 16, height: 16, borderRadius: '50%', background: '#E05A4A', color: 'white', fontSize: 9, fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'var(--font-mono)' }}>
            {unread > 9 ? '9+' : unread}
          </span>
        )}
      </button>

      {open && (
        <div style={{ position: 'absolute', top: '100%', right: 0, marginTop: 8, width: 320, maxHeight: 420, background: '#0d1a0a', border: '1px solid rgba(201,162,39,0.2)', borderRadius: 12, boxShadow: '0 8px 32px rgba(0,0,0,0.5)', overflow: 'hidden', zIndex: 999, display: 'flex', flexDirection: 'column' }}>
          <div style={{ padding: '12px 16px', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontFamily: 'var(--font-display)', fontSize: 13, fontWeight: 700, letterSpacing: '0.08em', color: 'var(--white)' }}>NOTIFICAÇÕES</span>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              {unread > 0 && <button onClick={markAll} style={{ background: 'none', border: 'none', color: 'var(--gold)', fontSize: 11, cursor: 'pointer', fontFamily: 'var(--font-mono)' }}>marcar lidas</button>}
              {pushSupported && pushPermission !== 'denied' && (
                <button
                  onClick={pushSubscribed ? pushUnsubscribe : pushSubscribe}
                  disabled={pushLoading}
                  title={pushSubscribed ? 'Desativar notificações push' : 'Ativar notificações push'}
                  style={{
                    background: pushSubscribed ? 'rgba(201,162,39,0.15)' : 'rgba(110,191,72,0.12)',
                    border: `1px solid ${pushSubscribed ? 'rgba(201,162,39,0.3)' : 'rgba(110,191,72,0.3)'}`,
                    borderRadius: 6, color: pushSubscribed ? 'var(--gold)' : '#6EBF48',
                    fontSize: 10, cursor: pushLoading ? 'default' : 'pointer',
                    padding: '3px 8px', fontFamily: 'var(--font-mono)', transition: 'all 0.15s',
                  }}
                >
                  {pushLoading ? '⏳' : pushSubscribed ? '🔔 Ativo' : '🔕 Ativar push'}
                </button>
              )}
              {pushPermission === 'denied' && (
                <span style={{ fontSize: 9, color: 'var(--white-faint)', fontFamily: 'var(--font-mono)' }} title="Notificações bloqueadas no navegador">🚫 Bloqueado</span>
              )}
            </div>
          </div>
          <div style={{ overflowY: 'auto', flex: 1 }}>
            {notifications.length === 0 ? (
              <div style={{ padding: '30px 16px', textAlign: 'center', color: 'var(--white-faint)', fontSize: 13 }}>Sem notificações</div>
            ) : notifications.map(n => (
              <div key={n._id} style={{ padding: '12px 16px', borderBottom: '1px solid var(--border)', background: n.read ? 'transparent' : 'rgba(201,162,39,0.04)', display: 'flex', gap: 10 }}>
                <div style={{ fontSize: 18, flexShrink: 0, marginTop: 2 }}>{TYPE_ICON[n.type] || 'ℹ️'}</div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 12, fontWeight: 700, color: n.read ? 'var(--white-dim)' : 'var(--white)', marginBottom: 2 }}>{n.title}</div>
                  <div style={{ fontSize: 11, color: 'var(--white-faint)', lineHeight: 1.4 }}>{n.message}</div>
                  <div style={{ fontSize: 10, color: 'rgba(244,242,236,0.2)', marginTop: 4, fontFamily: 'var(--font-mono)' }}>
                    {new Date(n.createdAt).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' })}
                  </div>
                </div>
                {!n.read && <div style={{ width: 8, height: 8, borderRadius: '50%', background: TYPE_COLOR[n.type] || '#C9A227', flexShrink: 0, marginTop: 4 }} />}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

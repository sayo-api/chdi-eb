import { useState, useEffect } from 'react';
import { usePushNotifications } from '../hooks/usePushNotifications';
import { useAppAuth } from '../context/AppAuthContext';

/* ─────────────────────────────────────────────────────────────────────────────
   PushPermissionBanner
   Shows a dismissible banner asking the soldier to allow push notifications.
   Only shows when:
     - user is logged in
     - push is supported
     - permission is 'default' (not yet asked)
     - not already subscribed
     - not manually dismissed
───────────────────────────────────────────────────────────────────────────── */

const STORAGE_KEY = 'chdi_push_dismissed';
const MAX_DISMISSALS = 3;

export default function PushPermissionBanner() {
  const { isAppLoggedIn } = useAppAuth();
  const { supported, permission, subscribed, loading, error, subscribe } =
    usePushNotifications(isAppLoggedIn);

  const [visible, setVisible] = useState(false);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (!isAppLoggedIn || !supported || subscribed) { setVisible(false); return; }
    if (permission === 'denied') { setVisible(false); return; }
    if (permission === 'granted' && subscribed) { setVisible(false); return; }

    // Don't show if dismissed too many times
    const dismissals = parseInt(localStorage.getItem(STORAGE_KEY) || '0', 10);
    if (dismissals >= MAX_DISMISSALS) { setVisible(false); return; }

    // Small delay so it doesn't appear instantly on load
    const t = setTimeout(() => setVisible(true), 1800);
    return () => clearTimeout(t);
  }, [isAppLoggedIn, supported, permission, subscribed]);

  const handleAllow = async () => {
    const ok = await subscribe();
    if (ok) {
      setSuccess(true);
      setTimeout(() => setVisible(false), 3000);
    }
  };

  const handleDismiss = () => {
    const d = parseInt(localStorage.getItem(STORAGE_KEY) || '0', 10);
    localStorage.setItem(STORAGE_KEY, String(d + 1));
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <div style={{
      position: 'fixed',
      bottom: 80,
      left: '50%',
      transform: 'translateX(-50%)',
      zIndex: 1200,
      maxWidth: 440,
      width: 'calc(100vw - 32px)',
      background: 'rgba(10,15,8,0.97)',
      border: '1px solid rgba(201,162,39,0.35)',
      borderRadius: 14,
      padding: '16px 20px',
      boxShadow: '0 8px 40px rgba(0,0,0,0.6), 0 0 0 1px rgba(201,162,39,0.1)',
      backdropFilter: 'blur(12px)',
      display: 'flex',
      flexDirection: 'column',
      gap: 12,
      animation: 'slideUp 0.3s ease',
    }}>
      <style>{`@keyframes slideUp{from{transform:translateX(-50%) translateY(20px);opacity:0}to{transform:translateX(-50%) translateY(0);opacity:1}}`}</style>

      {success ? (
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <span style={{ fontSize: 28 }}>✅</span>
          <div>
            <div style={{ fontFamily: 'var(--font-display)', fontSize: 14, fontWeight: 800, color: '#6EBF48', letterSpacing: '0.06em' }}>
              NOTIFICAÇÕES ATIVADAS!
            </div>
            <div style={{ fontSize: 12, color: 'var(--white-dim)', marginTop: 2 }}>
              Você será notificado quando for escalado.
            </div>
          </div>
        </div>
      ) : (
        <>
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
            {/* Bell icon */}
            <div style={{
              width: 44, height: 44, borderRadius: 12, flexShrink: 0,
              background: 'rgba(201,162,39,0.12)', border: '1px solid rgba(201,162,39,0.3)',
              display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22,
            }}>🔔</div>

            <div style={{ flex: 1 }}>
              <div style={{
                fontFamily: 'var(--font-display)', fontSize: 14, fontWeight: 800,
                color: 'var(--gold)', letterSpacing: '0.08em', marginBottom: 4,
              }}>
                ATIVAR NOTIFICAÇÕES
              </div>
              <div style={{ fontSize: 12, color: 'var(--white-dim)', lineHeight: 1.5 }}>
                Receba alertas quando for escalado, quando sua escala mudar ou houver avisos importantes.
              </div>
            </div>

            {/* Dismiss X */}
            <button
              onClick={handleDismiss}
              style={{ background: 'none', border: 'none', color: 'var(--white-faint)', cursor: 'pointer', fontSize: 20, lineHeight: 1, padding: 0, flexShrink: 0 }}
              title="Fechar"
            >×</button>
          </div>

          {error && (
            <div style={{ fontSize: 11, color: '#E05A4A', padding: '6px 10px', background: 'rgba(224,90,74,0.08)', borderRadius: 6, border: '1px solid rgba(224,90,74,0.2)' }}>
              ⚠️ {error}
            </div>
          )}

          <div style={{ display: 'flex', gap: 8 }}>
            <button
              onClick={handleAllow}
              disabled={loading}
              style={{
                flex: 1, padding: '10px 16px', borderRadius: 10,
                background: loading ? 'rgba(201,162,39,0.5)' : 'rgba(201,162,39,0.9)',
                border: 'none', color: '#0A0F08', cursor: loading ? 'default' : 'pointer',
                fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 13,
                letterSpacing: '0.08em', transition: 'all 0.15s',
              }}
            >
              {loading ? '⏳ Ativando...' : '🔔 Permitir'}
            </button>
            <button
              onClick={handleDismiss}
              style={{
                padding: '10px 16px', borderRadius: 10,
                background: 'transparent', border: '1px solid var(--border)',
                color: 'var(--white-faint)', cursor: 'pointer',
                fontSize: 12, fontFamily: 'var(--font-mono)', transition: 'all 0.15s',
              }}
            >
              Agora não
            </button>
          </div>

          <div style={{ display: 'flex', gap: 16, fontSize: 10, color: 'var(--white-faint)', fontFamily: 'var(--font-mono)' }}>
            <span>🗓 Escalas</span>
            <span>🔄 Mudanças</span>
            <span>📢 Avisos</span>
          </div>
        </>
      )}
    </div>
  );
}

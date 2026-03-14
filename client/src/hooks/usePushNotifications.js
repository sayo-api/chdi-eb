import { useState, useEffect, useCallback } from 'react';
import api from '../api/axios';

/* ─────────────────────────────────────────────────────────────────────────────
   usePushNotifications
   Manages Web Push subscription lifecycle for logged-in app users.
───────────────────────────────────────────────────────────────────────────── */

function urlBase64ToUint8Array(base64String) {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
  const rawData = atob(base64);
  return Uint8Array.from([...rawData].map(c => c.charCodeAt(0)));
}

export function usePushNotifications(isLoggedIn) {
  const [permission, setPermission] = useState(
    typeof Notification !== 'undefined' ? Notification.permission : 'default'
  );
  const [subscribed, setSubscribed] = useState(false);
  const [swReady,    setSwReady]    = useState(false);
  const [loading,    setLoading]    = useState(false);
  const [error,      setError]      = useState('');

  // Register service worker
  useEffect(() => {
    if (!('serviceWorker' in navigator) || !('PushManager' in window)) return;
    navigator.serviceWorker.register('/sw.js').then(reg => {
      setSwReady(true);
      // Listen for subscription change from SW
      navigator.serviceWorker.addEventListener('message', e => {
        if (e.data?.type === 'PUSH_SUBSCRIPTION_CHANGED') subscribe();
      });
    }).catch(err => console.error('[SW]', err));
  }, []);

  // On login, auto-check if already subscribed
  useEffect(() => {
    if (!isLoggedIn || !swReady) return;
    checkExistingSubscription();
  }, [isLoggedIn, swReady]);

  async function checkExistingSubscription() {
    try {
      const reg = await navigator.serviceWorker.ready;
      const sub = await reg.pushManager.getSubscription();
      setSubscribed(!!sub);
    } catch {}
  }

  const subscribe = useCallback(async () => {
    if (!swReady) { setError('Service Worker não disponível.'); return false; }
    setLoading(true);
    setError('');
    try {
      // 1. Request permission
      const perm = await Notification.requestPermission();
      setPermission(perm);
      if (perm !== 'granted') {
        setError('Permissão de notificação negada.');
        setLoading(false);
        return false;
      }

      // 2. Get VAPID public key from server
      const { data: vapidData } = await api.get('/push/vapid-public-key');
      const applicationServerKey = urlBase64ToUint8Array(vapidData.publicKey);

      // 3. Subscribe via PushManager
      const reg = await navigator.serviceWorker.ready;
      const subscription = await reg.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey,
      });

      // 4. Send subscription to our server
      const token = localStorage.getItem('appToken');
      await api.post('/push/web-subscribe', subscription.toJSON(), {
        headers: { Authorization: `Bearer ${token}` },
      });

      setSubscribed(true);
      setLoading(false);
      return true;
    } catch (err) {
      console.error('[Push] subscribe error:', err);
      setError('Erro ao ativar notificações. Tente novamente.');
      setLoading(false);
      return false;
    }
  }, [swReady]);

  const unsubscribe = useCallback(async () => {
    setLoading(true);
    try {
      const reg = await navigator.serviceWorker.ready;
      const sub = await reg.pushManager.getSubscription();
      if (sub) {
        const token = localStorage.getItem('appToken');
        await api.delete('/push/web-unsubscribe', {
          data: { endpoint: sub.endpoint },
          headers: { Authorization: `Bearer ${token}` },
        });
        await sub.unsubscribe();
      }
      setSubscribed(false);
    } catch (err) {
      console.error('[Push] unsubscribe error:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  const supported = typeof Notification !== 'undefined' && 'serviceWorker' in navigator && 'PushManager' in window;

  return { supported, permission, subscribed, loading, error, subscribe, unsubscribe };
}

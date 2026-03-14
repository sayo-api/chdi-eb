/**
 * pushService.js
 * Sends push notifications via:
 *  - Web Push (VAPID) → browsers
 *  - FCM V1 HTTP API  → Android app (via Firebase)
 *
 * Required env vars:
 *   VAPID_PUBLIC_KEY, VAPID_PRIVATE_KEY, VAPID_EMAIL
 *   FCM_PROJECT_ID, FCM_SERVICE_ACCOUNT_JSON  (JSON string of service account)
 */

const WebPushSubscription = require('../models/WebPushSubscription');
const FcmToken            = require('../models/FcmToken');

// ── Web Push (VAPID) ──────────────────────────────────────────────────────────
let _webpush = null;
function getWebPush() {
  if (_webpush) return _webpush;
  if (!process.env.VAPID_PUBLIC_KEY || !process.env.VAPID_PRIVATE_KEY) return null;
  try {
    _webpush = require('web-push');
    _webpush.setVapidDetails(
      `mailto:${process.env.VAPID_EMAIL || 'admin@chdi.mil.br'}`,
      process.env.VAPID_PUBLIC_KEY,
      process.env.VAPID_PRIVATE_KEY
    );
  } catch (e) {
    console.warn('[WebPush] web-push package not installed:', e.message);
    _webpush = null;
  }
  return _webpush;
}

async function sendWebPush(userIds, payload) {
  const webpush = getWebPush();
  if (!webpush) return;
  const subs = await WebPushSubscription.find({ user: { $in: userIds }, active: true });
  if (!subs.length) return;
  const json = JSON.stringify({
    title: payload.title || 'C.H.D.I · 1º RCG',
    body:  payload.body  || '',
    icon:  '/favicon.svg',
    badge: '/favicon.svg',
    tag:   payload.tag   || 'chdi-notif',
    data:  { url: payload.url || '/' },
  });
  const results = await Promise.allSettled(
    subs.map(sub =>
      webpush.sendNotification({ endpoint: sub.endpoint, keys: sub.keys }, json)
        .catch(async err => {
          if (err.statusCode === 410 || err.statusCode === 404)
            await WebPushSubscription.findByIdAndUpdate(sub._id, { active: false });
          throw err;
        })
    )
  );
  const sent = results.filter(r => r.status === 'fulfilled').length;
  console.log(`[WebPush] ${sent}/${subs.length} delivered`);
}

// ── FCM V1 (Android app) ──────────────────────────────────────────────────────
let _fcmAccessToken = null;
let _fcmTokenExpiry = 0;

async function getFcmAccessToken() {
  if (_fcmAccessToken && Date.now() < _fcmTokenExpiry - 60000) return _fcmAccessToken;

  let serviceAccount = null;
  if (process.env.FCM_SERVICE_ACCOUNT_JSON) {
    try { serviceAccount = JSON.parse(process.env.FCM_SERVICE_ACCOUNT_JSON); }
    catch (e) { console.error('[FCM] Invalid FCM_SERVICE_ACCOUNT_JSON:', e.message); return null; }
  } else {
    console.warn('[FCM] FCM_SERVICE_ACCOUNT_JSON not set — push to Android disabled');
    return null;
  }

  try {
    const { GoogleAuth } = require('google-auth-library');
    const auth = new GoogleAuth({
      credentials: serviceAccount,
      scopes: ['https://www.googleapis.com/auth/firebase.messaging'],
    });
    const client = await auth.getClient();
    const tokenResponse = await client.getAccessToken();
    _fcmAccessToken = tokenResponse.token;
    _fcmTokenExpiry = Date.now() + 55 * 60 * 1000;
    return _fcmAccessToken;
  } catch (e) {
    console.error('[FCM] OAuth2 error:', e.message);
    return null;
  }
}

async function sendFcmPush(userIds, payload) {
  const accessToken = await getFcmAccessToken();
  if (!accessToken) return;
  const projectId = process.env.FCM_PROJECT_ID;
  if (!projectId) { console.warn('[FCM] FCM_PROJECT_ID not set'); return; }

  const tokens = await FcmToken.find({ user: { $in: userIds }, active: true }).select('token _id');
  if (!tokens.length) return;

  const fcmUrl = `https://fcm.googleapis.com/v1/projects/${projectId}/messages:send`;
  await Promise.allSettled(tokens.map(t => sendSingleFcm(t, payload, accessToken, fcmUrl)));
  console.log(`[FCM V1] Sent to ${tokens.length} device(s)`);
}

function sendSingleFcm(tokenDoc, payload, accessToken, url) {
  const body = JSON.stringify({
    message: {
      token: tokenDoc.token,
      notification: {
        title: payload.title || 'C.H.D.I · 1º RCG',
        body:  payload.body  || '',
      },
      android: {
        priority: 'high',
        notification: {
          channel_id: payload.type?.startsWith('schedule') ? 'chdi_schedule' : 'chdi_general',
          color: '#C9A227',
          sound: 'default',
          default_vibrate_timings: true,
        },
      },
      data: {
        type: payload.type || 'info',
        tag:  payload.tag  || '',
      },
    },
  });
  return new Promise((resolve, reject) => {
    const urlObj = new URL(url);
    const req = require('https').request({
      hostname: urlObj.hostname, path: urlObj.pathname, method: 'POST',
      headers: {
        'Authorization':  `Bearer ${accessToken}`,
        'Content-Type':   'application/json',
        'Content-Length': Buffer.byteLength(body),
      },
    }, res => {
      let data = '';
      res.on('data', d => data += d);
      res.on('end', async () => {
        if (res.statusCode === 404 || res.statusCode === 410)
          await FcmToken.findByIdAndUpdate(tokenDoc._id, { active: false });
        if (res.statusCode >= 400)
          console.warn(`[FCM] token ${tokenDoc.token.substring(0,20)}... → ${res.statusCode}: ${data}`);
        resolve(data);
      });
    });
    req.on('error', reject);
    req.write(body);
    req.end();
  });
}

async function sendPushToUsers(userIds, payload) {
  if (!userIds?.length) return;
  const ids = userIds.map(String);
  await Promise.allSettled([sendWebPush(ids, payload), sendFcmPush(ids, payload)]);
}

module.exports = { sendWebPush, sendFcmPush, sendPushToUsers };

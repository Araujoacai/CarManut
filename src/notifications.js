// ============================================================
// notifications.js — Sistema de Notificações de Manutenção
// ============================================================
// Estratégia em 3 camadas:
//  1. Foreground: ao abrir o app, checa e dispara notificações detalhadas
//  2. Background: Periodic Background Sync (SW acorda ~1x/dia no Android)
//  3. FCM token: salvo no Firestore para envio server-side futuro
// ============================================================
import { db } from '../firebase.js';
import { getVehicles, getServices, buildLastServiceMap } from './db.js';
import { MAINTENANCE_ITEMS, calcMaintenanceStatus } from './maintenance-data.js';
import {
  doc, setDoc, getDoc, serverTimestamp
} from 'https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js';

// ── Chaves de configuração no localStorage ──────────────────
const KEY_PERM      = 'cm_notif_perm';
const KEY_PREFS     = 'cm_notif_prefs';
const KEY_CACHE     = 'cm_maintenance_cache'; // para o SW ler
const KEY_LAST_CHK  = 'cm_last_check';

// ── Preferências padrão ─────────────────────────────────────
export const DEFAULT_PREFS = {
  enabled:   true,
  threshold: 'warning',   // 'overdue' | 'warning' | 'upcoming'
  // 'overdue'  → só quando já venceu
  // 'warning'  → a partir de 85% do intervalo
  // 'upcoming' → a partir de 70% do intervalo
};

export function getPrefs() {
  try {
    return { ...DEFAULT_PREFS, ...JSON.parse(localStorage.getItem(KEY_PREFS) || '{}') };
  } catch { return { ...DEFAULT_PREFS }; }
}

export function savePrefs(prefs) {
  localStorage.setItem(KEY_PREFS, JSON.stringify(prefs));
}

// ── Permissão ───────────────────────────────────────────────
export async function requestNotificationPermission() {
  if (!('Notification' in window)) return 'not-supported';
  if (Notification.permission === 'granted') return 'granted';
  if (Notification.permission === 'denied')  return 'denied';

  const result = await Notification.requestPermission();
  localStorage.setItem(KEY_PERM, result);
  return result;
}

export function getNotificationPermission() {
  if (!('Notification' in window)) return 'not-supported';
  return Notification.permission;
}

// ── Mostrar uma notificação local (via SW se disponível) ────
async function showNotification(title, body, options = {}) {
  if (Notification.permission !== 'granted') return;

  const sw = await navigator.serviceWorker?.ready;
  if (sw) {
    await sw.showNotification(title, {
      body,
      icon:  '/icons/icon-192.png',
      badge: '/icons/icon-72.png',
      tag:   options.tag || 'carmanut',
      data:  options.data || {},
      requireInteraction: false,
      ...options,
    });
  } else {
    new Notification(title, { body, icon: '/icons/icon-192.png' });
  }
}

// ── Checar manutenções e disparar notificações ──────────────
export async function checkAndNotifyMaintenance(user, force = false) {
  const prefs = getPrefs();
  if (!prefs.enabled) return;
  if (Notification.permission !== 'granted') return;

  // Não checar mais de 1x por hora (exceto forçado)
  const lastCheck = Number(localStorage.getItem(KEY_LAST_CHK) || 0);
  if (!force && Date.now() - lastCheck < 60 * 60 * 1000) return;
  localStorage.setItem(KEY_LAST_CHK, Date.now());

  const thresholdMap = { overdue: 100, warning: 85, upcoming: 70 };
  const minPct = thresholdMap[prefs.threshold] ?? 85;

  let vehicles = [];
  try { vehicles = await getVehicles(user.uid); } catch { return; }

  const alerts = []; // { vehicleName, itemName, emoji, status, label }

  for (const vehicle of vehicles) {
    let services = [];
    try { services = await getServices(user.uid, vehicle.id); } catch { continue; }

    const lastMap = buildLastServiceMap(services);

    for (const item of MAINTENANCE_ITEMS) {
      const last   = lastMap[item.id];
      const status = calcMaintenanceStatus(
        item, last?.km ?? null, last?.date ?? null, vehicle.currentKm || 0
      );

      if (status.percent >= minPct) {
        alerts.push({
          vehicleName: `${vehicle.make} ${vehicle.model}`,
          itemName:    item.name,
          emoji:       item.emoji,
          status:      status.status,
          label:       status.label,
          vehicleId:   vehicle.id,
          pct:         status.percent,
        });
      }
    }
  }

  // Ordenar: vencidos primeiro
  alerts.sort((a, b) => {
    const o = { overdue: 0, warning: 1, ok: 2 };
    return o[a.status] - o[b.status] || b.pct - a.pct;
  });

  // Salvar cache para o SW usar no background sync
  const cacheData = {
    at:        Date.now(),
    alertCount: alerts.filter(a => a.status !== 'ok').length,
    overdue:   alerts.filter(a => a.status === 'overdue').length,
    warning:   alerts.filter(a => a.status === 'warning').length,
    items:     alerts.slice(0, 10).map(a => ({
      vehicleName: a.vehicleName,
      itemName:    a.itemName,
      emoji:       a.emoji,
      status:      a.status,
      label:       a.label,
    })),
  };
  try {
    localStorage.setItem(KEY_CACHE, JSON.stringify(cacheData));
    // Também salva via Cache API para o SW acessar quando app estiver fechado
    const notifCache = await caches.open('carmanut-notif-cache');
    await notifCache.put('/notif-data.json', new Response(JSON.stringify(cacheData), {
      headers: { 'Content-Type': 'application/json' },
    }));
  } catch {}

  if (alerts.length === 0) return;

  // Agrupar por veículo para não spammar
  const byVehicle = {};
  for (const a of alerts) {
    if (!byVehicle[a.vehicleName]) byVehicle[a.vehicleName] = [];
    byVehicle[a.vehicleName].push(a);
  }

  for (const [vehicleName, items] of Object.entries(byVehicle)) {
    const overdue = items.filter(i => i.status === 'overdue');
    const warning = items.filter(i => i.status === 'warning');

    let title, body;
    if (overdue.length > 0) {
      title = `🔴 ${vehicleName} — Manutenção Vencida`;
      if (overdue.length === 1) {
        body = `${overdue[0].emoji} ${overdue[0].itemName}: ${overdue[0].label}`;
      } else {
        body = `${overdue.length} itens vencidos: ${overdue.slice(0,2).map(i => i.itemName).join(', ')}${overdue.length > 2 ? '...' : ''}`;
      }
    } else if (warning.length > 0) {
      title = `⚠️ ${vehicleName} — Manutenção Próxima`;
      if (warning.length === 1) {
        body = `${warning[0].emoji} ${warning[0].itemName}: ${warning[0].label}`;
      } else {
        body = `${warning.length} itens próximos do vencimento`;
      }
    } else {
      continue;
    }

    await showNotification(title, body, {
      tag:  `carmanut-${vehicleName.replace(/\s/g,'-')}`,
      data: { url: '/', vehicleName },
    });

    // Pequena pausa entre notificações
    await new Promise(r => setTimeout(r, 500));
  }

  return alerts.length;
}

// ── Periodic Background Sync ─────────────────────────────────
export async function registerPeriodicSync() {
  if (!('serviceWorker' in navigator) || !('periodicSync' in ServiceWorkerRegistration.prototype)) {
    return false;
  }
  try {
    const sw     = await navigator.serviceWorker.ready;
    const status = await navigator.permissions.query({ name: 'periodic-background-sync' });

    if (status.state === 'granted') {
      await sw.periodicSync.register('check-maintenance', {
        minInterval: 24 * 60 * 60 * 1000, // 1 dia
      });
      return true;
    }
  } catch (err) {
    console.warn('[CarManut] Periodic sync não disponível:', err.message);
  }
  return false;
}

// ── Salvar token FCM no Firestore ────────────────────────────
export async function saveFCMToken(uid, token) {
  if (!token || !uid) return;
  try {
    const ref = doc(db, 'users', uid, 'fcmTokens', token.slice(-20));
    await setDoc(ref, {
      token,
      createdAt: serverTimestamp(),
      platform:  navigator.userAgent.includes('Android') ? 'android' : 'web',
    }, { merge: true });
  } catch (err) {
    console.warn('[CarManut] Erro ao salvar FCM token:', err.message);
  }
}

// ── Inicializar notificações ao abrir o app ──────────────────
export async function initNotifications(user) {
  const prefs = getPrefs();
  if (!prefs.enabled) return;

  // Checar em background (não bloqueia a UI)
  setTimeout(async () => {
    try {
      await checkAndNotifyMaintenance(user, false);
      await registerPeriodicSync();
    } catch (err) {
      console.warn('[CarManut] Notification check error:', err);
    }
  }, 3000); // aguarda 3s após abertura do app
}

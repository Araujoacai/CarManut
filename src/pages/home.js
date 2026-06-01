// ============================================================
// home.js — Dashboard de Veículos
// ============================================================
import { getVehicles } from '../db.js';
import { getServices, buildLastServiceMap } from '../db.js';
import { MAINTENANCE_ITEMS, calcMaintenanceStatus, formatKm } from '../maintenance-data.js';
import { showToast } from '../components/toast.js';
import { router } from '../app.js';

export async function renderHome(container, user) {
  container.innerHTML = `<div class="loading-overlay"><div class="spinner"></div></div>`;

  let vehicles = [];
  try {
    vehicles = await getVehicles(user.uid);
  } catch (err) {
    console.error(err);
    showToast('Erro ao carregar veículos', 'error');
  }

  // Calculate alert counts for each vehicle
  const vehiclesWithAlerts = await Promise.all(vehicles.map(async v => {
    try {
      const services = await getServices(user.uid, v.id);
      const lastMap  = buildLastServiceMap(services);
      let overdueCount = 0, warningCount = 0;

      MAINTENANCE_ITEMS.forEach(item => {
        const last = lastMap[item.id];
        const status = calcMaintenanceStatus(
          item,
          last?.km ?? null,
          last?.date ?? null,
          v.currentKm || 0
        );
        if (status.status === 'overdue') overdueCount++;
        else if (status.status === 'warning') warningCount++;
      });

      return { ...v, overdueCount, warningCount };
    } catch {
      return { ...v, overdueCount: 0, warningCount: 0 };
    }
  }));

  const firstName = user.displayName?.split(' ')[0] || 'Motorista';
  const totalVehicles = vehicles.length;
  const totalOverdue = vehiclesWithAlerts.reduce((sum, v) => sum + v.overdueCount, 0);

  // Update reminder badge
  const badge = document.getElementById('reminder-badge');
  if (badge) {
    if (totalOverdue > 0) {
      badge.textContent = totalOverdue;
      badge.classList.remove('hidden');
    } else {
      badge.classList.add('hidden');
    }
  }

  container.innerHTML = `
    <div class="home-page page">
      <div class="home-greeting">
        <h2 class="greeting-text">Olá, <span>${firstName}</span> 👋</h2>
        <p class="greeting-sub">${new Date().toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' })}</p>
      </div>

      ${totalVehicles > 0 ? `
        <div class="stats-grid">
          <div class="stat-card">
            <div class="stat-icon">🚗</div>
            <div class="stat-value">${totalVehicles}</div>
            <div class="stat-label">Veículo${totalVehicles !== 1 ? 's' : ''}</div>
          </div>
          <div class="stat-card">
            <div class="stat-icon">${totalOverdue > 0 ? '🔴' : '✅'}</div>
            <div class="stat-value" style="color:${totalOverdue > 0 ? 'var(--danger)' : 'var(--success)'}">${totalOverdue}</div>
            <div class="stat-label">Vencido${totalOverdue !== 1 ? 's' : ''}</div>
          </div>
        </div>
      ` : ''}

      <div class="section-header">
        <span class="section-title">Meus Veículos</span>
        ${totalVehicles > 0 ? `<button class="btn-link" id="btn-add-vehicle-link">+ Adicionar</button>` : ''}
      </div>

      <div class="vehicles-list" id="vehicles-list">
        ${vehiclesWithAlerts.length > 0
          ? vehiclesWithAlerts.map(v => renderVehicleCard(v)).join('')
          : renderEmptyVehicles()
        }
      </div>
    </div>
  `;

  // Event listeners
  document.querySelectorAll('.vehicle-card').forEach(card => {
    card.addEventListener('click', () => {
      router.navigate('vehicle-detail', { vehicleId: card.dataset.vehicleId });
    });
  });

  const addBtns = document.querySelectorAll('#btn-add-vehicle, #btn-add-vehicle-link');
  addBtns.forEach(btn => {
    btn?.addEventListener('click', () => router.navigate('vehicle-form'));
  });
}

function renderVehicleCard(v) {
  const alerts = [];
  if (v.overdueCount > 0) {
    alerts.push(`<span class="alert-chip danger">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
      ${v.overdueCount} vencido${v.overdueCount !== 1 ? 's' : ''}
    </span>`);
  }
  if (v.warningCount > 0) {
    alerts.push(`<span class="alert-chip warning">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
      ${v.warningCount} atenção
    </span>`);
  }
  if (alerts.length === 0) {
    alerts.push(`<span class="alert-chip ok">✓ Em dia</span>`);
  }

  return `
    <div class="card vehicle-card" data-vehicle-id="${v.id}">
      <div class="vehicle-card-header">
        <div class="vehicle-icon">${v.emoji || '🚗'}</div>
        <div class="vehicle-info">
          <div class="vehicle-name">${v.make} ${v.model}</div>
          <div class="vehicle-year-fuel">${v.year} · ${getFuelLabel(v.fuel)} · ${v.engine || ''}</div>
        </div>
        <div class="vehicle-km-badge">
          <span class="km-value">${Number(v.currentKm || 0).toLocaleString('pt-BR')}</span>
          <span class="km-label">km</span>
        </div>
      </div>
      <div class="vehicle-alerts">${alerts.join('')}</div>
    </div>
  `;
}

function renderEmptyVehicles() {
  return `
    <div class="empty-state">
      <div class="empty-icon">🚗</div>
      <div class="empty-title">Nenhum veículo ainda</div>
      <div class="empty-desc">Adicione seu primeiro veículo para começar a acompanhar a manutenção.</div>
      <button class="btn btn-primary btn-sm" id="btn-add-vehicle">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
        Adicionar Veículo
      </button>
    </div>
  `;
}

function getFuelLabel(fuel) {
  const map = { flex: 'Flex', gasoline: 'Gasolina', diesel: 'Diesel', electric: 'Elétrico', hybrid: 'Híbrido', cng: 'GNV' };
  return map[fuel] || fuel || '—';
}

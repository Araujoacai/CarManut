// ============================================================
// reminders.js — Próximas Revisões (todos os veículos)
// ============================================================
import { getVehicles, getServices, buildLastServiceMap } from '../db.js';
import { MAINTENANCE_ITEMS, calcMaintenanceStatus, formatDate } from '../maintenance-data.js';
import { router } from '../app.js';

export async function renderReminders(container, user) {
  container.innerHTML = `<div class="loading-overlay"><div class="spinner"></div></div>`;

  let vehicles = [];
  try {
    vehicles = await getVehicles(user.uid);
  } catch { }

  if (vehicles.length === 0) {
    container.innerHTML = `
      <div class="reminders-page page">
        <div class="empty-state">
          <div class="empty-icon">🔔</div>
          <div class="empty-title">Sem veículos cadastrados</div>
          <div class="empty-desc">Adicione um veículo para ver os lembretes de manutenção.</div>
          <button class="btn btn-primary btn-sm" id="btn-add-first">Adicionar Veículo</button>
        </div>
      </div>`;
    document.getElementById('btn-add-first')?.addEventListener('click', () => router.navigate('vehicle-form'));
    return;
  }

  // Load all services for all vehicles
  const allItems = [];
  await Promise.all(vehicles.map(async v => {
    try {
      const services = await getServices(user.uid, v.id);
      const lastMap  = buildLastServiceMap(services);

      MAINTENANCE_ITEMS.forEach(item => {
        const last = lastMap[item.id];
        const status = calcMaintenanceStatus(item, last?.km ?? null, last?.date ?? null, v.currentKm || 0);
        allItems.push({ item, vehicle: v, status, last });
      });
    } catch { }
  }));

  // Sort: overdue first, then warning, then ok; within each, by percent desc
  allItems.sort((a, b) => {
    const order = { overdue: 0, warning: 1, ok: 2 };
    const diff = order[a.status.status] - order[b.status.status];
    if (diff !== 0) return diff;
    return b.status.percent - a.status.percent;
  });

  // Update badge
  const overdueTotal = allItems.filter(i => i.status.status === 'overdue').length;
  const warnTotal    = allItems.filter(i => i.status.status === 'warning').length;
  const badge = document.getElementById('reminder-badge');
  if (badge) {
    if (overdueTotal > 0) { badge.textContent = overdueTotal; badge.classList.remove('hidden'); }
    else badge.classList.add('hidden');
  }

  let currentFilter = 'all';

  function renderList(filter) {
    const filtered = filter === 'all' ? allItems
      : filter === 'urgent' ? allItems.filter(i => i.status.status === 'overdue' || i.status.status === 'warning')
      : allItems.filter(i => i.status.status === filter);

    if (filtered.length === 0) {
      return `<div class="empty-state"><div class="empty-icon">✅</div><div class="empty-title">Tudo em dia!</div><div class="empty-desc">Nenhum item nesta categoria.</div></div>`;
    }

    return filtered.map(({ item, vehicle, status, last }) => {
      const pct = Math.min(status.percent, 100);
      return `
        <div class="reminder-item ${status.status}" data-vehicle-id="${vehicle.id}">
          <div class="reminder-header">
            <div>
              <div class="reminder-title">${item.emoji} ${item.name}</div>
              <div class="reminder-vehicle">${vehicle.emoji||'🚗'} ${vehicle.make} ${vehicle.model} · ${Number(vehicle.currentKm||0).toLocaleString('pt-BR')} km</div>
            </div>
            <span class="reminder-status ${status.status}">
              ${status.status === 'overdue' ? '🔴 Vencido' : status.status === 'warning' ? '⚠️ Atenção' : '✅ OK'}
            </span>
          </div>
          <div class="reminder-progress">
            <div class="progress-track">
              <div class="progress-fill ${status.status}" style="width:${pct}%;"></div>
            </div>
            <div class="progress-labels">
              <span>${item.kmInterval ? `a cada ${item.kmInterval.toLocaleString('pt-BR')} km` : item.monthInterval ? `a cada ${item.monthInterval} meses` : ''}</span>
              <span>${status.label}</span>
            </div>
          </div>
          <div class="reminder-footer">
            <div class="reminder-km-info">
              ${last ? `Último: <strong>${Number(last.km||0).toLocaleString('pt-BR')} km</strong> em <strong>${formatDate(last.date)}</strong>` : '<span style="color:var(--text-muted)">Nunca registrado</span>'}
            </div>
            <button class="btn-register-small goto-vehicle" data-vehicle-id="${vehicle.id}">Ver Veículo</button>
          </div>
        </div>
      `;
    }).join('');
  }

  container.innerHTML = `
    <div class="reminders-page page">
      <div style="margin-bottom:16px;">
        <div class="greeting-text" style="font-size:1.3rem;">Lembretes <span style="color:var(--amber-500);">${overdueTotal > 0 ? `(${overdueTotal} vencido${overdueTotal!==1?'s':''})` : '✅'}</span></div>
        <div class="greeting-sub">${vehicles.length} veículo${vehicles.length!==1?'s':''} · ${allItems.length} itens monitorados</div>
      </div>

      <div class="filter-chips">
        <button class="filter-chip active" data-filter="all">Todos (${allItems.length})</button>
        <button class="filter-chip" data-filter="urgent">
          🚨 Urgente (${overdueTotal + warnTotal})
        </button>
        <button class="filter-chip" data-filter="overdue">🔴 Vencido (${overdueTotal})</button>
        <button class="filter-chip" data-filter="warning">⚠️ Atenção (${warnTotal})</button>
        <button class="filter-chip" data-filter="ok">✅ Em dia</button>
      </div>

      <div id="reminders-list">
        ${renderList('all')}
      </div>
    </div>
  `;

  // Filter chips
  document.querySelectorAll('.filter-chip').forEach(chip => {
    chip.addEventListener('click', () => {
      document.querySelectorAll('.filter-chip').forEach(c => c.classList.remove('active'));
      chip.classList.add('active');
      currentFilter = chip.dataset.filter;
      document.getElementById('reminders-list').innerHTML = renderList(currentFilter);

      // Re-bind goto buttons
      document.querySelectorAll('.goto-vehicle').forEach(btn => {
        btn.addEventListener('click', () => router.navigate('vehicle-detail', { vehicleId: btn.dataset.vehicleId }));
      });
    });
  });

  // Goto vehicle buttons
  document.querySelectorAll('.goto-vehicle').forEach(btn => {
    btn.addEventListener('click', () => router.navigate('vehicle-detail', { vehicleId: btn.dataset.vehicleId }));
  });
}

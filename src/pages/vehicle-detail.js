// ============================================================
// vehicle-detail.js — Detalhe do Veículo (Histórico + Revisões)
// ============================================================
import { getVehicle, getServices, updateKm, deleteService, buildLastServiceMap } from '../db.js';
import { MAINTENANCE_ITEMS, calcMaintenanceStatus, formatKm, formatDate, formatCurrency, SERVICE_CATEGORIES } from '../maintenance-data.js';
import { showToast } from '../components/toast.js';
import { openQuickRegisterModal } from '../components/quick-register-modal.js';
import { router } from '../app.js';

// Referências vivas para os event listeners dos botões de editar
let _vehicle = null;
let _lastMap = {};
let _user    = null;
let _reloadFn = null;
let _currentCat = 'all';
let _itemStatuses = [];

export async function renderVehicleDetail(container, user, params = {}) {
  const { vehicleId } = params;
  if (!vehicleId) { router.navigate('home'); return; }

  container.innerHTML = `<div class="loading-overlay"><div class="spinner"></div></div>`;

  let vehicle, services;
  try {
    [vehicle, services] = await Promise.all([
      getVehicle(user.uid, vehicleId),
      getServices(user.uid, vehicleId),
    ]);
  } catch (err) {
    showToast('Erro ao carregar veículo', 'error');
    router.navigate('home');
    return;
  }

  if (!vehicle) { router.navigate('home'); return; }

  const lastMap = buildLastServiceMap(services);
  _vehicle  = vehicle;
  _lastMap  = lastMap;
  _user     = user;
  _reloadFn = () => renderVehicleDetail(container, user, params);

  const fuelLabel  = getFuelLabel(vehicle.fuel);
  const transLabel = getTransLabel(vehicle.transmission);

  // Calculate overall alert status
  const itemStatuses = MAINTENANCE_ITEMS.map(item => {
    const last = lastMap[item.id];
    return {
      ...item,
      last,
      status: calcMaintenanceStatus(item, last?.km ?? null, last?.date ?? null, vehicle.currentKm || 0)
    };
  });
  _itemStatuses = itemStatuses;

  const overdueItems = itemStatuses.filter(i => i.status.status === 'overdue');
  const warningItems = itemStatuses.filter(i => i.status.status === 'warning');

  const totalCost = services.reduce((sum, s) => sum + (Number(s.cost) || 0), 0);

  container.innerHTML = `
    <div class="detail-page page">

      <!-- Vehicle Hero -->
      <div class="vehicle-hero">
        <div class="vehicle-hero-top">
          <div>
            <div class="vehicle-hero-name">${vehicle.make} ${vehicle.model}</div>
            <div class="vehicle-hero-spec">
              ${vehicle.year} · ${fuelLabel} · ${transLabel}
              ${vehicle.engine ? ` · ${vehicle.engine}` : ''}
              ${vehicle.plate ? ` · <strong>${vehicle.plate}</strong>` : ''}
            </div>
          </div>
          <div class="vehicle-hero-emoji">${vehicle.emoji || '🚗'}</div>
        </div>

        <div class="vehicle-km-update">
          <div>
            <div class="km-big">${Number(vehicle.currentKm||0).toLocaleString('pt-BR')}</div>
            <div class="km-big-label">km atual</div>
          </div>
          <button class="btn-update-km" id="btn-update-km">✏️ Atualizar KM</button>
        </div>

        ${overdueItems.length > 0 || warningItems.length > 0 ? `
          <div style="margin-top:12px;display:flex;gap:8px;flex-wrap:wrap;">
            ${overdueItems.length > 0 ? `<span class="alert-chip danger">🔴 ${overdueItems.length} vencido${overdueItems.length!==1?'s':''}</span>` : ''}
            ${warningItems.length > 0 ? `<span class="alert-chip warning">⚠️ ${warningItems.length} atenção</span>` : ''}
          </div>
        ` : `<div style="margin-top:12px;"><span class="alert-chip ok">✅ Manutenção em dia</span></div>`}
      </div>

      <!-- Stats Row -->
      <div class="stats-grid" style="margin-bottom:16px;">
        <div class="stat-card">
          <div class="stat-icon">🔧</div>
          <div class="stat-value">${services.length}</div>
          <div class="stat-label">Serviço${services.length!==1?'s':''}</div>
        </div>
        <div class="stat-card">
          <div class="stat-icon">💰</div>
          <div class="stat-value" style="font-size:1rem;">${formatCurrency(totalCost)}</div>
          <div class="stat-label">Total gasto</div>
        </div>
      </div>

      <!-- Tabs -->
      <div class="tabs">
        <button class="tab-btn active" data-tab="reminders">Revisões</button>
        <button class="tab-btn" data-tab="history">Histórico</button>
        <button class="tab-btn" data-tab="info">Info</button>
      </div>

      <!-- Tab: Reminders -->
      <div class="tab-content active" id="tab-reminders">
        ${renderRemindersTab(_itemStatuses, vehicle, _currentCat)}
      </div>

      <!-- Tab: History -->
      <div class="tab-content" id="tab-history">
        ${renderHistoryTab(services, vehicleId)}
      </div>

      <!-- Tab: Info -->
      <div class="tab-content" id="tab-info">
        ${renderInfoTab(vehicle)}
      </div>

      <div style="height:100px;"></div>
    </div>

    <!-- FAB: Add Service -->
    <div style="position:fixed;bottom:calc(var(--nav-h) + 16px);right:16px;z-index:150;">
      <button class="btn btn-primary" id="btn-add-service" style="border-radius:50px;padding:14px 20px;width:auto;box-shadow:0 8px 32px rgba(245,158,11,0.4);">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" width="20" height="20"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
        Registrar Serviço
      </button>
    </div>
  `;

  // Tabs
  document.querySelectorAll('.tab-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
      document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
      btn.classList.add('active');
      document.getElementById(`tab-${btn.dataset.tab}`).classList.add('active');
    });
  });

  // Update KM
  document.getElementById('btn-update-km').addEventListener('click', () => {
    showKmModal(user, vehicle, async (newKm) => {
      await updateKm(user.uid, vehicleId, newKm);
      showToast(`KM atualizado para ${Number(newKm).toLocaleString('pt-BR')} km`, 'success');
      renderVehicleDetail(container, user, params);
    });
  });

  // Add Service
  document.getElementById('btn-add-service').addEventListener('click', () => {
    router.navigate('add-service', { vehicleId });
  });

  // Edit vehicle (info tab button)
  document.getElementById('btn-edit-vehicle')?.addEventListener('click', () => {
    router.navigate('vehicle-form', { vehicleId });
  });

  // Botões de editar/registrar item de manutenção (aba Revisões)
  bindReminderEditButtons();
  bindReminderFilters();

  // Delete service
  document.querySelectorAll('.btn-delete-service').forEach(btn => {
    btn.addEventListener('click', async (e) => {
      e.stopPropagation();
      if (!confirm('Excluir este registro?')) return;
      try {
        await deleteService(user.uid, vehicleId, btn.dataset.serviceId);
        showToast('Registro excluído', 'info');
        renderVehicleDetail(container, user, params);
      } catch {
        showToast('Erro ao excluir', 'error');
      }
    });
  });

  // Re-bind quando trocar de aba (histórico não tem esses botões)
  document.querySelectorAll('.tab-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      if (btn.dataset.tab === 'reminders') {
        requestAnimationFrame(() => {
          bindReminderFilters();
          bindReminderEditButtons();
        });
      }
    });
  });
}

function renderRemindersTab(itemStatuses, vehicle, currentCat = 'all') {
  const availableCats = new Set(itemStatuses.map(i => i.category));
  const catChips = [
    { id: 'all', label: 'Todos', emoji: '📋' },
    ...SERVICE_CATEGORIES.filter(c => availableCats.has(c.id))
  ];

  const chipsHtml = `
    <div class="filter-chips" style="margin-bottom:16px;">
      ${catChips.map(c => `
        <button class="filter-chip cat-chip ${currentCat === c.id ? 'active' : ''}" data-cat="${c.id}">
          ${c.emoji} ${c.label}
        </button>
      `).join('')}
    </div>
  `;

  let filtered = itemStatuses;
  if (currentCat !== 'all') {
    filtered = itemStatuses.filter(i => i.category === currentCat);
  }

  const sorted = [...filtered].sort((a, b) => {
    const order = { overdue: 0, warning: 1, ok: 2 };
    return order[a.status.status] - order[b.status.status];
  });

  const listHtml = sorted.length === 0 
    ? `<div class="empty-state" style="padding:40px 20px;"><div class="empty-icon">✅</div><div class="empty-title">Nenhum item nesta categoria</div></div>`
    : sorted.map(item => {
    const s   = item.status;
    const pct = Math.min(s.percent, 100);
    const last = item.last;
    const lastKmFmt  = last ? Number(last.km||0).toLocaleString('pt-BR') + ' km' : null;
    const lastDateFmt = last ? formatDate(last.date) : null;

    return `
      <div class="reminder-item ${s.status}">
        <div class="reminder-header">
          <div style="flex:1;min-width:0;">
            <div class="reminder-title">${item.emoji} ${item.name}</div>
            ${item.note ? `<div style="font-size:0.7rem;color:var(--text-muted);margin-top:2px;line-height:1.4;">${item.note}</div>` : ''}
          </div>
          <div style="display:flex;flex-direction:column;align-items:flex-end;gap:6px;flex-shrink:0;margin-left:8px;">
            <span class="reminder-status ${s.status}">
              ${s.status === 'overdue' ? '🔴 Vencido' : s.status === 'warning' ? '⚠️ Atenção' : '✅ OK'}
            </span>
            <button
              class="btn-edit-reminder"
              data-item-id="${item.id}"
              style="
                padding:4px 10px;border-radius:8px;font-size:0.72rem;font-weight:700;
                background:rgba(245,158,11,0.12);border:1px solid rgba(245,158,11,0.3);
                color:var(--amber-500);cursor:pointer;white-space:nowrap;
                transition:all 0.15s;
              ">
              ✏️ ${last ? 'Editar' : 'Registrar'}
            </button>
          </div>
        </div>

        <div class="reminder-progress">
          <div class="progress-track">
            <div class="progress-fill ${s.status}" style="width:${pct}%;"></div>
          </div>
          <div class="progress-labels">
            <span>${item.kmInterval ? `a cada ${item.kmInterval.toLocaleString('pt-BR')} km` : item.monthInterval ? `a cada ${item.monthInterval} meses` : ''}</span>
            <span>${s.label}</span>
          </div>
        </div>

        <div class="reminder-footer" style="flex-wrap:wrap;gap:4px;">
          <div class="reminder-km-info">
            ${last
              ? `Último: <strong>${lastKmFmt}</strong> em <strong>${lastDateFmt}</strong>`
              : '<span style="color:var(--text-muted)">Nunca registrado — clique em Registrar</span>'
            }
          </div>
          ${s.nextKm || s.nextDate ? `
            <div style="font-size:0.72rem;color:var(--text-muted);">
              Próx: ${s.nextKm ? `<strong style="color:var(--text-secondary);">${s.nextKm.toLocaleString('pt-BR')} km</strong>` : ''}
              ${s.nextDate ? `<strong style="color:var(--text-secondary);">${formatDate(s.nextDate)}</strong>` : ''}
            </div>
          ` : ''}
        </div>
      </div>
    `;
  }).join('');

  return chipsHtml + listHtml;
}

// Vincula filtros de categoria
function bindReminderFilters() {
  document.querySelectorAll('.cat-chip').forEach(chip => {
    chip.replaceWith(chip.cloneNode(true));
  });
  document.querySelectorAll('.cat-chip').forEach(chip => {
    chip.addEventListener('click', () => {
      _currentCat = chip.dataset.cat;
      const tab = document.getElementById('tab-reminders');
      if (tab && _vehicle) {
        tab.innerHTML = renderRemindersTab(_itemStatuses, _vehicle, _currentCat);
        bindReminderFilters();
        bindReminderEditButtons();
      }
    });
  });
}

// Vincula os botões ✏️ Editar/Registrar na aba de Revisões
function bindReminderEditButtons() {
  document.querySelectorAll('.btn-edit-reminder').forEach(btn => {
    // Evitar duplicar listeners
    btn.replaceWith(btn.cloneNode(true));
  });
  document.querySelectorAll('.btn-edit-reminder').forEach(btn => {
    btn.addEventListener('click', e => {
      e.stopPropagation();
      const itemId = btn.dataset.itemId;
      const item   = MAINTENANCE_ITEMS.find(i => i.id === itemId);
      if (!item || !_vehicle || !_user) return;
      openQuickRegisterModal({
        item,
        vehicle:     _vehicle,
        user:        _user,
        lastService: _lastMap[itemId] || null,
        onSaved:     _reloadFn,
      });
    });
  });
}

function renderHistoryTab(services, vehicleId) {
  if (services.length === 0) {
    return `
      <div class="empty-state">
        <div class="empty-icon">🔧</div>
        <div class="empty-title">Sem registros ainda</div>
        <div class="empty-desc">Registre o primeiro serviço para iniciar o histórico de manutenção.</div>
      </div>
    `;
  }

  const catMap = {};
  const { SERVICE_CATEGORIES } = { SERVICE_CATEGORIES: window._SC || [] };

  return `<div class="service-list">
    ${services.map(svc => {
      const parts = (svc.parts || []).join(', ');
      return `
        <div class="service-item">
          <div class="service-item-icon">${svc.emoji || '🔧'}</div>
          <div class="service-item-body">
            <div class="service-item-name">${svc.serviceName || svc.type || 'Serviço'}</div>
            <div class="service-item-meta">
              <span>📅 ${formatDate(svc.date)}</span>
              <span>📍 ${Number(svc.km||0).toLocaleString('pt-BR')} km</span>
              ${svc.workshop ? `<span>🏪 ${svc.workshop}</span>` : ''}
            </div>
            ${svc.notes ? `<div style="font-size:0.75rem;color:var(--text-muted);margin-top:4px;">${svc.notes}</div>` : ''}
          </div>
          <div style="display:flex;flex-direction:column;align-items:flex-end;gap:8px;flex-shrink:0;">
            ${svc.cost ? `<div class="service-item-cost">${formatCurrency(svc.cost)}</div>` : ''}
            <button class="btn-delete-service" data-service-id="${svc.id}"
              style="color:var(--text-muted);font-size:0.7rem;padding:4px 8px;border-radius:6px;background:var(--surface-3);">
              🗑️
            </button>
          </div>
        </div>
      `;
    }).join('')}
  </div>`;
}

function renderInfoTab(vehicle) {
  const rows = [
    ['Marca', vehicle.make],
    ['Modelo', vehicle.model],
    ['Ano', vehicle.year],
    ['Motor', vehicle.engine || '—'],
    ['Combustível', getFuelLabel(vehicle.fuel)],
    ['Câmbio', getTransLabel(vehicle.transmission)],
    ['Cor', vehicle.color || '—'],
    ['Placa', vehicle.plate || '—'],
  ];

  return `
    <div class="settings-list" style="border-radius:16px;overflow:hidden;margin-bottom:16px;">
      ${rows.map(([label, value]) => `
        <div class="settings-item" style="cursor:default;">
          <div class="settings-item-text">
            <span>${label}</span>
            <strong>${value}</strong>
          </div>
        </div>
      `).join('')}
    </div>
    ${vehicle.notes ? `
      <div class="card" style="padding:16px;margin-bottom:16px;">
        <div class="form-section-title" style="font-size:0.7rem;font-weight:700;letter-spacing:0.1em;text-transform:uppercase;color:var(--text-muted);margin-bottom:8px;">Observações</div>
        <p style="font-size:0.85rem;color:var(--text-secondary);line-height:1.6;">${vehicle.notes}</p>
      </div>
    ` : ''}
    <button class="btn btn-secondary" id="btn-edit-vehicle">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
      Editar Veículo
    </button>
  `;
}

function showKmModal(user, vehicle, onSave) {
  const overlay = document.createElement('div');
  overlay.className = 'modal-overlay';
  overlay.innerHTML = `
    <div class="modal">
      <div class="modal-handle"></div>
      <div class="modal-title">Atualizar Quilometragem</div>
      <div class="form-group">
        <label class="form-label">KM atual do odômetro</label>
        <div class="input-wrapper">
          <input class="form-input with-suffix" type="number" id="modal-km-input" 
            value="${vehicle.currentKm||''}" min="${vehicle.currentKm||0}" placeholder="0" />
          <span class="input-suffix">km</span>
        </div>
        <p class="form-hint">Valor atual: ${Number(vehicle.currentKm||0).toLocaleString('pt-BR')} km</p>
      </div>
      <div style="display:flex;gap:12px;margin-top:16px;">
        <button class="btn btn-secondary" id="modal-km-cancel" style="flex:1;">Cancelar</button>
        <button class="btn btn-primary" id="modal-km-save" style="flex:2;">Salvar</button>
      </div>
    </div>
  `;

  document.body.appendChild(overlay);
  document.getElementById('modal-km-input').focus();

  document.getElementById('modal-km-cancel').onclick = () => overlay.remove();
  overlay.addEventListener('click', (e) => { if (e.target === overlay) overlay.remove(); });

  document.getElementById('modal-km-save').onclick = async () => {
    const val = document.getElementById('modal-km-input').value;
    if (!val || Number(val) < 0) { showToast('KM inválido', 'warning'); return; }
    await onSave(Number(val));
    overlay.remove();
  };
}

function getFuelLabel(fuel) {
  const map = { flex: 'Flex', gasoline: 'Gasolina', diesel: 'Diesel', electric: 'Elétrico', hybrid: 'Híbrido', cng: 'GNV' };
  return map[fuel] || fuel || '—';
}

function getTransLabel(t) {
  const map = { manual: 'Manual', automatic: 'Automático', cvt: 'CVT', dct: 'DCT' };
  return map[t] || t || '—';
}

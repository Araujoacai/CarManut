// ============================================================
// add-service.js — Registrar Serviço / Peças
// ============================================================
import { getVehicles, getVehicle, addService, updateKm } from '../db.js';
import { MAINTENANCE_ITEMS, SERVICE_CATEGORIES, formatKm } from '../maintenance-data.js';
import { showToast } from '../components/toast.js';
import { router } from '../app.js';

export async function renderAddService(container, user, params = {}) {
  let { vehicleId } = params;

  container.innerHTML = `<div class="loading-overlay"><div class="spinner"></div></div>`;

  // Load vehicles
  let vehicles = [], selectedVehicle = null;
  try {
    const { getVehicles } = await import('../db.js');
    vehicles = await getVehicles(user.uid);
    if (vehicleId) {
      selectedVehicle = vehicles.find(v => v.id === vehicleId) || null;
    } else if (vehicles.length === 1) {
      selectedVehicle = vehicles[0];
      vehicleId = vehicles[0].id;
    }
  } catch { showToast('Erro ao carregar veículos', 'error'); }

  const today = new Date().toISOString().split('T')[0];

  container.innerHTML = `
    <div class="form-page page">

      <!-- Veículo -->
      <div class="form-section">
        <div class="form-section-title">Veículo</div>
        <div class="form-group">
          <label class="form-label">Selecione o Veículo</label>
          <select class="form-select" id="field-vehicle">
            <option value="">Selecione...</option>
            ${vehicles.map(v => `<option value="${v.id}" ${v.id===vehicleId?'selected':''}>${v.emoji||'🚗'} ${v.make} ${v.model} (${v.year})</option>`).join('')}
          </select>
        </div>
        <div id="vehicle-km-display" class="${selectedVehicle ? '' : 'hidden'}" style="background:var(--surface-3);border-radius:10px;padding:10px 14px;margin-top:8px;font-size:0.82rem;color:var(--text-secondary);">
          KM atual: <strong id="vehicle-current-km" style="color:var(--amber-500);">${selectedVehicle ? Number(selectedVehicle.currentKm||0).toLocaleString('pt-BR') : 0} km</strong>
        </div>
      </div>

      <!-- Tipo de Serviço -->
      <div class="form-section">
        <div class="form-section-title">Tipo de Serviço</div>
        <div class="form-group">
          <label class="form-label">Categoria</label>
          <select class="form-select" id="field-category">
            ${SERVICE_CATEGORIES.map(c => `<option value="${c.id}">${c.emoji} ${c.label}</option>`).join('')}
          </select>
        </div>
        <div class="form-group">
          <label class="form-label">Descrição do Serviço</label>
          <input class="form-input" type="text" id="field-service-name" placeholder="Ex: Troca de óleo e filtro" />
        </div>
      </div>

      <!-- Peças (para rastrear manutenção) -->
      <div class="form-section">
        <div class="form-section-title">Peças / Itens Realizados <span style="color:var(--text-muted);font-weight:400;">(para rastrear intervalos)</span></div>
        <div class="parts-grid" id="parts-grid">
          ${MAINTENANCE_ITEMS.map(item => `
            <button type="button" class="part-chip" data-part-id="${item.id}" title="${item.note||''}">
              ${item.emoji} ${item.name}
            </button>
          `).join('')}
        </div>
      </div>

      <!-- Data e KM -->
      <div class="form-section">
        <div class="form-section-title">Quando foi realizado</div>
        <div class="form-row">
          <div class="form-group">
            <label class="form-label" for="field-date">Data</label>
            <input class="form-input" type="date" id="field-date" value="${today}" />
          </div>
          <div class="form-group">
            <label class="form-label" for="field-km">KM no momento</label>
            <div class="input-wrapper">
              <input class="form-input with-suffix" type="number" id="field-service-km"
                placeholder="${selectedVehicle ? selectedVehicle.currentKm||'' : ''}"
                value="${selectedVehicle ? selectedVehicle.currentKm||'' : ''}" min="0" />
              <span class="input-suffix">km</span>
            </div>
          </div>
        </div>
        <div class="form-group">
          <label class="form-label" style="display:flex;align-items:center;gap:8px;">
            <input type="checkbox" id="update-km-check" checked style="accent-color:var(--amber-500);width:16px;height:16px;" />
            Atualizar KM do veículo para este valor
          </label>
        </div>
      </div>

      <!-- Detalhes -->
      <div class="form-section">
        <div class="form-section-title">Detalhes</div>
        <div class="form-row">
          <div class="form-group">
            <label class="form-label" for="field-cost">Valor Gasto</label>
            <div class="input-wrapper">
              <span class="input-prefix">R$</span>
              <input class="form-input with-prefix" type="number" id="field-cost" placeholder="0,00" min="0" step="0.01" />
            </div>
          </div>
          <div class="form-group">
            <label class="form-label" for="field-workshop">Oficina / Mecânico</label>
            <input class="form-input" type="text" id="field-workshop" placeholder="Nome da oficina" />
          </div>
        </div>
        <div class="form-group">
          <label class="form-label" for="field-notes">Observações</label>
          <textarea class="form-textarea" id="field-notes" placeholder="Detalhes adicionais, marca das peças, etc."></textarea>
        </div>
      </div>

      <div style="height:120px;"></div>
    </div>

    <div class="bottom-action">
      <button class="btn btn-primary" id="btn-save-service">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" width="20" height="20"><path d="M19 21H5a2 2 0 01-2-2V5a2 2 0 012-2h11l5 5v11a2 2 0 01-2 2z"/><polyline points="17 21 17 13 7 13 7 21"/></svg>
        Registrar Serviço
      </button>
    </div>
  `;

  // Part chip selection
  const selectedParts = new Set();
  document.querySelectorAll('.part-chip').forEach(chip => {
    chip.addEventListener('click', () => {
      const partId = chip.dataset.partId;
      if (selectedParts.has(partId)) {
        selectedParts.delete(partId);
        chip.classList.remove('selected');
      } else {
        selectedParts.add(partId);
        chip.classList.add('selected');
      }
    });
  });

  // Vehicle change
  document.getElementById('field-vehicle').addEventListener('change', (e) => {
    const v = vehicles.find(v => v.id === e.target.value);
    if (v) {
      vehicleId = v.id;
      selectedVehicle = v;
      document.getElementById('vehicle-current-km').textContent = `${Number(v.currentKm||0).toLocaleString('pt-BR')} km`;
      document.getElementById('vehicle-km-display').classList.remove('hidden');
      document.getElementById('field-service-km').value = v.currentKm || '';
      document.getElementById('field-service-km').placeholder = v.currentKm || '';
    } else {
      document.getElementById('vehicle-km-display').classList.add('hidden');
    }
  });

  // Category → auto-fill service name
  document.getElementById('field-category').addEventListener('change', (e) => {
    const cat = SERVICE_CATEGORIES.find(c => c.id === e.target.value);
    if (cat && !document.getElementById('field-service-name').value) {
      document.getElementById('field-service-name').value = cat.label;
    }
  });

  // Save
  document.getElementById('btn-save-service').addEventListener('click', async () => {
    const vid = document.getElementById('field-vehicle').value;
    if (!vid) { showToast('Selecione um veículo', 'warning'); return; }
    const km = document.getElementById('field-service-km').value;
    if (!km) { showToast('Informe o KM no momento do serviço', 'warning'); return; }
    const serviceName = document.getElementById('field-service-name').value.trim();
    if (!serviceName) { showToast('Descreva o serviço realizado', 'warning'); return; }

    const btn = document.getElementById('btn-save-service');
    btn.disabled = true;
    btn.innerHTML = `<div class="spinner"></div> Salvando...`;

    const category = document.getElementById('field-category').value;
    const catData = SERVICE_CATEGORIES.find(c => c.id === category);

    try {
      await addService(user.uid, vid, {
        type:        category,
        serviceName,
        emoji:       catData?.emoji || '🔧',
        parts:       [...selectedParts],
        date:        new Date(document.getElementById('field-date').value),
        km:          Number(km),
        cost:        Number(document.getElementById('field-cost').value) || 0,
        workshop:    document.getElementById('field-workshop').value.trim(),
        notes:       document.getElementById('field-notes').value.trim(),
      });

      // Update vehicle KM if checked
      if (document.getElementById('update-km-check').checked) {
        const v = vehicles.find(v => v.id === vid);
        if (v && Number(km) > (v.currentKm || 0)) {
          await updateKm(user.uid, vid, Number(km));
        }
      }

      showToast('Serviço registrado!', 'success');
      router.navigate(vehicleId ? 'vehicle-detail' : 'home', vehicleId ? { vehicleId } : {});
    } catch (err) {
      console.error(err);
      showToast('Erro ao salvar', 'error');
      btn.disabled = false;
      btn.innerHTML = 'Registrar Serviço';
    }
  });
}

// ============================================================
// vehicle-form.js — Cadastrar / Editar Veículo
// ============================================================
import { addVehicle, updateVehicle, getVehicle } from '../db.js';
import { CAR_BRANDS, FUEL_TYPES, TRANSMISSION_TYPES, VEHICLE_PRESETS } from '../maintenance-data.js';
import { showToast } from '../components/toast.js';
import { router } from '../app.js';

const CURRENT_YEAR = new Date().getFullYear();
const VEHICLE_EMOJIS = ['🚗','🚙','🏎️','🚕','🚐','🛻','🚌','🏍️'];

export async function renderVehicleForm(container, user, params = {}) {
  const { vehicleId } = params;
  const isEdit = !!vehicleId;

  let vehicle = null;
  if (isEdit) {
    container.innerHTML = `<div class="loading-overlay"><div class="spinner"></div></div>`;
    vehicle = await getVehicle(user.uid, vehicleId);
  }

  // Year options
  const years = [];
  for (let y = CURRENT_YEAR + 1; y >= 1980; y--) years.push(y);

  container.innerHTML = `
    <div class="form-page page">
      <div class="form-section">
        <div class="form-section-title">Emoji do Veículo</div>
        <div style="display:flex;gap:8px;flex-wrap:wrap;margin-bottom:8px;">
          ${VEHICLE_EMOJIS.map(e => `
            <button type="button" class="emoji-btn" data-emoji="${e}" 
              style="font-size:1.8rem;padding:8px;border-radius:12px;background:${(vehicle?.emoji||'🚗')===e?'rgba(245,158,11,0.15)':'var(--surface-3)'};border:2px solid ${(vehicle?.emoji||'🚗')===e?'var(--amber-500)':'transparent'};cursor:pointer;transition:all 0.15s;">
              ${e}
            </button>
          `).join('')}
        </div>
        <input type="hidden" id="field-emoji" value="${vehicle?.emoji || '🚗'}" />
      </div>

      <div class="form-section">
        <div class="form-section-title">Dados do Veículo</div>

        <div class="form-group">
          <label class="form-label" for="field-make">Marca</label>
          <select class="form-select" id="field-make" required>
            <option value="">Selecione a marca</option>
            ${CAR_BRANDS.map(b => `<option value="${b}" ${vehicle?.make===b?'selected':''}>${b}</option>`).join('')}
          </select>
        </div>

        <div class="form-group">
          <label class="form-label" for="field-model">Modelo</label>
          <input class="form-input" type="text" id="field-model" placeholder="Ex: Civic LXS" value="${vehicle?.model||''}" required />
        </div>

        <div class="form-row">
          <div class="form-group">
            <label class="form-label" for="field-year">Ano</label>
            <select class="form-select" id="field-year" required>
              ${years.map(y => `<option value="${y}" ${vehicle?.year==y?'selected':''}>${y}</option>`).join('')}
            </select>
          </div>
          <div class="form-group">
            <label class="form-label" for="field-fuel">Combustível</label>
            <select class="form-select" id="field-fuel">
              ${FUEL_TYPES.map(f => `<option value="${f.id}" ${vehicle?.fuel===f.id?'selected':''}>${f.label}</option>`).join('')}
            </select>
          </div>
        </div>

        <div class="form-row">
          <div class="form-group">
            <label class="form-label" for="field-engine">Motor</label>
            <input class="form-input" type="text" id="field-engine" placeholder="Ex: 1.8 R18A" value="${vehicle?.engine||''}" />
          </div>
          <div class="form-group">
            <label class="form-label" for="field-transmission">Câmbio</label>
            <select class="form-select" id="field-transmission">
              ${TRANSMISSION_TYPES.map(t => `<option value="${t.id}" ${vehicle?.transmission===t.id?'selected':''}>${t.label}</option>`).join('')}
            </select>
          </div>
        </div>
      </div>

      <div class="form-section">
        <div class="form-section-title">Quilometragem</div>
        <div class="form-group">
          <label class="form-label" for="field-km">KM Atual</label>
          <div class="input-wrapper">
            <input class="form-input with-suffix" type="number" id="field-km" 
              placeholder="0" min="0" max="9999999" value="${vehicle?.currentKm||''}" required />
            <span class="input-suffix">km</span>
          </div>
          <p class="form-hint">Informe a quilometragem atual do odômetro.</p>
        </div>
      </div>

      <div class="form-section">
        <div class="form-section-title">Informações Adicionais</div>
        <div class="form-row">
          <div class="form-group">
            <label class="form-label" for="field-plate">Placa</label>
            <input class="form-input" type="text" id="field-plate" 
              placeholder="ABC-1234" value="${vehicle?.plate||''}" maxlength="8" 
              style="text-transform:uppercase;" />
          </div>
          <div class="form-group">
            <label class="form-label" for="field-color">Cor</label>
            <input class="form-input" type="text" id="field-color" 
              placeholder="Prata, Preto..." value="${vehicle?.color||''}" />
          </div>
        </div>
        <div class="form-group">
          <label class="form-label" for="field-notes">Observações</label>
          <textarea class="form-textarea" id="field-notes" placeholder="Notas sobre o veículo...">${vehicle?.notes||''}</textarea>
        </div>
      </div>

      ${isEdit ? `
        <div class="form-section">
          <button type="button" class="btn btn-danger" id="btn-delete-vehicle">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6"/><path d="M10 11v6M14 11v6"/><path d="M9 6V4h6v2"/></svg>
            Excluir Veículo
          </button>
        </div>
      ` : ''}

      <div style="height:120px;"></div>
    </div>

    <div class="bottom-action">
      <button class="btn btn-primary" id="btn-save-vehicle">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M19 21H5a2 2 0 01-2-2V5a2 2 0 012-2h11l5 5v11a2 2 0 01-2 2z"/><polyline points="17 21 17 13 7 13 7 21"/><polyline points="7 3 7 8 15 8"/></svg>
        ${isEdit ? 'Salvar Alterações' : 'Adicionar Veículo'}
      </button>
    </div>
  `;

  // Emoji selector
  document.querySelectorAll('.emoji-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.emoji-btn').forEach(b => {
        b.style.background = 'var(--surface-3)';
        b.style.border = '2px solid transparent';
      });
      btn.style.background = 'rgba(245,158,11,0.15)';
      btn.style.border = '2px solid var(--amber-500)';
      document.getElementById('field-emoji').value = btn.dataset.emoji;
    });
  });

  // Save
  document.getElementById('btn-save-vehicle').addEventListener('click', async () => {
    const btn = document.getElementById('btn-save-vehicle');
    const make  = document.getElementById('field-make').value.trim();
    const model = document.getElementById('field-model').value.trim();
    const year  = document.getElementById('field-year').value;
    const km    = document.getElementById('field-km').value;

    if (!make || !model || !year || km === '') {
      showToast('Preencha os campos obrigatórios', 'warning');
      return;
    }

    btn.disabled = true;
    btn.innerHTML = `<div class="spinner"></div> Salvando...`;

    const data = {
      emoji:        document.getElementById('field-emoji').value,
      make, model,
      year:         Number(year),
      fuel:         document.getElementById('field-fuel').value,
      engine:       document.getElementById('field-engine').value.trim(),
      transmission: document.getElementById('field-transmission').value,
      currentKm:    Number(km),
      plate:        document.getElementById('field-plate').value.toUpperCase().trim(),
      color:        document.getElementById('field-color').value.trim(),
      notes:        document.getElementById('field-notes').value.trim(),
    };

    try {
      if (isEdit) {
        await updateVehicle(user.uid, vehicleId, data);
        showToast('Veículo atualizado!', 'success');
      } else {
        await addVehicle(user.uid, data);
        showToast('Veículo adicionado!', 'success');
      }
      router.navigate('home');
    } catch (err) {
      console.error(err);
      showToast('Erro ao salvar. Tente novamente.', 'error');
      btn.disabled = false;
      btn.innerHTML = isEdit ? 'Salvar Alterações' : 'Adicionar Veículo';
    }
  });

  // Delete
  document.getElementById('btn-delete-vehicle')?.addEventListener('click', async () => {
    if (!confirm(`Excluir ${vehicle?.make} ${vehicle?.model}? Todo o histórico será apagado.`)) return;
    try {
      const { deleteVehicle } = await import('../db.js');
      await deleteVehicle(user.uid, vehicleId);
      showToast('Veículo excluído', 'info');
      router.navigate('home');
    } catch (err) {
      showToast('Erro ao excluir', 'error');
    }
  });
}

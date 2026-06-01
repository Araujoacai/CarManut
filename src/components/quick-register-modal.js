// ============================================================
// quick-register-modal.js — Modal de Registro Rápido por Item
// ============================================================
import { addService, updateKm, getVehicle } from '../db.js';
import { showToast } from './toast.js';

/**
 * Abre modal para registrar/atualizar um item de manutenção específico.
 * @param {object} opts
 *   item        — objeto MAINTENANCE_ITEMS (id, name, emoji, note…)
 *   vehicle     — objeto do veículo { id, make, model, currentKm, … }
 *   user        — Firebase user
 *   lastService — { km, date } último registro (ou null)
 *   onSaved     — callback após salvar (sem args)
 */
export function openQuickRegisterModal({ item, vehicle, user, lastService, onSaved }) {
  // Remove modal anterior se existir
  document.getElementById('qr-modal-overlay')?.remove();

  const today    = new Date().toISOString().split('T')[0];
  const lastDate = lastService?.date
    ? (lastService.date instanceof Date ? lastService.date : new Date(lastService.date))
        .toISOString().split('T')[0]
    : today;
  const lastKm   = lastService?.km ?? vehicle.currentKm ?? '';

  const overlay = document.createElement('div');
  overlay.id        = 'qr-modal-overlay';
  overlay.className = 'modal-overlay';

  overlay.innerHTML = `
    <div class="modal" id="qr-modal" style="max-height:92svh;">
      <div class="modal-handle"></div>

      <!-- Cabeçalho do item -->
      <div style="display:flex;align-items:center;gap:12px;margin-bottom:20px;">
        <div style="
          width:48px;height:48px;border-radius:12px;
          background:rgba(245,158,11,0.12);border:1px solid rgba(245,158,11,0.25);
          display:flex;align-items:center;justify-content:center;font-size:1.4rem;flex-shrink:0;">
          ${item.emoji}
        </div>
        <div>
          <div style="font-size:1rem;font-weight:700;letter-spacing:-0.02em;">${item.name}</div>
          <div style="font-size:0.75rem;color:var(--text-secondary);margin-top:2px;">
            ${vehicle.emoji || '🚗'} ${vehicle.make} ${vehicle.model}
          </div>
        </div>
      </div>

      <!-- Última vez -->
      ${lastService ? `
        <div style="
          background:rgba(245,158,11,0.07);border:1px solid rgba(245,158,11,0.18);
          border-radius:10px;padding:10px 14px;margin-bottom:16px;
          font-size:0.78rem;color:var(--text-secondary);line-height:1.6;">
          <span style="color:var(--amber-500);font-weight:600;">Último registro:</span>
          ${Number(lastService.km||0).toLocaleString('pt-BR')} km
          em ${(lastService.date instanceof Date ? lastService.date : new Date(lastService.date))
              .toLocaleDateString('pt-BR')}
        </div>
      ` : `
        <div style="
          background:rgba(239,68,68,0.07);border:1px solid rgba(239,68,68,0.18);
          border-radius:10px;padding:10px 14px;margin-bottom:16px;
          font-size:0.78rem;color:#f87171;">
          ⚠️ Nunca registrado — informe quando foi feito pela última vez.
        </div>
      `}

      <!-- Nota do item -->
      ${item.note ? `
        <div style="
          background:var(--surface-3);border-radius:10px;padding:10px 14px;
          margin-bottom:16px;font-size:0.75rem;color:var(--text-muted);line-height:1.6;">
          💡 ${item.note}
        </div>
      ` : ''}

      <!-- Formulário -->
      <div style="display:flex;flex-direction:column;gap:12px;">

        <div class="form-row">
          <div class="form-group" style="margin:0;">
            <label class="form-label" for="qr-date">Data do serviço</label>
            <input class="form-input" type="date" id="qr-date" value="${lastDate}" />
          </div>
          <div class="form-group" style="margin:0;">
            <label class="form-label" for="qr-km">KM no momento</label>
            <div class="input-wrapper">
              <input class="form-input with-suffix" type="number"
                id="qr-km" value="${lastKm}" min="0" placeholder="${vehicle.currentKm||0}" />
              <span class="input-suffix">km</span>
            </div>
          </div>
        </div>

        <div class="form-row">
          <div class="form-group" style="margin:0;">
            <label class="form-label" for="qr-cost">Valor gasto</label>
            <div class="input-wrapper">
              <span class="input-prefix">R$</span>
              <input class="form-input with-prefix" type="number"
                id="qr-cost" placeholder="0,00" min="0" step="0.01" value="${lastService?.cost||''}" />
            </div>
          </div>
          <div class="form-group" style="margin:0;">
            <label class="form-label" for="qr-workshop">Oficina / Mecânico</label>
            <input class="form-input" type="text"
              id="qr-workshop" placeholder="Nome da oficina" value="${lastService?.workshop||''}" />
          </div>
        </div>

        <div class="form-group" style="margin:0;">
          <label class="form-label" for="qr-notes">Observações</label>
          <textarea class="form-textarea" id="qr-notes"
            placeholder="Marca da peça, detalhes do serviço..."
            style="min-height:64px;">${lastService?.notes||''}</textarea>
        </div>

        <label style="display:flex;align-items:center;gap:10px;font-size:0.82rem;color:var(--text-secondary);cursor:pointer;">
          <input type="checkbox" id="qr-update-km" checked
            style="accent-color:var(--amber-500);width:16px;height:16px;flex-shrink:0;" />
          Atualizar KM do veículo para este valor
        </label>

      </div>

      <!-- Botões -->
      <div style="display:flex;gap:12px;margin-top:20px;">
        <button class="btn btn-secondary" id="qr-cancel" style="flex:1;">Cancelar</button>
        <button class="btn btn-primary"   id="qr-save"   style="flex:2;">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" width="18" height="18">
            <path d="M19 21H5a2 2 0 01-2-2V5a2 2 0 012-2h11l5 5v11a2 2 0 01-2 2z"/>
            <polyline points="17 21 17 13 7 13 7 21"/>
          </svg>
          Salvar Registro
        </button>
      </div>
    </div>
  `;

  document.body.appendChild(overlay);

  // Fechar ao clicar fora
  overlay.addEventListener('click', e => { if (e.target === overlay) overlay.remove(); });
  document.getElementById('qr-cancel').onclick = () => overlay.remove();

  // Salvar
  document.getElementById('qr-save').onclick = async () => {
    const dateVal     = document.getElementById('qr-date').value;
    const kmVal       = document.getElementById('qr-km').value;
    const cost        = document.getElementById('qr-cost').value;
    const workshop    = document.getElementById('qr-workshop').value.trim();
    const notes       = document.getElementById('qr-notes').value.trim();
    const updateKmChk = document.getElementById('qr-update-km').checked;

    if (!dateVal) { showToast('Informe a data do serviço', 'warning'); return; }
    if (!kmVal)   { showToast('Informe o KM no momento', 'warning');  return; }

    const btn = document.getElementById('qr-save');
    btn.disabled = true;
    btn.innerHTML = `<div class="spinner"></div> Salvando...`;

    try {
      await addService(user.uid, vehicle.id, {
        type:        'quick',
        serviceName: item.name,
        emoji:       item.emoji,
        parts:       [item.id],
        date:        new Date(dateVal),
        km:          Number(kmVal),
        cost:        Number(cost) || 0,
        workshop,
        notes,
      });

      // Atualiza KM do veículo se checkbox marcado e KM maior
      if (updateKmChk && Number(kmVal) > (vehicle.currentKm || 0)) {
        await updateKm(user.uid, vehicle.id, Number(kmVal));
      }

      overlay.remove();
      showToast(`${item.name} registrado!`, 'success');
      onSaved && onSaved();

    } catch (err) {
      console.error(err);
      showToast('Erro ao salvar. Tente novamente.', 'error');
      btn.disabled = false;
      btn.innerHTML = `
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" width="18" height="18">
          <path d="M19 21H5a2 2 0 01-2-2V5a2 2 0 012-2h11l5 5v11a2 2 0 01-2 2z"/>
          <polyline points="17 21 17 13 7 13 7 21"/>
        </svg>
        Salvar Registro`;
    }
  };
}

// ============================================================
// settings.js — Configurações, Perfil e Notificações
// ============================================================
import { signOutUser } from '../auth.js';
import { showToast } from '../components/toast.js';
import {
  getPrefs, savePrefs, DEFAULT_PREFS,
  requestNotificationPermission, getNotificationPermission,
  checkAndNotifyMaintenance, registerPeriodicSync,
} from '../notifications.js';
import { router } from '../app.js';

export function renderSettings(container, user) {
  const prefs = getPrefs();
  const perm  = getNotificationPermission();

  const permLabel = {
    granted:       '✅ Permitidas',
    denied:        '🚫 Bloqueadas',
    default:       '⏳ Não configurado',
    'not-supported': '❌ Não suportado',
  }[perm] || '—';

  const permColor = {
    granted: 'var(--success)',
    denied:  'var(--danger)',
    default: 'var(--amber-500)',
  }[perm] || 'var(--text-muted)';

  container.innerHTML = `
    <div class="settings-page page">

      <!-- Profile Card -->
      <div class="profile-card">
        <div class="profile-avatar">
          ${user.photoURL
            ? `<img src="${user.photoURL}" alt="${user.displayName}" />`
            : `<div class="profile-avatar-placeholder">👤</div>`
          }
        </div>
        <div class="profile-info">
          <strong>${user.displayName || 'Usuário'}</strong>
          <span>${user.email}</span>
        </div>
      </div>

      <!-- Notificações -->
      <div class="settings-section">
        <div class="form-section-title" style="font-size:0.7rem;font-weight:700;letter-spacing:0.1em;text-transform:uppercase;color:var(--text-muted);margin-bottom:12px;">
          🔔 Notificações
        </div>

        <!-- Status de permissão -->
        <div style="
          background:var(--surface-2);border:1px solid rgba(255,255,255,0.06);
          border-radius:var(--radius-lg);padding:16px;margin-bottom:12px;
          display:flex;align-items:center;justify-content:space-between;
        ">
          <div>
            <div style="font-size:0.88rem;font-weight:600;">Permissão do Sistema</div>
            <div style="font-size:0.75rem;color:${permColor};margin-top:2px;">${permLabel}</div>
          </div>
          ${perm !== 'granted' ? `
            <button class="btn btn-primary btn-sm" id="btn-request-perm" style="${perm === 'denied' ? 'opacity:0.5;pointer-events:none;' : ''}">
              ${perm === 'denied' ? 'Bloqueado' : 'Permitir'}
            </button>
          ` : `
            <span style="font-size:1.2rem;">✅</span>
          `}
        </div>

        ${perm === 'denied' ? `
          <div style="background:rgba(239,68,68,0.08);border:1px solid rgba(239,68,68,0.2);border-radius:10px;padding:12px 14px;margin-bottom:12px;font-size:0.78rem;color:#f87171;line-height:1.6;">
            As notificações estão bloqueadas neste navegador.<br>
            Para reativar: <strong>Configurações do Chrome → Site → Notificações → Permitir</strong>
          </div>
        ` : ''}

        <div class="settings-list">
          <!-- Toggle Ativar/Desativar -->
          <div class="settings-item" style="cursor:default;">
            <div class="settings-item-icon">🔔</div>
            <div class="settings-item-text">
              <strong>Ativar Notificações</strong>
              <span>Alertas de manutenção</span>
            </div>
            <label class="toggle-switch" style="flex-shrink:0;">
              <input type="checkbox" id="toggle-notif-enabled"
                ${prefs.enabled ? 'checked' : ''}
                ${perm !== 'granted' ? 'disabled' : ''} />
              <span class="toggle-slider"></span>
            </label>
          </div>

          <!-- Quando notificar -->
          <div class="settings-item" style="cursor:default;">
            <div class="settings-item-icon">⏰</div>
            <div class="settings-item-text">
              <strong>Notificar quando</strong>
              <span>Limite de alerta</span>
            </div>
            <select id="select-threshold" class="form-select"
              style="width:auto;padding:6px 32px 6px 10px;font-size:0.78rem;background:var(--surface-4);"
              ${!prefs.enabled || perm !== 'granted' ? 'disabled' : ''}>
              <option value="overdue"  ${prefs.threshold==='overdue' ?'selected':''}>Só vencidos</option>
              <option value="warning"  ${prefs.threshold==='warning' ?'selected':''}>≥85% vencido</option>
              <option value="upcoming" ${prefs.threshold==='upcoming'?'selected':''}>≥70% vencido</option>
            </select>
          </div>
        </div>

        <!-- Testar notificação -->
        <button class="btn btn-secondary mt-3" id="btn-test-notif"
          style="${perm !== 'granted' || !prefs.enabled ? 'opacity:0.4;pointer-events:none;' : ''}">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="18" height="18">
            <path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9"/>
            <path d="M13.73 21a2 2 0 01-3.46 0"/>
          </svg>
          Testar Notificação Agora
        </button>

        <p style="font-size:0.72rem;color:var(--text-muted);margin-top:8px;line-height:1.6;padding:0 4px;">
          O app verifica manutenções ao abrir e, quando instalado no Android, também em segundo plano (1x/dia).
        </p>
      </div>

      <!-- Navegação -->
      <div class="settings-section">
        <div class="form-section-title" style="font-size:0.7rem;font-weight:700;letter-spacing:0.1em;text-transform:uppercase;color:var(--text-muted);margin-bottom:12px;">Geral</div>
        <div class="settings-list">
          <div class="settings-item" id="settings-vehicles">
            <div class="settings-item-icon">🚗</div>
            <div class="settings-item-text">
              <strong>Meus Veículos</strong>
              <span>Gerenciar veículos cadastrados</span>
            </div>
            <div class="settings-item-arrow"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="9 18 15 12 9 6"/></svg></div>
          </div>
          <div class="settings-item" id="settings-add-vehicle">
            <div class="settings-item-icon">➕</div>
            <div class="settings-item-text">
              <strong>Adicionar Veículo</strong>
              <span>Cadastrar novo veículo</span>
            </div>
            <div class="settings-item-arrow"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="9 18 15 12 9 6"/></svg></div>
          </div>
        </div>
      </div>

      <!-- Sobre -->
      <div class="settings-section">
        <div class="form-section-title" style="font-size:0.7rem;font-weight:700;letter-spacing:0.1em;text-transform:uppercase;color:var(--text-muted);margin-bottom:12px;">Sobre</div>
        <div class="settings-list">
          <div class="settings-item" style="cursor:default;">
            <div class="settings-item-icon">📱</div>
            <div class="settings-item-text">
              <strong>CarManut</strong>
              <span>Versão 1.1.0 · PWA</span>
            </div>
          </div>
          <div class="settings-item" style="cursor:default;">
            <div class="settings-item-icon">🔒</div>
            <div class="settings-item-text">
              <strong>Dados Seguros</strong>
              <span>Sincronizado com Firebase</span>
            </div>
          </div>
          <div class="settings-item" style="cursor:default;">
            <div class="settings-item-icon">📡</div>
            <div class="settings-item-text">
              <strong>Funciona Offline</strong>
              <span>Dados disponíveis sem internet</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Referência -->
      <div class="settings-section">
        <div class="card" style="padding:16px;">
          <p style="font-size:0.8rem;color:var(--text-secondary);line-height:1.7;">
            Dados do <strong style="color:var(--amber-500);">Honda Civic 2008 LXS 1.8</strong>
            incluídos com base no motor R18A.<br>
            <em>Consulte sempre um mecânico de confiança.</em>
          </p>
        </div>
      </div>

      <!-- Sair -->
      <div class="settings-section">
        <button class="btn btn-danger" id="btn-signout-settings">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="18" height="18">
            <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4"/>
            <polyline points="16 17 21 12 16 7"/>
            <line x1="21" y1="12" x2="9" y2="12"/>
          </svg>
          Sair da Conta
        </button>
      </div>

      <div style="height:80px;"></div>
    </div>
  `;

  // Solicitar permissão
  document.getElementById('btn-request-perm')?.addEventListener('click', async () => {
    const result = await requestNotificationPermission();
    if (result === 'granted') {
      showToast('Notificações ativadas!', 'success');
      renderSettings(container, user); // re-render
    } else if (result === 'denied') {
      showToast('Notificações bloqueadas no navegador.', 'error');
      renderSettings(container, user);
    }
  });

  // Toggle habilitado
  document.getElementById('toggle-notif-enabled')?.addEventListener('change', e => {
    const prefs = getPrefs();
    prefs.enabled = e.target.checked;
    savePrefs(prefs);
    showToast(prefs.enabled ? 'Notificações ativadas' : 'Notificações desativadas', 'info');
    // Atualiza estado do select e botão de teste
    const sel = document.getElementById('select-threshold');
    const testBtn = document.getElementById('btn-test-notif');
    if (sel) sel.disabled = !prefs.enabled;
    if (testBtn) testBtn.style.opacity = prefs.enabled ? '1' : '0.4';
    if (testBtn) testBtn.style.pointerEvents = prefs.enabled ? 'auto' : 'none';
  });

  // Threshold
  document.getElementById('select-threshold')?.addEventListener('change', e => {
    const prefs = getPrefs();
    prefs.threshold = e.target.value;
    savePrefs(prefs);
    const labels = { overdue: 'só vencidos', warning: '≥85%', upcoming: '≥70%' };
    showToast(`Notificar: ${labels[e.target.value]}`, 'info');
  });

  // Testar notificação
  document.getElementById('btn-test-notif')?.addEventListener('click', async () => {
    const btn = document.getElementById('btn-test-notif');
    btn.disabled = true;
    btn.innerHTML = `<div class="spinner"></div> Verificando...`;
    try {
      const count = await checkAndNotifyMaintenance(user, true); // força check
      if (count === 0) {
        showToast('Nenhum alerta pendente — tudo em dia! ✅', 'success');
      } else {
        showToast(`${count} alerta(s) enviado(s)! Verifique as notificações.`, 'success');
      }
    } catch (err) {
      showToast('Erro ao verificar manutenções.', 'error');
    }
    btn.disabled = false;
    btn.innerHTML = `
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="18" height="18">
        <path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9"/>
        <path d="M13.73 21a2 2 0 01-3.46 0"/>
      </svg>
      Testar Notificação Agora`;
  });

  // Navegação
  document.getElementById('settings-vehicles')?.addEventListener('click', () => router.navigate('home'));
  document.getElementById('settings-add-vehicle')?.addEventListener('click', () => router.navigate('vehicle-form'));
  document.getElementById('btn-signout-settings')?.addEventListener('click', async () => {
    if (!confirm('Deseja sair da sua conta?')) return;
    await signOutUser();
  });
}

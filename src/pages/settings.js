// ============================================================
// settings.js — Configurações e Perfil
// ============================================================
import { signOutUser } from '../auth.js';
import { showToast } from '../components/toast.js';
import { router } from '../app.js';

export function renderSettings(container, user) {
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

      <!-- General Settings -->
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

      <!-- About -->
      <div class="settings-section">
        <div class="form-section-title" style="font-size:0.7rem;font-weight:700;letter-spacing:0.1em;text-transform:uppercase;color:var(--text-muted);margin-bottom:12px;">Sobre</div>
        <div class="settings-list">
          <div class="settings-item" style="cursor:default;">
            <div class="settings-item-icon">📱</div>
            <div class="settings-item-text">
              <strong>CarManut</strong>
              <span>Versão 1.0.0 · PWA</span>
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

      <!-- Maintenance Info -->
      <div class="settings-section">
        <div class="form-section-title" style="font-size:0.7rem;font-weight:700;letter-spacing:0.1em;text-transform:uppercase;color:var(--text-muted);margin-bottom:12px;">Referência de Manutenção</div>
        <div class="card" style="padding:16px;">
          <p style="font-size:0.8rem;color:var(--text-secondary);line-height:1.7;">
            Os intervalos de manutenção são baseados nos <strong style="color:var(--text-primary);">manuais do proprietário</strong> e boas práticas da indústria automotiva.<br><br>
            Dados específicos do <strong style="color:var(--amber-500);">Honda Civic 2008 LXS 1.8</strong> foram incluídos baseados no motor R18A.<br><br>
            <em>Consulte sempre um mecânico de confiança para seu veículo específico.</em>
          </p>
        </div>
      </div>

      <!-- Sign Out -->
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

  document.getElementById('settings-vehicles')?.addEventListener('click', () => router.navigate('home'));
  document.getElementById('settings-add-vehicle')?.addEventListener('click', () => router.navigate('vehicle-form'));

  document.getElementById('btn-signout-settings').addEventListener('click', async () => {
    if (!confirm('Deseja sair da sua conta?')) return;
    await signOutUser();
  });
}

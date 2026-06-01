// ============================================================
// login.js — Página de Login com Google
// ============================================================
import { signInWithGoogle } from '../auth.js';
import { showToast } from '../components/toast.js';

export function renderLogin(container) {
  container.innerHTML = `
    <div class="login-page page">
      <div class="login-logo">
        <svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
          <rect width="64" height="64" rx="16" fill="#F59E0B"/>
          <path d="M12 40L16 28H48L52 40H12Z" fill="white" fill-opacity="0.2"/>
          <path d="M14 36H50L48 28H16L14 36Z" fill="white"/>
          <rect x="18" y="36" width="8" height="5" rx="2.5" fill="#0f0f0f"/>
          <rect x="38" y="36" width="8" height="5" rx="2.5" fill="#0f0f0f"/>
          <circle cx="22" cy="41" r="3.5" fill="#1a1a1a" stroke="white" stroke-width="1.5"/>
          <circle cx="42" cy="41" r="3.5" fill="#1a1a1a" stroke="white" stroke-width="1.5"/>
          <path d="M22 24H42" stroke="white" stroke-width="2" stroke-linecap="round"/>
          <path d="M28 20V24" stroke="white" stroke-width="2" stroke-linecap="round"/>
          <path d="M36 20V24" stroke="white" stroke-width="2" stroke-linecap="round"/>
        </svg>
      </div>

      <h1 class="login-title">CarManut</h1>
      <p class="login-tagline">Controle total da manutenção do seu veículo, baseado no manual do proprietário.</p>

      <div class="login-features">
        <div class="login-feature">
          <div class="login-feature-icon">🔔</div>
          <div class="login-feature-text">
            <strong>Lembretes Inteligentes</strong>
            <span>Alertas por KM e tempo</span>
          </div>
        </div>
        <div class="login-feature">
          <div class="login-feature-icon">📋</div>
          <div class="login-feature-text">
            <strong>Histórico Completo</strong>
            <span>Todos os serviços registrados</span>
          </div>
        </div>
        <div class="login-feature">
          <div class="login-feature-icon">🚗</div>
          <div class="login-feature-text">
            <strong>Múltiplos Veículos</strong>
            <span>Gerencie toda a sua garagem</span>
          </div>
        </div>
      </div>

      <button id="btn-google-login" class="btn-google">
        <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
          <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
          <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
          <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
        </svg>
        Continuar com Google
      </button>
    </div>
  `;

  document.getElementById('btn-google-login').addEventListener('click', async (e) => {
    const btn = e.currentTarget;
    btn.disabled = true;
    btn.innerHTML = `
      <div class="spinner"></div>
      Entrando...
    `;
    try {
      await signInWithGoogle();
    } catch (err) {
      console.error(err);
      showToast('Erro ao entrar. Tente novamente.', 'error');
      btn.disabled = false;
      btn.innerHTML = `
        <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
          <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
          <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
          <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
        </svg>
        Continuar com Google
      `;
    }
  });
}

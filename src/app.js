// ============================================================
// app.js — Router Principal + Bootstrap
// ============================================================
import { onAuthChange, signOutUser } from './auth.js';
import { renderLogin }         from './pages/login.js';
import { renderHome }          from './pages/home.js';
import { renderVehicleForm }   from './pages/vehicle-form.js';
import { renderVehicleDetail } from './pages/vehicle-detail.js';
import { renderAddService }    from './pages/add-service.js';
import { renderReminders }     from './pages/reminders.js';
import { renderSettings }      from './pages/settings.js';

// ============================================================
// Router
// ============================================================
class Router {
  constructor() {
    this.current  = null;
    this.params   = {};
    this.user     = null;
    this.history  = [];
  }

  navigate(page, params = {}) {
    if (this.current) this.history.push({ page: this.current, params: this.params });
    this.current = page;
    this.params  = params;
    this.render();
  }

  back() {
    const prev = this.history.pop();
    if (prev) {
      this.current = prev.page;
      this.params  = prev.params;
      this.render();
    } else {
      this.navigate('home');
    }
  }

  render() {
    if (!this.user) {
      this._showLoginUI();
      return;
    }
    this._showAppUI();

    const page      = this.current || 'home';
    const container = document.getElementById('page-container');
    const header    = document.getElementById('app-header');
    const backBtn   = document.getElementById('btn-back');
    const titleEl   = document.getElementById('header-title');
    const subEl     = document.getElementById('header-sub');
    const nav       = document.getElementById('bottom-nav');

    // Scroll to top
    container.scrollTo(0, 0);

    // Update header & nav based on page
    const pageConfig = {
      home:           { title: 'CarManut', sub: null, back: false, showNav: true, navActive: 'home' },
      reminders:      { title: 'Lembretes', sub: null, back: false, showNav: true, navActive: 'reminders' },
      'add-service':  { title: 'Registrar Serviço', sub: null, back: true, showNav: true, navActive: 'add-service' },
      history:        { title: 'Histórico', sub: null, back: false, showNav: true, navActive: 'history' },
      settings:       { title: 'Configurações', sub: null, back: false, showNav: true, navActive: 'settings' },
      'vehicle-form': { title: this.params.vehicleId ? 'Editar Veículo' : 'Novo Veículo', sub: null, back: true, showNav: false, navActive: null },
      'vehicle-detail': { title: 'Meu Veículo', sub: null, back: true, showNav: true, navActive: 'home' },
    };

    const cfg = pageConfig[page] || pageConfig.home;

    titleEl.textContent = cfg.title;

    if (cfg.sub) {
      subEl.textContent = cfg.sub;
      subEl.classList.remove('hidden');
    } else {
      subEl.classList.add('hidden');
    }

    if (cfg.back && this.history.length > 0) {
      backBtn.classList.remove('hidden');
    } else {
      backBtn.classList.add('hidden');
    }

    // Nav items active state
    document.querySelectorAll('.nav-item').forEach(item => {
      item.classList.toggle('active', item.dataset.page === cfg.navActive);
    });

    // Render page
    switch (page) {
      case 'home':           renderHome(container, this.user); break;
      case 'reminders':      renderReminders(container, this.user); break;
      case 'add-service':    renderAddService(container, this.user, this.params); break;
      case 'vehicle-form':   renderVehicleForm(container, this.user, this.params); break;
      case 'vehicle-detail': renderVehicleDetail(container, this.user, this.params); break;
      case 'settings':       renderSettings(container, this.user); break;
      default:               renderHome(container, this.user);
    }
  }

  _showLoginUI() {
    document.getElementById('splash-screen').classList.add('hidden');
    document.getElementById('app').classList.add('hidden');

    // Render login directly in body
    let loginWrap = document.getElementById('login-wrapper');
    if (!loginWrap) {
      loginWrap = document.createElement('div');
      loginWrap.id = 'login-wrapper';
      document.body.appendChild(loginWrap);
    }
    loginWrap.classList.remove('hidden');
    renderLogin(loginWrap);

    document.getElementById('app-header').classList.add('hidden');
    document.getElementById('bottom-nav').classList.add('hidden');
  }

  _showAppUI() {
    document.getElementById('splash-screen').classList.add('hidden');

    const loginWrap = document.getElementById('login-wrapper');
    if (loginWrap) loginWrap.classList.add('hidden');

    document.getElementById('app').classList.remove('hidden');
    document.getElementById('app-header').classList.remove('hidden');
    document.getElementById('bottom-nav').classList.remove('hidden');

    // Update user avatar in header
    const avatarBtn = document.getElementById('btn-user-avatar');
    const avatarImg = document.getElementById('user-avatar-img');
    if (this.user?.photoURL) {
      avatarImg.src = this.user.photoURL;
      avatarBtn.classList.remove('hidden');
    }
    document.getElementById('btn-signout').classList.remove('hidden');
  }
}

export const router = new Router();

// ============================================================
// Bootstrap
// ============================================================
function init() {
  // Register Service Worker
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('/sw.js').catch(console.error);
  }

  // Bottom nav clicks
  document.querySelectorAll('.nav-item').forEach(item => {
    item.addEventListener('click', () => {
      const page = item.dataset.page;
      if (page) router.navigate(page);
    });
  });

  // Back button
  document.getElementById('btn-back')?.addEventListener('click', () => router.back());

  // Sign out (header)
  document.getElementById('btn-signout')?.addEventListener('click', async () => {
    if (confirm('Deseja sair da sua conta?')) await signOutUser();
  });

  // Avatar click → settings
  document.getElementById('btn-user-avatar')?.addEventListener('click', () => {
    router.navigate('settings');
  });

  // Auth state
  onAuthChange(user => {
    router.user = user;

    if (user) {
      // Logged in
      if (!router.current || router.current === 'login') {
        router.navigate('home');
      } else {
        router.render();
      }
    } else {
      // Logged out
      router.current = null;
      router.history = [];
      router.render();
    }
  });

  // Hide splash after min 1.8s (matches loader animation)
  setTimeout(() => {
    const splash = document.getElementById('splash-screen');
    splash?.classList.add('fade-out');
    setTimeout(() => splash?.classList.add('hidden'), 400);
  }, 1800);
}

// Start app
init();

// NajaVoice PWA Registration
// Add this script to every HTML page

(function() {

  // ── Register Service Worker ──
  if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
      navigator.serviceWorker.register('/sw.js')
        .then(reg => console.log('NajaVoice SW registered:', reg.scope))
        .catch(err => console.log('NajaVoice SW error:', err));
    });
  }

  // ── Install Prompt (Add to Home Screen) ──
  let deferredPrompt;

  window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    deferredPrompt = e;
    showInstallBanner();
  });

  function showInstallBanner() {
    // Don't show if already installed
    if (window.matchMedia('(display-mode: standalone)').matches) return;
    if (localStorage.getItem('nv_pwa_dismissed')) return;

    const banner = document.createElement('div');
    banner.id = 'pwa-banner';
    banner.style.cssText = `
      position: fixed;
      bottom: 0; left: 0; right: 0;
      background: #0d1f0f;
      color: #fff;
      padding: 1rem 1.2rem;
      display: flex;
      align-items: center;
      gap: 1rem;
      z-index: 99999;
      box-shadow: 0 -4px 20px rgba(0,0,0,0.3);
      animation: slideUp 0.4s ease;
      flex-wrap: wrap;
    `;

    banner.innerHTML = `
      <style>
        @keyframes slideUp {
          from { transform: translateY(100%); }
          to   { transform: translateY(0); }
        }
      </style>
      <div style="font-size:2rem;flex-shrink:0;">🇳🇬</div>
      <div style="flex:1;min-width:160px;">
        <div style="font-family:Syne,sans-serif;font-size:0.92rem;font-weight:800;margin-bottom:0.15rem;">
          Install NajaVoice App
        </div>
        <div style="font-size:0.75rem;color:rgba(255,255,255,0.55);line-height:1.4;">
          Add to your home screen for the best experience — works offline too!
        </div>
      </div>
      <div style="display:flex;gap:0.5rem;flex-shrink:0;">
        <button id="pwa-install-btn" style="
          background:#008751;color:#fff;border:none;
          padding:0.6rem 1.1rem;border-radius:8px;
          font-family:Syne,sans-serif;font-size:0.85rem;
          font-weight:700;cursor:pointer;
        ">📲 Install</button>
        <button id="pwa-dismiss-btn" style="
          background:transparent;color:rgba(255,255,255,0.5);
          border:1px solid rgba(255,255,255,0.2);
          padding:0.6rem 0.8rem;border-radius:8px;
          font-family:DM Sans,sans-serif;font-size:0.82rem;
          cursor:pointer;
        ">✕</button>
      </div>
    `;

    document.body.appendChild(banner);

    document.getElementById('pwa-install-btn').onclick = async () => {
      banner.remove();
      if (deferredPrompt) {
        deferredPrompt.prompt();
        const { outcome } = await deferredPrompt.userChoice;
        if (outcome === 'accepted') {
          console.log('NajaVoice installed!');
          showToastPWA('🎉 NajaVoice installed! Find it on your home screen.');
        }
        deferredPrompt = null;
      }
    };

    document.getElementById('pwa-dismiss-btn').onclick = () => {
      banner.remove();
      localStorage.setItem('nv_pwa_dismissed', '1');
    };
  }

  // ── Show toast helper ──
  function showToastPWA(msg) {
    const t = document.getElementById('toast');
    if (t) {
      t.innerHTML = msg;
      t.classList.add('show');
      setTimeout(() => t.classList.remove('show'), 4000);
    }
  }

  // ── Detect if running as installed PWA ──
  if (window.matchMedia('(display-mode: standalone)').matches) {
    document.documentElement.classList.add('pwa-mode');
    console.log('Running as installed PWA');
  }

  // ── Online/Offline indicator ──
  function updateOnlineStatus() {
    const isOnline = navigator.onLine;
    let indicator = document.getElementById('online-indicator');

    if (!isOnline) {
      if (!indicator) {
        indicator = document.createElement('div');
        indicator.id = 'online-indicator';
        indicator.style.cssText = `
          position: fixed; top: 0; left: 0; right: 0;
          background: #e53e3e; color: #fff;
          text-align: center; font-size: 0.8rem;
          padding: 0.4rem; z-index: 99998;
          font-family: DM Sans, sans-serif;
        `;
        indicator.textContent = '📡 You are offline — showing cached content';
        document.body.prepend(indicator);
      }
    } else {
      if (indicator) indicator.remove();
    }
  }

  window.addEventListener('online', updateOnlineStatus);
  window.addEventListener('offline', updateOnlineStatus);
  updateOnlineStatus();

})();

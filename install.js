/* install.js v1.0 */
(function(){
  const installBtn = document.getElementById('installPWA');
  const dlBtn = document.getElementById('downloadShortcut');
  const menu = document.getElementById('menuPopup');

  let deferredPrompt = null;
  let iosHintShown = localStorage.getItem('iosHintShown') === 'true';

  function isStandalone(){
    return window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone === true;
  }
  function isiOS(){
    const ua = window.navigator.userAgent.toLowerCase();
    return /iphone|ipad|ipod/.test(ua);
  }
  function isSafari(){
    const ua = window.navigator.userAgent;
    return /Safari/.test(ua) && !/Chrome|CriOS|Firefox/.test(ua);
  }

  // iOS hint overlay
  function showIosHint(){
    if(iosHintShown) return;
    const wrap = document.createElement('div');
    wrap.className = 'install-hint';
    wrap.innerHTML = '<div class="card"><h2>Zum Home-Bildschirm</h2><p>1. Tippe auf das Teilen-Symbol in Safari.</p><p>2. Wähle „Zum Home-Bildschirm“.</p><p>3. Bestätigen – fertig.</p><button id="closeHint" class="menu-btn">Verstanden</button></div>';
    document.body.appendChild(wrap);
    document.getElementById('closeHint').addEventListener('click', ()=>{
      wrap.remove();
      iosHintShown = true;
      localStorage.setItem('iosHintShown','true');
    });
  }

  // Shortcuts generator
  function download(filename, blob){
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    setTimeout(()=>{
      URL.revokeObjectURL(a.href);
      a.remove();
    }, 1000);
  }

  function downloadShortcuts(){
    const url = location.href;
    const name = 'Keto Einkaufsliste';

    // Windows .url
    const win = `[InternetShortcut]\nURL=${url}\nIconFile=${location.origin + location.pathname.replace(/\/[^/]*$/, '/') + 'icons/icon-192.png'}\nIconIndex=0\n`;
    download('Keto-Einkaufsliste.url', new Blob([win], {type:'application/octet-stream'}));

    // Linux .desktop
    const desktop = `[Desktop Entry]\nName=${name}\nType=Application\nExec=xdg-open ${url}\nIcon=${location.origin + location.pathname.replace(/\/[^/]*$/, '/') + 'icons/icon-192.png'}\nTerminal=false\nCategories=Utility;`;
    download('Keto-Einkaufsliste.desktop', new Blob([desktop], {type:'application/x-desktop'}));

    // macOS .webloc (plist)
    const plist = `<?xml version="1.0" encoding="UTF-8"?>\n<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">\n<plist version="1.0"><dict><key>URL</key><string>${url}</string></dict></plist>`;
    download('Keto-Einkaufsliste.webloc', new Blob([plist], {type:'application/xml'}));
  }

  // Install-Button State Management
  function setInstallEnabled(enabled){
    if(!installBtn) return;
    installBtn.disabled = !enabled;
    installBtn.textContent = enabled ? 'Installieren' : 'Installieren nicht verfügbar';
  }

  // Hook buttons
  if(dlBtn){
    dlBtn.addEventListener('click', ()=>{
      downloadShortcuts();
      // close menu if present
      if(menu && !menu.classList.contains('hidden')) menu.classList.add('hidden');
    });
  }

  if(installBtn){
    installBtn.addEventListener('click', async ()=>{
      // iOS path
      if(isiOS() && isSafari()){
        showIosHint();
        if(menu && !menu.classList.contains('hidden')) menu.classList.add('hidden');
        return;
      }
      // PWA path
      if(deferredPrompt){
        deferredPrompt.prompt();
        const { outcome } = await deferredPrompt.userChoice;
        console.log('install outcome', outcome);
        deferredPrompt = null; // only usable once
        setInstallEnabled(false);
      }else{
        // Fallback for browsers ohne Prompt (Firefox)
        alert('Der Browser stellt keinen Install-Dialog bereit. Verwende die Desktop-Verknüpfungen oder das Browser-Menü.');
      }
      if(menu && !menu.classList.contains('hidden')) menu.classList.add('hidden');
    });
  }

  // PWA: receive the prompt
  window.addEventListener('beforeinstallprompt', (e)=>{
    e.preventDefault();
    deferredPrompt = e;
    setInstallEnabled(true);
  });

  window.addEventListener('appinstalled', ()=>{
    console.log('PWA installiert');
    setInstallEnabled(false);
  });

  // Initial state
  if(isStandalone()){
    setInstallEnabled(false);
  }else{
    // On iOS Safari we don't have beforeinstallprompt: keep enabled to show hint
    if(isiOS() && isSafari()){
      setInstallEnabled(true);
    }else{
      setInstallEnabled(false);
    }
  }

  // SW registration
  if('serviceWorker' in navigator){
    navigator.serviceWorker.register('sw.js')
      .catch(()=>{});
  }
})();

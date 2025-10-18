/* install.js v1.1 (Keto Einkaufsliste) */
(function(){
  var installBtn = document.getElementById('installPWA');
  var dlBtn = document.getElementById('downloadShortcut');
  var menu = document.getElementById('menuPopup');

  var deferredPrompt = null;
  var iosHintShown = localStorage.getItem('iosHintShown') === 'true';

  function isStandalone(){
    return window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone === true;
  }
  function ua(){ return (navigator.userAgent || '').toLowerCase(); }
  function isiOS(){ return /iphone|ipad|ipod/.test(ua()); }
  function isAndroid(){ return /android/.test(ua()); }
  function isMac(){ return /macintosh|mac os x/.test(ua()); }
  function isWindows(){ return /windows nt/.test(ua()); }
  function isLinux(){ return !isAndroid() && /linux/.test(ua()); }
  function isSafari(){ return /safari/.test(navigator.userAgent) && !/chrome|crios|edg|edge|opr|opera/.test(navigator.userAgent.toLowerCase()); }
  function isFirefox(){ return /firefox|fxios/.test(ua()); }
  function isChromiumLike(){ return /chrome|crios|edg|edge|opr|opera/.test(ua()) && !isFirefox() && !isSafari(); }

  function currentOS(){
    if(isiOS()) return 'ios';
    if(isAndroid()) return 'android';
    if(isWindows()) return 'windows';
    if(isMac()) return 'macos';
    if(isLinux()) return 'linux';
    return 'unknown';
  }

  function toggle(el, show){
    if(!el) return;
    el.style.display = show ? '' : 'none';
  }

  // iOS hint overlay (only for iOS Safari path)
  function showIosHint(){
    if(iosHintShown) return;
    var wrap = document.createElement('div');
    wrap.className = 'install-hint';
    wrap.innerHTML = '<div class="card"><h2>Zum Home-Bildschirm</h2><p>1. Tippe auf das Teilen-Symbol in Safari.</p><p>2. Waehle "Zum Home-Bildschirm".</p><p>3. Bestaetigen.</p><button id="closeHint" class="menu-btn">Verstanden</button></div>';
    document.body.appendChild(wrap);
    document.getElementById('closeHint').addEventListener('click', function(){
      wrap.remove();
      iosHintShown = true;
      localStorage.setItem('iosHintShown','true');
    });
  }

  // Shortcut generator: only generate the appropriate file for the current OS
  function download(filename, blob){
    var a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    setTimeout(function(){
      URL.revokeObjectURL(a.href);
      a.remove();
    }, 800);
  }

  function downloadShortcutForOS(){
    var url = location.href;
    var name = 'Keto Einkaufsliste';
    var originPath = location.origin + location.pathname.replace(/\/[^/]*$/, '/') + 'icons/icon-192.png';
    var os = currentOS();

    if(os === 'windows'){
      var win = '[InternetShortcut]\nURL='+url+'\nIconFile='+originPath+'\nIconIndex=0\n';
      download('Keto-Einkaufsliste.url', new Blob([win], {type:'application/octet-stream'}));
    }else if(os === 'linux'){
      var desktop = '[Desktop Entry]\nName='+name+'\nType=Application\nExec=xdg-open '+url+'\nIcon='+originPath+'\nTerminal=false\nCategories=Utility;\n';
      download('Keto-Einkaufsliste.desktop', new Blob([desktop], {type:'application/x-desktop'}));
    }else if(os === 'macos'){
      var plist = '<?xml version="1.0" encoding="UTF-8"?>\n<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">\n<plist version="1.0"><dict><key>URL</key><string>'+url+'</string></dict></plist>';
      download('Keto-Einkaufsliste.webloc', new Blob([plist], {type:'application/xml'}));
    }else{
      alert('Kein passender Desktop-Shortcut fuer dieses Geraet.');
    }
  }

  function setInstallEnabled(enabled){
    if(!installBtn) return;
    installBtn.disabled = !enabled;
    installBtn.textContent = enabled ? 'Installieren' : 'Installieren nicht verfuegbar';
  }

  // PWA hooks
  window.addEventListener('beforeinstallprompt', function(e){
    e.preventDefault();
    deferredPrompt = e;
    // Enable only if we show the install button on this platform
    if(installBtn && installBtn.style.display !== 'none'){
      setInstallEnabled(true);
    }
  });

  window.addEventListener('appinstalled', function(){
    setInstallEnabled(false);
  });

  // Bind buttons
  if(dlBtn){
    dlBtn.addEventListener('click', function(){
      downloadShortcutForOS();
      if(menu && !menu.classList.contains('hidden')) menu.classList.add('hidden');
    });
  }

  if(installBtn){
    installBtn.addEventListener('click', function(){
      var os = currentOS();

      // iOS Safari: show manual hint
      if(os === 'ios' && isSafari()){
        showIosHint();
        if(menu && !menu.classList.contains('hidden')) menu.classList.add('hidden');
        return;
      }

      // Chromium-like with prompt
      if(deferredPrompt){
        deferredPrompt.prompt();
        deferredPrompt.userChoice.then(function(){ setInstallEnabled(false); deferredPrompt = null; });
      }else{
        alert('Kein Install-Dialog verfuegbar. Verwenden Sie das Browser-Menue oder den Desktop-Shortcut.');
      }
      if(menu && !menu.classList.contains('hidden')) menu.classList.add('hidden');
    });
  }

  // Decide visibility per OS/Browser
  (function decideVisibility(){
    var os = currentOS();
    var chromium = isChromiumLike();
    var safari = isSafari();
    var firefox = isFirefox();

    // Default hidden until we decide
    toggle(installBtn, false);
    toggle(dlBtn, false);
    setInstallEnabled(false);

    // ANDROID (Chrome/Edge): show Install, no Desktop shortcut
    if(os === 'android' && chromium){
      toggle(installBtn, true);
      return;
    }

    // iOS (Safari only): show Install to trigger hint; hide Desktop shortcut
    if(os === 'ios'){
      toggle(installBtn, true); // opens hint
      return;
    }

    // WINDOWS / LINUX (Chromium): show both (Install + Desktop)
    if((os === 'windows' || os === 'linux') && chromium){
      toggle(installBtn, true);
      toggle(dlBtn, true);
      return;
    }

    // macOS: Safari has no prompt -> show Desktop .webloc; Chromium can install
    if(os === 'macos'){
      if(chromium){
        toggle(installBtn, true);
        toggle(dlBtn, true);
      }else if(safari){
        toggle(dlBtn, true);
      }
      return;
    }

    // Firefox (desktop/mobile): no prompt -> show Desktop on desktop only
    if(firefox){
      if(os === 'windows' || os === 'linux' || os === 'macos'){
        toggle(dlBtn, true);
      }
      return;
    }

    // Unknown: do nothing
  })();

  // Service Worker registration
  if('serviceWorker' in navigator){
    navigator.serviceWorker.register('sw.js').catch(function(){});
  }
})();

README-Install.txt v1.0
================================
Ziel
----
Dieses Paket macht die Seite als PWA installierbar (Windows/macOS/Linux/Android)
und liefert iOS-Hinweis plus echte Desktop-Verknüpfungen zum Download.

Dateien
-------
- Shopping.html           (Hauptseite inkl. Menüeinträge „Installieren“ & „Desktop-Verknüpfung laden“)
- install.js              (PWA-Install-Logik, iOS-Overlay, Shortcut-Downloads)
- sw.js                   (einfaches Precache, Offline-Basis)
- manifest.webmanifest    (App-Metadaten, Icons)
- icons/icon-192.png
- icons/icon-512.png
- README-Install.txt

Deployment
----------
1) Alles unverändert in denselben Ordner Ihres Webspaces hochladen (HTTPS).
2) Seite aufrufen: /Shopping.html
3) Chrome/Edge/Chromium: Menü „Installieren“. Android: Install-Prompt. iOS: Overlay zeigt Anleitung.
4) Optional: Menü „Desktop-Verknüpfung laden“ generiert .url, .desktop, .webloc (für manuelle Ablage).

Hinweise
--------
- Firefox Desktop bietet derzeit keinen standardisierten Install-Dialog; verwenden Sie dort die Downloads.
- Service Worker greift nur über HTTPS (oder localhost).
- Icons können beliebig ersetzt werden (PNG). Größen: 192, 512.


Plattformlogik
--------------
- Android (Chromium): zeigt nur 'Installieren'.
- iOS (Safari): zeigt nur 'Installieren' (oeffnet Anleitung).
- Windows/Linux (Chromium): zeigt 'Installieren' und 'Desktop-Verknuepfung laden'.
- macOS: Chromium zeigt beides; Safari nur Desktop-Verknuepfung.
- Firefox: Desktop-Verknuepfung; kein PWA-Dialog.

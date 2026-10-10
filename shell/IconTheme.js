/* PearPortOS icon priorities: (1) supplied Icons.zip, (2) elementary OS,
   (3) original bundled fallback. Do not crop native app silhouettes. */
(() => {
  const supplied = window.PEAR_USER_ICONS || {};
  const installed = new Set(window.PEAR_ELEMENTARY_INSTALLED || []);
  const elementary = window.PEAR_ELEMENTARY_SOURCES || {};
  const base = 'https://raw.githubusercontent.com/elementary/icons/9.0.0/';
  const oldIcon = name => 'assets/icons/' + (name === 'downloads' ? 'folder' : name) + '.svg';
  const localElementary = name => `assets/icons/elementary/${name}.svg`;
  // System Preferences uses elementary's actual system-gear icon,
  // not its display/trackpad icon and not the user's Apple icon.
  window.PearPort.icon = name => {
    if (name === 'preferences') {
      return 'assets/icons/user/system-preferences.png';
    }
    if (Object.hasOwn(supplied, name)) return supplied[name];
    if (installed.has(name)) return localElementary(name);
    if (elementary[name]) return base + elementary[name];
    return oldIcon(name);
  };
  document.addEventListener('error', event => {
    const el=event.target;
    if(!(el instanceof HTMLImageElement)) return;
    const path=el.getAttribute('src') || '';
    // Preferences always has a bundled elementary-inspired backup.
    if(path === localElementary('preferences')) {
      el.src='assets/icons/preferences.svg'; return;
    }
    if(path.startsWith('assets/icons/user/') || path.startsWith('assets/icons/') &&
         !path.includes('/elementary/')) return;
    const match=Object.keys(elementary).find(name =>
      path === localElementary(name) || path === base + elementary[name]);
    if(!match) return;
    if(installed.has(match) && path !== localElementary(match))el.src=localElementary(match);
    else el.src=oldIcon(match);
  },true);
})();

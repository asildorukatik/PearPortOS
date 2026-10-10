(() => {
 const P=window.PearPort;
 function start(){P.theme=new P.ThemeManager();P.apps=new P.AppRegistry();P.fs=new P.VirtualFS();P.windows=new P.WindowManager();P.pearder=new P.Pearder();P.terminal=new P.Terminal();P.preferences=new P.SystemPreferences();P.menu=new P.MenuBar();P.desktop=new P.Desktop();P.widgets=new P.DesktopWidgets();P.dock=new P.Dock();P.preferences.applyStartup();P.calendar=new P.CalendarApp();P.compare=new P.CompareMode();P.debug=new P.DebugPanel();P.shell5=new P.Shell5();P.installLaunchpadMotion?.(P.launchpad);P.session.start();
 P.events.on('window:open',()=>P.debug?.update());
 P.fs.ready.then(()=>{P.desktop.render();P.pearder.refreshAll()});
 P.events.emit('ready',{phases:[1,2,3,4,5]});
 // Catalina desktop starts without a debug or welcome toast.
 if(P.theme.dynamic)setInterval(()=>P.theme.refreshDynamic(),60000);
 // Expose read-only browser test entry point (also useful in automated checks).
 window.PearPortDiagnostics={listWindows:()=>P.windows.list(),tokens:()=>getComputedStyle(document.documentElement)};
 }
 if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start);else start();
})();

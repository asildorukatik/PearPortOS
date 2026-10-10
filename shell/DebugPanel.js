(() => {
 const P=window.PearPort;
 P.DebugPanel=class DebugPanel {
  constructor(){this.el=P.$('#debug-panel');this.hover=P.$('#debug-hover');this.open=false;this.showGrid=false;this.fps=0;this.frames=0;this.lastFrame=performance.now();this.hit='Move over a UI element';this.render();document.addEventListener('keydown',e=>{if(e.ctrlKey&&e.altKey&&e.key.toLowerCase()==='d'){e.preventDefault();this.toggle()}if(e.ctrlKey&&e.altKey&&e.key.toLowerCase()==='c'){e.preventDefault();P.compare.toggle();this.update()}});document.addEventListener('pointermove',e=>this.inspect(e));P.events.on('window:open',()=>this.update());P.events.on('window:close',()=>this.update());P.events.on('window:focus',()=>this.update());P.events.on('compare:toggle',()=>this.update());P.events.on('theme',()=>this.update());this.tick(performance.now())}
  toggle(){this.open=!this.open;this.el.classList.toggle('open',this.open);this.hover.style.display=this.open?'block':'none';this.update()}
  render(){this.el.innerHTML=`<h2><span>🔬 PearPortOS · Inspector</span><button id="debug-close" title="Close">×</button></h2><div class="muted">Ctrl+Alt+D toggles debug · Catalina target</div>
   <div class="debug-pill" id="debug-performance">FPS: -- · Windows: 0</div>
   <h3>Appearance</h3><div class="debug-row"><label for="debug-theme">Mode</label><select id="debug-theme"><option value="dark">Dark</option><option value="light">Light</option></select></div>
   <div class="debug-row"><label for="debug-dynamic">Dynamic Desktop</label><input id="debug-dynamic" type="checkbox"></div>
   <div class="debug-row"><label for="debug-font">Font</label><select id="debug-font"><option value="inter">Local Inter</option><option value="system">System</option></select></div>
   <div class="debug-row"><label for="debug-dock-size">Dock icon size</label><input id="debug-dock-size" type="range" min="20" max="72" value="52"></div>
   <div class="debug-row"><label for="debug-magnify">Dock magnification</label><input id="debug-magnify" type="checkbox" checked></div>
   <div class="debug-row"><label for="debug-autohide">Automatically hide Dock</label><input id="debug-autohide" type="checkbox"></div>
   <button id="debug-reset-dock" class="debug-button">Restore default Dock arrangement</button>
   <h3>Compare mode · overlay first</h3><div class="debug-row"><label for="debug-compare">Enable screenshot overlay</label><input id="debug-compare" type="checkbox"></div>
   <div class="debug-row"><label for="debug-opacity">Opacity</label><input id="debug-opacity" type="range" min="0" max="1" step=".01" value=".5"><output id="opacity-value">50%</output></div>
   <div class="debug-row"><label for="debug-scale">Scale</label><input id="debug-scale" type="number" step=".01" min=".1" max="4" value="1"></div>
   <div class="debug-row"><label for="debug-shift-x">Shift X</label><input id="debug-shift-x" type="number" value="0"></div>
   <div class="debug-row"><label for="debug-shift-y">Shift Y</label><input id="debug-shift-y" type="number" value="0"></div>
   <div class="debug-two"><button id="debug-reference">Use provided reference</button><button id="debug-reset-align">Reset alignment</button></div>
   <label class="muted" for="debug-upload">Load new screenshot (kept in browser memory):</label><input id="debug-upload" type="file" accept="image/*">
   <h3>Overlay & measurements</h3><div class="debug-row"><label for="debug-grid-toggle">10px grid</label><input id="debug-grid-toggle" type="checkbox"></div>
   <div class="debug-pill" id="debug-hit">Hover dimensions appear here</div>
   <h3>Window z-order</h3><div class="debug-pill" id="debug-windows">No windows</div>
   <h3>Events</h3><div class="debug-pill" id="debug-events">No events</div>
   <div class="debug-two"><button id="debug-export">Export CSS tokens as JSON</button><button id="debug-demo">New test window</button></div>
   <div class="muted">Reference screenshot is an image overlay only. Wallpaper and icons are original artwork. This is not a real operating system.</div>`;
    const bind=(selector,event,fn)=>P.$(selector,this.el).addEventListener(event,fn);
    bind('#debug-close','click',()=>this.toggle());bind('#debug-theme','change',e=>P.theme.setTheme(e.target.value));bind('#debug-dynamic','change',e=>P.theme.setDynamic(e.target.checked));bind('#debug-font','change',e=>document.documentElement.dataset.debugFont=e.target.value);
    bind('#debug-dock-size','input',e=>{document.documentElement.style.setProperty('--dock-icon-size',e.target.value+'px');P.dock.fit()});bind('#debug-magnify','change',e=>P.dock.setMagnification(e.target.checked));
    bind('#debug-autohide','change',e=>P.dock.setAutoHide(e.target.checked));
    bind('#debug-reset-dock','click',()=>{P.dock.resetDefaults();this.update()});
    bind('#debug-compare','change',e=>P.compare.setEnabled(e.target.checked));bind('#debug-opacity','input',e=>{P.compare.setOpacity(e.target.value);P.$('#opacity-value').textContent=Math.round(e.target.value*100)+'%'});
    bind('#debug-scale','input',e=>P.compare.setScale(e.target.value));const position=()=>P.compare.setShift(P.$('#debug-shift-x').value,P.$('#debug-shift-y').value);
    bind('#debug-shift-x','input',position);bind('#debug-shift-y','input',position);bind('#debug-reference','click',()=>{P.compare.useReference();P.compare.setEnabled(true);this.update()});
    bind('#debug-reset-align','click',()=>{P.compare.setScale(1);P.compare.setShift(0,0);P.$('#debug-scale').value=1;P.$('#debug-shift-x').value=0;P.$('#debug-shift-y').value=0});
    bind('#debug-upload','change',e=>{P.compare.openFile(e.target.files[0]);this.update()});bind('#debug-grid-toggle','change',e=>P.$('#debug-grid').classList.toggle('active',e.target.checked));
    bind('#debug-export','click',()=>this.exportTokens());bind('#debug-demo','click',()=>P.windows.createWindow('window-demo',{newInstance:true}));
  }
  update(){if(!this.open)return;P.$('#debug-theme',this.el).value=P.theme.mode;P.$('#debug-dynamic',this.el).checked=P.theme.dynamic;P.$('#debug-compare',this.el).checked=P.compare.enabled;P.$('#debug-magnify',this.el).checked=P.dock.magnification;P.$('#debug-autohide',this.el).checked=P.dock.autoHide;const win=P.windows.list().sort((a,b)=>b.z-a.z);P.$('#debug-windows',this.el).textContent=win.map(w=>`${w.focused?'●':'○'} ${w.title} #${w.z}${w.minimized?' (min)':''}`).join(' · ')||'No windows';P.$('#debug-events',this.el).textContent=P.events.history.slice(0,8).map(x=>`[${x.time}] ${x.name}`).join('\n')||'No events'}
  inspect(e){if(!this.open||e.target.closest('#debug-panel'))return;let target=e.target.closest('.pp-window,.window-titlebar,.traffic-btn,.dock-item,.menu-item,.menu-logo,.menu-bar,.status-button,#desktop');if(!target){this.hover.style.display='none';return}let r=target.getBoundingClientRect();this.hover.style.display='block';this.hover.style.left=r.x+'px';this.hover.style.top=r.y+'px';this.hover.style.width=r.width+'px';this.hover.style.height=r.height+'px';const cs=getComputedStyle(target);P.$('#debug-hit',this.el).textContent=`${target.className||target.tagName} | ${r.width.toFixed(1)} × ${r.height.toFixed(1)} CSS px | x=${r.x.toFixed(1)}, y=${r.y.toFixed(1)} | radius=${cs.borderRadius}`}
  tick(t){this.frames++;if(t-this.lastFrame>=750){this.fps=Math.round(this.frames*1000/(t-this.lastFrame));this.frames=0;this.lastFrame=t;if(this.open){P.$('#debug-performance',this.el).textContent=`FPS: ${this.fps} · Windows: ${P.windows.windows.size} · ${Math.round(innerWidth)}×${Math.round(innerHeight)} CSS px`;this.update()}}requestAnimationFrame(next=>this.tick(next))}
  exportTokens(){const base=document.createElement('div');document.body.append(base);const css=getComputedStyle(document.documentElement);let vars={};for(let i=0;i<css.length;i++){let prop=css[i];if(prop.startsWith('--'))vars[prop]=css.getPropertyValue(prop).trim()}base.remove();const json=JSON.stringify({app:'PearPortOS',target:'macOS Catalina 10.15.7',theme:P.theme.mode,note:'Browser computed design tokens, may include debug overrides',tokens:vars},null,2);const a=document.createElement('a');a.href=URL.createObjectURL(new Blob([json],{type:'application/json'}));a.download='PearPortOS-tokens.json';a.click();setTimeout(()=>URL.revokeObjectURL(a.href),2000);P.events.emit('debug:export')}
 };
})();

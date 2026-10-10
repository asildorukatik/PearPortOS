(() => {
 const P=window.PearPort;
 const rect=w=>({x:w.offsetLeft,y:w.offsetTop,w:w.offsetWidth,h:w.offsetHeight});
 P.WindowManager=class WindowManager {
  constructor(){this.layer=P.$('#window-layer');this.windows=new Map();this.counter=0;this.z=0;this.focused=null;this.fullscreen=null;this.installKeys();window.addEventListener('resize',()=>this.constrainToViewport())}
  list(){return [...this.windows.values()].map(w=>({id:w.id,title:w.title,minimized:w.minimized,focused:this.focused===w.id,z:w.z}))}
  title(){return this.windows.get(this.focused)?.title||'Pearder'}
  createWindow(appId,opts={}){
   const app=P.apps.get(appId)||{id:appId,title:appId,icon:'folder'};
   const existing=[...this.windows.values()].find(w=>w.appId===appId&&!w.closing&&!opts.newInstance);
   if(existing){if(existing.minimized)this.restore(existing.id);this.focus(existing.id);return existing.id}
   const id=`win-${++this.counter}`;const n=this.counter;
   const preferredWidth=appId==='calendar'?'--calendar-width':appId==='preferences'?'--prefs-width':appId==='pearder'?'--pearder-width':appId==='terminal'?'--terminal-width':'--window-default-width';
   const preferredHeight=appId==='calendar'?'--calendar-height':appId==='preferences'?'--prefs-height':appId==='pearder'?'--pearder-height':appId==='terminal'?'--terminal-height':'--window-default-height';
   const w=Math.min(opts.width||P.css(preferredWidth,630),innerWidth-P.css('--window-screen-edge')-4);
   const h=Math.min(opts.height||P.css(preferredHeight,412),innerHeight-P.css('--menu-height')-P.css('--window-max-height-reserve'));
   const maxX=Math.max(0,innerWidth-w-P.css('--window-screen-edge')),maxY=Math.max(P.css('--menu-height'),innerHeight-h-P.css('--window-safe-bottom'));
   const x=Math.min(maxX,Math.max(P.css('--window-initial-x'),(innerWidth-w)/2+((n-1)%4)*P.css('--window-cascade-x')));
   const y=Math.min(maxY,Math.max(P.css('--menu-height')+P.css('--window-top-offset'),(innerHeight-h)/2-30+((n-1)%4)*P.css('--window-cascade-y')));
   const el=document.createElement('section');el.className='pp-window';el.dataset.windowId=id;el.setAttribute('role','dialog');el.setAttribute('aria-label',app.title);
   el.style.cssText=`left:${x}px;top:${y}px;width:${w}px;height:${h}px`;
   el.innerHTML=`<div class="window-titlebar"><div class="traffic"><button class="traffic-btn traffic-close" aria-label="Close window" title="Close"><span>×</span></button><button class="traffic-btn traffic-minimize" aria-label="Minimize window" title="Minimize"><span>−</span></button><button class="traffic-btn traffic-zoom" aria-label="Full Screen (Option: Zoom)" title="Full Screen"><span>⤢</span></button></div><span class="window-title">${P.escape(app.title)}</span></div><div class="window-body"></div>${['n','s','e','w','ne','nw','se','sw'].map(edge=>`<div class="resize-handle resize-${edge}" data-edge="${edge}"></div>`).join('')}`;
   P.$('.window-body',el).innerHTML=this.makeContent(app);
   if(appId==='pearder')el.classList.add('has-pear-toolbar');
   this.layer.append(el);
   const data={id,appId,title:app.title,el,z:0,minimized:false,fullscreen:false,zoomed:false,restoreRect:null,closing:false,transition:null};this.windows.set(id,data);if(appId==='preferences'){P.preferences?.mount(el,id);const toolbar=P.$('.prefs-toolbar',el);toolbar?.addEventListener('pointerdown',e=>this.startManipulation(e,data,'move'));toolbar?.addEventListener('dblclick',e=>{if(!e.target.closest('button,input,select'))this.zoom(id)})}
   if(appId==='pearder'){P.pearder?.mount(el,id,opts.path||'/Users/pear');const toolbar=P.$('.pear-toolbar',el);toolbar?.addEventListener('pointerdown',e=>this.startManipulation(e,data,'move'));toolbar?.addEventListener('dblclick',e=>{if(!e.target.closest('button,input,select'))this.zoom(id)})}
   if(appId==='terminal')P.terminal?.mount(el,id);
   if(appId==='calendar')P.calendar?.mount(el,id);
   P.$('.traffic-close',el).addEventListener('click',e=>{e.stopPropagation();this.close(id)});
   P.$('.traffic-minimize',el).addEventListener('click',e=>{e.stopPropagation();this.minimize(id)});
   P.$('.traffic-zoom',el).addEventListener('click',e=>{e.stopPropagation();if(e.altKey)this.zoom(id);else this.toggleFullScreen(id)});
   P.$('.window-titlebar',el).addEventListener('dblclick',e=>{if(!e.target.closest('.traffic'))this.zoom(id)});
   P.$('.window-titlebar',el).addEventListener('pointerdown',e=>this.startManipulation(e,data,'move'));
   P.$$('.resize-handle',el).forEach(hd=>hd.addEventListener('pointerdown',e=>this.startManipulation(e,data,hd.dataset.edge)));
   el.addEventListener('pointerdown',()=>this.focus(id));
   P.$$('.open-app',el).forEach(b=>b.addEventListener('click',()=>P.apps.open(b.dataset.app)));
   this.focus(id);P.events.emit('window:open',{id,appId});
   try{el.animate([{opacity:0,transform:'scale(.92)'},{opacity:1,transform:'scale(1)'}],{duration:P.css('--anim-window-open',220),easing:'cubic-bezier(.2,.7,.2,1)'})}catch{}
   return id;
  }
  makeContent(app){
   if(app.id==='preferences')return '<div class="preferences-root"></div>';
   if(app.id==='pearder')return '<div class="pearder-root"></div>';
   if(app.id==='terminal')return '<div class="terminal-root"></div>';
   if(app.id==='calendar')return '<div class="pear-calendar-root"></div>';
   if(app.id==='pearder')return `<div class="window-content"><img class="window-empty-icon" src="${P.icon('pearder')}" alt=""/><h1>Pearder</h1><p>The Catalina window system is working. Pearder's full file browser, sidebar, column view and Quick Look are reserved for Phase 4, when there are Finder screenshots to calibrate against.</p><div class="win-actions"><button class="open-app primary" data-app="welcome">Open introduction</button><button class="open-app" data-app="window-demo">Window test</button></div><div class="panel-note"><strong>Phase 2 ready</strong><br>Drag this title bar, resize any edge or corner, use the traffic lights, or hold Option while clicking the green button to zoom without entering fullscreen.</div></div>`;
   if(app.id==='window-demo'||app.id==='welcome')return `<div class="window-content"><h1>${app.id==='welcome'?'Welcome to PearPortOS':'Window geometry test'}</h1><p>An original Catalina-inspired browser shell. The menu bar, dark/light modes, window controls and Dock are currently interactive. Unverified measurements remain tokenized for screenshot comparison.</p><div class="demo-row"><img src="${P.icon('pearder')}" alt=""><div>Try moving, resizing and minimizing this window.<div class="secondary">Screenshots will allow precise window geometry calibration.</div></div></div><div class="demo-row"><img src="${P.icon('preferences')}" alt=""><div>System Preferences has a live Catalina-style icon grid and controls.</div></div><div class="win-actions" style="margin-top:18px"><button class="open-app" data-app="pearder">Open Pearder</button><button class="open-app" data-app="window-demo">Focus window test</button></div></div>`;
   return `<div class="window-content"><img class="window-empty-icon" src="${P.icon(app.icon)}" alt=""/><h1>${P.escape(app.title)}</h1><p>This app is a placeholder in the Phase 5 browser build. Additional built-in applications are planned for Phase 6.</p><div class="panel-note"><strong>Window controls are live.</strong><br>Use this window to inspect Catalina-style geometry, active/inactive chrome, dragging and resizing.</div></div>`;
  }
  focus(id){const w=this.windows.get(id);if(!w||w.minimized||w.closing)return;if(P.mission&&w.space!=null&&w.space!==P.mission.current){P.mission.switchSpace(w.space);return;}if(this.fullscreen&&this.fullscreen!==id)this.leaveFullScreen(this.fullscreen);this.z++;w.z=this.z;this.focused=id;for(const w2 of this.windows.values()){w2.el.classList.toggle('inactive',w2.id!==id);w2.el.style.zIndex=String(w2.z)}P.events.emit('window:focus',{id,appId:w.appId})}
  focusTop(){const visible=[...this.windows.values()].filter(w=>!w.minimized&&!w.closing&&(!P.mission||w.space==null||w.space===P.mission.current)).sort((a,b)=>b.z-a.z);this.focused=visible[0]?.id||null;this.windows.forEach(w=>w.el.classList.toggle('inactive',w.id!==this.focused));P.events.emit('window:focus',{id:this.focused,appId:visible[0]?.appId})}
  close(id){
   const w=this.windows.get(id);if(!w||w.closing)return;
   w.closing=true;
   if(w.fullscreen)this.leaveFullScreen(id);
   w.transition?.cancel();
   // Minimized windows are already hidden; do not animate an invisible element.
   const done=()=>{if(!this.windows.has(id))return;w.el.remove();this.windows.delete(id);if(w.appId==='preferences')P.preferences?.unmount(id);if(w.appId==='pearder')P.pearder?.unmount(id);if(w.appId==='terminal')P.terminal?.unmount(id);if(w.appId==='calendar')P.calendar?.unmount(id);this.focusTop();P.events.emit('window:close',{id,appId:w.appId})};
   if(w.minimized||!w.el.isConnected){done();return}
   const animation=w.el.animate([{opacity:1,transform:'scale(1)'},{opacity:0,transform:'scale(.95)'}],{duration:P.css('--anim-window-close',150),easing:'ease-in'});
   w.transition=animation;animation.finished.catch(()=>{}).finally(done);
  }
  minimize(id){
   const w=this.windows.get(id);if(!w||w.minimized||w.closing)return;
   if(w.fullscreen)this.leaveFullScreen(id);
   const target=P.$(`[data-dock-id="${w.appId}"]`);
   const r=w.el.getBoundingClientRect(),dest=target?.getBoundingClientRect();
   const dx=dest?(dest.left+dest.width/2)-(r.left+r.width/2):0;
   const dy=dest?(dest.top+dest.height/2)-(r.top+r.height/2):innerHeight;
   w.minimized=true;P.events.emit('window:minimize',{id,appId:w.appId});this.focusTop();
   w.transition=w.el.animate([{transform:'translate(0px,0px) scale(1)',opacity:1},{transform:`translate(${dx}px,${dy}px) scale(.07)`,opacity:.45}],{duration:P.css('--anim-minimize',450),easing:'cubic-bezier(.4,0,1,1)'});
   const animation=w.transition;
   animation.finished.catch(()=>{}).finally(()=>{if(w.transition===animation&&w.minimized)w.el.style.display='none'});
  }
  restore(id){
   const w=this.windows.get(id);if(!w||!w.minimized||w.closing)return;
   w.transition?.cancel();w.transition=null;w.minimized=false;w.el.style.display='flex';this.focus(id);
   const dest=P.$(`[data-dock-id="${w.appId}"]`)?.getBoundingClientRect(),r=w.el.getBoundingClientRect();
   const dx=dest?(dest.left+dest.width/2)-(r.left+r.width/2):0;
   const dy=dest?(dest.top+dest.height/2)-(r.top+r.height/2):innerHeight;
   w.transition=w.el.animate([{transform:`translate(${dx}px,${dy}px) scale(.07)`,opacity:.4},{transform:'translate(0,0) scale(1)',opacity:1}],{duration:P.css('--anim-minimize',450),easing:'cubic-bezier(.2,.8,.1,1)'});
   P.events.emit('window:restore',{id,appId:w.appId});
  }
  toggleFullScreen(id){const w=this.windows.get(id);if(!w||w.closing)return;this.focus(id);if(w.fullscreen){this.leaveFullScreen(id);return}if(this.fullscreen)this.leaveFullScreen(this.fullscreen);w.restoreRect=rect(w.el);w.fullscreen=true;w.zoomed=false;this.fullscreen=id;w.el.classList.add('fullscreen');this.setRect(w,{x:0,y:0,w:innerWidth,h:innerHeight});P.$('#screen').classList.add('has-fullscreen');P.events.emit('window:fullscreen',{id})}
  leaveFullScreen(id){const w=this.windows.get(id);if(!w||!w.fullscreen)return;w.fullscreen=false;this.fullscreen=null;w.el.classList.remove('fullscreen');P.$('#screen').classList.remove('has-fullscreen');this.setRect(w,w.restoreRect);w.restoreRect=null;this.constrainToViewport();P.events.emit('window:unfullscreen',{id})}
  zoom(id){const w=this.windows.get(id);if(!w)return;if(w.fullscreen){this.leaveFullScreen(id);return}if(w.zoomed){this.setRect(w,w.restoreRect);w.restoreRect=null;w.zoomed=false;this.constrainToViewport()}else{w.restoreRect=rect(w.el);this.setRect(w,this.zoomRect());w.zoomed=true}this.focus(id);P.events.emit('window:zoom',{id,zoomed:w.zoomed})}
  setRect(w,r){if(!r)return;Object.assign(w.el.style,{left:r.x+'px',top:r.y+'px',width:r.w+'px',height:r.h+'px'})}
  zoomRect(){const menu=P.css('--menu-height'),dock=P.css('--dock-icon-size')+P.css('--dock-bottom-gap')+P.css('--window-zoom-bottom-reserve');return {x:0,y:menu,w:innerWidth,h:Math.max(P.css('--window-min-height'),innerHeight-menu-dock)}}
  constrainToViewport(){
   const menu=P.css('--menu-height'),leftEdge=P.css('--window-min-visible-x'),topEdge=P.css('--window-min-visible-y');
   for(const win of this.windows.values()){
    if(win.fullscreen){this.setRect(win,{x:0,y:0,w:innerWidth,h:innerHeight});continue}
    if(win.zoomed){this.setRect(win,this.zoomRect());continue}
    const r=rect(win.el);
    const w=Math.min(r.w,Math.max(P.css('--window-min-width'),innerWidth-P.css('--window-screen-edge'))),
     h=Math.min(r.h,Math.max(P.css('--window-min-height'),innerHeight-menu-P.css('--window-safe-bottom')));
    this.setRect(win,{x:Math.max(leftEdge-w,Math.min(innerWidth-leftEdge,r.x)),y:Math.max(menu,Math.min(innerHeight-topEdge,r.y)),w,h});
   }
   P.events.emit('window:viewport',{width:innerWidth,height:innerHeight});
  }
  startManipulation(e,w,edge){
   if(e.button!==0||e.target.closest('.traffic')||w.fullscreen||w.closing)return;
   if(edge==='move'&&e.target.closest('button,input,select,textarea,label'))return;
   this.focus(w.id);e.preventDefault();
   const target=e.currentTarget;target.setPointerCapture(e.pointerId);
   let startRect=rect(w.el);const sx=e.clientX,sy=e.clientY;
   const minW=P.css('--window-min-width'),minH=P.css('--window-min-height'),bar=P.css('--menu-height');
   let moved=false,detached=false;
   const move=ev=>{
    const dx=ev.clientX-sx,dy=ev.clientY-sy;
    if(!moved&&Math.hypot(dx,dy)<P.css('--drag-start-threshold',3))return;
    if(!moved){moved=true;
     if(edge==='move'&&w.zoomed&&w.restoreRect){
      const saved=w.restoreRect,anchor=(sx-startRect.x)/startRect.w;
      this.setRect(w,{x:sx-anchor*saved.w,y:Math.max(bar,sy-P.css('--window-drag-anchor-y',11)),w:saved.w,h:saved.h});
      startRect=rect(w.el);detached=true;w.zoomed=false;w.restoreRect=null;
     }
    }
    let {x,y,w:width,h}=startRect;
    if(edge==='move'){
     x=Math.min(innerWidth-P.css('--window-min-visible-x'),Math.max(P.css('--window-min-visible-x')-width,startRect.x+(detached?ev.clientX-sx:dx)));
     y=Math.min(innerHeight-P.css('--window-min-visible-y'),Math.max(bar,startRect.y+(detached?ev.clientY-sy:dy)));
    }else{
     if(edge.includes('e'))width=Math.max(minW,startRect.w+dx);
     if(edge.includes('s'))h=Math.max(minH,startRect.h+dy);
     if(edge.includes('w')){width=Math.max(minW,startRect.w-dx);x=startRect.x+startRect.w-width}
     if(edge.includes('n')){h=Math.max(minH,startRect.h-dy);y=startRect.y+startRect.h-h}
     if(y<bar&&edge.includes('n')){h-=bar-y;y=bar}
     h=Math.max(minH,h);
    }
    this.setRect(w,{x,y,w:width,h});
   };
   const end=()=>{
    target.removeEventListener('pointermove',move);target.removeEventListener('pointerup',end);target.removeEventListener('pointercancel',end);
    if(!moved)return;
    if(edge==='move'){
     const current=rect(w.el),d=P.css('--window-edge-snap-distance',12),limit=innerWidth-current.w;
     if(current.x>=0&&current.x<d)current.x=0;
     if(limit>=0&&Math.abs(current.x-limit)<d)current.x=limit;
     if(current.y<=bar+d)current.y=bar;
     this.setRect(w,current);
    }
    P.events.emit('window:geometry',{id:w.id,...rect(w.el)});
   };
   target.addEventListener('pointermove',move);target.addEventListener('pointerup',end);target.addEventListener('pointercancel',end);
  }
  installKeys(){document.addEventListener('keydown',e=>{if(e.key==='Escape'&&this.fullscreen){this.leaveFullScreen(this.fullscreen);return}const cmd=e.metaKey||e.ctrlKey;if(!cmd||!this.focused)return;const key=e.key.toLowerCase();if(['w','m','q'].includes(key)){e.preventDefault();const focused=this.focused;const app=this.windows.get(focused)?.appId;if(key==='w')this.close(focused);if(key==='m')this.minimize(focused);if(key==='q'){[...this.windows.values()].filter(w=>w.appId===app).forEach(w=>this.close(w.id))}}})}
 };
})();

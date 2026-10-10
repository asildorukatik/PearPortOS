(() => {
 const P=window.PearPort;
 P.Dock=class Dock {
  constructor(){
   this.el=P.$('#dock');this.items=P.apps.all();this.frame=0;this.active=false;this.baseCenters=null;
   const defaults=this.items.map(a=>a.id);
   const load=(key,fallback)=>{try{const value=JSON.parse(localStorage.getItem(key));return value??fallback}catch{return fallback}};
   const savedOrder=load('pear-dock-order',defaults), savedPinned=load('pear-dock-pinned',defaults);
   this.order=[...new Set([...savedOrder.filter(id=>defaults.includes(id)),...defaults])];
   this.pinned=new Set(savedPinned.filter(id=>defaults.includes(id)));
   this.magnification=load('pear-dock-magnification',true);
   this.autoHide=load('pear-dock-autohide',false);
   this.position=['bottom','left','right'].includes(load('pear-dock-position','bottom'))?load('pear-dock-position','bottom'):'bottom';
   this.el.dataset.position=this.position;
   this.dragId=null;this.hideTimer=null;
   this.reveal=document.createElement('div');this.reveal.id='dock-reveal';this.reveal.setAttribute('aria-hidden','true');P.$('#screen').append(this.reveal);
   this.reveal.addEventListener('pointerenter',()=>this.showDock());
   this.el.addEventListener('pointerenter',()=>this.showDock());
   this.el.addEventListener('pointerleave',()=>{this.resetMagnify();this.scheduleHide()});
   this.el.addEventListener('pointermove',e=>{if(!this.magnification||this.dragId)return;this.active=true;this.pointerX=e.clientX;this.pointerY=e.clientY;if(!this.frame)this.frame=requestAnimationFrame(()=>this.updateMagnify())});
   this.el.addEventListener('dragover',e=>{if(this.dragId)e.preventDefault()});
   this.el.addEventListener('drop',e=>{if(this.dragId){e.preventDefault();this.finishDrag()}});
   window.addEventListener('resize',()=>this.fit());
   for(const event of ['window:open','window:close','window:minimize','window:restore'])P.events.on(event,e=>this.refresh(e.appId));
   this.render();this.setAutoHide(this.autoHide,false);
  }
  store(){try{localStorage.setItem('pear-dock-order',JSON.stringify(this.order));localStorage.setItem('pear-dock-pinned',JSON.stringify([...this.pinned]));localStorage.setItem('pear-dock-autohide',JSON.stringify(this.autoHide));localStorage.setItem('pear-dock-magnification',JSON.stringify(this.magnification));localStorage.setItem('pear-dock-position',JSON.stringify(this.position))}catch{}}
  hasWindow(id){return [...P.windows.windows.values()].some(w=>w.appId===id&&!w.closing)}
  visible(){return this.order.filter(id=>this.pinned.has(id)||this.hasWindow(id))}
  render(){
   this.resetMagnify();const ids=this.visible();
   this.el.innerHTML=ids.map((id,i)=>{const app=P.apps.get(id);const previous=ids[i-1];const divider=id==='downloads'&&previous!=='downloads';return `${divider?'<div class="dock-divider" aria-hidden="true"></div>':''}<div class="dock-item${this.hasWindow(id)?' running':''}" tabindex="0" role="button" draggable="true" aria-label="Open ${P.escape(app.title)}" data-dock-id="${id}" data-idx="${i}"><img class="dock-icon" draggable="false" src="${P.icon(app.icon)}" alt=""/><div class="dock-indicator"></div><span class="dock-tip">${P.escape(app.title)}</span></div>`}).join('');
   P.$$('.dock-item',this.el).forEach(el=>{const id=el.dataset.dockId;
    el.addEventListener('click',()=>{if(!this.dragId)this.activate(id)});
    el.addEventListener('keydown',e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();this.activate(id)}if(e.key==='F10'&&e.shiftKey){e.preventDefault();const r=el.getBoundingClientRect();this.context({clientX:r.x,clientY:r.y,preventDefault(){}},id)}});
    el.addEventListener('contextmenu',e=>{e.preventDefault();this.context(e,id)});
    el.addEventListener('dragstart',e=>{this.dragId=id;this.resetMagnify();el.classList.add('dragging');e.dataTransfer.effectAllowed='move';e.dataTransfer.setData('text/plain',id)});
    el.addEventListener('dragover',e=>{if(!this.dragId)return;e.preventDefault();e.dataTransfer.dropEffect='move';el.classList.add('drag-target')});
    el.addEventListener('dragleave',()=>el.classList.remove('drag-target'));
    el.addEventListener('drop',e=>{e.preventDefault();e.stopPropagation();if(!this.dragId)return;this.moveItem(this.dragId,id);this.finishDrag()});
    el.addEventListener('dragend',()=>this.finishDrag());
   });
   this.fit();
  }
  fit(){this.resetMagnify();const icons=P.$$('.dock-item',this.el);if(!icons.length)return;
   document.documentElement.style.removeProperty('--dock-size-live');
   const size=parseFloat(getComputedStyle(icons[0].querySelector('img')).width)||P.css('--dock-icon-size',52);
   const vertical=this.position!=='bottom';
   const style=getComputedStyle(this.el);const gap=parseFloat(vertical?style.rowGap:style.columnGap)||0;
   const available=(vertical?innerHeight:innerWidth)-P.css('--dock-fit-margin',14);
   const extra=[...this.el.children].filter(el=>el.classList.contains('dock-divider')).length;
   const fixed=vertical?parseFloat(style.paddingTop)+parseFloat(style.paddingBottom)+(parseFloat(style.borderTopWidth)||0)+(parseFloat(style.borderBottomWidth)||0):parseFloat(style.paddingLeft)+parseFloat(style.paddingRight)+(parseFloat(style.borderLeftWidth)||0)+(parseFloat(style.borderRightWidth)||0);
   const divWidth=extra*(P.css('--dock-divider-width',1)+P.css('--dock-divider-margin',4)*2);
   const max=Math.floor((available-fixed-divWidth-gap*Math.max(0,icons.length+extra-1))/icons.length);
   if(max<size)document.documentElement.style.setProperty('--dock-size-live',Math.max(P.css('--dock-fit-min-size',8),max)+'px');
  }
  refresh(appId){const item=P.$(`[data-dock-id="${appId}"]`,this.el);if(item)item.classList.toggle('running',this.hasWindow(appId));else if(this.hasWindow(appId))this.render();
   if(!this.pinned.has(appId)&&!this.hasWindow(appId))this.render();
  }
  activate(id){
   const windows=[...P.windows.windows.values()].filter(w=>w.appId===id&&!w.closing).sort((a,b)=>b.z-a.z);
   const minim=windows.find(w=>w.minimized);
   if(windows.length&&!windows[0].minimized)P.windows.focus(windows[0].id);
   else if(minim)P.windows.restore(minim.id);
   else P.apps.open(id);
   const el=P.$(`[data-dock-id="${id}"]`,this.el);
   if(el){el.classList.remove('bouncing');void el.offsetWidth;el.classList.add('bouncing');setTimeout(()=>el.classList.remove('bouncing'),P.css('--dock-bounce-duration',1440))}
   P.menu.dismiss();
  }
  updateMagnify(){
   this.frame=0;if(!this.active||this.dragId)return;
   const nodes=P.$$('.dock-item',this.el);if(!nodes.length)return;
   const vertical=this.position!=='bottom';
   if(!this.baseCenters){this.baseCenters=nodes.map(el=>{const b=el.getBoundingClientRect();return vertical?b.top+b.height/2:b.left+b.width/2});this.baseExtent=vertical?this.el.offsetHeight:this.el.offsetWidth;}
   const size=nodes[0].querySelector('.dock-icon').offsetWidth;
   const max=P.css('--dock-max-scale',2),radius=P.css('--dock-magnify-radius',4)*size;
   const pointer=vertical?this.pointerY:this.pointerX;
   const requested=this.baseCenters.map(center=>{const d=Math.abs(center-pointer);return 1+(max-1)*(d>=radius?0:(1+Math.cos(Math.PI*d/radius))/2)});
   // Unlike a transform-only Dock, use real flex-basis: the translucent shelf
   // and neighbouring icon positions expand/shrink with the magnified icons.
   const baseExtent=this.baseExtent;
   const free=Math.max(0,(vertical?innerHeight:innerWidth)-P.css('--dock-fit-margin',14)-baseExtent);
   const totalExtra=requested.reduce((sum,s)=>sum+size*(s-1),0);
   const fit=Math.min(1,totalExtra>0?free/totalExtra:1);
   nodes.forEach((el,i)=>{
    const scale=1+(requested[i]-1)*fit;
    el.style.setProperty('--dock-scale',scale.toFixed(4));
    el.style.setProperty('--dock-extent',((size*scale)).toFixed(2)+'px');
    el.style.zIndex=String(Math.round(scale*100));
   });
  }
  resetMagnify(){this.active=false;if(this.frame)cancelAnimationFrame(this.frame);this.frame=0;this.baseCenters=null;this.baseExtent=null;P.$$('.dock-item',this.el).forEach(el=>{el.style.removeProperty('--dock-scale');el.style.removeProperty('--dock-extent');el.style.removeProperty('--dock-shift');el.style.removeProperty('z-index')})}
  setPosition(value){if(!['bottom','left','right'].includes(value))return;this.resetMagnify();this.position=value;this.el.dataset.position=value;this.store();this.fit();P.events.emit('dock:settings',{magnification:this.magnification,autoHide:this.autoHide,position:value})}
  setMagnification(value){this.magnification=!!value;if(!value)this.resetMagnify();this.store();P.events.emit('dock:settings',{magnification:this.magnification,autoHide:this.autoHide})}
  setAutoHide(value,persist=true){this.autoHide=!!value;P.$('#screen').classList.toggle('dock-auto-hide',this.autoHide);P.$('#screen').classList.remove('dock-revealed');if(persist)this.store();P.events.emit('dock:settings',{magnification:this.magnification,autoHide:this.autoHide})}
  showDock(){clearTimeout(this.hideTimer);if(this.autoHide)P.$('#screen').classList.add('dock-revealed')}
  scheduleHide(){if(!this.autoHide)return;clearTimeout(this.hideTimer);this.hideTimer=setTimeout(()=>P.$('#screen').classList.remove('dock-revealed'),P.css('--dock-hide-delay',320))}
  moveItem(source,target){if(source===target)return;const before=this.order.indexOf(source),to=this.order.indexOf(target);if(before<0||to<0)return;this.order.splice(before,1);this.order.splice(to,0,source);this.store();this.render();P.events.emit('dock:reorder',{source,target})}
  finishDrag(){if(!this.dragId)return;this.dragId=null;P.$$('.dragging,.drag-target',this.el).forEach(el=>el.classList.remove('dragging','drag-target'));this.resetMagnify()}
  setPinned(id,yes){if(yes)this.pinned.add(id);else this.pinned.delete(id);this.store();this.render();P.events.emit('dock:pin',{id,pinned:yes})}
  resetDefaults(){this.order=this.items.map(a=>a.id);this.pinned=new Set(this.order);this.magnification=true;this.setPosition('bottom');this.setAutoHide(false);this.store();this.render();P.events.emit('dock:reset')}
  context(e,id){P.menu.dismiss();this.showDock();const app=P.apps.get(id),popup=document.createElement('div'),pinned=this.pinned.has(id);popup.className='menu-popup dock-context';
   popup.innerHTML=`<button class="popup-item" data-action="open">Open ${P.escape(app.title)}</button><div class="popup-separator"></div><button class="popup-item" data-action="show">Show in Pearder</button><button class="popup-item" data-action="pin">${pinned?'Remove from Dock':'Keep in Dock'}</button><div class="popup-separator"></div><button class="popup-item" data-action="quit" ${!this.hasWindow(id)?'disabled':''}>Quit ${P.escape(app.title)}</button>`;
   P.$('#popups').append(popup);const w=popup.offsetWidth,h=popup.offsetHeight,margin=P.css('--dock-popup-edge-margin',6);
   popup.style.left=Math.max(margin,Math.min(innerWidth-w-margin,e.clientX))+'px';popup.style.top=Math.max(P.css('--menu-height')+margin,Math.min(innerHeight-h-margin,e.clientY-h))+'px';
   P.$$('.popup-item',popup).forEach(b=>b.onclick=()=>{popup.remove();const a=b.dataset.action;if(a==='open')this.activate(id);if(a==='pin')this.setPinned(id,!pinned);if(a==='quit')[...P.windows.windows.values()].filter(w=>w.appId===id).forEach(w=>P.windows.close(w.id));if(a==='show'){P.apps.open('pearder');const s=[...P.pearder.instances.values()][0];if(s)P.pearder.navigate(s,'/Applications')}});
  }
 };
})();

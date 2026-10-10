(() => {
 const P=window.PearPort;
 const DESK='/Users/pear/Desktop';
 const load=(key,fallback)=>{try{return JSON.parse(localStorage.getItem(key))??fallback}catch{return fallback}};
 P.Desktop=class Desktop {
  constructor(){
   this.el=P.$('#desktop');this.icons=[];this.positions=load('pear-desktop-icon-positions',{});
   try{this.showIcons=localStorage.getItem('pear-show-desktop-items')!=='false'}catch{this.showIcons=true}
   this.el.innerHTML='<div id="desktop-icons" aria-label="Desktop files"></div>';
   this.el.addEventListener('contextmenu',e=>this.context(e));
   this.el.addEventListener('pointerdown',e=>this.select(e));
   this.el.addEventListener('dblclick',e=>{if(!e.target.closest('.desktop-icon,.pear-widget'))P.apps.open('pearder')});
   this.el.addEventListener('dragstart',e=>this.dragStart(e));
   this.el.addEventListener('dragover',e=>this.dragOver(e));
   this.el.addEventListener('dragleave',e=>{if(!this.el.contains(e.relatedTarget))this.clearDragStyle()});
   this.el.addEventListener('drop',e=>this.drop(e));
   this.el.addEventListener('dragend',()=>this.clearDragStyle());
   window.addEventListener('resize',()=>this.positionIcons());
   P.events.on('fs:change',()=>this.render());
  }
  context(e){if(e.target.closest('.desktop-icon,.pear-widget'))return;
   e.preventDefault();P.menu.dismiss();
   const p=document.createElement('div');p.className='desktop-context';p.style.cssText=`left:${Math.max(5,Math.min(e.clientX,innerWidth-215))}px;top:${Math.max(P.css('--menu-height'),Math.min(e.clientY,innerHeight-235))}px`;
   p.innerHTML=`<button class="popup-item" data-action="folder">New Folder</button><div class="popup-separator"></div><button class="popup-item" data-action="widgets">Edit Widgets…</button><button class="popup-item" data-action="widget-toggle">${P.widgets?.visible?'Hide Widgets':'Show Widgets'}</button><div class="popup-separator"></div><button class="popup-item" data-action="change">Change Desktop Background…</button><button class="popup-item" data-action="icons">${this.showIcons?'Hide Desktop Items':'Show Desktop Items'}</button><button class="popup-item" data-action="tidy">Clean Up Desktop Icons</button>`;
   P.$('#popups').append(p);P.$$('.popup-item',p).forEach(btn=>btn.onclick=()=>{
    const v=btn.dataset.action;P.menu.dismiss();p.remove();
    if(v==='folder')this.newFolder();if(v==='widgets')P.widgets?.edit(true);if(v==='widget-toggle')P.widgets?.toggleVisible();
    if(v==='change'){P.apps.open('preferences');const state=[...P.preferences.instances.values()].at(-1);if(state)P.preferences.navigate(state,'desktop')}
    if(v==='icons'){this.showIcons=!this.showIcons;try{localStorage.setItem('pear-show-desktop-items',String(this.showIcons))}catch{}this.render()}
    if(v==='tidy'){this.positions={};this.savePositions();this.render()}
   });
  }
  newFolder(){const name=prompt('Folder name','untitled folder');if(!name)return;try{P.fs.add(DESK,name,'folder')}catch(e){P.toast(e.message)}}
  savePositions(){try{localStorage.setItem('pear-desktop-icon-positions',JSON.stringify(this.positions))}catch{}}
  positionIcons(){const list=P.$$('.desktop-icon',this.el);const height=Math.max(180,this.el.clientHeight),width=Math.max(120,this.el.clientWidth);const cellW=P.css('--desktop-cell-width',80),cellH=P.css('--desktop-cell-height',90);const rows=Math.max(1,Math.floor((height-24)/(cellH+8)));list.forEach((el,i)=>{
    const col=Math.floor(i/rows),row=i%rows;
    const defaultPos={x:width-(col+1)*(cellW+10)-8,y:12+row*(cellH+8)};
    const own=this.positions[el.dataset.id]||defaultPos;
    const x=Math.max(0,Math.min(width-cellW,own.x)),y=Math.max(0,Math.min(height-cellH,own.y));
    el.style.left=x+'px';el.style.top=y+'px';
   })}
  render(){if(!P.fs)return;const items=P.fs.list(DESK),root=P.$('#desktop-icons');root.style.display=this.showIcons?'block':'none';
   const ids=new Set(items.map(n=>n.id));let stale=false;Object.keys(this.positions).forEach(id=>{if(!ids.has(id)){delete this.positions[id];stale=true}});if(stale)this.savePositions();
   root.innerHTML=items.map(n=>`<button type="button" draggable="true" class="desktop-icon" data-id="${n.id}" title="${P.escape(n.name)}"><img src="${P.icon(n.type==='folder'?'folder':n.type==='image'?'photos':'notes')}" alt="" draggable="false"><span>${P.escape(n.name)}</span></button>`).join('');this.positionIcons();
   P.$$('.desktop-icon',root).forEach(el=>{
    el.addEventListener('click',()=>{P.$$('.desktop-icon',root).forEach(x=>x.classList.remove('selected'));el.classList.add('selected')});
    el.addEventListener('dblclick',e=>{e.stopPropagation();const n=P.fs.nodes.get(el.dataset.id);if(n?.type==='folder'){
      P.apps.open('pearder');const win=[...P.windows.windows.values()].find(w=>w.appId==='pearder');const state=P.pearder.instances.get(win?.id);if(state)P.pearder.navigate(state,P.fs.pathOf(n))
     }else if(n)P.pearder.quicklook.show(P.fs.pathOf(n))});
   });
  }
  dragStart(e){const b=e.target.closest('.desktop-icon');if(!b)return;const n=P.fs.nodes.get(b.dataset.id);if(!n)return;
   e.dataTransfer.setData('application/x-pearport-file',P.fs.pathOf(n));e.dataTransfer.setData('text/plain',P.fs.pathOf(n));e.dataTransfer.effectAllowed='copyMove';b.classList.add('dragging');
  }
  dragOver(e){if(e.target.closest('.pear-widget,.pear-widget-gallery'))return;const types=Array.from(e.dataTransfer?.types||[]);if(types.includes('application/x-pearport-file')||types.includes('Files')){
    e.preventDefault();e.dataTransfer.dropEffect=e.altKey?'copy':'move';const to=e.target.closest('.desktop-icon');
    this.clearDragStyle();if(to){const n=P.fs.nodes.get(to.dataset.id);if(n?.type==='folder')to.classList.add('drop-target')}
   }}
  clearDragStyle(){P.$$('.desktop-icon',this.el).forEach(x=>x.classList.remove('dragging','drop-target'))}
  async drop(e){if(e.target.closest('.pear-widget,.pear-widget-gallery'))return;
   const files=Array.from(e.dataTransfer?.files||[]),src=e.dataTransfer?.getData('application/x-pearport-file');if(!src&&!files.length)return;
   e.preventDefault();e.stopPropagation();this.clearDragStyle();const target=e.target.closest('.desktop-icon');const n=target?P.fs.nodes.get(target.dataset.id):null;
   const dest=n?.type==='folder'?P.fs.pathOf(n):DESK;
   if(src){try{
     const node=P.fs.must(src);
     if(dest===DESK&&node.parent===P.fs.must(DESK).id&&!e.altKey){
      const b=this.el.getBoundingClientRect(),cellW=P.css('--desktop-cell-width',80),cellH=P.css('--desktop-cell-height',90);
      this.positions[node.id]={x:Math.max(0,Math.min(b.width-cellW,e.clientX-b.left-cellW/2)),y:Math.max(0,Math.min(b.height-cellH,e.clientY-b.top-cellH/2))};this.savePositions();this.positionIcons();
     }else if(e.altKey)P.fs.copy(src,dest);else P.fs.move(src,dest);
    }catch(err){P.toast(err.message)}return}
   for(const file of files){try{
     if(file.size>1024*1024)throw Error('Files must be under 1 MB');
     const image=file.type.startsWith('image/');if(!image&&!file.type.startsWith('text/')&&!/\.(txt|md|json|csv|js|html|css)$/i.test(file.name))throw Error('Only text and image imports are supported');
     const text=await new Promise((resolve,reject)=>{const reader=new FileReader();reader.onload=()=>resolve(reader.result);reader.onerror=()=>reject(reader.error);if(image)reader.readAsDataURL(file);else reader.readAsText(file)});
     P.fs.importFile(dest,file.name,text,image?'image':'text');
    }catch(err){P.toast(err.message)}}
  }
  select(e){if(e.button!==0||e.target.closest('button,.pear-widget,.pear-widget-gallery'))return;P.menu.dismiss();P.$$('.desktop-icon',this.el).forEach(x=>x.classList.remove('selected'));
   const sx=e.clientX,sy=e.clientY,selection=document.createElement('div');selection.className='desktop-selection';
   const move=ev=>{Object.assign(selection.style,{left:Math.min(ev.clientX,sx)+'px',top:Math.min(ev.clientY,sy)+'px',width:Math.abs(ev.clientX-sx)+'px',height:Math.abs(ev.clientY-sy)+'px'});if(!selection.isConnected)document.body.append(selection)};
   const end=()=>{selection.remove();this.el.removeEventListener('pointermove',move);this.el.removeEventListener('pointerup',end);this.el.removeEventListener('pointercancel',end)};
   this.el.addEventListener('pointermove',move);this.el.addEventListener('pointerup',end);this.el.addEventListener('pointercancel',end);
  }
 };
})();

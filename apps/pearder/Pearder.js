(() => {
 const P=window.PearPort, E=P.escape;
 const LOCATIONS=[['Favorites',[['⌂','Home','/Users/pear'],['▣','Desktop','/Users/pear/Desktop'],['▤','Documents','/Users/pear/Documents'],['↓','Downloads','/Users/pear/Downloads'],['◈','Pictures','/Users/pear/Pictures'],['⬡','Applications','/Applications']]],['Locations',[['▣','Macintosh HD','/']]],['Tags',[['●','Red','tag:red'],['●','Orange','tag:orange'],['●','Blue','tag:blue']]],['',[['♻','Trash','/Trash']]]];
 const ICONS={folder:'folder',text:'notes',image:'photos',app:'appstore'};
 const icon=node=>P.icon(ICONS[node.type]||'notes');
 const human=n=>n<1024?`${n} B`:n<1048576?`${(n/1024).toFixed(1)} KB`:`${(n/1048576).toFixed(1)} MB`;
 const date=n=>new Intl.DateTimeFormat('en-US',{month:'short',day:'numeric',year:'numeric'}).format(new Date(n.modified||Date.now()));
 class QuickLook {
  constructor(){this.overlay=null;document.addEventListener('keydown',e=>{if(e.key==='Escape'&&this.overlay)this.close()})}
  show(path){let n;try{n=P.fs.must(path)}catch(e){return P.toast(e.message)}
   this.close();const overlay=document.createElement('div');overlay.className='ql-overlay';overlay.setAttribute('role','dialog');overlay.setAttribute('aria-label','Quick Look');
   const preview=n.type==='folder'?`<div class="ql-generic"><img src="${icon(n)}" alt=""><p>${P.fs.children(n.id).length} items</p></div>`:n.type==='image'?`<img class="ql-image" src="${E(n.content)}" alt="${E(n.name)}" onerror="this.replaceWith(document.createTextNode('Preview unavailable'))">`:n.type==='app'?`<div class="ql-generic"><img src="${icon(n)}" alt=""><p>Application shortcut</p></div>`:`<pre class="ql-text">${E(n.content||'')}</pre>`;
   overlay.innerHTML=`<div class="ql-backdrop"></div><section class="ql-window"><header><strong>${E(n.name)}</strong><button data-ql="close" title="Close Quick Look">×</button></header><div class="ql-content">${preview}</div><footer><span>${E(n.type)} · ${E(human(P.fs.size(n)))}</span>${n.type==='text'?'<button data-ql="edit">Edit Text…</button>':''}<button data-ql="download">Export file…</button></footer></section>`;
   P.$('#screen').append(overlay);overlay.querySelector('.ql-backdrop').onclick=()=>this.close();overlay.querySelector('[data-ql="close"]').onclick=()=>this.close();overlay.querySelector('[data-ql="download"]').onclick=()=>{if(n.type!=='folder')P.pearder.download(n);else P.toast('Select files to export individually')};const edit=overlay.querySelector('[data-ql="edit"]');if(edit)edit.onclick=()=>{const box=overlay.querySelector('.ql-content');box.innerHTML='<textarea class="ql-editor" aria-label="Text document editor"></textarea>';const input=box.querySelector('textarea');input.value=n.content||'';edit.textContent='Save Changes';edit.onclick=()=>{try{P.fs.write(P.fs.pathOf(n),input.value);this.show(P.fs.pathOf(n));P.toast('Document saved')}catch(err){P.toast(err.message)}};input.focus()};this.overlay=overlay;
  }
  close(){this.overlay?.remove();this.overlay=null}
 }
 class Pearder {
  constructor(){this.instances=new Map();this.clipboard=null;this.quicklook=new QuickLook();P.events.on('fs:change',()=>this.refreshAll());document.addEventListener('keydown',e=>this.onGlobalKey(e));}
  active(){return this.instances.get(P.windows.focused)}
  mount(windowEl,id,initialPath='/Users/pear'){
   const root=P.$('.pearder-root',windowEl);if(!root)return;
   const state={id,root,windowEl,path:initialPath,view:'icons',selected:[],filter:'',history:[initialPath],index:0,sort:'name',columns:[],tag:null,tabs:[{path:initialPath,history:[initialPath],index:0}],tab:0,dragTimer:null};this.instances.set(id,state);
   root.innerHTML=`<div class="pear-toolbar"><div class="pear-nav"><button data-act="back" title="Back" aria-label="Back">‹</button><button data-act="forward" title="Forward" aria-label="Forward">›</button></div><div class="pear-location-title"></div><div class="pear-view-switch" role="group" aria-label="View as">${[['icons','▦'],['list','☷'],['columns','▥'],['gallery','▣']].map(([view,glyph])=>`<button data-view="${view}" title="${view} view">${glyph}</button>`).join('')}</div><button class="pear-tool" data-act="sort" title="Sort">≡</button><button class="pear-tool" data-act="action" title="Actions">⚙</button><button class="pear-tool" data-act="share" title="Export selected file">⇧</button><button class="pear-tool" data-act="tags" title="Tags">◆</button><input class="pear-search" type="search" placeholder="Search" aria-label="Search current folder"/></div><div class="pear-tabbar"></div>
   <div class="pear-main"><aside class="pear-sidebar"></aside><main class="pear-content" tabindex="0" aria-label="Files"></main></div><div class="pear-pathbar"></div><div class="pear-status"></div>`;
   root.addEventListener('click',e=>this.onClick(e,state));root.addEventListener('dblclick',e=>this.onDoubleClick(e,state));root.addEventListener('contextmenu',e=>this.onContext(e,state));root.addEventListener('input',e=>{if(e.target.matches('.pear-search')){state.filter=e.target.value.toLowerCase();this.renderContents(state)}});
   root.addEventListener('dragover',e=>{if(e.target.closest('.pear-content,.pear-sidebar-item[data-path^="/"]')){e.preventDefault();e.dataTransfer.dropEffect=e.dataTransfer.types.includes('application/x-pearport-file')?'move':'copy'}});
   root.addEventListener('drop',e=>this.onDrop(e,state));
   root.addEventListener('dragstart',e=>this.onDragStart(e,state));
   root.addEventListener('dragenter',e=>this.onDragEnter(e,state));
   root.addEventListener('dragleave',()=>clearTimeout(state.dragTimer));
   root.addEventListener('dragend',()=>clearTimeout(state.dragTimer));
   this.navigate(state,initialPath,false);
  }
  unmount(id){this.instances.delete(id)}
  navigate(s,path,push=true){const n=P.fs.get(path);if(!n){P.toast(`Folder not found: ${path}`);return}if(n.type!=='folder'){this.quicklook.show(path);return}
   s.path=P.fs.pathOf(n);s.selected=[];s.filter='';s.tag=null;if(push){s.history=s.history.slice(0,s.index+1);s.history.push(s.path);s.index++}this.syncTab(s);const search=P.$('.pear-search',s.root);if(search)search.value='';this.render(s);
  }
  navigateHistory(s,step){const i=s.index+step;if(i<0||i>=s.history.length)return;s.index=i;this.navigate(s,s.history[i],false)}
  setView(s,view){s.view=view;this.render(s)}
  syncTab(s){if(s.tabs?.[s.tab])Object.assign(s.tabs[s.tab],{path:s.path,history:[...s.history],index:s.index})}
  addTab(s){this.syncTab(s);s.tabs.push({path:s.path,history:[s.path],index:0});this.switchTab(s,s.tabs.length-1)}
  switchTab(s,i){this.syncTab(s);if(!s.tabs[i])return;this.loadTab(s,i)}
  loadTab(s,i){s.tab=i;const t=s.tabs[i];s.path=t.path;s.history=[...t.history];s.index=t.index;s.selected=[];s.filter='';s.tag=null;P.$('.pear-search',s.root).value='';this.render(s)}
  closeTab(s,i){if(s.tabs.length===1){P.windows.close(s.id);return}this.syncTab(s);const old=s.tab;s.tabs.splice(i,1);const next=i===old?Math.min(i,s.tabs.length-1):i<old?old-1:old;this.loadTab(s,next)}
  refreshAll(){this.instances.forEach(s=>{if(!P.fs.get(s.path))s.path='/Users/pear';this.render(s)});P.desktop?.render?.()}
  render(s){this.renderTabs(s);this.renderSidebar(s);this.renderContents(s);const n=P.fs.get(s.path);P.$('.pear-location-title',s.root).textContent=n?.name||'Macintosh HD';P.$('[data-act="back"]',s.root).disabled=s.index<=0;P.$('[data-act="forward"]',s.root).disabled=s.index>=s.history.length-1;P.$$('.pear-view-switch button',s.root).forEach(btn=>btn.classList.toggle('active',btn.dataset.view===s.view));
   const parts=s.path.split('/').filter(Boolean);P.$('.pear-pathbar',s.root).innerHTML=`<span>▣</span><button data-path="/">Macintosh HD</button>${parts.map((part,i)=>`<span>›</span><button data-path="/${parts.slice(0,i+1).join('/')}">${E(part)}</button>`).join('')}`;
  }
  renderTabs(s){P.$('.pear-tabbar',s.root).innerHTML=s.tabs.length===1?'':s.tabs.map((t,i)=>`<div class="pear-tab ${i===s.tab?'active':''}"><button data-tab="${i}">${E(P.fs.get(t.path)?.name||'Home')}</button><button class="pear-tab-close" data-tab-close="${i}" title="Close tab">×</button></div>`).join('')+'<button class="pear-add-tab" data-add-tab title="New tab">＋</button>'}
  renderSidebar(s){P.$('.pear-sidebar',s.root).innerHTML=LOCATIONS.map(([heading,items])=>`<div class="pear-sidebar-group">${heading?`<div class="pear-sidebar-heading">${heading}</div>`:''}${items.map(([symbol,title,path])=>`<button class="pear-sidebar-item ${s.path===path||s.tag&&s.tag===path.slice(4)?'active':''}" data-path="${E(path)}"><span class="pear-sidebar-glyph">${symbol}</span><span>${E(title)}</span></button>`).join('')}</div>`).join('')}
  currentItems(s){const items=s.tag?[...P.fs.nodes.values()].filter(n=>n.parent!==null&&n.type!=='folder'):P.fs.list(s.path);let arr=items.filter(n=>!s.filter||n.name.toLowerCase().includes(s.filter));if(s.tag)arr=arr.filter(n=>n.tags?.includes(s.tag));if(s.sort==='date')arr.sort((a,b)=>b.modified-a.modified);if(s.sort==='kind')arr.sort((a,b)=>a.type.localeCompare(b.type)||a.name.localeCompare(b.name));return arr}
  itemHtml(n,s,view){const sel=s.selected.includes(n.id)?'selected':'';const type=n.type==='folder'?'Folder':n.type==='app'?'Application':n.type==='image'?'Image':'Text document';
   if(view==='icons')return `<button draggable="true" class="pear-file pear-file-icon ${sel}" data-item="${n.id}" title="${E(n.name)}"><img src="${icon(n)}" alt=""><span>${E(n.name)}</span></button>`;
   if(view==='list')return `<button draggable="true" class="pear-file pear-file-row ${sel}" data-item="${n.id}"><span class="pear-file-name"><img src="${icon(n)}" alt="">${E(n.name)}</span><span>${E(date(n))}</span><span>${E(human(P.fs.size(n)))}</span><span>${type}</span></button>`;
   return `<button draggable="true" class="pear-file pear-column-file ${sel}" data-item="${n.id}"><img src="${icon(n)}" alt=""><span>${E(n.name)}</span>${n.type==='folder'?'<b>›</b>':''}</button>`;
  }
  renderContents(s){const area=P.$('.pear-content',s.root);let items=this.currentItems(s);if(!items.length){area.innerHTML='<div class="pear-empty">No items to display</div>';}
   else if(s.view==='icons')area.innerHTML=`<div class="pear-icon-grid">${items.map(n=>this.itemHtml(n,s,'icons')).join('')}</div>`;
   else if(s.view==='list')area.innerHTML=`<div class="pear-file-list"><div class="pear-list-header"><span>Name</span><span>Date Modified</span><span>Size</span><span>Kind</span></div>${items.map(n=>this.itemHtml(n,s,'list')).join('')}</div>`;
   else if(s.view==='columns'){
    const selected=s.selected.length===1?P.fs.nodes.get(s.selected[0]):null;
    const extra=selected?.type==='folder'?P.fs.children(selected.id):[];
    area.innerHTML=`<div class="pear-columns"><div class="pear-column">${items.map(n=>this.itemHtml(n,s,'column')).join('')}</div>${extra.length?`<div class="pear-column">${extra.map(n=>this.itemHtml(n,{...s,selected:[]},'column')).join('')}</div>`:selected?`<div class="pear-column pear-column-preview">${this.previewHtml(selected)}</div>`:''}</div>`;
   }else{
    const current=P.fs.nodes.get(s.selected[0])||items[0];area.innerHTML=`<div class="pear-gallery"><div class="pear-gallery-large">${this.previewHtml(current)}</div><div class="pear-gallery-strip">${items.map(n=>`<button draggable="true" class="pear-gallery-thumbnail ${n.id===current.id?'selected':''}" data-item="${n.id}"><img src="${icon(n)}" alt=""><span>${E(n.name)}</span></button>`).join('')}</div></div>`;
   }
   const selected=s.selected.map(id=>P.fs.nodes.get(id)).filter(Boolean);P.$('.pear-status',s.root).textContent=`${items.length} items · ${selected.length?`${selected.length} selected · `:''}PearPortOS virtual disk · Browser-local storage`;
  }
  previewHtml(n){return `<div class="pear-preview"><img src="${icon(n)}" alt=""><h3>${E(n.name)}</h3><p>${E(n.type)} · ${human(P.fs.size(n))}</p>${n.type==='text'?`<pre>${E((n.content||'').slice(0,300))}</pre>`:''}${n.type==='image'?`<img class="pear-preview-image" src="${E(n.content)}" alt="">`:''}</div>`}
  onClick(e,s){const close=e.target.closest('[data-tab-close]');if(close){this.closeTab(s,+close.dataset.tabClose);return}if(e.target.closest('[data-add-tab]')){this.addTab(s);return}const tab=e.target.closest('[data-tab]');if(tab){this.switchTab(s,+tab.dataset.tab);return}const path=e.target.closest('[data-path]');if(path){const p=path.dataset.path;if(p.startsWith('tag:')){s.tag=p.slice(4);s.selected=[];this.render(s)}else this.navigate(s,p);return}
   const btn=e.target.closest('[data-act]');if(btn){this.action(s,btn.dataset.act,e);return}
   const view=e.target.closest('[data-view]');if(view){this.setView(s,view.dataset.view);return}
   const file=e.target.closest('[data-item]');if(file){const id=file.dataset.item;if(e.ctrlKey||e.metaKey){s.selected=s.selected.includes(id)?s.selected.filter(x=>x!==id):[...s.selected,id]}else s.selected=[id];if(s.view==='icons'||s.view==='list'){P.$$('.pear-file',s.root).forEach(el=>el.classList.toggle('selected',s.selected.includes(el.dataset.item)));P.$('.pear-status',s.root).textContent=`${this.currentItems(s).length} items · ${s.selected.length} selected · PearPortOS virtual disk · Browser-local storage`;}else this.renderContents(s);return}
   if(e.target.closest('.pear-content')&&!e.target.closest('button')){s.selected=[];this.renderContents(s)}
  }
  onDoubleClick(e,s){const btn=e.target.closest('[data-item]');if(!btn)return;this.openNode(P.fs.nodes.get(btn.dataset.item),s)}
  openNode(n,s){if(!n)return;const path=P.fs.pathOf(n);if(n.type==='folder')this.navigate(s,path);else if(n.type==='app'){if(n.name.startsWith('Pearder'))P.apps.open('pearder');else if(n.name.startsWith('Terminal'))P.apps.open('terminal');else if(n.name.startsWith('System Preferences'))P.apps.open('preferences');}else this.quicklook.show(path)}
  action(s,action,e){try{
   if(action==='back'||action==='forward')return this.navigateHistory(s,action==='back'?-1:1);
   if(action==='sort'){const values=['name','date','kind'];s.sort=values[(values.indexOf(s.sort)+1)%values.length];this.renderContents(s);P.toast('Sorted by '+s.sort);return}
   if(action==='action')return this.menu(e.clientX,e.clientY,s);
   if(action==='share')return this.exportSelected(s);
   if(action==='import'){const input=document.createElement('input');input.type='file';input.multiple=true;input.accept='image/*,text/*,.txt,.md,.json,.csv,.js,.css,.html,.log';input.onchange=()=>this.onDrop({target:P.$('.pear-content',s.root),preventDefault(){},dataTransfer:{files:input.files}},s);input.click();return}
   if(action==='tags'){if(!s.selected.length)return P.toast('Select a file first');const n=P.fs.nodes.get(s.selected[0]);const colors=['red','orange','blue'];const old=n.tags?.[0];n.tags=old?[ ]:[colors[0]];P.fs.persist();P.toast(n.tags.length?'Red tag added':'Tag removed');return}
   if(action==='newfolder'){let name=prompt('New folder name','untitled folder');if(name){P.fs.add(s.path,name,'folder');this.render(s)}return}
   if(action==='newfile'){let name=prompt('New text document name','Untitled.txt');if(name){P.fs.add(s.path,name,'text','');this.render(s)}return}
   if(action==='rename'){const n=P.fs.nodes.get(s.selected[0]);if(!n)return P.toast('Select an item');const name=prompt('Rename:',n.name);if(name){P.fs.rename(P.fs.pathOf(n),name);this.render(s)}return}
   if(action==='copy'||action==='cut'){if(!s.selected.length)return P.toast('Select an item first');this.clipboard={nodes:s.selected.map(id=>P.fs.pathOf(id)),cut:action==='cut'};P.toast(action==='cut'?'Ready to move':'Copied to virtual clipboard');return}
   if(action==='paste'){if(!this.clipboard)return P.toast('Clipboard is empty');for(const src of this.clipboard.nodes){const n=P.fs.get(src);if(n){if(this.clipboard.cut)P.fs.move(src,s.path);else P.fs.copy(src,s.path)}}if(this.clipboard.cut)this.clipboard=null;return}
   if(action==='trash'){for(const id of s.selected){const n=P.fs.nodes.get(id);if(n)P.fs.trash(P.fs.pathOf(n))}s.selected=[];return}
   if(action==='restore'){for(const id of s.selected){const n=P.fs.nodes.get(id);if(n)P.fs.restore(P.fs.pathOf(n))}s.selected=[];return}
   if(action==='delete'){if(!confirm('Permanently delete the selected items from PearPortOS?'))return;for(const id of s.selected){const n=P.fs.nodes.get(id);if(n)P.fs.remove(P.fs.pathOf(n))}s.selected=[];return}
   if(action==='emptytrash'){if(confirm('Permanently empty the virtual Trash?'))P.fs.emptyTrash();return}
   if(action==='open'){const n=P.fs.nodes.get(s.selected[0]);if(n)this.openNode(n,s);return}
   if(action==='quicklook'){const n=P.fs.nodes.get(s.selected[0]);if(n)this.quicklook.show(P.fs.pathOf(n));return}
   if(action==='getinfo'){const n=P.fs.nodes.get(s.selected[0]);if(n)alert(`Name: ${n.name}\nKind: ${n.type}\nSize: ${human(P.fs.size(n))}\nPath: ${P.fs.pathOf(n)}`);return}
  }catch(err){P.toast(err.message||'File action failed')}
  }
  menu(x,y,s){P.menu.dismiss();const selected=s.selected.length>0;const trash=s.path==='/Trash';const actions=[['newfolder','New Folder'],['newfile','New Text Document'],['import','Import Files…'],['sep',''],...(selected?[['open','Open'],['quicklook','Quick Look   Space'],['rename','Rename'],['getinfo','Get Info'],['copy','Copy'],['cut','Move'],['tags','Add/Remove Tag'],[trash?'restore':'trash',trash?'Put Back':'Move to Trash']]:[]),['paste','Paste'],...(trash?[['emptytrash','Empty Trash']]:[])];
   const pop=document.createElement('div');pop.className='menu-popup pear-context';pop.innerHTML=actions.map(([id,label])=>id==='sep'?'<div class="popup-separator"></div>':`<button class="popup-item" data-context="${id}">${E(label)}</button>`).join('');P.$('#popups').append(pop);pop.style.left=Math.max(3,Math.min(innerWidth-pop.offsetWidth-3,x||350))+'px';pop.style.top=Math.max(P.css('--menu-height'),Math.min(innerHeight-pop.offsetHeight-5,y||150))+'px';pop.querySelectorAll('[data-context]').forEach(btn=>btn.addEventListener('click',()=>{pop.remove();this.action(s,btn.dataset.context)}))
  }
  onContext(e,s){if(!e.target.closest('.pear-content'))return;e.preventDefault();const file=e.target.closest('[data-item]');if(file&&!s.selected.includes(file.dataset.item)){s.selected=[file.dataset.item];this.renderContents(s)}this.menu(e.clientX,e.clientY,s)}
  onDragStart(e,s){const file=e.target.closest('[data-item]');if(!file)return;const n=P.fs.nodes.get(file.dataset.item);if(!n)return;s.selected=[n.id];e.dataTransfer.setData('application/x-pearport-file',P.fs.pathOf(n));e.dataTransfer.effectAllowed='copyMove'}
  onDragEnter(e,s){clearTimeout(s.dragTimer);const file=e.target.closest('.pear-file[data-item]');const n=file&&P.fs.nodes.get(file.dataset.item);if(n?.type==='folder'&&e.dataTransfer.types.includes('application/x-pearport-file'))s.dragTimer=setTimeout(()=>{if(P.fs.get(P.fs.pathOf(n)))this.navigate(s,P.fs.pathOf(n))},650)}
  async onDrop(e,s){clearTimeout(s.dragTimer);const hover=e.target.closest('.pear-sidebar-item[data-path^="/"],.pear-content');if(!hover)return;e.preventDefault();const source=e.dataTransfer?.getData('application/x-pearport-file');if(source){let dest=hover.classList.contains('pear-sidebar-item')?hover.dataset.path:s.path;const folder=e.target.closest('.pear-file[data-item]');if(folder){const node=P.fs.nodes.get(folder.dataset.item);if(node?.type==='folder')dest=P.fs.pathOf(node)}try{if(e.altKey)P.fs.copy(source,dest);else P.fs.move(source,dest)}catch(err){P.toast(err.message)}return}
   for(const file of Array.from(e.dataTransfer?.files||[])){if(file.size>1048576){P.toast('Import files must be under 1 MB');continue}const isImage=file.type.startsWith('image/'),isText=file.type.startsWith('text/')||/\.(txt|md|json|csv|js|css|html|log)$/i.test(file.name);if(!isImage&&!isText){P.toast('Only text and images can be imported');continue}try{const reader=new FileReader();const content=await new Promise((res,rej)=>{reader.onload=()=>res(reader.result);reader.onerror=()=>rej(reader.error);if(isImage)reader.readAsDataURL(file);else reader.readAsText(file)});P.fs.importFile(s.path,file.name,content,isImage?'image':'text')}catch(err){P.toast(err.message)}}}
  exportSelected(s){const n=P.fs.nodes.get(s.selected[0]);if(!n)return P.toast('Select a file to export');if(n.type==='folder')return P.toast('Select a file, not a folder');this.download(n)}
  download(n){if(n.type==='image'&&n.content.startsWith('assets/')){const a=document.createElement('a');a.href=n.content;a.download=n.name;document.body.append(a);a.click();a.remove();return}const blob=n.type==='image'&&n.content.startsWith('data:')?this.dataBlob(n.content):new Blob([n.content||''],{type:'text/plain'});const url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download=n.name;document.body.append(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),1000)}
  dataBlob(url){const [meta,body]=url.split(','),bytes=atob(body),array=new Uint8Array(bytes.length);for(let i=0;i<bytes.length;i++)array[i]=bytes.charCodeAt(i);return new Blob([array],{type:meta.match(/data:([^;]+)/)?.[1]||'application/octet-stream'})}
  onGlobalKey(e){if(this.quicklook.overlay){if(e.code==='Space'){e.preventDefault();this.quicklook.close()}return}const s=this.active();if(!s||e.target.matches('input,textarea,[contenteditable]')||e.target.closest('.terminal-root'))return;
   const cmd=e.metaKey||e.ctrlKey;if(e.code==='Space'&&s.selected.length){e.preventDefault();this.action(s,'quicklook');return}
   if(e.key==='Backspace'&&!cmd){e.preventDefault();this.navigate(s,P.fs.parent(s.path));return}
   if(cmd){const key=e.key.toLowerCase();if(key==='t'){e.preventDefault();this.addTab(s);return}const map={c:'copy',x:'cut',v:'paste',i:'getinfo','1':'icons','2':'list','3':'columns','4':'gallery'};if(map[key]){e.preventDefault();if(['icons','list','columns','gallery'].includes(map[key]))this.setView(s,map[key]);else this.action(s,map[key])}}else if(e.key==='Delete'&&s.selected.length){e.preventDefault();this.action(s,'trash')}
  }
 }
 P.Pearder=Pearder;
})();

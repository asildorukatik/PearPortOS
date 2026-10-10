/* PearPortOS VirtualFS: browser-isolated, not the host operating system's files. */
(() => {
 const P=window.PearPort;
 const escPath=(name)=>String(name||'').trim();
 class VirtualFS {
  constructor(){this.nodes=new Map();this.next=1;this.version=0;this.db=null;this.storageKey='pearport-vfs-v1';this.seed();this.ready=this.load();}
  seed(){
   this.nodes.clear();this.next=1;
   const add=(parent,name,type='folder',content='')=>{const id=String(this.next++),n={id,parent,name,type,content,modified:Date.now(),originalParent:null};this.nodes.set(id,n);return id;};
   const root=add(null,'Macintosh HD');const apps=add(root,'Applications'),users=add(root,'Users');add(root,'System');const pear=add(users,'pear');const desktop=add(pear,'Desktop'),docs=add(pear,'Documents'),down=add(pear,'Downloads'),pictures=add(pear,'Pictures');add(pear,'Music');add(pear,'Movies');add(root,'Trash');
   add(docs,'Welcome.txt','text','Welcome to PearPortOS!\n\nThis is a virtual file saved inside this browser.\nYou can create, rename, move, copy and preview documents.\n\nTry opening Terminal and typing: ls ~/Documents');
   add(docs,'Project Ideas.txt','text','PearPortOS roadmap\n• Phase 4: Pearder, Quick Look and Terminal\n• Phase 5: Spotlight and Mission Control\n• Phase 6: more applications');
   add(desktop,'Read Me.txt','text','Double-click Pearder to browse files.\nRight-click a document to rename, copy or delete it.\nSpace opens Quick Look.');
   add(down,'Sample.txt','text','Files in this demo exist only in your browser storage.');
   add(apps,'Pearder.app','app');const utils=add(apps,'Utilities');add(utils,'Terminal.app','app');add(apps,'System Preferences.app','app');
   add(pictures,'Pear Island.svg','image','assets/wallpapers/Pear-Island.svg');
  }
  async load(){let fromLocal=false;try{const raw=localStorage.getItem(this.storageKey);if(raw){this.hydrate(JSON.parse(raw));fromLocal=true}}catch(e){console.warn('VirtualFS storage unavailable:',e)}
   if(!('indexedDB' in window))return;
   try{const db=await new Promise((resolve,reject)=>{const req=indexedDB.open('pearport-files',1);req.onupgradeneeded=()=>req.result.createObjectStore('snapshots');req.onsuccess=()=>resolve(req.result);req.onerror=()=>reject(req.error)});this.db=db;
    const value=await new Promise((resolve,reject)=>{const tx=db.transaction('snapshots','readonly');const req=tx.objectStore('snapshots').get('current');req.onsuccess=()=>resolve(req.result);req.onerror=()=>reject(req.error)});
    if(value&&(!fromLocal||(value.saved||0)>(this.loadedSaved||0)))this.hydrate(value);
    if(!value)this.persist();
   }catch(e){console.warn('VirtualFS IndexedDB unavailable; localStorage fallback in use:',e)}
   P.events.emit('fs:ready');
  }
  hydrate(data){if(!data||!Array.isArray(data.nodes)||data.nodes.length<1)return;this.loadedSaved=data.saved||0;this.nodes=new Map(data.nodes.map(n=>[n.id,n]));this.next=Math.max(Number(data.next)||1,...data.nodes.map(n=>Number(n.id)+1));this.version++;}
  snapshot(){return {saved:Date.now(),next:this.next,nodes:[...this.nodes.values()]}}
  persist(){this.version++;const snap=this.snapshot();try{localStorage.setItem(this.storageKey,JSON.stringify(snap))}catch(e){console.warn('VirtualFS localStorage is full or blocked:',e)}
   if(this.db){try{const tx=this.db.transaction('snapshots','readwrite');tx.objectStore('snapshots').put(snap,'current')}catch(e){console.warn('VirtualFS save failed:',e)}}
   P.events.emit('fs:change',{version:this.version});}
  resolve(path,cwd='/Users/pear'){
   let s=String(path??'').trim();if(!s)s=cwd;if(s==='~')s='/Users/pear';else if(s.startsWith('~/'))s='/Users/pear/'+s.slice(2);
   if(!s.startsWith('/'))s=cwd.replace(/\/$/,'')+'/'+s;
   const seg=[];s.split('/').forEach(p=>{if(!p||p==='.')return;if(p==='..')seg.pop();else seg.push(p)});return '/'+seg.join('/');
  }
  pathOf(node){if(typeof node==='string')node=this.nodes.get(node);if(!node)throw Error('Item not found');const parts=[];while(node&&node.parent!==null){parts.unshift(node.name);node=this.nodes.get(node.parent)}return '/'+parts.join('/')}
  get(path,cwd='/Users/pear'){
   const p=this.resolve(path,cwd);if(p==='/')return [...this.nodes.values()].find(n=>n.parent===null);
   let current=this.get('/');for(const seg of p.slice(1).split('/')){current=[...this.nodes.values()].find(n=>n.parent===current.id&&n.name===seg);if(!current)return null;}return current;
  }
  must(path,cwd){const n=this.get(path,cwd);if(!n)throw Error(`No such file or folder: ${path}`);return n}
  children(id){return [...this.nodes.values()].filter(n=>n.parent===id).sort((a,b)=>(a.type==='folder'?0:1)-(b.type==='folder'?0:1)||a.name.localeCompare(b.name,undefined,{numeric:true}));}
  list(path,cwd){const n=this.must(path,cwd);if(n.type!=='folder')throw Error('Not a folder');return this.children(n.id)}
  parent(path){const p=this.resolve(path);return p==='/'?'/':p.substring(0,p.lastIndexOf('/'))||'/'}
  basename(path){return this.resolve(path).split('/').pop()||'Macintosh HD'}
  validateName(name){name=escPath(name);if(!name||name==='.'||name==='..'||name.includes('/')||name.includes('\0')||name.length>180)throw Error('Invalid file name');return name}
  add(parentPath,name,type='folder',content=''){
   const parent=this.must(parentPath);if(parent.type!=='folder')throw Error('Destination is not a folder');name=this.validateName(name);if(this.children(parent.id).some(n=>n.name===name))throw Error('An item with that name already exists');
   const n={id:String(this.next++),parent:parent.id,name,type,content,modified:Date.now(),originalParent:null};this.nodes.set(n.id,n);this.persist();return n;
  }
  mkdir(path){return this.add(this.parent(path),this.basename(path),'folder')}
  write(path,content){const n=this.get(path);if(n){if(n.type==='folder')throw Error('Cannot write to a folder');n.content=String(content);n.type='text';n.modified=Date.now();this.persist();return n}return this.add(this.parent(path),this.basename(path),'text',String(content))}
  importFile(folder,fileName,content,type){return this.add(folder,fileName,type,content)}
  rename(path,name){const n=this.must(path);if(n.parent===null)throw Error('Cannot rename the disk');name=this.validateName(name);if(this.children(n.parent).some(x=>x.name===name&&x.id!==n.id))throw Error('That name is already in use');n.name=name;n.modified=Date.now();this.persist();return n}
  isAncestor(ancestor,node){while(node){if(node.id===ancestor.id)return true;node=this.nodes.get(node.parent)}return false}
  move(path,destination){const n=this.must(path),dest=this.must(destination);if(n.parent===null)throw Error('Cannot move disk root');if(dest.type!=='folder')throw Error('Destination must be a folder');if(this.isAncestor(n,dest))throw Error('Cannot move a folder inside itself');if(this.children(dest.id).some(x=>x.name===n.name&&x.id!==n.id))throw Error('Destination already contains this name');n.parent=dest.id;n.modified=Date.now();this.persist();return n}
  copy(path,destination){const orig=this.must(path),dest=this.must(destination);if(dest.type!=='folder')throw Error('Destination must be a folder');if(this.isAncestor(orig,dest))throw Error('Cannot copy a folder inside itself');const clone=(from,to,newName)=>{const n={...from,id:String(this.next++),parent:to,name:newName??from.name,originalParent:null};this.nodes.set(n.id,n);this.children(from.id).forEach(child=>clone(child,n.id));return n};
   let newName=orig.name;const present=this.children(dest.id).map(n=>n.name);if(present.includes(newName)){let i=2;const dot=orig.name.lastIndexOf('.'),base=dot>0?orig.name.slice(0,dot):orig.name,ext=dot>0?orig.name.slice(dot):'';do{newName=`${base} copy${i===2?'':' '+(i-1)}${ext}`;i++}while(present.includes(newName))}
   const out=clone(orig,dest.id,newName);this.persist();return out;
  }
  trash(path){const n=this.must(path),trash=this.must('/Trash');if(n.parent===null||n.id===trash.id)throw Error('Cannot trash that item');if(n.parent===trash.id)return n;n.originalParent=n.parent;n.originalName=n.name;
   let name=n.name;let i=1;while(this.children(trash.id).some(x=>x.name===name))name=`${n.name} (${++i})`;n.name=name;n.parent=trash.id;this.persist();return n;
  }
  restore(path){const n=this.must(path),trash=this.must('/Trash');if(n.parent!==trash.id)throw Error('Not in Trash');const dest=this.nodes.get(n.originalParent);if(!dest||dest.type!=='folder')throw Error('Original folder no longer exists');let name=n.originalName||n.name;let i=1;while(this.children(dest.id).some(x=>x.name===name))name=`${n.originalName||n.name} (${++i})`;n.name=name;n.parent=dest.id;n.originalParent=null;n.originalName=null;this.persist();return n}
  remove(path){const n=this.must(path);if(n.parent===null)throw Error('Cannot remove disk');const visit=id=>{this.children(id).forEach(c=>visit(c.id));this.nodes.delete(id)};visit(n.id);this.persist()}
  emptyTrash(){this.children(this.must('/Trash').id).forEach(n=>{const del=id=>{this.children(id).forEach(c=>del(c.id));this.nodes.delete(id)};del(n.id)});this.persist()}
  text(path){const n=this.must(path);if(n.type==='folder')throw Error('This is a folder');return n.content||''}
  size(n){return n.type==='folder'?this.children(n.id).length:new Blob([n.content||'']).size}
 }
 P.VirtualFS=VirtualFS;
})();

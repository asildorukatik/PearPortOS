(() => {
 const P=window.PearPort,E=P.escape;
 const tokenize=s=>{const tokens=[];let value='',quote='',escaped=false;for(const c of s){if(escaped){value+=c;escaped=false;continue}if(c==='\\'&&quote!=="'"){escaped=true;continue}if(quote){if(c===quote)quote='';else value+=c;continue}if(c==='"'||c==="'"){quote=c;continue}if(/\s/.test(c)){if(value){tokens.push(value);value=''}continue}value+=c}if(quote)throw Error('Unclosed quotation mark');if(value)tokens.push(value);return tokens};
 class Terminal {
  constructor(){this.instances=new Map()}
  mount(el,id){const root=P.$('.terminal-root',el);if(!root)return;const s={id,root,cwd:'/Users/pear',history:[],historyIndex:0};this.instances.set(id,s);
   root.innerHTML='<div class="terminal-scroll"><div class="terminal-lines"></div><form class="terminal-entry"><label class="terminal-prefix"></label><input class="terminal-input" autocomplete="off" spellcheck="false" aria-label="Terminal command" /></form></div>';
   P.$('.terminal-entry',root).addEventListener('submit',e=>{e.preventDefault();const line=P.$('.terminal-input',root).value;P.$('.terminal-input',root).value='';this.run(s,line)});
   P.$('.terminal-input',root).addEventListener('keydown',e=>{if(e.key==='ArrowUp'){e.preventDefault();s.historyIndex=Math.max(0,s.historyIndex-1);e.target.value=s.history[s.historyIndex]||''}if(e.key==='ArrowDown'){e.preventDefault();s.historyIndex=Math.min(s.history.length,s.historyIndex+1);e.target.value=s.history[s.historyIndex]||''}if(e.key==='Tab'){e.preventDefault();this.complete(s,e.target)}});
   root.addEventListener('click',()=>P.$('.terminal-input',root)?.focus());
   this.print(s,'Last login: '+new Date().toLocaleString()+' on browser-console');this.print(s,'PearPortOS Terminal · Virtual filesystem only · Type help');this.prompt(s);setTimeout(()=>P.$('.terminal-input',root)?.focus(),60)
  }
  unmount(id){this.instances.delete(id)}
  print(s,line='',type='normal'){const box=P.$('.terminal-lines',s.root);if(!box)return;const row=document.createElement('div');row.className='terminal-line '+type;row.textContent=line;box.append(row);if(box.childElementCount>550)box.firstChild.remove();const scroll=P.$('.terminal-scroll',s.root);scroll.scrollTop=scroll.scrollHeight;}
  prompt(s){P.$('.terminal-prefix',s.root).textContent=`pear@PearPortOS ${s.cwd==='/Users/pear'?'~':s.cwd.replace('/Users/pear','~')} %`}
  complete(s,input){const text=input.value;const m=text.match(/(.*\s|^)([^\s]*)$/);if(!m)return;const fragment=m[2],base=P.fs.parent(P.fs.resolve(fragment||'.',s.cwd));try{const items=P.fs.list(base).filter(n=>n.name.startsWith(P.fs.basename(fragment)));if(items.length===1)input.value=text.slice(0,-fragment.length)+(fragment.includes('/')?fragment.slice(0,fragment.lastIndexOf('/')+1):'')+items[0].name+(items[0].type==='folder'?'/':'')}catch{}}
  run(s,line){this.print(s,`${P.$('.terminal-prefix',s.root).textContent} ${line}`,'command');if(!line.trim())return;
   s.history.push(line);s.historyIndex=s.history.length;
   try{const parts=tokenize(line),cmd=parts.shift(),args=parts,at=p=>P.fs.resolve(p,s.cwd),out=t=>this.print(s,String(t)),fs=P.fs;
    switch(cmd){
     case 'help':out('Commands: help, pwd, ls, cd, mkdir, touch, cat, echo, cp, mv, rm, rmdir, tree, find, clear, date, whoami, uname, open, stat, head, history, reset');out('Use paths like ~/Documents, ../Desktop or /Applications. echo hello > file.txt writes a text file.');break;
     case 'pwd':out(s.cwd);break;
     case 'ls':{
      const full=args.filter(x=>!x.startsWith('-')),path=at(full[0]||'.'),n=fs.must(path);const rows=n.type==='folder'?fs.children(n.id):[n];if(args.includes('-l')||args.includes('-la'))rows.forEach(n=>out(`${n.type==='folder'?'d':'-'}rw-r--r--   ${String(fs.size(n)).padStart(7)}  ${n.name}${n.type==='folder'?'/':''}`));else out(rows.map(n=>n.name+(n.type==='folder'?'/':'')).join('    '));break;}
     case 'cd':{const n=fs.must(at(args[0]||'~'));if(n.type!=='folder')throw Error('cd: Not a directory');s.cwd=fs.pathOf(n);this.prompt(s);break}
     case 'mkdir':if(!args.length)throw Error('mkdir: Missing folder name');args.filter(a=>a!=='-p').forEach(a=>{const path=at(a);if(args.includes('-p')){let p='';path.split('/').filter(Boolean).forEach(part=>{p+='/'+part;if(!fs.get(p))fs.mkdir(p)})}else fs.mkdir(path)});break;
     case 'touch':if(!args.length)throw Error('touch: Missing file name');args.forEach(a=>{const path=at(a);if(!fs.get(path))fs.write(path,'')});break;
     case 'cat':if(!args.length)throw Error('cat: Missing file name');args.forEach(a=>out(fs.text(at(a))));break;
     case 'head':{const n=fs.text(at(args.at(-1)));out(n.split('\n').slice(0,10).join('\n'));break}
     case 'echo':{
      const ix=args.findIndex(a=>a==='>'||a==='>>');const output=args.slice(0,ix<0?undefined:ix).join(' ');if(ix<0)out(output);else {if(!args[ix+1])throw Error('Missing output file name');const path=at(args[ix+1]);fs.write(path,(args[ix]==='>>'&&fs.get(path)?fs.text(path)+'\n':'')+output+'\n')}break}
     case 'cp':if(args.length<2)throw Error('Usage: cp SOURCE DIRECTORY');fs.copy(at(args[0]),at(args[1]));break;
     case 'mv':if(args.length<2)throw Error('Usage: mv SOURCE DESTINATION');{const src=at(args[0]),dest=at(args[1]),node=fs.get(dest);if(node?.type==='folder')fs.move(src,dest);else{const parent=fs.parent(dest);fs.move(src,parent);fs.rename(parent+'/'+fs.basename(src),fs.basename(dest))}}break;
     case 'rm':case 'rmdir':if(!args.length)throw Error('Missing file or folder name');args.filter(a=>!a.startsWith('-')).forEach(a=>{const path=at(a),n=fs.must(path);if(n.type==='folder'&&fs.children(n.id).length&&!args.some(t=>t==='-r'||t==='-rf'||t==='-R'))throw Error(`rm: ${a}: is a nonempty directory (use -r)`);fs.remove(path)});break;
     case 'tree':{const walk=(path,depth=0)=>{if(depth>5)return;fs.list(path).forEach(n=>{out('  '.repeat(depth)+(n.type==='folder'?'📁 ':'   ')+n.name);if(n.type==='folder')walk(fs.pathOf(n),depth+1)})};out(at(args[0]||'.'));walk(at(args[0]||'.'));break}
     case 'find':{const results=[];const walk=(path,depth=0)=>{if(depth>12)return;for(const n of fs.list(path)){const p=fs.pathOf(n);results.push(p);if(n.type==='folder')walk(p,depth+1)}};walk(at(args[0]||'.'));results.forEach(out);break}
     case 'stat':{const n=fs.must(at(args[0]||'.'));out(`${n.name} · ${n.type} · ${fs.size(n)} bytes · ${new Date(n.modified).toLocaleString()}`);break}
     case 'clear':P.$('.terminal-lines',s.root).replaceChildren();break;
     case 'date':out(new Date().toString());break;
     case 'whoami':out('pear');break;
     case 'uname':out('PearPortOS web shell 0.4.0 · not a Unix kernel');break;
     case 'history':s.history.forEach((h,i)=>out(`${i+1}  ${h}`));break;
     case 'open':{const path=at(args[0]||'.'),n=fs.must(path);if(n.type==='folder'){P.apps.open('pearder');const win=[...P.windows.windows.values()].find(w=>w.appId==='pearder');const view=P.pearder.instances.get(win?.id);if(view)P.pearder.navigate(view,path)}else if(n.type==='app'){const id=n.name.startsWith('Terminal')?'terminal':n.name.startsWith('System Preferences')?'preferences':'pearder';P.apps.open(id)}else P.pearder.quicklook.show(path);break}
     case 'reset':if(args.join(' ')==='--factory-files'&&confirm('Erase all virtual files and restore samples?')){fs.seed();fs.persist();out('Virtual disk reset')}else out('To reset files, run: reset --factory-files');break;
     default:out(`${cmd}: command not found (type help)`);
    }
   }catch(err){this.print(s,err.message||String(err),'error')}
   this.prompt(s);P.$('.terminal-input',s.root).focus();
  }
 }
 P.Terminal=Terminal;
})();

(() => {
 const P=window.PearPort;
 const GROUPS=[
  [['general','General'],['desktop','Desktop & Screen Saver'],['dock','Dock'],['mission','Mission Control'],['siri','Siri'],['spotlight','Spotlight'],['language','Language & Region']],
  [['notifications','Notifications'],['accounts','Internet Accounts'],['users','Users & Groups'],['accessibility','Accessibility'],['security','Security & Privacy'],['update','Software Update']],
  [['network','Network'],['bluetooth','Bluetooth'],['sound','Sound'],['printers','Printers & Scanners'],['keyboard','Keyboard'],['trackpad','Trackpad'],['mouse','Mouse'],['displays','Displays'],['energy','Energy Saver'],['datetime','Date & Time'],['sharing','Sharing'],['backup','Time Machine'],['startup','Startup Disk']]
 ];
 const entries=GROUPS.flat(), all=new Map(entries);
 const U=()=>P.UI;
 const esc=P.escape;
 const opt=(...xs)=>xs.map(x=>[x,x]);
 const note=(s)=>`<p class="prefs-note">${esc(s)}</p>`;
 const separator=()=>'<div class="pp-separator"></div>';
 const row=(label,html,desc='')=>U().fieldrow(label,html,desc);
 const choice=(key,title,on)=>U().checkbox(key,title,on);
 const show=(title,desc,html)=>`<section class="prefs-content-pane"><div class="prefs-pane-heading"><h2>${esc(title)}</h2>${U().help('PearPortOS is a web desktop. These controls cannot change the computer operating system.')}</div>${desc?note(desc):''}${html}</section>`;
 P.SystemPreferences=class SystemPreferences {
  constructor(){try{this.values=JSON.parse(localStorage.getItem('pear-settings-v3'))||{}}catch{this.values={}};this.instances=new Map();}
  read(k,def){return this.values[k]??def}
  save(k,v){this.values[k]=v;try{localStorage.setItem('pear-settings-v3',JSON.stringify(this.values))}catch{}P.events.emit('preferences:change',{key:k,value:v})}
  mount(windowEl,id){const root=P.$('.preferences-root',windowEl);if(!root)return;const state={id,windowEl,root,pane:null,history:[],index:-1};this.instances.set(id,state);
   root.innerHTML=`<div class="prefs-toolbar"><div class="prefs-nav"><button data-nav="back" type="button" title="Back" aria-label="Back">‹</button><button data-nav="forward" type="button" title="Forward" aria-label="Forward">›</button><button data-nav="all" type="button" title="Show All" aria-label="Show All">▦</button></div><span class="prefs-toolbar-title">System Preferences</span><div class="prefs-search">${U().search('filter','Search')}</div></div><div class="prefs-scroller"></div>`;
   root.addEventListener('click',e=>this.click(e,state));root.addEventListener('change',e=>this.change(e,state));root.addEventListener('input',e=>this.input(e,state));root.addEventListener('keydown',e=>{if(e.target.matches('input[data-setting="filter"]')&&e.key==='Enter'){const first=P.$('.prefs-grid-item:not([hidden])',root);if(first){e.preventDefault();this.navigate(state,first.dataset.pane)}}});
   this.navigate(state,null);
  }
  unmount(id){this.instances.delete(id)}
  updateToolbar(state){const {root,index,history,pane}=state;
   P.$('[data-nav="back"]',root).disabled=index<=0;
   P.$('[data-nav="forward"]',root).disabled=index>=history.length-1;
   P.$('[data-nav="all"]',root).disabled=pane===null;
   P.$('.prefs-toolbar-title',root).textContent=pane?all.get(pane)||'System Preferences':'System Preferences';
   P.$('.prefs-search',root).hidden=pane!==null;
  }
  navigate(state,pane,push=true){if(pane&&!all.has(pane))return;state.pane=pane;if(pane===null){const search=P.$('[data-setting="filter"]',state.root);if(search)search.value=''}if(push){state.history=state.history.slice(0,state.index+1);state.history.push(pane);state.index++}this.updateToolbar(state);P.$('.prefs-scroller',state.root).innerHTML=pane?this.renderPane(pane):this.renderGrid();P.$('.prefs-scroller',state.root).scrollTop=0;}
  renderGrid(){return `<div class="prefs-grid-page"><h1>System Preferences</h1>${GROUPS.map((group,i)=>`<div class="prefs-grid-group" data-group="${i}">${group.map(([id,title])=>`<button class="prefs-grid-item" data-pane="${id}" title="${esc(title)}" type="button"><img src="${P.icon('pref-'+id)}" alt=""><span>${esc(title)}</span></button>`).join('')}</div>`).join('')}<div class="prefs-bottom-note">Changes here customize PearPortOS, not your computer's operating system.</div></div>`}
  renderPane(p){const r=(k,d)=>this.read(k,d),btn=U().button,cb=choice,radio=U().radio,slider=U().slider,seg=U().segment,pop=U().popup;
   switch(p){
    case 'general':return show('General','Configure the appearance of the PearPortOS desktop.',
     row('Appearance:',seg('appearance', [['light','Light'],['dark','Dark'],['auto','Auto']],P.theme.preference))+
     row('Accent color:',`<div class="prefs-accent-swatches" role="group" aria-label="Accent color">${['blue','purple','pink','red','orange','yellow','green','graphite'].map(name=>`<button type="button" class="prefs-accent-swatch ${P.theme.accent===name?'selected':''}" data-accent="${name}" title="${name}" aria-label="${name}" aria-pressed="${P.theme.accent===name}"></button>`).join('')}</div>`)+
     separator()+cb('smoothScroll','Smooth scrolling inside PearPortOS windows',r('smoothScroll',true))+
     separator()+`<div class="prefs-demo-heading">Catalina controls preview</div>`+
     row('Buttons:',`<div class="pp-inline">${btn('Normal',{action:'demo-normal'})}${btn('Default',{action:'demo-default',primary:true})}</div>`)+
     row('Selection:',radio('demo-radio',[['one','First'],['two','Second']],r('demo-radio','one')))+
     row('Progress:',U().progress(65))+
     row('Stepper:',U().stepper('demo-stepper',r('demo-stepper',5)))+
     row('Sheet:',btn('Show alert sheet…',{action:'demo-sheet'}))+
     U().disclosure('Additional standard components',U().table(['Control','Availability'],[['Text field','Yes'],['Search field','Yes'],['Checkbox / radio','Yes'],['Segmented / popup','Yes'],['Slider / stepper','Yes'],['Sheet / progress','Yes'],['Tabs / table / disclosure','Yes']])));
    case 'desktop':return show('Desktop & Screen Saver','Catalina island wallpapers supplied by you. Select Day, Dusk, Night, or Dynamic Desktop.',
     U().tabs('desktop-tab',[['desktop','Desktop'],['saver','Screen Saver']],r('desktop-tab','desktop'))+
     `<div class="prefs-wallpaper-preview" aria-label="Current Catalina wallpaper preview"></div>`+
     row('Wallpaper style:',pop('wallpaper-choice', [['auto','Automatic'],['day','Day'],['dusk','Dusk'],['night','Night']],P.theme.wallpaperChoice))+
     row('Dynamic Desktop:',cb('dynamic','Automatically change wallpaper with time of day',P.theme.dynamic))+
     row('Wallpaper:',`<div class="prefs-wallpaper-actions"><label class="prefs-wallpaper-import">Choose Picture…<input type="file" data-wallpaper-upload accept="image/png,image/jpeg,image/webp" aria-label="Choose a wallpaper from your device"></label><button type="button" data-action="wallpaper-reset">Restore Catalina</button></div>`)+
     note('The three wallpapers came from your uploads and are bundled locally. Your imported picture stays in your browser; images up to 2 MB can be saved.')+
     note('Dynamic Desktop follows local time: day 7 AM–5 PM, dusk 5–8 PM, night 8 PM–7 AM. An explicitly selected wallpaper stays fixed.'));
    case 'dock':return show('Dock','Configure the floating Catalina-style shelf.',
     row('Size:',slider('dock-size',r('dock-size',52),{min:20,max:72})+` <output data-out="dock-size">${r('dock-size',52)} px</output>`)+
     row('Magnification:',cb('dock-magnification','Magnification',P.dock.magnification))+
     row('Maximum:',slider('dock-max-scale',r('dock-max-scale',2),{min:1,max:2.5,step:.1})+` <output data-out="dock-max-scale">${r('dock-max-scale',2)}×</output>`)+
     row('Position on screen:',radio('dock-position',[['left','Left'],['bottom','Bottom'],['right','Right']],P.dock.position))+
     separator()+cb('dock-autohide','Automatically hide and show the Dock',P.dock.autoHide)+
     separator()+row('Arrangement:',btn('Restore Default Dock',{action:'dock-reset'})));
    case 'mission':return show('Mission Control','Press F3 to see all windows, or use Ctrl+Left / Ctrl+Right to change Spaces.',
     cb('mission-group','Group windows by application',r('mission-group',true))+separator()+cb('mission-display','Displays have separate Spaces',r('mission-display',true))+separator()+['tl','tr','bl','br'].map((pos,i)=>row(['Top left:','Top right:','Bottom left:','Bottom right:'][i],pop('hot-'+pos,[['none','—'],['mission','Mission Control'],['launchpad','Launchpad'],['desktop','Desktop'],['notifications','Notification Center'],['lock','Lock Screen']],r('hot-'+pos,'none')))).join(''));
    case 'siri':return show('Siri','The web demo uses a local text-command assistant and optional browser speech recognition.',btn('Open Siri…',{action:'show-siri'}));
    case 'spotlight':return show('Spotlight','Search apps and virtual files, or do calculations using Cmd/Ctrl+Space.',btn('Open Spotlight…',{action:'show-spotlight'}));
    case 'language':return show('Language & Region','Language selection is cosmetic in this web demo; PearPortOS interface currently uses English.',row('Preferred language:',pop('language',[['en','English'],['tr','Türkçe (future)'],['fr','Français (future)']],r('language','en')))+row('Clock format:',cb('clock24','Use a 24-hour clock',r('clock24',false))));
    case 'notifications':return show('Notifications','Open Notification Center using the rightmost menu bar icon.',btn('Open Notification Center…',{action:'show-notifications'}));
    case 'accounts':return this.unavailable('Internet Accounts','Web pages cannot add your computer’s native email or cloud accounts. No credentials are requested or stored.');
    case 'users':return this.unavailable('Users & Groups','This web-based desktop uses a demonstration session, not operating-system users.');
    case 'accessibility':return show('Accessibility','Local settings for this simulated desktop.',cb('reduce-motion','Reduce motion',r('reduce-motion',false))+separator()+cb('reduce-transparency','Reduce transparency',r('reduce-transparency',false)));
    case 'security':return this.unavailable('Security & Privacy','The browser sandbox cannot modify firewall, disk encryption, app permissions or system privacy controls.');
    case 'update':return this.unavailable('Software Update','PearPortOS is an offline development build. Automatic OS update checks are not available.');
    case 'network':return this.unavailable('Network','Wi-Fi and Ethernet status require native Linux services. This browser app cannot configure your real network.');
    case 'bluetooth':return this.unavailable('Bluetooth','Bluetooth pairing and system-wide device settings are unavailable from this browser desktop.');
    case 'sound':return show('Sound','Preview of PearPortOS interface sound controls. This does not change system audio.',row('Output volume:',slider('mock-volume',r('mock-volume',52))+` <output data-out="mock-volume">${r('mock-volume',52)}%</output>`)+row('Alert:',pop('mock-alert',opt('Pear Chime','Quiet Pop','None'),r('mock-alert','Pear Chime'))));
    case 'printers':return this.unavailable('Printers & Scanners','Connected printers and scanners require native OS integration.');
    case 'keyboard':return show('Keyboard','Preferences for a future native port.',row('Key repeat:',slider('key-repeat',r('key-repeat',50)))+row('Modifier keys:',btn('Modifier Keys…',{action:'demo-sheet'})));
    case 'trackpad':return show('Trackpad','Gestures are only simulated using mouse and keyboard shortcuts in this browser.',row('Tracking speed:',slider('track-speed',r('track-speed',50)))+cb('natural-scroll','Scroll direction: Natural',r('natural-scroll',true)));
    case 'mouse':return show('Mouse','Local preferences only.',row('Tracking speed:',slider('mouse-speed',r('mouse-speed',50)))+cb('mouse-secondary','Enable secondary click',r('mouse-secondary',true)));
    case 'displays':return show('Displays','These controls preview a display settings pane; they do not change your monitor resolution.',U().tabs('display-tab',[['display','Display'],['color','Color']],r('display-tab','display'))+row('Scale:',pop('mock-scale',[['normal','Default for display'],['large','Larger Text'],['space','More Space']],r('mock-scale','normal'))));
    case 'energy':return show('Energy Saver','Web pages cannot change the computer’s sleep and power policies.',cb('mock-energy','Prevent automatic sleeping while the display is off (demo)',r('mock-energy',false)));
    case 'datetime':return show('Date & Time','Your browser provides the current local time. No system clock changes can be made.',row('Current time:',`<strong>${new Date().toLocaleString()}</strong>`)+cb('clock24','Use a 24-hour clock',r('clock24',false)));
    case 'sharing':return this.unavailable('Sharing','Native file, printer and screen-sharing services require the future Ubuntu port.');
    case 'backup':return this.unavailable('Time Machine','System backups are not implemented in a browser. Use the host OS backup tools.');
    case 'startup':return this.unavailable('Startup Disk','Browser applications cannot select a boot device or replace the operating system.');
    default:return this.unavailable(all.get(p)||'System Preferences','This pane is not available yet.');
   }
  }
  unavailable(title,body){return show(title,'',`<div class="prefs-unavailable"><div class="prefs-unavailable-icon">◇</div>${note(body)}</div>`)}
  click(e,state){const btn=e.target.closest('button');if(!btn)return;
   if(btn.dataset.pane){this.navigate(state,btn.dataset.pane);return}
   if(btn.dataset.nav){if(btn.dataset.nav==='all')this.navigate(state,null);else {const index=state.index+(btn.dataset.nav==='back'?-1:1);if(index>=0&&index<state.history.length){state.index=index;this.navigate(state,state.history[index],false)}}return}
   if(btn.dataset.accent){P.theme.setAccent(btn.dataset.accent);this.navigate(state,'general',false);return}
   if(btn.dataset.setting&&btn.dataset.value!==undefined){this.apply(btn.dataset.setting,btn.dataset.value,state);this.navigate(state,state.pane,false);return}
   if(btn.dataset.action==='dismiss-sheet'){btn.closest('.pp-sheet-mask')?.remove();return}
   if(btn.dataset.action==='demo-sheet'){state.root.insertAdjacentHTML('beforeend',U().sheet('PearPortOS','This is a Catalina-style window sheet. All visual values remain provisional until the iMac screenshots arrive.'));return}
   if(btn.dataset.action==='show-siri'){P.siri.open();return}
   if(btn.dataset.action==='show-spotlight'){P.spotlight.open();return}
   if(btn.dataset.action==='show-notifications'){P.notificationCenter.open();return}
   if(btn.dataset.action==='wallpaper-reset'){this.clearWallpaper();this.navigate(state,'desktop',false);return}
   if(btn.dataset.action==='dock-reset'){P.dock.resetDefaults();document.documentElement.style.removeProperty('--dock-icon-size');document.documentElement.style.removeProperty('--dock-max-scale');this.save('dock-size',52);this.save('dock-max-scale',2);this.navigate(state,'dock',false);return}
   if(btn.dataset.action==='step'){let value=Math.max(Number(btn.dataset.min),Math.min(Number(btn.dataset.max),Number(this.read(btn.dataset.setting,5))+Number(btn.dataset.step)));this.save(btn.dataset.setting,value);btn.closest('.pp-stepper').querySelector('output').textContent=value;return}
   if(btn.dataset.action)P.toast(btn.dataset.action==='demo-default'?'Default push button activated':'Control activated');
   if(btn.dataset.help)P.toast(btn.dataset.help);
  }
  change(e,state){const el=e.target;if(el.matches('[data-wallpaper-upload]')){this.importWallpaper(el.files?.[0],state);return}if(!el.dataset.setting)return;const k=el.dataset.setting;if(k==='filter')return;this.apply(k,el.type==='checkbox'?el.checked:el.value,state)}
  input(e,state){const el=e.target;if(el.dataset.setting==='filter'){const query=el.value.trim().toLowerCase();P.$$('.prefs-grid-item',state.root).forEach(item=>{item.hidden=!item.textContent.toLowerCase().includes(query)});P.$$('.prefs-grid-group',state.root).forEach(g=>{g.hidden=!P.$('.prefs-grid-item:not([hidden])',g)});return}
   if(el.type==='range'&&el.dataset.setting){this.apply(el.dataset.setting,el.value,state);const out=P.$(`[data-out="${el.dataset.setting}"]`,state.root);if(out)out.textContent=el.value+(el.dataset.setting==='dock-size'?' px':el.dataset.setting==='dock-max-scale'?'×':'%')}
  }
  apply(key,raw,state){const value=['dock-size','dock-max-scale','mock-volume','key-repeat','track-speed','mouse-speed'].includes(key)?Number(raw):raw;this.save(key,value);
   switch(key){
    case 'appearance':P.theme.setTheme(value);break;
    case 'dynamic':P.theme.setDynamic(value);break;
    case 'wallpaper-choice':P.theme.setWallpaperChoice(value);break;
    case 'dock-magnification':P.dock.setMagnification(value);break;
    case 'dock-autohide':P.dock.setAutoHide(value);break;
    case 'dock-position':P.dock.setPosition(value);break;
    case 'dock-size':document.documentElement.style.setProperty('--dock-icon-size',value+'px');P.dock.fit();break;
    case 'dock-max-scale':document.documentElement.style.setProperty('--dock-max-scale',value);P.dock.resetMagnify();break;
    case 'clock24':P.menu.updateClock();break;
    case 'reduce-motion':document.documentElement.dataset.reduceMotion=value?'on':'off';break;
    case 'reduce-transparency':document.documentElement.dataset.reduceTransparency=value?'on':'off';break;
   }
  }
  importWallpaper(file,state){
   if(!file)return;
   if(!['image/png','image/jpeg','image/webp'].includes(file.type)){P.toast('Choose a PNG, JPEG, or WebP image.');return}
   if(file.size>2*1024*1024){P.toast('Image exceeds 2 MB. Resize it first for browser storage.');return}
   const reader=new FileReader();reader.onerror=()=>P.toast('Could not read the wallpaper picture.');
   reader.onload=()=>{const data=reader.result;if(typeof data!=='string'||!data.startsWith('data:image/'))return;
    this.showWallpaper(data);
    try{localStorage.setItem('pear-custom-wallpaper-v1',data);P.toast('Wallpaper saved in this browser.')}catch{P.toast('Wallpaper applied for this session, but browser storage is full.')}
    if(state?.pane==='desktop')this.navigate(state,'desktop',false);
   };reader.readAsDataURL(file);
  }
  showWallpaper(data){const el=P.$('#wallpaper');if(!el)return;el.style.setProperty('--custom-wallpaper-url',`url("${data}")`);document.documentElement.style.setProperty('--custom-wallpaper-url',`url("${data}")`);document.documentElement.dataset.wallpaperCustom='on';P.events.emit('wallpaper:change',{custom:true});}
  clearWallpaper(){document.documentElement.dataset.wallpaperCustom='off';P.$('#wallpaper')?.style.removeProperty('--custom-wallpaper-url');document.documentElement.style.removeProperty('--custom-wallpaper-url');try{localStorage.removeItem('pear-custom-wallpaper-v1')}catch{}P.events.emit('wallpaper:change',{custom:false});P.toast('Catalina wallpaper restored.')}
  applyStartup(){try{const custom=localStorage.getItem('pear-custom-wallpaper-v1');if(custom?.startsWith('data:image/'))this.showWallpaper(custom)}catch{}
   const size=this.read('dock-size',null);if(size!==null)document.documentElement.style.setProperty('--dock-icon-size',size+'px');const max=this.read('dock-max-scale',null);if(max!==null)document.documentElement.style.setProperty('--dock-max-scale',max);
   document.documentElement.dataset.reduceMotion=this.read('reduce-motion',false)?'on':'off';document.documentElement.dataset.reduceTransparency=this.read('reduce-transparency',false)?'on':'off';P.dock.fit()}
 };
})();

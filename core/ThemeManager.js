(() => {
 const P=window.PearPort;
 const accents={blue:['#0a64ff','#0a84ff'],purple:['#af52de','#bf5af2'],pink:['#ff2d55','#ff375f'],red:['#ff3b30','#ff453a'],orange:['#ff9500','#ff9f0a'],yellow:['#ffcc00','#ffd60a'],green:['#28cd41','#30d158'],graphite:['#8e8e93','#8e8e93']};
 const get=(name,fallback)=>{try{return localStorage.getItem(name)??fallback}catch{return fallback}};
 P.ThemeManager=class ThemeManager {
  constructor(){const selected=get('pear-appearance',get('pear-theme','dark'));
   this.preference=['light','dark','auto'].includes(selected)?selected:'dark';
   this.dynamic=get('pear-dynamic','false')==='true';
   this.wallpaperChoice=['auto','day','dusk','night'].includes(get('pear-wallpaper-choice','auto'))?get('pear-wallpaper-choice','auto'):'auto';
   this.accent=accents[get('pear-accent','blue')]?get('pear-accent','blue'):'blue';
   this.media=window.matchMedia?.('(prefers-color-scheme: dark)');
   this.media?.addEventListener?.('change',()=>{if(this.preference==='auto')this.apply()});
   this.refreshDynamic();this.apply();
  }
  apply(){this.mode=this.preference==='auto'?(this.media?.matches?'dark':'light'):this.preference;
   if(!this.dynamic && this.wallpaperChoice==='auto')this.wallpaperPhase=this.mode==='dark'?'night':'day';
   const hex=accents[this.accent][this.mode==='dark'?1:0];
   const rgb=[1,3,5].map(i=>parseInt(hex.slice(i,i+2),16));
   document.documentElement.dataset.theme=this.mode;
   document.documentElement.dataset.appearance=this.preference;
   document.documentElement.dataset.dynamic=this.dynamic?'on':'off';
   document.documentElement.dataset.wallpaperPhase=this.wallpaperPhase||'day';
   document.documentElement.dataset.wallpaperChoice=this.wallpaperChoice;
   document.documentElement.style.setProperty('--accent',hex);
   document.documentElement.style.setProperty('--accent-rgb',rgb.join(','));
  }
  setTheme(mode){if(!['light','dark','auto'].includes(mode))return;this.preference=mode;try{localStorage.setItem('pear-appearance',mode);if(mode!=='auto')localStorage.setItem('pear-theme',mode)}catch{}this.apply();P.events.emit('theme',{mode:this.mode,preference:mode});}
  setAccent(name){if(!accents[name])return;this.accent=name;try{localStorage.setItem('pear-accent',name)}catch{}this.apply();P.events.emit('theme:accent',{accent:name});}
  setDynamic(on){this.dynamic=!!on;try{localStorage.setItem('pear-dynamic',String(this.dynamic))}catch{}this.refreshDynamic();this.apply();P.events.emit('dynamic',{on:this.dynamic});}
  setWallpaperChoice(name){
    if(!['auto','day','dusk','night'].includes(name))return;
    this.wallpaperChoice=name;
    try{localStorage.setItem('pear-wallpaper-choice',name)}catch{}
    this.refreshDynamic(); P.events.emit('wallpaper:change',{choice:name});
  }
  refreshDynamic(){
    const hour=new Date().getHours();
    const clockPhase=hour>=7&&hour<17?'day':hour>=17&&hour<20?'dusk':'night';
    // Static themes pick Catalina daytime/nighttime appropriately, whereas the
    // Dynamic Desktop option follows the actual local clock (with dusk).
    this.wallpaperPhase=this.wallpaperChoice==='auto' ? (this.dynamic?clockPhase:(this.mode||this.preference)==='dark'?'night':'day') : this.wallpaperChoice;
    this.apply();
  }
  toggle(){this.setTheme(this.mode==='light'?'dark':'light')}
 };
})();

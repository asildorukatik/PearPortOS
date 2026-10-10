(() => {
  const P=window.PearPort=window.PearPort||{};
  P.events=new class EventBus {
    constructor(){this.listeners=new Map();this.history=[]}
    on(name,fn){if(!this.listeners.has(name))this.listeners.set(name,new Set());this.listeners.get(name).add(fn);return()=>this.listeners.get(name)?.delete(fn)}
    emit(name,payload={}){this.history.unshift({name,payload,time:new Date().toLocaleTimeString()});this.history.length=Math.min(this.history.length,60);this.listeners.get(name)?.forEach(fn=>fn(payload))}
  };
  P.css=(name,fallback=0)=>{const v=getComputedStyle(document.documentElement).getPropertyValue(name).trim();return Number.parseFloat(v)||fallback};
  P.$=(sel,from=document)=>from.querySelector(sel);
  P.$$=(sel,from=document)=>Array.from(from.querySelectorAll(sel));
  P.escape=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  P.icon=name=>`assets/icons/${name}.svg`;
  P.toast=(msg)=>{let t=P.$('#toast');t.textContent=msg;t.classList.add('visible');clearTimeout(P.toastTimer);P.toastTimer=setTimeout(()=>t.classList.remove('visible'),2700)};
})();

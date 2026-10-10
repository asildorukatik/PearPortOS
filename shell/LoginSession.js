/* PearPortOS Login preview · no real authentication or Linux account access.
   Passwords here are deliberately PUBLIC demo passcodes, never real credentials. */
(() => {
 'use strict';
 const P=window.PearPort;
 const ACCOUNTS=Object.freeze([
  {id:'pear',name:'Pear User',avatar:'pear.svg',code:'pear',hint:'Demo passcode: pear'},
  {id:'developer',name:'Developer',avatar:'developer.svg',code:'demo',hint:'Demo passcode: demo'},
  {id:'guest',name:'Guest User',avatar:'guest.svg',code:null,hint:'No passcode required'}
 ]);
 const POWER_ICONS={
  sleep:'<path d="M20.1 15.2A8.3 8.3 0 0 1 8.8 3.9 8.4 8.4 0 1 0 20.1 15.2Z"/>',
  restart:'<path d="M20 11a8 8 0 1 0-2.4 5.7M20 4v7h-7"/>',
  shutdown:'<path d="M12 2v10M5.5 5.5a9 9 0 1 0 13 0"/>'
 };
 const powerIcon=k=>`<svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round">${POWER_ICONS[k]}</svg>`;
 const accountAvatar=(a)=>`<img src="assets/avatars/${a.avatar}" alt="" draggable="false">`;
 class LoginSession {
  constructor(){
   this.el=document.createElement('div');this.el.id='pear-session';this.el.className='phase5-overlay pear-login';
   this.el.setAttribute('role','dialog');this.el.setAttribute('aria-modal','true');
   this.el.setAttribute('aria-label','PearPortOS login');
   P.$('#screen').append(this.el);
   this.current=null;this.selected=null;this.mode='chooser';this.visible=false;this.invalidTimer=null;
   this.clockTimer=setInterval(()=>this.updateClock(),10000);
   document.addEventListener('keydown',e=>{
    if(!this.visible)return;
    if(this.mode==='sleep'&&!e.metaKey&&!e.altKey&&!e.ctrlKey){e.preventDefault();e.stopImmediatePropagation();this.wake()}
   },true);
  }
  start(){this.mode='chooser';this.show();}
  show(){this.visible=true;this.el.classList.add('shown');P.$('#screen').classList.add('session-locked');this.render()}
  hide(){this.visible=false;this.el.classList.add('login-dismiss');setTimeout(()=>{if(!this.visible){this.el.classList.remove('shown','login-dismiss');P.$('#screen').classList.remove('session-locked')}},380)}
  lock(mode='locked'){
   P.shell5?.closeOverlays('lock');
   if(mode==='shutdown'||mode==='sleep')this.mode=mode;
   else this.mode=this.current&&this.current.code!==null?'password':'chooser';
   this.selected=this.mode==='password'?this.current:null;
   this.show();
  }
  logout(){this.current=null;this.selected=null;this.mode='chooser';this.show()}
  back(){if(this.mode==='password'){this.mode='chooser';this.selected=null;this.render();return}if(this.mode==='sleep')this.wake()}
  select(id){
   const account=ACCOUNTS.find(a=>a.id===id);if(!account)return;
   this.selected=account;clearTimeout(this.invalidTimer);
   if(account.code===null){this.mode='password';this.render();setTimeout(()=>this.unlock(),420);return}
   this.mode='password';this.render();
   const input=this.el.querySelector('.login-password');
   input?.focus({preventScroll:true});
  }
  verify(input){
   if(!this.selected||!this.selected.code||this.mode!=='password')return;
   clearTimeout(this.invalidTimer);const entered=input.value;
   if(entered===this.selected.code){input.disabled=true;this.el.classList.add('login-success');setTimeout(()=>this.unlock(),150);return}
   if(entered.length>=this.selected.code.length){
    this.invalidTimer=setTimeout(()=>{
     if(this.mode!=='password'||input.value===this.selected?.code)return;
     this.el.classList.remove('login-invalid');void this.el.offsetWidth;this.el.classList.add('login-invalid');
     const note=this.el.querySelector('.login-feedback');if(note)note.textContent='Incorrect demo passcode. Try again.';
     setTimeout(()=>{if(this.mode==='password'){input.value='';input.focus();this.el.classList.remove('login-invalid')}},520);
    },800);
   }else {const note=this.el.querySelector('.login-feedback');if(note)note.textContent=this.selected.hint}
  }
  unlock(){
   if(!this.selected)return;this.current=this.selected;this.el.classList.remove('login-success','login-invalid');
   try{localStorage.setItem('pear-demo-last-user',this.current.id)}catch{}
   this.hide();
   P.events.emit('session:login',{user:this.current.name,guest:this.current.id==='guest'});
   if(P.notificationCenter?.notify)P.notificationCenter.notify('Welcome to PearPortOS',`${this.current.name} · Web desktop preview`);
  }
  wake(){this.mode=this.current&&this.current.code!==null?'password':'chooser';this.selected=this.mode==='password'?this.current:null;this.show()}
  power(action){
   clearTimeout(this.invalidTimer);
   if(action==='sleep'){this.mode='sleep';this.show()}
   else if(action==='shutdown'){this.mode='shutdown';this.show()}
   else if(action==='restart'){this.current=null;this.selected=null;this.mode='chooser';this.show()}
  }
  updateClock(){const el=this.el.querySelector('.login-clock');if(!el)return;
   const d=new Date();el.textContent=new Intl.DateTimeFormat('en-US',{hour:'numeric',minute:'2-digit'}).format(d);
   const date=this.el.querySelector('.login-date');if(date)date.textContent=new Intl.DateTimeFormat('en-US',{weekday:'long',month:'long',day:'numeric'}).format(d)
  }
  render(){
   const m=this.mode;const chosen=this.selected;
   this.el.dataset.scene=m;this.el.classList.remove('login-success','login-invalid','login-dismiss');
   const chooser=m==='chooser';const password=m==='password';
   let center='';
   if(chooser){center=`<div class="login-users" aria-label="Select a user">${ACCOUNTS.map((a,i)=>`<button type="button" class="login-user" data-user="${a.id}" style="--user-order:${i}" aria-label="Choose ${P.escape(a.name)}"><span class="login-user-avatar">${accountAvatar(a)}</span><span class="login-user-name">${P.escape(a.name)}</span></button>`).join('')}</div><div class="login-instruction">Select a user to continue</div>`}
   else if(password&&chosen){center=`<div class="login-auth"><button class="login-back" data-back title="Choose another user" aria-label="Back to accounts">‹ <span>All Users</span></button><div class="login-active-avatar">${accountAvatar(chosen)}</div><h1>${P.escape(chosen.name)}</h1>${chosen.code===null?'<p class="login-guest-message">Opening guest desktop…</p>':`<div class="login-password-wrap"><input class="login-password" type="password" aria-label="Demo passcode" placeholder="Enter Password" autocapitalize="off" autocomplete="off" spellcheck="false" maxlength="64"><span class="login-field-arrow" aria-hidden="true">➜</span></div><p class="login-feedback" aria-live="polite">${P.escape(chosen.hint)}</p>`}</div>`}
   else if(m==='sleep'){center=`<div class="login-power-state"><div class="login-power-symbol">${powerIcon('sleep')}</div><h1>Sleeping</h1><button data-wake>Click or press a key to wake</button></div>`}
   else if(m==='shutdown'){center=`<div class="login-power-state"><div class="login-power-symbol">${powerIcon('shutdown')}</div><h1>PearPortOS is shut down</h1><p>The web preview is paused.</p><button data-power="restart">Start PearPortOS</button></div>`}
   this.el.innerHTML=`<div class="login-backdrop" aria-hidden="true"></div><div class="login-tint" aria-hidden="true"></div><div class="login-top"><span class="login-date"></span><span class="login-clock"></span></div><main class="login-center">${center}</main><div class="login-power-actions">${['sleep','restart','shutdown'].map(p=>`<button type="button" class="login-power" data-power="${p}"><span>${powerIcon(p)}</span><small>${p==='shutdown'?'Shut Down':p==='restart'?'Restart':'Sleep'}</small></button>`).join('')}</div><div class="login-disclaimer">Visual login preview only · Never enter your real password</div>`;
   this.updateClock();
   this.el.querySelectorAll('[data-user]').forEach(b=>b.onclick=()=>this.select(b.dataset.user));
   this.el.querySelector('[data-back]')?.addEventListener('click',()=>this.back());
   this.el.querySelector('.login-password')?.addEventListener('input',e=>this.verify(e.target));
   this.el.querySelector('.login-password')?.addEventListener('keydown',e=>{if(e.key==='Enter'){e.preventDefault();e.stopPropagation()}if(e.key==='Escape'){e.preventDefault();this.back()}});
   this.el.querySelectorAll('[data-power]').forEach(b=>b.onclick=()=>this.power(b.dataset.power));
   this.el.querySelector('[data-wake]')?.addEventListener('click',()=>this.wake());
  }
 }
 P.LoginSession=LoginSession;
 P.demoAccounts=ACCOUNTS.map(a=>({id:a.id,name:a.name,guest:a.code===null}));
})();

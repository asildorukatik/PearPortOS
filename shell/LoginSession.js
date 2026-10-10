/* PearPortOS Catalina-inspired first-run setup and local session UI.
   This is a browser-local convenience gate, NOT operating-system authentication.
   Existing desktop data belongs to the browser origin, not to individual users. */
(() => {
 'use strict';
 const P = window.PearPort;
 const ACCOUNT_KEY = 'pearport-user-v1';
 const USER_AVATAR = 'assets/wallpapers/Catalina-Dusk.jpg';
 const MIN_PASSWORD = 5;
 const PEAR_BADGE = 'assets/wallpapers/Catalina-Dusk.jpg';
 const POWER_ICONS = {
  sleep: '<path d="M20.1 15.2A8.3 8.3 0 0 1 8.8 3.9 8.4 8.4 0 1 0 20.1 15.2Z"/>',
  restart: '<path d="M20 11a8 8 0 1 0-2.4 5.7M20 4v7h-7"/>',
  shutdown: '<path d="M12 2v10M5.5 5.5a9 9 0 1 0 13 0"/>'
 };
 const powerIcon = kind => `<svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round">${POWER_ICONS[kind]}</svg>`;
 const avatar = () => `<img src="${USER_AVATAR}" alt="" draggable="false">`;
 const bytesToBase64 = bytes => btoa(String.fromCharCode(...bytes));
 const base64ToBytes = str => Uint8Array.from(atob(str), ch => ch.charCodeAt(0));
 async function passwordVerifier(password, salt) {
  if (!globalThis.crypto?.subtle) throw new Error('Password setup requires HTTPS or a secure local browser context.');
  const key = await crypto.subtle.importKey('raw', new TextEncoder().encode(password), 'PBKDF2', false, ['deriveBits']);
  const bits = await crypto.subtle.deriveBits({name:'PBKDF2',salt:base64ToBytes(salt),iterations:160000,hash:'SHA-256'},key,256);
  return bytesToBase64(new Uint8Array(bits));
 }
 function readAccount() {
  try {
   const value = JSON.parse(localStorage.getItem(ACCOUNT_KEY) || 'null');
   return value && value.version === 1 && typeof value.name === 'string' &&
    typeof value.salt === 'string' && typeof value.verifier === 'string' ? value : null;
  } catch { return null; }
 }
 class LoginSession {
  constructor() {
   this.el = document.createElement('div');
   this.el.id='pear-session';
   this.el.className='phase5-overlay pear-login';
   this.el.setAttribute('role','dialog');
   this.el.setAttribute('aria-modal','true');
   this.el.setAttribute('aria-label','PearPortOS setup and sign-in');
   P.$('#screen').append(this.el);
   this.account = readAccount();
   this.current=null;
   this.selected=null;
   this.mode='setup-welcome';
   this.visible=false;
   this.draftName='';
   this.draftPassword='';
   this.verifyVersion=0;
   this.verifyTimer=null;
   this.busy=false;
   this.clockTimer=setInterval(()=>this.updateClock(),10000);
   document.addEventListener('keydown',event=>{
    if(!this.visible)return;
    if(this.mode==='sleep' && !event.metaKey && !event.altKey && !event.ctrlKey){
     event.preventDefault(); event.stopImmediatePropagation();this.wake();
    }
   },true);
  }
  start(){this.account=readAccount();this.mode=this.account?'chooser':'setup-welcome';this.show();}
  show(){this.visible=true;this.el.classList.remove('login-dismiss');this.el.classList.add('shown');P.$('#screen').classList.add('session-locked');this.render();}
  hide(){this.visible=false;this.el.classList.add('login-dismiss');setTimeout(()=>{if(!this.visible){this.el.classList.remove('shown','login-dismiss');P.$('#screen').classList.remove('session-locked');}},380);}
  lock(mode='locked'){
   P.shell5?.closeOverlays('lock');
   this.invalidateVerify();
   if(mode==='sleep'||mode==='shutdown'){this.mode=mode;}
   else this.mode=this.account?'password':'setup-welcome';
   this.selected=this.account;
   this.show();
  }
  logout(){this.invalidateVerify();this.current=null;this.selected=null;this.mode=this.account?'chooser':'setup-welcome';this.show();}
  back(){this.invalidateVerify();if(this.mode==='password'){this.mode='chooser';this.selected=null;this.render();}else if(this.mode==='sleep')this.wake();}
  select(){if(!this.account)return;this.selected=this.account;this.mode='password';this.render();this.el.querySelector('.login-password')?.focus({preventScroll:true});}
  invalidateVerify(){this.verifyVersion++;clearTimeout(this.verifyTimer);this.verifyTimer=null;}
  async verify(input){
   if(this.busy||this.mode!=='password'||!this.account)return;
   this.invalidateVerify();
   const text=input.value;
   if(text.length<MIN_PASSWORD)return;
   const version=this.verifyVersion;
   this.verifyTimer=setTimeout(async()=>{
    try {
     const value=await passwordVerifier(text,this.account.salt);
     if(version!==this.verifyVersion||this.mode!=='password'||input.value!==text)return;
     if(value===this.account.verifier){input.disabled=true;this.unlock();return;}
     // Do not reject partial passwords while the user is still typing.
     setTimeout(()=>{
      if(version!==this.verifyVersion||this.mode!=='password'||input.value!==text)return;
      const error=this.el.querySelector('.login-feedback');
      if(error)error.textContent='Incorrect password';
      this.el.classList.remove('login-invalid');void this.el.offsetWidth;this.el.classList.add('login-invalid');
      setTimeout(()=>{if(version===this.verifyVersion&&this.mode==='password'){input.value='';input.focus();this.el.classList.remove('login-invalid');}},450);
     },1100);
    }catch(error){const el=this.el.querySelector('.login-feedback');if(el)el.textContent=error.message||'Cannot check password';}
   },150);
  }
  unlock(){
   if(!this.account)return;
   this.invalidateVerify();
   this.current={id:'primary',name:this.account.name};
   this.selected=this.account;
   this.el.classList.remove('login-invalid');this.el.classList.add('login-success');
   setTimeout(()=>this.hide(),175);
   P.events.emit('session:login',{user:this.current.name,guest:false});
   // Deliberately no toast or Notification Center "login successful" banner.
  }
  wake(){this.mode=this.account?'password':'setup-welcome';this.selected=this.account;this.show();}
  power(action){
   this.invalidateVerify();
   if(action==='sleep'||action==='shutdown'){this.mode=action;this.show();}
   else if(action==='restart'){this.current=null;this.selected=null;this.mode=this.account?'chooser':'setup-welcome';this.show();}
  }
  updateClock(){
   const clock=this.el.querySelector('.login-clock');if(!clock)return;
   const d=new Date();clock.textContent=new Intl.DateTimeFormat('en-US',{hour:'numeric',minute:'2-digit'}).format(d);
   const date=this.el.querySelector('.login-date');if(date)date.textContent=new Intl.DateTimeFormat('en-US',{weekday:'long',month:'long',day:'numeric'}).format(d);
  }
  setupAdvance(){
   if(this.busy)return;
   if(this.mode==='setup-welcome'){this.mode='setup-name';this.render();this.el.querySelector('.setup-entry')?.focus();}
   else if(this.mode==='setup-name'){
    const name=this.el.querySelector('.setup-entry')?.value.trim()||'';
    if(!name)return;
    this.draftName=name;this.mode='setup-password';this.render();this.el.querySelector('.setup-entry')?.focus();
   }else if(this.mode==='setup-password'){
    const password=this.el.querySelector('.setup-entry')?.value||'';
    if(password.length<MIN_PASSWORD)return;
    this.draftPassword=password;this.saveSetup();
   }else if(this.mode==='setup-done'){this.draftPassword='';this.unlock();}
  }
  async saveSetup(){
   if(this.busy||!this.draftName||this.draftPassword.length<MIN_PASSWORD)return;
   this.busy=true;
   const feedback=this.el.querySelector('.setup-error');if(feedback)feedback.textContent='Setting up your account…';
   try{
    if(!globalThis.crypto?.getRandomValues)throw new Error('A secure browser connection is required.');
    const salt=bytesToBase64(crypto.getRandomValues(new Uint8Array(16)));
    const verifier=await passwordVerifier(this.draftPassword,salt);
    const account={version:1,name:this.draftName,salt,verifier};
    localStorage.setItem(ACCOUNT_KEY,JSON.stringify(account));
    if(localStorage.getItem(ACCOUNT_KEY)!==JSON.stringify(account))throw new Error('Unable to save this account.');
    this.account=account;this.selected=account;this.draftPassword='';this.mode='setup-done';this.render();
   }catch(error){if(feedback)feedback.textContent=error.message||'Unable to save your account';}
   finally{this.busy=false;}
  }
  setupCard(){
   const m=this.mode, name=m==='setup-name', password=m==='setup-password';
   const intro=m==='setup-welcome'||m==='setup-done';
   const logo=`<div class="setup-logo" aria-hidden="true"><img src="${PEAR_BADGE}" alt=""></div><h1 class="setup-brand"><strong>PearPortOS</strong> Catalina</h1>`;
   const brand=`<div class="setup-small-brand"><strong>PearPortOS</strong> Catalina</div>`;
   let middle='';
   if(intro){middle=logo;}
   else if(name){middle=`${brand}<div class="setup-form"><h2>What should we call you?</h2><input class="setup-entry" aria-label="Your name" placeholder="Your Name Here" maxlength="40" spellcheck="false" autocomplete="off" value="${P.escape(this.draftName)}"/></div>`;}
   else if(password){middle=`${brand}<div class="setup-form"><h2>Would you like to set a password?</h2><input class="setup-entry" type="password" aria-label="Choose a password" placeholder="Secrets Secrets Secrets" minlength="${MIN_PASSWORD}" maxlength="128" autocomplete="new-password"/><div class="setup-hint">At least five characters</div></div>`;}
   const foot=m==='setup-done'?'All set! Press anywhere to begin your journey.':'Press anywhere to continue';
   const enabled=intro||(name&&this.draftName.trim().length>0)||(password&&this.draftPassword.length>=MIN_PASSWORD);
   return `<div class="setup-screen"><div class="setup-card" tabindex="0" aria-label="First-time setup">${middle}<div class="setup-footer ${enabled?'':'setup-footer-hidden'}">${foot}</div><div class="setup-error" role="status"></div></div></div>`;
  }
  render(){
   const m=this.mode;
   this.el.dataset.scene=m;
   this.el.classList.remove('login-success','login-invalid','login-dismiss');
   if(m.startsWith('setup-')){
    this.el.innerHTML=this.setupCard();
    this.el.querySelector('.setup-screen')?.addEventListener('click',event=>{if(event.target.closest('input'))return;this.setupAdvance();});
    this.el.querySelector('.setup-card')?.addEventListener('keydown',event=>{if(event.key==='Enter'){event.preventDefault();this.setupAdvance();}});
    const entry=this.el.querySelector('.setup-entry');
    entry?.addEventListener('input',()=>{if(m==='setup-name')this.draftName=entry.value;else this.draftPassword=entry.value;const foot=this.el.querySelector('.setup-footer');const okay=m==='setup-name'?!!entry.value.trim():entry.value.length>=MIN_PASSWORD;foot?.classList.toggle('setup-footer-hidden',!okay);});
    return;
   }
   const chooser=m==='chooser',password=m==='password';
   let center='';
   if(chooser){center=`<div class="login-users" aria-label="Select a user"><button type="button" class="login-user" data-user="primary"><span class="login-user-avatar">${avatar()}</span><span class="login-user-name">${P.escape(this.account?.name||'User')}</span></button></div>`;}
   else if(password){center=`<div class="login-auth"><button class="login-back" data-back title="Back to accounts" aria-label="Back to accounts">‹ <span>All Users</span></button><div class="login-active-avatar">${avatar()}</div><h1>${P.escape(this.account?.name||'User')}</h1><div class="login-password-wrap"><input class="login-password" type="password" aria-label="Password" placeholder="Enter Password" autocapitalize="off" autocomplete="off" spellcheck="false" maxlength="128"><span class="login-field-arrow" aria-hidden="true">➜</span></div><p class="login-feedback" aria-live="polite"></p></div>`;}
   else if(m==='sleep'){center=`<div class="login-power-state"><div class="login-power-symbol">${powerIcon('sleep')}</div><h1>Sleeping</h1><button data-wake>Click or press a key to wake</button></div>`;}
   else if(m==='shutdown'){center=`<div class="login-power-state"><div class="login-power-symbol">${powerIcon('shutdown')}</div><h1>PearPortOS is shut down</h1><p>The web preview is paused.</p><button data-power="restart">Start PearPortOS</button></div>`;}
   this.el.innerHTML=`<div class="login-backdrop" aria-hidden="true"></div><div class="login-tint" aria-hidden="true"></div><div class="login-top"><span class="login-date"></span><span class="login-clock"></span></div><main class="login-center">${center}</main><div class="login-power-actions">${['sleep','restart','shutdown'].map(p=>`<button type="button" class="login-power" data-power="${p}"><span>${powerIcon(p)}</span><small>${p==='shutdown'?'Shut Down':p==='restart'?'Restart':'Sleep'}</small></button>`).join('')}</div><div class="login-disclaimer">Web-only account · Not a device security lock</div>`;
   this.updateClock();
   this.el.querySelector('[data-user]')?.addEventListener('click',()=>this.select());
   this.el.querySelector('[data-back]')?.addEventListener('click',()=>this.back());
   const input=this.el.querySelector('.login-password');
   input?.addEventListener('input',()=>this.verify(input));
   input?.addEventListener('keydown',event=>{if(event.key==='Enter'){event.preventDefault();event.stopPropagation();}else if(event.key==='Escape'){event.preventDefault();this.back();}});
   this.el.querySelectorAll('[data-power]').forEach(b=>b.addEventListener('click',()=>this.power(b.dataset.power)));
   this.el.querySelector('[data-wake]')?.addEventListener('click',()=>this.wake());
  }
 }
 P.LoginSession=LoginSession;
})();

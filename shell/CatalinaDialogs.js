/* Catalina-style dialogs. Browser-local only; no OS privileges are granted. */
(()=>{'use strict';
const P=window.PearPort, E=x=>P.escape(String(x??''));
const warning='<svg viewBox="0 0 80 80" aria-hidden="true"><path d="M40 7L76 69H4Z" fill="#f3bb30" stroke="#d2961b" stroke-width="3"/><path d="M40 24v24" stroke="#fff" stroke-width="7" stroke-linecap="round"/><circle cx="40" cy="59" r="4" fill="#fff"/></svg>';
const lock='<svg viewBox="0 0 84 100" aria-hidden="true"><path d="M20 48V29a22 22 0 0144 0v19" stroke="#cbd2dc" stroke-width="10" fill="none"/><rect x="7" y="43" width="70" height="51" rx="5" fill="#d89820" stroke="#905813"/><circle cx="42" cy="65" r="6" fill="#775016"/><path d="M40 69h5l3 12H37z" fill="#775016"/></svg>';
class CatalinaDialogs {
 constructor(){this.root=document.createElement('div');this.root.id='pear-dialog-layer';this.root.className='pear-dialog-layer';this.root.hidden=true;document.body.append(this.root);this.finish=null;this.keyHandler=null;}
 close(accepted=false){if(!this.finish)return;const callback=this.finish;this.finish=null;this.root.hidden=true;this.root.replaceChildren();document.removeEventListener('keydown',this.keyHandler,true);this.keyHandler=null;callback(accepted)}
 show({title='PearPortOS',message='',symbol='warning',ok='OK',cancel='Cancel',confirm=false,auth=false}={}){
  if(this.finish)this.close(false);
  this.root.hidden=false;
  const art=symbol==='warning'?warning:lock;
  const ask=auth?'<label class="pear-auth-label">Password: <input class="pear-auth-password" type="password" autocomplete="off" spellcheck="false" aria-label="Account password" maxlength="128"></label><p class="pear-dialog-error" aria-live="polite"></p><p class="pear-dialog-localnote">Browser-local preview only; no operating-system permissions are granted.</p>':'';
  const cancelHtml=(confirm||auth)?'<button type="button" class="pear-dialog-cancel">'+E(cancel)+'</button>':'';
  this.root.innerHTML='<div class="pear-dialog-shade"></div><section class="pear-native-dialog" role="alertdialog" aria-modal="true" aria-labelledby="pear-dialog-title" aria-describedby="pear-dialog-message"><div class="pear-dialog-main"><div class="pear-dialog-art">'+art+'</div><div class="pear-dialog-copy"><h2 id="pear-dialog-title">'+E(title)+'</h2><p id="pear-dialog-message">'+E(message)+'</p>'+ask+'</div></div><div class="pear-dialog-actions">'+cancelHtml+'<button class="pear-dialog-ok" type="button">'+E(ok)+'</button></div></section>';
  return new Promise(resolve=>{
   this.finish=resolve;
   const okBtn=this.root.querySelector('.pear-dialog-ok');
   this.root.querySelector('.pear-dialog-cancel')?.addEventListener('click',()=>this.close(false));
   okBtn.addEventListener('click',async()=>{
    if(!auth){this.close(true);return}
    const field=this.root.querySelector('.pear-auth-password'),error=this.root.querySelector('.pear-dialog-error');
    if(!field.value){error.textContent='Enter your PearPortOS password.';field.focus();return}
    okBtn.disabled=true;
    try{const valid=await P.session?.checkPassword(field.value);if(!this.finish)return;if(valid)this.close(true);else{error.textContent='Incorrect password';field.select()}}
    catch{if(this.finish)error.textContent='Unable to verify the browser-local password.'}
    finally{if(this.finish)okBtn.disabled=false}
   });
   this.keyHandler=e=>{if(e.key==='Escape'){e.preventDefault();e.stopImmediatePropagation();this.close(false)}else if(e.key==='Enter'&&e.target.closest('.pear-native-dialog')){e.preventDefault();e.stopImmediatePropagation();okBtn.click()}};
   document.addEventListener('keydown',this.keyHandler,true);
   (auth?this.root.querySelector('.pear-auth-password'):okBtn)?.focus({preventScroll:true});
  });
 }
 alert({title='PearPortOS',message='',symbol='warning'}={}){return this.show({title,message,symbol})}
 confirm({title='Are you sure?',message='',ok='OK',cancel='Cancel',symbol='warning'}={}){return this.show({title,message,ok,cancel,symbol,confirm:true})}
 authorize({app='System Preferences',reason='No system settings will be changed.'}={}){
  if(!P.session?.account)return this.alert({title:'No PearPortOS account',message:'Complete first-run setup before testing authentication.'}).then(()=>false);
  return this.show({title:app+' is trying to authenticate user.',message:'Enter the password for “'+P.session.account.name+'” to allow this preview. '+reason,symbol:'lock',auth:true})
 }
}
P.CatalinaDialogs=CatalinaDialogs;
})();
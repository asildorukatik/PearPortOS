/* Catalina-era controls. All appearance constants are core/tokens.css. */
(() => {
 const P=window.PearPort,E=P.escape;
 const attr=(name,value)=>value===undefined||value===null?'':` ${name}="${E(value)}"`;
 const id=(name)=>`pp-${name.replace(/[^a-z0-9_-]/gi,'-')}`;
 P.UI={
  button(label,{action='',primary=false,disabled=false,tooltip=''}={}){return `<button type="button" class="pp-button${primary?' primary':''}"${attr('data-action',action)}${attr('title',tooltip)}${disabled?' disabled':''}>${E(label)}</button>`},
  checkbox(name,label,checked=false,{disabled=false}={}){return `<label class="pp-choice"><input class="pp-checkbox" type="checkbox" data-setting="${E(name)}"${checked?' checked':''}${disabled?' disabled':''}><span>${E(label)}</span></label>`},
  radio(name,options,chosen){return `<div class="pp-radio-group" role="radiogroup" aria-label="${E(name)}">${options.map(([value,label])=>`<label class="pp-choice"><input type="radio" class="pp-radio" name="${E(name)}" data-setting="${E(name)}" value="${E(value)}"${chosen===value?' checked':''}><span>${E(label)}</span></label>`).join('')}</div>`},
  segment(name,options,chosen){return `<div class="pp-segment" role="group" aria-label="${E(name)}">${options.map(([value,label])=>`<button type="button" class="pp-segment-item${value===chosen?' selected':''}" data-setting="${E(name)}" data-value="${E(value)}" aria-pressed="${value===chosen}">${E(label)}</button>`).join('')}</div>`},
  popup(name,options,chosen){return `<select class="pp-select" data-setting="${E(name)}" aria-label="${E(name)}">${options.map(([value,label])=>`<option value="${E(value)}"${chosen===value?' selected':''}>${E(label)}</option>`).join('')}</select>`},
  slider(name,value,{min=0,max=100,step=1}={}){return `<input type="range" class="pp-slider" data-setting="${E(name)}" min="${min}" max="${max}" step="${step}" value="${value}" aria-label="${E(name)}">`},
  text(name,value='',placeholder=''){return `<input class="pp-field" data-setting="${E(name)}" value="${E(value)}" placeholder="${E(placeholder)}" aria-label="${E(name)}">`},
  search(name,placeholder='Search'){return `<div class="pp-search"><svg viewBox="0 0 20 20" width="13" height="13" fill="none" stroke="currentColor" stroke-width="2"><circle cx="8" cy="8" r="5.3"/><path d="m12 12 5 5"/></svg><input type="search" data-setting="${E(name)}" placeholder="${E(placeholder)}" aria-label="${E(name)}" /></div>`},
  stepper(name,value,{min=0,max=100}={}){return `<span class="pp-stepper"><output>${E(value)}</output><span><button type="button" aria-label="Increase" data-action="step" data-setting="${E(name)}" data-step="1" data-max="${max}" data-min="${min}">▲</button><button type="button" aria-label="Decrease" data-action="step" data-setting="${E(name)}" data-step="-1" data-max="${max}" data-min="${min}">▼</button></span></span>`},
  fieldrow(label,html,desc=''){return `<div class="pp-fieldrow"><span class="pp-row-label">${E(label)}</span><div class="pp-row-field">${html}${desc?`<div class="pp-row-description">${E(desc)}</div>`:''}</div></div>`},
  progress(value){return `<progress class="pp-progress" max="100" value="${Number(value)||0}" aria-label="Progress"></progress>`},
  spinner(){return '<span class="pp-spinner" role="status" aria-label="Working"></span>'},
  table(headers,rows){return `<div class="pp-table-wrap"><table class="pp-table"><thead><tr>${headers.map(x=>`<th>${E(x)}</th>`).join('')}</tr></thead><tbody>${rows.map(r=>`<tr>${r.map(c=>`<td>${E(c)}</td>`).join('')}</tr>`).join('')}</tbody></table></div>`},
  disclosure(label,inner){return `<details class="pp-disclosure"><summary>${E(label)}</summary><div>${inner}</div></details>`},
  tabs(name,options,chosen){return `<div class="pp-tabs" role="tablist" aria-label="${E(name)}">${options.map(([v,l])=>`<button role="tab" type="button" class="${v===chosen?'selected':''}" aria-selected="${v===chosen}" data-setting="${E(name)}" data-value="${E(v)}">${E(l)}</button>`).join('')}</div>`},
  help(message){return `<button class="pp-help" type="button" data-help="${E(message)}" title="${E(message)}" aria-label="Help: ${E(message)}">?</button>`},
  sheet(title,body){return `<div class="pp-sheet-mask" role="presentation"><div class="pp-sheet" role="dialog" aria-modal="true" aria-label="${E(title)}"><strong>${E(title)}</strong><div>${body}</div><div class="pp-sheet-actions">${P.UI.button('OK',{action:'dismiss-sheet',primary:true})}</div></div></div>`}
 };
})();

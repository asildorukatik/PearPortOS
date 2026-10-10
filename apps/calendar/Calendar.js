/* PearPortOS Calendar: independent vanilla-JS calendar inspired by the
   MIT-licensed ThanasOS CalendarApp month/week/day navigation. */
(() => {
 const P=window.PearPort;
 const E=s=>P.escape(String(s));
 const pad=n=>String(n).padStart(2,'0');
 const key=d=>`${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())}`;
 const startOfWeek=d=>{const x=new Date(d.getFullYear(),d.getMonth(),d.getDate());x.setDate(x.getDate()-(x.getDay()+6)%7);return x};
 const week=['Mon','Tue','Wed','Thu','Fri','Sat','Sun'];
 class CalendarApp {
  constructor(){this.instances=new Map();this.events=this.read();}
  read(){try{const a=JSON.parse(localStorage.getItem('pearport-calendar-v1')||'[]');return Array.isArray(a)?a.filter(e=>e&&/^\d{4}-\d\d-\d\d$/.test(e.date)&&typeof e.title==='string'):[]}catch{return []}}
  save(){try{localStorage.setItem('pearport-calendar-v1',JSON.stringify(this.events))}catch{}P.events.emit('calendar:change');}
  getEvents(){return this.events}
  mount(el,id){const root=el.querySelector('.pear-calendar-root');const s={root,view:'month',focus:new Date(),selected:key(new Date())};this.instances.set(id,s);root.addEventListener('click',e=>this.click(e,s));root.addEventListener('submit',e=>this.submit(e,s));this.render(s)}
  unmount(id){this.instances.delete(id)}
  navigate(s,delta){const d=new Date(s.focus);if(s.view==='month')d.setMonth(d.getMonth()+delta);else d.setDate(d.getDate()+delta*(s.view==='week'?7:1));s.focus=d;this.render(s)}
  eventsFor(date){return this.events.filter(e=>e.date===date).sort((a,b)=>(a.time||'').localeCompare(b.time||''))}
  renderMonth(s){const d=s.focus,y=d.getFullYear(),m=d.getMonth(),first=startOfWeek(new Date(y,m,1)),now=key(new Date());return `<div class="pc-cal-grid">${week.map(w=>`<div class="pc-weekday">${w}</div>`).join('')}${Array.from({length:42},(_,i)=>{const x=new Date(first);x.setDate(first.getDate()+i);const date=key(x),events=this.eventsFor(date),other=x.getMonth()!==m;return `<button class="pc-month-day ${other?'pc-other-month':''} ${date===now?'pc-today':''} ${date===s.selected?'pc-selected':''}" data-pc-day="${date}"><span class="pc-day-num">${x.getDate()}</span>${events.slice(0,3).map(e=>`<span class="pc-event" style="--pc-color:${e.color||'#0a84ff'}">${E(e.time||'')} ${E(e.title)}</span>`).join('')}${events.length>3?`<small>+${events.length-3} more</small>`:''}</button>`}).join('')}</div>`}
  renderWeek(s){const first=startOfWeek(s.focus);return `<div class="pc-week-columns">${Array.from({length:7},(_,i)=>{const d=new Date(first);d.setDate(d.getDate()+i);const k=key(d);return `<section class="pc-week-col"><button data-pc-day="${k}" class="pc-week-label ${k===s.selected?'pc-selected':''}">${week[i]}<b>${d.getDate()}</b></button>${this.eventsFor(k).map(e=>`<button class="pc-week-event" data-pc-event="${e.id}" style="--pc-color:${e.color||'#0a84ff'}">${E(e.time||'All day')} ${E(e.title)}</button>`).join('')}</section>`}).join('')}</div>`}
  renderDay(s){const d=new Date(s.selected+'T12:00:00');return `<div class="pc-day-detail"><h2>${d.toLocaleDateString('en-US',{weekday:'long',month:'long',day:'numeric'})}</h2>${this.eventsFor(s.selected).map(e=>`<button class="pc-day-event" data-pc-event="${e.id}"><span style="background:${e.color||'#0a84ff'}"></span><strong>${E(e.title)}</strong><small>${E(e.time||'All day')}</small></button>`).join('')||'<p>No events for this day. Add an event using the form.</p>'}</div>`}
  render(s){const d=s.focus,subtitle=d.toLocaleDateString('en-US',{month:'long',year:'numeric'});const events=this.eventsFor(s.selected);
   const month=new Date(s.focus.getFullYear(),s.focus.getMonth(),1);const days=new Date(month.getFullYear(),month.getMonth()+1,0).getDate();const first=(month.getDay()+6)%7;
   s.root.innerHTML=`<div class="pc-app"><header class="pc-toolbar"><div class="pc-nav"><button data-pc="today">Today</button><button data-pc="prev" aria-label="Previous">‹</button><button data-pc="next" aria-label="Next">›</button></div><strong>${E(subtitle)}</strong><div class="pc-view">${['day','week','month'].map(v=>`<button data-pc-view="${v}" class="${s.view===v?'selected':''}">${v[0].toUpperCase()+v.slice(1)}</button>`).join('')}</div></header><div class="pc-body"><aside class="pc-sidebar"><h3>${E(subtitle)}</h3><div class="pc-mini">${week.map(n=>`<small>${n[0]}</small>`).join('')}${Array.from({length:first+days},(_,i)=>{const n=i-first+1;return n>0?`<button data-pc-mini="${key(new Date(month.getFullYear(),month.getMonth(),n))}" class="${s.selected===key(new Date(month.getFullYear(),month.getMonth(),n))?'current':''}">${n}</button>`:'<span></span>'}).join('')}</div><h3>Events · ${E(s.selected)}</h3><div class="pc-sidebar-events">${events.map(e=>`<button data-pc-event="${e.id}"><i style="background:${e.color||'#0a84ff'}"></i><b>${E(e.title)}</b><small>${E(e.time||'All day')}</small></button>`).join('')||'<p>No events</p>'}</div><form class="pc-add"><h3>New Event</h3><label>Title<input name="title" required maxlength="90" placeholder="Event name"></label><label>Date<input name="date" type="date" required value="${s.selected}"></label><label>Time<input name="time" type="time" value="09:00"></label><label>Color<select name="color"><option value="#0a84ff">Blue</option><option value="#f94d4d">Red</option><option value="#5cbf6d">Green</option><option value="#e6a23c">Orange</option></select></label><button type="submit">Add Event</button></form></aside><main class="pc-content">${s.view==='month'?this.renderMonth(s):s.view==='week'?this.renderWeek(s):this.renderDay(s)}</main></div></div>`;
  }
  submit(e,s){if(!e.target.matches('.pc-add'))return;e.preventDefault();const f=new FormData(e.target);const title=String(f.get('title')||'').trim(),date=String(f.get('date')||'');if(!title||!/\d{4}-\d\d-\d\d/.test(date))return;this.events.push({id:String(Date.now())+Math.random().toString(36).slice(2),title,date,time:String(f.get('time')||''),color:String(f.get('color')||'#0a84ff')});s.selected=date;s.focus=new Date(date+'T12:00:00');this.save();this.instances.forEach(x=>this.render(x));}
  click(e,s){const b=e.target.closest('button');if(!b)return;
   if(b.dataset.pc==='prev'||b.dataset.pc==='next')this.navigate(s,b.dataset.pc==='prev'?-1:1);
   else if(b.dataset.pc==='today'){s.focus=new Date();s.selected=key(new Date());this.render(s)}
   else if(b.dataset.pcView){s.view=b.dataset.pcView;this.render(s)}
   else if(b.dataset.pcDay||b.dataset.pcMini){const date=b.dataset.pcDay||b.dataset.pcMini;s.selected=date;s.focus=new Date(date+'T12:00:00');this.render(s)}
   else if(b.dataset.pcEvent){const event=this.events.find(x=>x.id===b.dataset.pcEvent);if(!event)return;const action=prompt(`Event: ${event.title}\nType a new title to rename it, or type DELETE to remove.`,event.title);if(action===null)return;if(action==='DELETE')this.events=this.events.filter(x=>x!==event);else if(action.trim())event.title=action.trim();this.save();this.instances.forEach(x=>this.render(x))}
  }
 }
 P.CalendarApp=CalendarApp;
})();

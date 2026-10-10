/* Desktop widgets in the style of ThanasOS's MIT-licensed demo patterns.
   Catalina's authentic widgets lived in Notification Center / Today;
   PearPortOS makes desktop widgets an optional, removable extension. */
(() => {
 const P=window.PearPort;
 const keys=['weather','clock','calendar','health'];
 const names={weather:'Weather',clock:'Clock',calendar:'Calendar',health:'Health Activity'};
 const E=s=>P.escape(String(s));
 const read=(key,otherwise)=>{try{const s=localStorage.getItem(key);return s===null?otherwise:JSON.parse(s)}catch{return otherwise}};
 const save=(key,v)=>{try{localStorage.setItem(key,JSON.stringify(v))}catch{}};
 const iconWeather=c=>c===0?'☀':[1,2,3].includes(c)?'⛅':[45,48].includes(c)?'☁':[51,53,55,61,63,65,80,81,82].includes(c)?'☂':[71,73,75,85,86].includes(c)?'❄':c>90?'⚡':'☁';
 const day=()=>new Date().toISOString().slice(0,10);
 class DesktopWidgets {
  constructor(){this.visible=read('pear-widgets-visible',true);this.order=read('pear-widgets-layout',[...keys]).filter(x=>keys.includes(x));this.editing=false;this.weather=null;this.weatherError=false;
   this.city=read('pear-widgets-city','Accra');this.cities={Accra:[5.56,-0.205],Bengaluru:[12.972,77.594],Istanbul:[41.008,28.978],London:[51.507,-0.128],NewYork:[40.713,-74.006]};if(!this.cities[this.city])this.city='Accra';
   this.root=document.createElement('aside');this.root.id='pear-desktop-widgets';this.root.setAttribute('aria-label','Desktop widgets');P.$('#desktop').append(this.root);this.draw();
   this.root.addEventListener('click',e=>this.click(e));this.root.addEventListener('change',e=>this.change(e));this.root.addEventListener('dragstart',e=>this.startDrag(e));this.root.addEventListener('dragover',e=>this.over(e));this.root.addEventListener('drop',e=>this.drop(e));
   this.root.addEventListener('keydown',e=>{if(e.key==='Escape'&&this.editing)this.edit(false)});
   this.tick=setInterval(()=>this.updateClock(),1000);this.fetchWeather();
   P.events.on('calendar:change',()=>this.draw());
  }
  store(){save('pear-widgets-layout',this.order);save('pear-widgets-visible',this.visible)}
  toggleVisible(){this.visible=!this.visible;this.store();this.draw()}
  edit(on=true){if(!this.visible)this.visible=true;this.editing=on;this.store();this.draw()}
  renderClock(){const now=new Date();const hour=now.getHours()%12+now.getMinutes()/60;const min=now.getMinutes()+now.getSeconds()/60;const sec=now.getSeconds();
   return `<div class="pear-analog"><div class="pear-clock-face">${Array.from({length:12},(_,i)=>`<span style="--tick:${i}">${i||12}</span>`).join('')}<i class="hand hour" style="--angle:${hour*30}deg"></i><i class="hand minute" style="--angle:${min*6}deg"></i><i class="hand second" style="--angle:${sec*6}deg"></i><b class="clock-pin"></b></div></div>`}
  renderCalendar(){const now=new Date(),y=now.getFullYear(),m=now.getMonth(),first=(new Date(y,m,1).getDay()+6)%7,days=new Date(y,m+1,0).getDate();const events=P.calendar?.getEvents?.()||[];
   return `<div class="pear-cal-head"><strong>${now.toLocaleDateString('en-US',{month:'long'}).toUpperCase()}</strong><button class="pear-widget-action" data-open-calendar title="Open Calendar">↗</button></div><div class="pear-cal-week">${['M','T','W','T','F','S','S'].map(s=>`<span>${s}</span>`).join('')}</div><div class="pear-cal-days">${Array.from({length:42},(_,i)=>{const n=i-first+1;const key=`${y}-${String(m+1).padStart(2,'0')}-${String(n).padStart(2,'0')}`;return `<span class="${n===now.getDate()?'today':''} ${events.some(x=>x.date===key)?'has-event':''}">${n>0&&n<=days?n:''}</span>`}).join('')}</div>`}
  renderHealth(){const metrics=read('pear-health-'+day(),{move:0,exercise:0,stand:0});const rings=[['move',400,'#ff335b'],['exercise',30,'#68ef38'],['stand',12,'#27c5ed']];
   const svg=`<svg class="pear-health-rings" viewBox="0 0 120 120" aria-label="Manually tracked daily activity"><g transform="rotate(-90 60 60)">${rings.map(([name,goal,color],i)=>{const r=47-i*13,c=2*Math.PI*r,level=Math.min(1,Number(metrics[name]||0)/goal);return `<circle cx="60" cy="60" r="${r}" fill="none" stroke="${color}" stroke-opacity=".20" stroke-width="10"/><circle cx="60" cy="60" r="${r}" fill="none" stroke="${color}" stroke-width="10" stroke-linecap="round" stroke-dasharray="${Math.max(0,level*c)} ${c}"/>`}).join('')}</g></svg>`;
   return `<div class="pear-health-layout">${svg}<div class="pear-health-list"><label>MOVE <b>${metrics.move||0}<small>/400 kcal</small></b></label><label>EXERCISE <b>${metrics.exercise||0}<small>/30 min</small></b></label><label>STAND <b>${metrics.stand||0}<small>/12 hr</small></b></label><button data-set-activity class="pear-widget-action">Edit activity…</button></div></div>`}
  renderWeather(){const w=this.weather;return `<div class="pear-weather-top"><div><div class="pear-weather-city">${E(this.city)}</div><div class="pear-weather-temp">${w?Math.round(w.temperature_2m)+'°':'—°'}</div></div><div class="pear-weather-condition"><span>${w?iconWeather(w.weather_code):'☁'}</span>${w?'Live weather':this.weatherError?'Weather unavailable':'Loading weather…'}</div></div><div class="pear-weather-bottom"><span>${w?`Wind ${Math.round(w.wind_speed_10m)} km/h`:'Weather requires an internet connection'}</span><button data-change-city class="pear-widget-action">Change city</button></div>`}
  template(type){if(type==='weather')return this.renderWeather();if(type==='clock')return this.renderClock();if(type==='calendar')return this.renderCalendar();return this.renderHealth()}
  draw(){this.root.classList.toggle('hidden',!this.visible);this.root.classList.toggle('editing',this.editing);
   this.root.innerHTML=`<div class="pear-widgets-stack">${this.order.map(type=>`<section class="pear-widget ${type}" data-widget="${type}" draggable="${this.editing}" aria-label="${names[type]} widget"><button class="pear-widget-remove" data-remove-widget="${type}" title="Remove ${names[type]}">−</button>${this.template(type)}</section>`).join('')}</div>${this.editing?`<section class="pear-widget-gallery"><h3>Customize Widgets</h3><p>Drag to reorder, or remove and add widgets.</p><div class="pear-widget-choices">${keys.filter(x=>!this.order.includes(x)).map(x=>`<button data-add-widget="${x}">＋ ${names[x]}</button>`).join('')||'<span>All available widgets are added.</span>'}</div><button class="pear-widget-done" data-widget-done>Done</button></section>`:''}`;
  }
  updateClock(){if(!this.visible)return;const face=this.root.querySelector('.pear-clock-face');if(!face)return;const d=new Date();face.querySelector('.hour')?.style.setProperty('--angle',(d.getHours()%12+d.getMinutes()/60)*30+'deg');face.querySelector('.minute')?.style.setProperty('--angle',(d.getMinutes()+d.getSeconds()/60)*6+'deg');face.querySelector('.second')?.style.setProperty('--angle',d.getSeconds()*6+'deg');}
  async fetchWeather(){const co=this.cities[this.city];if(!co)return;try{const q=`https://api.open-meteo.com/v1/forecast?latitude=${co[0]}&longitude=${co[1]}&current=temperature_2m,weather_code,wind_speed_10m&timezone=auto`;
   const controller=new AbortController(),timer=setTimeout(()=>controller.abort(),7000);let data;try{const res=await fetch(q,{signal:controller.signal});if(!res.ok)throw Error('Weather request failed');data=await res.json()}finally{clearTimeout(timer)}
   if(this.cities[this.city]!==co)return;this.weather=data.current;this.weatherError=false;
  }catch{this.weatherError=true;this.weather=null}this.draw()}
  click(e){const btn=e.target.closest('button');if(!btn)return;e.stopPropagation();
   if(btn.dataset.removeWidget){this.order=this.order.filter(x=>x!==btn.dataset.removeWidget);this.store();this.draw()}
   else if(btn.dataset.addWidget){this.order.push(btn.dataset.addWidget);this.store();this.draw()}
   else if(btn.hasAttribute('data-widget-done'))this.edit(false);
   else if(btn.hasAttribute('data-open-calendar'))P.apps.open('calendar');
   else if(btn.hasAttribute('data-change-city')){const city=prompt('Weather city: Accra, Bengaluru, Istanbul, London, NewYork',this.city);if(!city)return;const chosen=Object.keys(this.cities).find(x=>x.toLowerCase()===city.trim().toLowerCase());if(!chosen)return P.toast('Choose a supported city');this.city=chosen;save('pear-widgets-city',this.city);this.weather=null;this.draw();this.fetchWeather()}
   else if(btn.hasAttribute('data-set-activity')){const now=read('pear-health-'+day(),{move:0,exercise:0,stand:0}),newData={...now};for(const [key,label] of [['move','Move calories (kcal)'],['exercise','Exercise minutes'],['stand','Stand hours']]){const answer=prompt(label,String(now[key]||0));if(answer===null)return;const n=Number(answer);if(!Number.isFinite(n)||n<0)return P.toast('Enter a non-negative number');newData[key]=Math.round(n)}save('pear-health-'+day(),newData);this.draw()}
  }
  change(){}
  startDrag(e){if(!this.editing)return;const w=e.target.closest('[data-widget]');if(!w)return;e.dataTransfer.setData('application/x-pear-widget',w.dataset.widget);e.dataTransfer.effectAllowed='move'}
  over(e){if(this.editing&&e.dataTransfer?.types.includes('application/x-pear-widget'))e.preventDefault()}
  drop(e){if(!this.editing)return;const type=e.dataTransfer?.getData('application/x-pear-widget');const target=e.target.closest('[data-widget]')?.dataset.widget;if(!type||!target||type===target)return;e.preventDefault();const list=this.order.filter(x=>x!==type);list.splice(list.indexOf(target),0,type);this.order=list;this.store();this.draw()}
 }
 P.DesktopWidgets=DesktopWidgets;
})();

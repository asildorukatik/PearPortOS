(() => {
 const P=window.PearPort;
 P.CompareMode=class CompareMode {
   constructor(){this.layer=P.$('#compare-layer');this.image=P.$('#compare-image');this.enabled=false;this.opacity=.5;this.scale=1;this.shiftX=0;this.shiftY=0;this.customURL=null;this.useReference();P.events.on('theme',()=>{if(!this.customURL)this.useReference()})}
   useReference(){this.customURL=null;this.image.src=`assets/reference/catalina-${P.theme.mode}.jpg`;P.events.emit('compare:reference',{theme:P.theme.mode})}
   openFile(file){if(!file||!file.type.startsWith('image/'))return;if(this.customURL)URL.revokeObjectURL(this.customURL);this.customURL=URL.createObjectURL(file);this.image.src=this.customURL;this.setEnabled(true);P.events.emit('compare:file',{name:file.name})}
   setEnabled(on){this.enabled=!!on;this.layer.classList.toggle('enabled',this.enabled);P.events.emit('compare:toggle',{enabled:this.enabled})}
   toggle(){this.setEnabled(!this.enabled)}
   setOpacity(v){this.opacity=Math.min(1,Math.max(0,Number(v)));document.documentElement.style.setProperty('--compare-opacity',this.opacity)}
   setScale(v){this.scale=Math.min(4,Math.max(.1,Number(v)));document.documentElement.style.setProperty('--compare-scale',this.scale)}
   setShift(x,y){this.shiftX=Number(x);this.shiftY=Number(y);document.documentElement.style.setProperty('--compare-shift-x',this.shiftX+'px');document.documentElement.style.setProperty('--compare-shift-y',this.shiftY+'px')}
 };
})();

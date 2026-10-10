/* Optional decorative utility; not used by Catalina default window/Dock styles.
   This is an original smooth-rounded superellipse approximation (not Figma code). */
window.PearPort=window.PearPort||{};
window.PearPort.squirclePath=function(size,radius,smoothing=.6){
 const r=Math.max(0,Math.min(size/2,radius));const softness=Math.max(0,Math.min(1,smoothing));
 const c=r*(.55+softness*.19);const s=size;
 return `M ${r},0 L ${s-r},0 C ${s-r+c},0 ${s},${r-c} ${s},${r} L ${s},${s-r} C ${s},${s-r+c} ${s-r+c},${s} ${s-r},${s} L ${r},${s} C ${r-c},${s} 0,${s-r+c} 0,${s-r} L 0,${r} C 0,${r-c} ${r-c},0 ${r},0 Z`;
};

/* PearPortOS Launchpad motion: staggered icon reveal and blur/zoom close.
   Adapted conceptually from ThanasOS (MIT) for Catalina's simpler visual style. */
(() => {
 const P=window.PearPort;
 P.installLaunchpadMotion=launchpad=>{
  const render=launchpad.render.bind(launchpad),open=launchpad.open.bind(launchpad),close=launchpad.close.bind(launchpad);
  let timer=null;
  launchpad.render=function(){render();this.el.querySelectorAll('.launchpad-app').forEach((b,i)=>b.style.setProperty('--index',i))};
  launchpad.open=function(){if(timer){clearTimeout(timer);timer=null}this.el.classList.remove('exiting');open()};
  launchpad.close=function(){if(!this.el.classList.contains('shown'))return;if(timer)return;
   this.el.classList.add('exiting');timer=setTimeout(()=>{timer=null;this.el.classList.remove('exiting');close()},Math.min(260,window.matchMedia?.('(prefers-reduced-motion: reduce)').matches?0:260))
  };
  launchpad.launch=function(id){this.close();P.apps.open(id)};
 };
})();

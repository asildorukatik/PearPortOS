(() => {
 const P=window.PearPort;
 const apps=[
  ['pearder','Pearder','pearder',true],['launchpad','Launchpad','launchpad',false],
  ['pearsafari','Pearsafari','pearsafari',false],['mail','Mail','mail',false],
  ['contacts','Contacts','contacts',false],['calendar','Calendar','calendar',true],
  ['notes','Notes','notes',false],['reminders','Reminders','reminders',false],
  ['maps','Maps','maps',false],['photos','Photos','photos',false],
  ['messages','Messages','messages',false],['facetime','FaceTime','facetime',false],
  ['music','Music','music',false],['podcasts','Podcasts','podcasts',false],
  ['tv','TV','tv',false],['books','Books','books',false],
  ['appstore','App Store','appstore',false],['terminal','Terminal','terminal',true],
  ['activity','Activity Monitor','activity',false],
  ['preferences','System Preferences','preferences',false],
  ['downloads','Downloads','folder',false],['trash','Trash','trash',false]
 ];
 P.AppRegistry=class AppRegistry {
  constructor(){this.map=new Map(apps.map(([id,title,icon,enabled])=>[id,{id,title,icon,enabled}]));}
  get(id){return this.map.get(id)}
  all(){return Array.from(this.map.values())}
  icon(id){return P.icon(this.get(id)?.icon||'folder')}
  open(id){if(id==='launchpad'){P.launchpad?.open();return}if(id==='trash'){const win=P.windows.createWindow('pearder');const state=P.pearder.instances.get(win);if(state)P.pearder.navigate(state,'/Trash');return}if(id==='downloads'){const win=P.windows.createWindow('pearder');const state=P.pearder.instances.get(win);if(state)P.pearder.navigate(state,'/Users/pear/Downloads');return}const existing=[...P.windows.windows.values()].find(w=>w.appId===id&&!w.closing);if(existing?.space&&P.mission&&existing.space!==P.mission.current)P.mission.switchSpace(existing.space);P.windows.createWindow(id)}
 };
})();

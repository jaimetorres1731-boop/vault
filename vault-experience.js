(()=>{'use strict';
const $=id=>document.getElementById(id), KEY='vault-v12-experience';
const safeRead=()=>{try{return JSON.parse(localStorage.getItem(KEY)||'{}')}catch{return {}}};let settings=safeRead();
const save=()=>{try{localStorage.setItem(KEY,JSON.stringify(settings))}catch{}};
const make=(tag,txt,cls)=>{const e=document.createElement(tag);if(txt!==undefined)e.textContent=txt;if(cls)e.className=cls;return e};
const addCard=(parent,title,desc)=>{const c=make('section',undefined,'vault-experience-card');c.append(make('h3',title),make('p',desc));parent.append(c);return c};
const dash=$('vault-page-home')?.querySelector('.vault-page-content'),setting=$('vault-page-settings')?.querySelector('.vault-page-content');if(!dash||!setting)return;
const intro=addCard(dash,'Install Vault & take a tour','Get quick access from your home screen and learn how to use your savings dashboard.');intro.style.gridColumn='1/-1';intro.style.order='-2';
const actions=make('div',undefined,'vault-experience-actions'),install=make('button','Install Vault','btn primary'),tourBtn=make('button','Start walkthrough','btn');install.type=tourBtn.type='button';actions.append(install,tourBtn);intro.append(actions);const installNote=make('p','','vault-install-note');intro.append(installNote);
let promptEvent=null;
const isInstalledMode=()=>window.matchMedia('(display-mode: standalone)').matches||window.matchMedia('(display-mode: fullscreen)').matches||navigator.standalone===true;
const installStateKey='vault-install-completed';
const installedHere=()=>{try{return localStorage.getItem(installStateKey)==='true'}catch{return false}};
function updateInstallUI(){
 const installed=isInstalledMode()||installedHere();
 install.hidden=installed;
 installNote.textContent=installed?'Vault is installed. You can reopen this tutorial anytime.':'';
 const original=$('installApp');if(original)original.hidden=installed||!promptEvent;
}
window.addEventListener('beforeinstallprompt',e=>{
 e.preventDefault();
 if(isInstalledMode()||installedHere()){updateInstallUI();return}
 promptEvent=e;updateInstallUI();
});
window.addEventListener('appinstalled',()=>{
 try{localStorage.setItem(installStateKey,'true')}catch{}
 promptEvent=null;updateInstallUI();
});
install.onclick=async()=>{
 if(isInstalledMode()||installedHere()){updateInstallUI();return}
 if(promptEvent){
  const p=promptEvent;promptEvent=null;
  try{await p.prompt();const result=await p.userChoice;
   if(result?.outcome==='accepted')installNote.textContent='Installation started. The install option will disappear when installation completes.';
   else installNote.textContent='Installation canceled. You can install Vault later.';
  }catch{installNote.textContent='Your browser could not open the install prompt.'}
  updateInstallUI();
 }else{
  installNote.textContent=/iPad|iPhone|iPod/.test(navigator.userAgent)?'In Safari, tap Share, then Add to Home Screen.':'Use your browser menu and choose Install app or Add to Home Screen, if available.';
 }
};
updateInstallUI();
const theme=addCard(setting,'Appearance','Choose an accent color. Your layout and savings data stay unchanged.');theme.style.gridColumn='1/-1';const palette=make('div',undefined,'vault-accent-grid');theme.append(palette);
const themes=[['blue','#2ea9f5','Electric blue'],['violet','#9165e8','Violet'],['emerald','#14b88c','Emerald'],['gold','#d6a146','Gold'],['rose','#e95c94','Rose']];
function applyTheme(id){if(!themes.some(t=>t[0]===id))id='blue';document.body.dataset.vaultTheme=id;for(const b of palette.querySelectorAll('button'))b.setAttribute('aria-pressed',String(b.dataset.theme===id))}
for(const [id,color,label] of themes){const b=make('button','✓','vault-accent-choice');b.style.background=color;b.type='button';b.dataset.theme=id;b.title=label;b.setAttribute('aria-label',label);b.onclick=()=>{settings.theme=id;save();applyTheme(id)};palette.append(b)}applyTheme(settings.theme||'blue');
const notify=addCard(setting,'Notifications','Choose optional browser notifications. Alerts can fire while Vault is open; closed-app push alerts require a separate secure service.');notify.style.gridColumn='1/-1';
const notifActions=make('div',undefined,'vault-experience-actions'),permission=make('button','Enable notifications','btn'),test=make('button','Send test alert','btn');permission.type=test.type='button';notifActions.append(permission,test);notify.append(notifActions);
const status=make('p','Notifications have not been enabled.','vault-install-note');notify.append(status);
function canNotify(){return 'Notification' in window&&window.isSecureContext}
function updateStatus(){status.textContent=!canNotify()?'Browser notifications are not available in this environment.':`Notification permission: ${Notification.permission}. Vault can display alerts only while open.`}updateStatus();
permission.onclick=async()=>{if(!canNotify()){updateStatus();return}try{const result=await Notification.requestPermission();settings.notifications=result==='granted';save();updateStatus()}catch{status.textContent='Notification permission could not be requested.'}};
test.onclick=()=>{if(!canNotify()||Notification.permission!=='granted'){status.textContent='Enable notifications first.';return}try{new Notification('Vault notification test',{body:'Vault alerts are enabled while the app is open.',icon:'./icon-192.png'})}catch{status.textContent='Your browser blocked the test notification.'}};
// On-open reminders, only if permission was granted. No background push is claimed.
function notifyDue(){if(!canNotify()||Notification.permission!=='granted'||!settings.notifications)return;let extra;try{extra=JSON.parse(localStorage.getItem('vault-v11-extras')||'{}')}catch{return}const today=new Date().toLocaleDateString('en-CA');const due=extra?.reminders?.payday&&extra.reminders.payday<=today;const key='payday:'+today;if(due&&settings.lastAlert!==key){try{new Notification('Vault payday reminder',{body:'Open Vault to record your savings deposit.',icon:'./icon-192.png'});settings.lastAlert=key;save()}catch{}}}notifyDue();
const overlay=make('div',undefined,'vault-tour-overlay');overlay.setAttribute('role','presentation');const dialog=make('div',undefined,'vault-tour-dialog');dialog.setAttribute('role','dialog');dialog.setAttribute('aria-modal','true');dialog.setAttribute('aria-label','Vault walkthrough');overlay.append(dialog);document.body.append(overlay);
const steps=[['Welcome to Vault','Vault tracks your savings locally on this device. Start with a savings goal and deployment dates.'],['Dashboard','Your dashboard shows your recorded balance, progress, remaining goal and deployment timeline.'],['Transactions','Add deposits and withdrawals in Transactions. You can edit past entries if you make a mistake.'],['Savings Goals','Create optional smaller goals that share your primary savings balance without double-counting.'],['Insights & Calendar','Explore projections, monthly reports, checkpoints and daily transaction history.'],['Payday Planner','Plan future savings from each paycheck. Plans never automatically increase your balance.'],['Settings & Privacy','Export backups regularly, choose an accent color, and use the optional privacy PIN. The PIN does not encrypt your data.']];let step=0;
function closeTour(){overlay.classList.remove('open');settings.tourSeen=true;save()}
function showTour(){dialog.replaceChildren();const counter=make('div',`STEP ${step+1} OF ${steps.length}`,'vault-tour-progress'),title=make('h2',steps[step][0]),desc=make('p',steps[step][1]);const foot=make('div',undefined,'vault-tour-footer');const skip=make('button','Skip tour','btn'),back=make('button','Back','btn'),next=make('button',step===steps.length-1?'Finish':'Next →','btn primary');skip.type=back.type=next.type='button';back.disabled=step===0;skip.onclick=closeTour;back.onclick=()=>{step--;showTour()};next.onclick=()=>{if(step===steps.length-1)closeTour();else{step++;showTour()}};foot.append(skip,back,next);dialog.append(counter,title,desc,foot);next.focus()}
function startTour(){step=0;overlay.classList.add('open');showTour()}tourBtn.onclick=startTour;overlay.addEventListener('click',e=>{if(e.target===overlay)closeTour()});document.addEventListener('keydown',e=>{if(e.key==='Escape'&&overlay.classList.contains('open'))closeTour()});
const tourSettings=make('button','Replay tutorial','btn');tourSettings.type='button';tourSettings.onclick=startTour;theme.append(tourSettings);
if(!settings.tourSeen){const pinOverlay=$('vaultLock');if(!pinOverlay||pinOverlay.style.display!=='flex')startTour()}
})();
(()=>{'use strict';
const KEY='vault-deployment-v3';
const localDate=()=>{const d=new Date();return new Date(d.getFullYear(),d.getMonth(),d.getDate(),12)};
const parseDate=s=>{if(!/^\d{4}-\d{2}-\d{2}$/.test(s||''))return null;const [y,m,d]=s.split('-').map(Number);const result=new Date(y,m-1,d,12);return result.getFullYear()===y&&result.getMonth()===m-1&&result.getDate()===d?result:null};
const diff=(a,b)=>Math.round((b-a)/86400000);
function init(){
const home=document.getElementById('vault-page-home')?.querySelector('.vault-page-content');if(!home)return;
const card=document.createElement('section');card.className='card vault-countdown';card.setAttribute('aria-label','Deployment countdown');
card.innerHTML='<div class="vault-countdown-top"><h2>Deployment countdown</h2><span class="vault-countdown-tag">LIVE</span></div><div class="vault-countdown-number" id="vaultCountdownDays">—</div><div class="vault-countdown-label" id="vaultCountdownLabel">Days remaining</div><div class="vault-countdown-bar" role="progressbar" aria-label="Deployment time completed" aria-valuemin="0" aria-valuemax="100" aria-valuenow="0"><div id="vaultCountdownFill"></div></div><div class="vault-countdown-footer"><span id="vaultCountdownPercent">—</span><span id="vaultCountdownEnd">Set deployment dates in Savings Goals</span></div><p class="vault-countdown-help" id="vaultCountdownHelp"></p>';
const hero=home.querySelector('.hero');if(hero)hero.after(card);else home.prepend(card);
function update(){let settings={};try{settings=JSON.parse(localStorage.getItem(KEY)||'{}').settings||{}}catch{}
const start=parseDate(settings.start),end=parseDate(settings.end),now=localDate();let remaining='—',label='Days remaining',percent=0,caption='Set deployment dates in Savings Goals',help='';
if(start&&end&&end>start){const total=diff(start,end),left=Math.max(0,diff(now,end)),elapsed=Math.max(0,Math.min(total,diff(start,now)));percent=Math.round(elapsed/total*100);remaining=String(left);caption='Ends '+end.toLocaleDateString(undefined,{month:'short',day:'numeric',year:'numeric'});if(now<start){label='Days until deployment starts';remaining=String(Math.max(0,diff(now,start)));percent=0}else if(now>=end){label='Deployment complete';remaining='0';percent=100}else{label='Days remaining';}help=total+' total deployment days';}
else if(end){const left=Math.max(0,diff(now,end));remaining=String(left);label=now>=end?'Deployment complete':'Days remaining';caption='Ends '+end.toLocaleDateString(undefined,{month:'short',day:'numeric',year:'numeric'});help='Add a start date to see overall progress';}
document.getElementById('vaultCountdownDays').textContent=remaining;document.getElementById('vaultCountdownLabel').textContent=label;document.getElementById('vaultCountdownEnd').textContent=caption;document.getElementById('vaultCountdownPercent').textContent=start&&end&&end>start?percent+'% completed':'Progress unavailable';document.getElementById('vaultCountdownHelp').textContent=help;card.querySelector('[role=progressbar]').setAttribute('aria-valuenow',String(percent));document.getElementById('vaultCountdownFill').style.width=percent+'%';}
update();window.addEventListener('vault-updated',update);window.addEventListener('storage',update);document.addEventListener('visibilitychange',()=>{if(!document.hidden)update()});window.addEventListener('focus',update);setInterval(()=>{if(!document.hidden)update()},60000);
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init);else init();
})();
(()=>{'use strict';
const KEY='vault-deployment-v3';
const $=id=>document.getElementById(id);
const parse=s=>{if(!/^\d{4}-\d{2}-\d{2}$/.test(s||''))return null;const [y,m,d]=s.split('-').map(Number),v=new Date(y,m-1,d,12);return v.getFullYear()===y&&v.getMonth()===m-1&&v.getDate()===d?v:null};
const iso=d=>[d.getFullYear(),String(d.getMonth()+1).padStart(2,'0'),String(d.getDate()).padStart(2,'0')].join('-');
const days=(a,b)=>Math.round((Date.UTC(b.getFullYear(),b.getMonth(),b.getDate())-Date.UTC(a.getFullYear(),a.getMonth(),a.getDate()))/86400000);
function init(){const home=$('vault-page-home')?.querySelector('.vault-page-content');if(!home)return;
const card=document.createElement('section');card.className='card vault-countdown';card.setAttribute('aria-label','Deployment countdown');
card.innerHTML=`<div class="vault-countdown-top"><h2>Deployment countdown</h2><span class="vault-countdown-tag">LIVE</span></div>
<div class="vault-countdown-number" id="vaultCountdownDays">Set dates</div><div class="vault-countdown-label" id="vaultCountdownLabel">Days remaining</div>
<div class="vault-countdown-bar" role="progressbar" aria-label="Deployment completed" aria-valuemin="0" aria-valuemax="100" aria-valuenow="0"><div id="vaultCountdownFill"></div></div>
<div class="vault-countdown-footer"><span id="vaultCountdownPercent">Enter deployment dates below</span><span id="vaultCountdownEnd"></span></div>
<form id="vaultCountdownForm" class="vault-countdown-form"><label>Deployment start <input type="date" id="vaultCountStart" required></label><label>Deployment length (days) <input type="number" id="vaultCountLength" min="1" max="3650" step="1" placeholder="e.g. 440" required></label><label>Expected end date <input type="date" id="vaultCountEnd" required></label><button type="submit" class="btn primary">Save countdown</button></form><p class="vault-countdown-help" id="vaultCountdownHelp" role="status"></p>`;
const hero=home.querySelector('.hero');if(hero)hero.after(card);else home.prepend(card);
const start=$('vaultCountStart'),end=$('vaultCountEnd'),length=$('vaultCountLength'),help=$('vaultCountdownHelp');
function stored(){try{return JSON.parse(localStorage.getItem(KEY)||'{}')}catch{return {}}}
function sync(){const s=stored().settings||{};if(document.activeElement!==start)start.value=parse(s.start)?s.start:'';if(document.activeElement!==end)end.value=parse(s.end)?s.end:'';const a=parse(s.start),b=parse(s.end);if(a&&b&&b>a&&document.activeElement!==length)length.value=days(a,b);render()}
function render(){const s=stored().settings||{},a=parse(s.start),b=parse(s.end),today=new Date(),now=new Date(today.getFullYear(),today.getMonth(),today.getDate(),12);let value='Set dates',label='Days remaining',pct=0,footer='Set your deployment dates below';
if(a&&b&&b>a){const total=days(a,b),remaining=Math.max(0,days(now,b));pct=Math.min(100,Math.max(0,Math.round(days(a,now)/total*100)));value=String(remaining);label=now<a?'Days until start':now>=b?'Deployment complete':'Days remaining';if(now<a)value=String(days(now,a));footer=`${pct}% completed · ${total} total days · Ends ${b.toLocaleDateString()}`}
$('vaultCountdownDays').textContent=value;$('vaultCountdownLabel').textContent=label;$('vaultCountdownPercent').textContent=footer;$('vaultCountdownEnd').textContent='';$('vaultCountdownFill').style.width=pct+'%';card.querySelector('[role="progressbar"]').setAttribute('aria-valuenow',pct)}
function fromLength(){const a=parse(start.value),n=Number(length.value);if(a&&Number.isInteger(n)&&n>0&&n<=3650){const d=new Date(a);d.setDate(d.getDate()+n);end.value=iso(d)}}
function fromEnd(){const a=parse(start.value),b=parse(end.value);if(a&&b&&b>a)length.value=days(a,b)}
length.addEventListener('input',fromLength);end.addEventListener('change',fromEnd);start.addEventListener('change',()=>{if(length.value)fromLength();else fromEnd()});
$('vaultCountdownForm').addEventListener('submit',e=>{e.preventDefault();const a=parse(start.value),b=parse(end.value);if(!a||!b||b<=a){help.textContent='Enter a valid start date and an end date after the start.';return}try{const data=stored();data.settings=data.settings||{};data.settings.start=iso(a);data.settings.end=iso(b);localStorage.setItem(KEY,JSON.stringify(data));help.textContent='Countdown saved on this device.';window.dispatchEvent(new Event('vault-updated'));sync()}catch{help.textContent='Could not save. Check browser storage and export a backup.'}});
sync();window.addEventListener('vault-updated',sync);window.addEventListener('storage',sync);window.addEventListener('focus',render);document.addEventListener('visibilitychange',()=>{if(!document.hidden)render()});setInterval(()=>{if(!document.hidden)render()},60000)
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init);else init();})();

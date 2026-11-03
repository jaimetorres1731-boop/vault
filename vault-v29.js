(()=>{'use strict';
const KEY='vault-countdown-v29';
const $=id=>document.getElementById(id);
const parse=s=>{if(!/^\d{4}-\d{2}-\d{2}$/.test(s||''))return null;const [y,m,d]=s.split('-').map(Number);const a=new Date(y,m-1,d,12);return a.getFullYear()===y&&a.getMonth()===m-1&&a.getDate()===d?a:null};
const fmt=d=>[d.getFullYear(),String(d.getMonth()+1).padStart(2,'0'),String(d.getDate()).padStart(2,'0')].join('-');
const diff=(a,b)=>Math.round((Date.UTC(b.getFullYear(),b.getMonth(),b.getDate())-Date.UTC(a.getFullYear(),a.getMonth(),a.getDate()))/86400000);
function init(){
const home=$('vault-page-home')?.querySelector('.vault-page-content')||document.querySelector('#dashboard');
if(!home)return;
document.querySelectorAll('.vault-countdown').forEach(el=>el.remove());
const card=document.createElement('section');card.id='vaultCountdownV29';card.className='card vault-countdown-v29';
card.innerHTML=`<div class="v29-top"><h2>Deployment countdown</h2><span>LIVE</span></div><div class="v29-number" id="v29Remaining">Set dates below</div><div class="v29-label" id="v29Label">Days remaining</div><div class="v29-track"><div id="v29Fill"></div></div><p id="v29Progress">Enter your dates to start the countdown</p><form id="v29Form"><label>Deployment start date<input id="v29Start" type="date" required></label><label>Deployment length (days)<input id="v29Length" type="number" min="1" max="3650" value="440" required></label><label>Expected end date<input id="v29End" type="date" required></label><button type="submit">Save deployment dates</button></form><p id="v29Status" role="status"></p>`;
home.prepend(card);
const start=$('v29Start'),len=$('v29Length'),end=$('v29End'),status=$('v29Status');
const updateEnd=()=>{const a=parse(start.value),n=Number(len.value);if(a&&Number.isInteger(n)&&n>0&&n<=3650){a.setDate(a.getDate()+n);end.value=fmt(a)}};
start.addEventListener('change',updateEnd);len.addEventListener('input',updateEnd);
end.addEventListener('change',()=>{const a=parse(start.value),b=parse(end.value);if(a&&b&&b>a)len.value=diff(a,b)});
function render(){const a=parse(start.value),b=parse(end.value),today=new Date(),now=new Date(today.getFullYear(),today.getMonth(),today.getDate(),12);
if(!a||!b||b<=a){$('v29Remaining').textContent='Set dates below';$('v29Progress').textContent='Enter your deployment dates to start tracking';$('v29Fill').style.width='0%';return}
const total=diff(a,b),left=Math.max(0,diff(now,b)),percent=Math.max(0,Math.min(100,Math.round(diff(a,now)/total*100)));
$('v29Remaining').textContent=String(now<a?diff(now,a):left);
$('v29Label').textContent=now<a?'Days until deployment':now>=b?'Deployment complete':'Days remaining';
$('v29Progress').textContent=percent+'% complete · '+total+' total days · Ends '+b.toLocaleDateString();
$('v29Fill').style.width=percent+'%';
}
$('v29Form').addEventListener('submit',e=>{e.preventDefault();const a=parse(start.value),b=parse(end.value);if(!a||!b||b<=a){status.textContent='Choose a valid start date and later end date.';return}try{const main=JSON.parse(localStorage.getItem('vault-deployment-v3')||'null')||{settings:{starting:0,goal:0},transactions:[]};main.settings={...main.settings,start:start.value,end:end.value};localStorage.setItem('vault-deployment-v3',JSON.stringify(main));localStorage.setItem(KEY,JSON.stringify({start:start.value,end:end.value,length:Number(len.value)}));window.dispatchEvent(new Event('vault-updated'));status.textContent='Deployment dates saved on this device.';render()}catch{status.textContent='Unable to save dates. Check browser storage.'}});
try{const data=JSON.parse(localStorage.getItem(KEY)||'null');const main=JSON.parse(localStorage.getItem('vault-deployment-v3')||'null');const source=main?.settings?.start&&main?.settings?.end?main.settings:data;if(source&&parse(source.start)&&parse(source.end)){start.value=source.start;end.value=source.end;len.value=diff(parse(source.start),parse(source.end))}}catch{}
render();window.addEventListener('vault-updated',()=>{try{const d=JSON.parse(localStorage.getItem('vault-deployment-v3')||'null')?.settings;if(d?.start&&d?.end){start.value=d.start;end.value=d.end;len.value=diff(parse(d.start),parse(d.end));render()}}catch{}});window.addEventListener('focus',render);document.addEventListener('visibilitychange',()=>{if(!document.hidden)render()});setInterval(render,60000);
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init);else init();
})();
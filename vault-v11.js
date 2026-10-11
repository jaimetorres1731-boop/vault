
(()=>{
'use strict';
const $=id=>document.getElementById(id), KEY='vault-deployment-v3', EXT='vault-v11-extras';
const currency=n=>new Intl.NumberFormat('en-US',{style:'currency',currency:'USD',maximumFractionDigits:2}).format(n);
const parse=()=>{try{return JSON.parse(localStorage.getItem(KEY))||{settings:{starting:0,goal:0,start:'',end:''},transactions:[]}}catch{return {settings:{starting:0,goal:0,start:'',end:''},transactions:[]}}};
const blank={goals:[],reminders:{payday:'',frequency:'none',backup:'30',lastBackup:''},milestones:[]};
let ext;try{ext={...structuredClone(blank),...JSON.parse(localStorage.getItem(EXT)||'{}')}}catch{ext=structuredClone(blank)}
if(!Array.isArray(ext.goals))ext.goals=[];
if(!ext.reminders)ext.reminders={...blank.reminders};
let month=new Date();month.setDate(1);
const iso=d=>`${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
const today=iso(new Date());
function balance(d){return Math.round((Number(d.settings.starting||0)+d.transactions.reduce((a,t)=>a+(t.type==='deposit'?t.amount:-t.amount),0))*100)/100}
function save(){localStorage.setItem(EXT,JSON.stringify(ext));draw()}
function el(tag,text,cls){const n=document.createElement(tag);if(text!==undefined)n.textContent=text;if(cls)n.className=cls;return n}
function days(a,b){return Math.round((new Date(b+'T12:00:00')-new Date(a+'T12:00:00'))/86400000)}
function draw(){
 const d=parse(), bal=balance(d), g=Number(d.settings.goal||0), remain=d.settings.end?Math.max(0,days(today,d.settings.end)):0;
 const sorted=[...d.transactions].sort((a,b)=>a.date.localeCompare(b.date));
 const byMonth=new Map();
 for(const t of sorted){const m=t.date.slice(0,7);if(!byMonth.has(m))byMonth.set(m,{deposits:0,withdrawals:0});byMonth.get(m)[t.type==='deposit'?'deposits':'withdrawals']+=t.amount}
 const monthly=[...byMonth].sort((a,b)=>a[0].localeCompare(b[0])).map(([key,v])=>({key,net:v.deposits-v.withdrawals,...v}));
 const recent=monthly.slice(-6).map(x=>x.net);
 const avg=recent.length?recent.reduce((a,b)=>a+b,0)/recent.length:0;
 const variance=recent.length>=3?Math.sqrt(recent.reduce((a,b)=>a+(b-avg)**2,0)/recent.length):0;
 const months=remain/30.4375;
 $('projectionRange').textContent=recent.length<2?'Projections need at least two months of recorded activity.':`Conservative: ${currency(bal+months*Math.max(0,avg-variance))} · Expected: ${currency(bal+months*avg)} · Optimistic: ${currency(bal+months*(avg+variance))}. Based on recent monthly net savings; estimates only.`;
 const nextMonth=new Date();nextMonth.setDate(1);nextMonth.setMonth(nextMonth.getMonth()+1);
 const monthsElapsed=d.settings.start?Math.max(0,days(d.settings.start,today)/30.4375):0;
 const totalMonths=d.settings.start&&d.settings.end?days(d.settings.start,d.settings.end)/30.4375:0;
 $('checkpoint').textContent=g>0&&totalMonths>0?`Current checkpoint: ${currency(g*Math.min(1,monthsElapsed/totalMonths))}. You are ${bal>=g*Math.min(1,monthsElapsed/totalMonths)?'ahead of':'behind'} the even-paced target by ${currency(Math.abs(bal-g*Math.min(1,monthsElapsed/totalMonths)))}.`:'Enter your deployment dates and savings goal for monthly checkpoints.';
 const milestones=[10,25,50,75,100].map(p=>`${p}% ${g>0&&bal>=g*p/100?'✓':'○'}`).join('   ·   ');
 $('milestones').textContent=g>0?`Primary goal milestones: ${milestones}`:'Set your primary goal to see milestones.';
 $('insightStats').replaceChildren();
 const lastPay=sorted.filter(t=>t.type==='deposit'&&/pay/i.test(t.note||'')).at(-1);
 for(const [label,value] of [['Net saved this month',currency(byMonth.get(today.slice(0,7))?.deposits-byMonth.get(today.slice(0,7))?.withdrawals||0)],['Average monthly net',recent.length?currency(avg):'—'],['Last labeled payday deposit',lastPay?currency(lastPay.amount):'—'],['Months with activity',String(monthly.length)]]){const box=el('div',undefined,'stat');box.append(el('small',label),el('strong',value));$('insightStats').append(box)}
 // Goals: trim allocation only after explicit user approval; never silently move funds
 const totalAllocated=ext.goals.reduce((a,x)=>a+Number(x.allocated),0);
 $('subGoals').replaceChildren();
 if(totalAllocated>bal+0.001){$('subGoals').append(el('p',`Warning: allocated savings ${currency(totalAllocated)} exceed recorded balance ${currency(bal)}. Adjust goal allocations.`, 'neg'))}
 for(const goal of ext.goals){const row=el('div',undefined,'goalrow');const label=el('div');label.append(el('strong',goal.name),el('small',` · ${currency(goal.allocated)} allocated of ${currency(goal.target)} target`));const controls=el('div');const edit=el('button','Edit','btn');edit.type='button';edit.onclick=()=>{const val=prompt('Allocated savings ($)',goal.allocated);if(val===null)return;const n=Math.round(Number(val)*100)/100;if(!Number.isFinite(n)||n<0||totalAllocated-goal.allocated+n>bal+0.001){alert('Allocation must be nonnegative and cannot exceed total savings');return}goal.allocated=n;save()};const del=el('button','Remove','btn');del.type='button';del.onclick=()=>{if(confirm('Remove this goal? Savings balance will not change.')){ext.goals=ext.goals.filter(x=>x.id!==goal.id);save()}};controls.append(edit,del);row.append(label,controls);$('subGoals').append(row)}
 $('calendarMonth').textContent=month.toLocaleString('en-US',{month:'long',year:'numeric'});
 const grid=$('calendarGrid');grid.replaceChildren();for(const h of ['S','M','T','W','T','F','S'])grid.append(el('div',h,'dayhead'));
 for(let i=0;i<month.getDay();i++)grid.append(el('div'));
 const max=new Date(month.getFullYear(),month.getMonth()+1,0).getDate();
 for(let i=1;i<=max;i++){const date=iso(new Date(month.getFullYear(),month.getMonth(),i));const tx=d.transactions.filter(t=>t.date===date);const net=tx.reduce((a,t)=>a+(t.type==='deposit'?t.amount:-t.amount),0);const btn=el('button',String(i)+(tx.length?' •':''),tx.length?'has-money':'');btn.type='button';btn.title=tx.length?`${tx.length} transactions; net ${currency(net)}`:'No transactions';btn.onclick=()=>{$('dayDetails').textContent=tx.length?`${date}: ${tx.map(t=>`${t.type} ${currency(t.amount)} ${t.note||''}`).join(' | ')}`:`${date}: No transactions`};grid.append(btn)}
 $('monthlyRows').replaceChildren();for(const r of monthly.slice().reverse()){const row=el('div',undefined,'reportrow');row.append(el('span',r.key),el('span',`In ${currency(r.deposits)} · Out ${currency(r.withdrawals)} · Net ${currency(r.net)}`));$('monthlyRows').append(row)}if(!monthly.length)$('monthlyRows').append(el('p','No transactions yet.','small'));
 const r=ext.reminders,notices=[];if(r.payday&&r.payday<=today){notices.push('Payday reminder: log your savings deposit.');if(r.frequency==='biweekly'){while(r.payday<=today){const dt=new Date(r.payday+'T12:00:00');dt.setDate(dt.getDate()+14);r.payday=iso(dt)}$('nextPayday').value=r.payday;localStorage.setItem(EXT,JSON.stringify(ext))}else if(r.frequency==='semimonthly'){const dt=new Date();const next=dt.getDate()<15?new Date(dt.getFullYear(),dt.getMonth(),15):new Date(dt.getFullYear(),dt.getMonth()+1,1);r.payday=iso(next);$('nextPayday').value=r.payday;localStorage.setItem(EXT,JSON.stringify(ext))}}
 const backupDays=Number(r.backup||0);if(backupDays>0&&(!r.lastBackup||days(r.lastBackup,today)>=backupDays))notices.push('Backup reminder: export a JSON backup from Data & backup.');
 if(g>0&&bal>=g)notices.push('Your primary savings goal is reached!');
 $('reminderList').textContent=notices.length?notices.join('  •  '):'No reminders due. Reminders appear when Vault is open.';
}
$('goalForm').onsubmit=e=>{e.preventDefault();const name=$('subGoalName').value.trim(),target=Number($('subGoalTarget').value),allocated=Number($('subGoalAllocated').value),d=parse(),total=ext.goals.reduce((a,g)=>a+g.allocated,0);if(!name||!Number.isFinite(target)||target<=0||!Number.isFinite(allocated)||allocated<0||total+allocated>balance(d)+0.001){alert('Check goal values. Allocations cannot exceed available savings.');return}ext.goals.push({id:crypto.randomUUID?.()||String(Date.now()),name,target,allocated});save();e.target.reset()};
$('prevMonth').onclick=()=>{month.setMonth(month.getMonth()-1);draw()};
$('nextMonth').onclick=()=>{month.setMonth(month.getMonth()+1);draw()};
$('nextPayday').value=ext.reminders.payday||'';
$('paydayFrequency').value=ext.reminders.frequency||'none';
$('backupFrequency').value=ext.reminders.backup||'30';
$('saveReminder').onclick=()=>{ext.reminders={...ext.reminders,payday:$('nextPayday').value,frequency:$('paydayFrequency').value,backup:$('backupFrequency').value};save()};
const backupBtn=$('export');backupBtn.addEventListener('click',()=>{ext.reminders.lastBackup=today;save()});
const originalImport=$('import');originalImport.addEventListener('change',()=>{setTimeout(draw,100)});
window.addEventListener('vault-updated',()=>{try{ext={...structuredClone(blank),...JSON.parse(localStorage.getItem(EXT)||'{}')}}catch{}draw()});
const observe=new MutationObserver(()=>{clearTimeout(observe.timer);observe.timer=setTimeout(draw,100)});observe.observe($('history'),{childList:true});
// optional PIN privacy screen: not cryptographic security
const PINKEY='vault-v11-pin';
async function hash(pin){const bytes=new TextEncoder().encode('vault-pin-v1:'+pin);const digest=await crypto.subtle.digest('SHA-256',bytes);return Array.from(new Uint8Array(digest),b=>b.toString(16).padStart(2,'0')).join('')}
$('setPin').onclick=async()=>{const p=prompt('Choose a 4–12 digit privacy PIN (not encryption)');if(p===null)return;if(!/^\d{4,12}$/.test(p)){alert('Use 4–12 digits');return}localStorage.setItem(PINKEY,await hash(p));alert('PIN saved on this device. This is a privacy screen only.')};
$('clearPin').onclick=async()=>{const stored=localStorage.getItem(PINKEY);if(!stored)return;if(await hash(prompt('Current PIN')||'')!==stored){alert('Incorrect PIN');return}localStorage.removeItem(PINKEY);alert('PIN removed')};
function lock(){if(localStorage.getItem(PINKEY)){$('vaultLock').style.display='flex';$('unlockPin').value='';$('unlockPin').focus()}}
$('lockNow').onclick=lock;
$('unlockBtn').onclick=async()=>{if(await hash($('unlockPin').value)===localStorage.getItem(PINKEY)){$('vaultLock').style.display='none';$('unlockError').textContent=''}else{$('unlockError').textContent='Incorrect PIN'}};
$('unlockPin').onkeydown=e=>{if(e.key==='Enter')$('unlockBtn').click()};
lock();
let deferredPrompt;
window.addEventListener('beforeinstallprompt',e=>{e.preventDefault();deferredPrompt=e;$('installApp').hidden=window.matchMedia('(display-mode: standalone)').matches||navigator.standalone===true});
$('installApp').onclick=async()=>{if(deferredPrompt){deferredPrompt.prompt();await deferredPrompt.userChoice;deferredPrompt=null;$('installApp').hidden=true}};
if('serviceWorker' in navigator&&location.protocol==='https:')navigator.serviceWorker.register('./sw.js').catch(()=>{});
draw();
})();

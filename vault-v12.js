
(()=>{'use strict';
const BASE='vault-deployment-v3',EXTRA='vault-v11-extras',PLAN='vault-v12-payplan', $=id=>document.getElementById(id);
const fmt=n=>new Intl.NumberFormat('en-US',{style:'currency',currency:'USD'}).format(Number(n)||0);
const day=new Date(),today=`${day.getFullYear()}-${String(day.getMonth()+1).padStart(2,'0')}-${String(day.getDate()).padStart(2,'0')}`;
const read=k=>{try{return JSON.parse(localStorage.getItem(k)||'null')}catch{return null}};
const days=(a,b)=>Math.round((new Date(b+'T12:00:00')-new Date(a+'T12:00:00'))/864e5);
const monthKey=t=>String(t||'').slice(0,7);
function getData(){const b=read(BASE)||{settings:{starting:0,goal:0,start:'',end:''},transactions:[]};if(!b.settings||!Array.isArray(b.transactions))return null;return b}
const balance=d=>Number(d.settings.starting||0)+d.transactions.reduce((s,t)=>s+(t.type==='deposit'?1:-1)*Number(t.amount||0),0);
const node=(tag,content,cls)=>{const e=document.createElement(tag);if(content!==undefined)e.textContent=content;if(cls)e.className=cls;return e};
function metric(label,value,note){const e=node('div',undefined,'v12-metric');e.append(node('span',label),node('strong',value),node('small',note));return e}
function render(){
const d=getData();if(!d)return;const b=balance(d),goal=Number(d.settings.goal||0),end=d.settings.end||'',start=d.settings.start||'',remaining=end?Math.max(0,days(today,end)):0;
const netMonth=d.transactions.filter(t=>monthKey(t.date)===monthKey(today)).reduce((s,t)=>s+(t.type==='deposit'?1:-1)*t.amount,0);
const required=goal>0&&remaining>0?Math.max(0,goal-b)/(remaining/30.4375):null;
const months=new Map();for(const t of d.transactions){const m=monthKey(t.date);if(!months.has(m))months.set(m,{in:0,out:0});months.get(m)[t.type==='deposit'?'in':'out']+=t.amount}
const monthValues=[...months].sort((a,b)=>a[0].localeCompare(b[0]));const positive=monthValues.filter(([m])=>m<=monthKey(today));
const recent=positive.slice(-3).map(([,x])=>x.in-x.out);const avg=recent.length?recent.reduce((a,x)=>a+x,0)/recent.length:0;
const metrics=$('v12Metrics');metrics.replaceChildren(metric('Total saved',fmt(b),'Your recorded balance'),metric('Saved this month',fmt(netMonth),'Deposits minus withdrawals'),metric('Needed per month',required===null?'—':fmt(required),'To reach primary goal'),metric('Goal remaining',goal>0?fmt(Math.max(0,goal-b)):'—',goal>0?`${Math.max(0,Math.min(100,b/goal*100)).toFixed(1)}% complete`:'Set your primary goal'));
const percent=goal>0?Math.max(0,Math.min(100,b/goal*100)):0;$('v12ActualBar').style.width=`${percent}%`;
const total=start&&end?days(start,end):0;const expected=total>0?Math.max(0,Math.min(100,days(start,today)/total*100)):0;
$('v12TargetMark').style.display=goal>0&&total>0?'block':'none';$('v12TargetMark').style.left=`${expected}%`;
$('v12PaceLabel').textContent=goal>0&&total>0?`${percent.toFixed(1)}% saved · ${expected.toFixed(1)}% of timeline elapsed`:'Set goal and deployment dates';
$('v12PaceExplanation').textContent=goal>0&&total>0?(percent>=expected?'Your recorded savings are ahead of the even-paced target.':'Your recorded savings are below the even-paced target. This does not account for irregular pay or planned expenses.'):'The blue bar represents savings progress; the white marker represents the time-based target.';
const timeline=$('v12Timeline');timeline.replaceChildren();const recentTx=[...d.transactions].sort((a,b)=>b.date.localeCompare(a.date)||Number(b.created||0)-Number(a.created||0)).slice(0,6);
if(!recentTx.length)timeline.append(node('p','No activity yet. Your latest deposits and withdrawals will appear here.','footnote'));
for(const t of recentTx){const e=node('div',undefined,'v12-tx');const ic=node('div',t.type==='deposit'?'↓':'↑','v12-tx-icon'),info=node('div',undefined,'v12-tx-main');info.append(node('strong',t.note|| (t.type==='deposit'?'Savings deposit':'Savings withdrawal')),node('small',t.date));e.append(ic,info,node('div',`${t.type==='deposit'?'+':'−'}${fmt(t.amount)}`,'v12-tx-amount '+(t.type==='deposit'?'pos':'neg')));timeline.append(e)}
const h=$('v12HealthStats');h.replaceChildren();for(const [label,value] of [['Net saving months',`${positive.filter(([,v])=>v.in>v.out).length} / ${positive.length}`],['Last 3 active months',recent.length?fmt(avg):'—'],['Withdrawals this month',fmt(months.get(monthKey(today))?.out||0)]]){const el=node('div');el.append(node('span',label),node('strong',value));h.append(el)}
const ex=read(EXTRA),last=ex?.reminders?.lastBackup;
$('v12BackupStatus').textContent=last?`Last recorded JSON export: ${last}. Keep the downloaded file in a safe location. Your browser data does not sync automatically.`:'No recorded full backup export yet. Download a JSON backup before changing browsers or devices.';
const plan=read(PLAN)||{};let date=plan.date||'';const pay=Number(plan.amount||0);
if(date&&date>=today&&pay>0){let periods=0;let next=new Date(date+'T12:00:00');const final=end?new Date(end+'T12:00:00'):null;if(final){while(next<=final&&periods<1000){periods++;if(plan.cycle==='biweekly')next.setDate(next.getDate()+14);else if(plan.cycle==='monthly'){const d=next.getDate();next.setMonth(next.getMonth()+1);if(next.getDate()!==d)next.setDate(0)}else{if(next.getDate()===1)next.setDate(15);else{next.setMonth(next.getMonth()+1);next.setDate(1)}}}}$('v12PlanSummary').textContent=final?`Planned ${fmt(pay)} per payday · ${periods} estimated paydays through deployment end · ${fmt(pay*periods)} planned deposits (not included in your current balance).`:`Planned ${fmt(pay)} per payday. Set a deployment end date to estimate remaining paydays.`}else{$('v12PlanSummary').textContent='Set a future payday and amount to estimate planned deposits. This never adds money to your recorded balance.'}
const hidden=!!window.vaultPrivate;for(const e of document.querySelectorAll('.v12-metric strong,.v12-health strong,.v12-tx-amount,#v12PlanSummary'))e.classList.toggle('privacy-hidden-v12',hidden);
}
const plan=read(PLAN)||{};$('v12PayAmount').value=plan.amount??'';$('v12PayDate').value=plan.date||'';$('v12PayCycle').value=plan.cycle||'semi';
$('v12SavePlan').onclick=()=>{const amount=Number($('v12PayAmount').value),date=$('v12PayDate').value,cycle=$('v12PayCycle').value;if(!Number.isFinite(amount)||amount<0||!date){alert('Enter a nonnegative amount and payday date.');return}localStorage.setItem(PLAN,JSON.stringify({amount,date,cycle}));render()};
$('v12Export').onclick=()=>document.getElementById('export').click();
$('v12BackupCheck').onclick=()=>{const b=getData(),x=read(EXTRA);if(!b||!b.transactions.every(t=>['deposit','withdrawal'].includes(t.type)&&Number.isFinite(t.amount)&&t.amount>0)){alert('Record validation failed. Export your data and review transactions.');return}if(x&&(!Array.isArray(x.goals)||!x.goals.every(g=>Number.isFinite(g.allocated)&&g.allocated>=0))){alert('Optional goal validation failed.');return}alert(`Local records look structurally valid: ${b.transactions.length} transactions and ${x?.goals?.length||0} optional goals. This is not a full backup restoration test.`)};
window.addEventListener('vault-updated',render);
$('privacyToggle')?.addEventListener('click',()=>setTimeout(render,0));
const history=$('history');if(history){const obs=new MutationObserver(()=>{clearTimeout(obs.wait);obs.wait=setTimeout(render,80)});obs.observe(history,{childList:true})}
render();
})();

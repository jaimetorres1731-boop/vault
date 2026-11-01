(()=>{'use strict';
const $=id=>document.getElementById(id), key='vault-deployment-v3';
const money=n=>new Intl.NumberFormat('en-US',{style:'currency',currency:'USD'}).format(n);
const read=()=>{try{return JSON.parse(localStorage.getItem(key)||'{}')}catch{return {}}};
const number=x=>Number.isFinite(Number(x))?Number(x):0;
const dayDiff=(a,b)=>Math.max(0,Math.ceil((new Date(b+'T12:00:00')-new Date(a+'T12:00:00'))/86400000));
function metrics(){const d=read(),s=d.settings||{},tx=Array.isArray(d.transactions)?d.transactions:[];
 const deposits=tx.filter(t=>t.type==='deposit').reduce((a,t)=>a+number(t.amount),0),withdrawals=tx.filter(t=>t.type==='withdrawal').reduce((a,t)=>a+number(t.amount),0);
 const balance=number(s.starting)+deposits-withdrawals,goal=number(s.goal),end=s.end||'',today=new Date().toISOString().slice(0,10),remaining=end?dayDiff(today,end):null;
 const months=remaining===null?null:remaining/30.4375,required=goal>0&&months>0?Math.max(0,goal-balance)/months:null;
 return {s,tx,deposits,withdrawals,balance,goal,end,today,remaining,months,required};}
function metric(name,value){const d=document.createElement('div');d.className='v25-metric';const label=document.createElement('span');label.textContent=name;const strong=document.createElement('strong');strong.textContent=value;d.append(label,strong);return d}
function addPanel(page,title,description){const p=$('vault-page-'+page)?.querySelector('.vault-page-content');if(!p)return null;const card=document.createElement('section');card.className='card full v25-card';const h=document.createElement('h2');h.textContent=title;const intro=document.createElement('p');intro.className='footnote';intro.textContent=description;card.append(h,intro);p.append(card);return card}
function init(){
 const goals=addPanel('goals','Savings pace & milestones','Your remaining deployment time determines how much you need to save to hit your target.');
 const pace=document.createElement('div');pace.className='v25-metrics';goals?.append(pace);
 const insights=addPanel('insights','Deployment savings simulator','Try different monthly contributions and deployment-related expenses. These estimates do not change saved records.');
 if(!insights)return;
 const controls=document.createElement('div');controls.className='v25-controls';
 function input(label,defaultValue){const w=document.createElement('label');w.textContent=label;const el=document.createElement('input');el.type='number';el.min='0';el.max='1000000';el.step='0.01';el.value=defaultValue;w.append(el);controls.append(w);return el}
 const save=input('Monthly amount you plan to save ($)',500),expense=input('Extra deployment expenses per month ($)',0);
 insights.append(controls);const forecast=document.createElement('div');forecast.className='v25-metrics';insights.append(forecast);
 const report=addPanel('insights','Deployment savings report','A summary of recorded savings and withdrawals. Export a CSV for your own records.');
 const reportMetrics=document.createElement('div');reportMetrics.className='v25-metrics';report.append(reportMetrics);
 const download=document.createElement('button');download.type='button';download.className='btn';download.textContent='Download deployment report (CSV)';report.append(download);
 const status=document.createElement('p');status.className='footnote';status.setAttribute('role','status');report.append(status);
 function refresh(){const m=metrics();pace.replaceChildren();forecast.replaceChildren();reportMetrics.replaceChildren();
 pace.append(metric('Remaining days',m.remaining===null?'Set an end date':String(m.remaining)),metric('Savings target',m.goal>0?money(m.goal):'Set a goal'),metric('Required per month',m.required===null?'Set goal and future end date':money(m.required)));
 for(const milestone of [5000,10000,25000,50000,75000,100000]){if(m.goal>0&&milestone>m.goal)continue;pace.append(metric(money(milestone)+' milestone',m.balance>=milestone?'Reached':money(Math.max(0,milestone-m.balance))+' remaining'))}
 const monthly=Math.max(0,number(save.value)),extra=Math.max(0,number(expense.value)),months=m.months;
 forecast.append(metric('Current savings',money(m.balance)),metric('Projected end balance',months===null?'Set deployment end date':money(m.balance+(monthly-extra)*months)),metric('Estimated goal difference',months===null||m.goal<=0?'Set goal and end date':money(m.balance+(monthly-extra)*months-m.goal)));
 reportMetrics.append(metric('Total deposits',money(m.deposits)),metric('Total withdrawals',money(m.withdrawals)),metric('Net recorded savings',money(m.balance)),metric('Transactions',String(m.tx.length)));
 }
 function validInput(el){return el.value.trim()!==''&&Number.isFinite(Number(el.value))&&Number(el.value)>=0&&Number(el.value)<=1000000}
 for(const el of [save,expense])el.addEventListener('input',()=>{if(validInput(save)&&validInput(expense)){status.textContent='';refresh()}else status.textContent='Enter nonnegative amounts up to $1,000,000.'});
 download.onclick=()=>{const m=metrics(),rows=[['Vault deployment savings report',m.today],['Current savings',m.balance],['Goal',m.goal],['Deployment end date',m.end],['Deposits',m.deposits],['Withdrawals',m.withdrawals],['Transaction count',m.tx.length],[],['Date','Type','Amount','Category','Note'],...m.tx.map(t=>[t.date,t.type,t.amount,t.category||'',t.note||''])];const csv=rows.map(row=>row.map(v=>'"'+String(v??'').replace(/"/g,'""')+'"').join(',')).join('\r\n');const blob=new Blob([csv],{type:'text/csv;charset=utf-8'}),url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download='vault-deployment-report-'+m.today+'.csv';a.click();setTimeout(()=>URL.revokeObjectURL(url),2000)};
 const billsTitle=$('vault-page-bills')?.querySelector('h2');if(billsTitle)billsTitle.textContent='Deployment Expenses';
 const billsLink=[...document.querySelectorAll('.vault-nav-link')].find(a=>a.getAttribute('href')==='#bills');if(billsLink){const t=billsLink.querySelector('.vault-nav-text');if(t)t.textContent='Deployment Expenses'}
 // Keep simulator and milestones synchronized with the existing transaction and goal UI.
 document.addEventListener('click',e=>{if(e.target.closest('#transactionForm,#settingsForm,#addShortcut,#withdrawShortcut,.textbutton'))setTimeout(refresh,50)});
 window.addEventListener('storage',refresh);document.addEventListener('visibilitychange',()=>{if(!document.hidden)refresh()});
 refresh();
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init);else init();
})();

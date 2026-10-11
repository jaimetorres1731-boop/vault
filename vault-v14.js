(()=>{
'use strict';
const key='vault-deployment-v3',money=n=>new Intl.NumberFormat('en-US',{style:'currency',currency:'USD'}).format(n);
const el=(tag,txt,cls)=>{const e=document.createElement(tag);if(txt!==undefined)e.textContent=txt;if(cls)e.className=cls;return e};
const monthName=k=>{const [y,m]=k.split('-').map(Number);return new Date(y,m-1,1).toLocaleDateString('en-US',{month:'short',year:'numeric'})};
const now=new Date(),current=`${now.getFullYear()}-${String(now.getMonth()+1).padStart(2,'0')}`,previous=(()=>{const d=new Date(now.getFullYear(),now.getMonth()-1,1);return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}`})();
const insights=document.createElement('section');insights.className='card full vault-v14';insights.id='vaultAdvancedInsights';
insights.innerHTML=`<div class="split"><div><span class="v12-kicker">YOUR SAVINGS PATTERNS</span><h2>Advanced savings insights</h2></div><span class="small">V1.4</span></div><p class="footnote">Based only on transactions recorded in Vault. Comparisons exclude starting savings and planned deposits.</p><div id="vaultV14Metrics" class="vault-v14-metrics" aria-live="polite"></div><div class="vault-v14-two"><div class="vault-v14-panel"><h3>Last 6 calendar months</h3><p class="footnote">Monthly net savings (deposits minus withdrawals)</p><div id="vaultV14Chart" class="vault-v14-chart" role="img" aria-label="Monthly net savings chart"></div></div><div class="vault-v14-panel"><h3>What your records show</h3><div id="vaultV14Notes" class="vault-v14-notes"></div></div></div>`;
function place(){const page=document.getElementById('vault-page-insights');if(!page)return;const content=page.querySelector('.vault-page-content');if(content&&!insights.isConnected)content.prepend(insights)}
function render(){
place();if(!insights.isConnected)return;
let data;try{data=JSON.parse(localStorage.getItem(key)||'null')}catch{}
const tx=Array.isArray(data?.transactions)?data.transactions:[];
const months=new Map();
for(let i=5;i>=0;i--){const d=new Date(now.getFullYear(),now.getMonth()-i,1);months.set(`${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}`,{in:0,out:0,count:0})}
const full=new Map();
for(const t of tx){const k=String(t.date||'').slice(0,7);if(!/^\d{4}-\d{2}$/.test(k)||k>current||!['deposit','withdrawal'].includes(t.type))continue;const n=Number(t.amount);if(!Number.isFinite(n)||n<=0)continue;if(!full.has(k))full.set(k,{in:0,out:0,count:0});const v=full.get(k);v[t.type==='deposit'?'in':'out']+=n;v.count++;if(months.has(k)){const m=months.get(k);m[t.type==='deposit'?'in':'out']+=n;m.count++}}
const thisMonth=full.get(current)||{in:0,out:0},lastMonth=full.get(previous)||{in:0,out:0};
const net=v=>v.in-v.out,delta=net(thisMonth)-net(lastMonth);
const metrics=document.getElementById('vaultV14Metrics');metrics.replaceChildren();
const addMetric=(title,value,detail)=>{const m=el('div',undefined,'vault-v14-metric');m.append(el('span',title),el('strong',value),el('small',detail));metrics.append(m)};
addMetric('This month (net)',money(net(thisMonth)),'Deposits minus withdrawals');
addMetric('Previous month (net)',money(net(lastMonth)),'Calendar month total');
addMetric('Month-over-month',`${delta>=0?'+':'−'}${money(Math.abs(delta))}`,`Compared with ${monthName(previous)} · current month is incomplete`);
const six=[...months.entries()],values=six.map(([,v])=>net(v)),max=Math.max(1,...values.map(v=>Math.abs(v)));
const chart=document.getElementById('vaultV14Chart');chart.replaceChildren();
for(const [k,v] of six){const amount=net(v);const row=el('div',undefined,'vault-v14-bar-row');const label=el('span',monthName(k),'vault-v14-month');const track=el('div',undefined,'vault-v14-track');const bar=el('div',undefined,'vault-v14-bar '+(amount<0?'negative':'positive'));bar.style.width=`${Math.abs(amount)/max*100}%`;track.append(bar);row.append(label,track,el('span',money(amount),'vault-v14-value'));chart.append(row)}
const notes=document.getElementById('vaultV14Notes');notes.replaceChildren();
const active=[...full.entries()].sort((a,b)=>a[0].localeCompare(b[0])).filter(([,v])=>v.count>0);
const completed=active.filter(([k])=>k<current),lastThree=completed.slice(-3);
const avg=lastThree.length?lastThree.reduce((s,[,v])=>s+net(v),0)/lastThree.length:0;
const totalWithdraw=tx.reduce((s,t)=>t.type==='withdrawal'&&Number.isFinite(Number(t.amount))?s+Math.max(0,Number(t.amount)):s,0);
const statements=[
lastThree.length?`Average net savings across your last ${lastThree.length} completed active month${lastThree.length===1?'':'s'}: ${money(avg)}.`:'Record transactions in a completed month to see a historical savings average.',
`Recorded withdrawals across all transactions: ${money(totalWithdraw)}.`,
active.length?`You have activity in ${active.length} calendar month${active.length===1?'':'s'} through today.`:'No transaction history recorded yet. Add deposits or withdrawals to start seeing patterns.',
'These figures describe past activity, not guaranteed future savings. A month with no recorded transactions is not treated as a zero-activity month in the active-month average.'
];for(const statement of statements)notes.append(el('p',statement));
}
window.addEventListener('vault-updated',render);
window.addEventListener('storage',e=>{if(e.key===key)render()});
const history=document.getElementById('history');if(history){let timeout;new MutationObserver(()=>{clearTimeout(timeout);timeout=setTimeout(render,120)}).observe(history,{childList:true})}
render();
})();

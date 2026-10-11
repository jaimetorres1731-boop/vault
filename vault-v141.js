(()=>{
'use strict';
const KEY='vault-deployment-v3';
const categories={deposit:['Paycheck','Bonus','Gift','Transfer','Other'],withdrawal:['Bills','Shopping','Emergency','Transfer','Other']};
const type=document.getElementById('type'),cat=document.getElementById('txCategory'),filter=document.getElementById('txCategoryFilter');
const panel=document.getElementById('vault-page-insights')?.querySelector('.vault-page-content');
if(!type||!cat||!filter)return;
function setOptions(){const current=cat.value;cat.replaceChildren(new Option('Uncategorized',''));for(const label of categories[type.value]||[])cat.add(new Option(label,label));if([...cat.options].some(o=>o.value===current))cat.value=current}
type.addEventListener('change',setOptions);setOptions();
const insight=document.createElement('section');insight.className='card full vault-cat-insight';insight.id='vaultCategoryInsights';
insight.innerHTML='<h2>Transaction categories</h2><p class="footnote">Breakdown of recorded deposits and withdrawals by category. Older records without categories appear as Uncategorized.</p><div class="vault-cat-columns"><div><h3>Money added</h3><div id="vaultCatDeposits"></div></div><div><h3>Money withdrawn</h3><div id="vaultCatWithdrawals"></div></div></div>';
if(panel)panel.insertBefore(insight,panel.children[1]||null);
const money=n=>new Intl.NumberFormat('en-US',{style:'currency',currency:'USD'}).format(n);
function render(){
let data;try{data=JSON.parse(localStorage.getItem(KEY)||'null')}catch{}
const tx=Array.isArray(data?.transactions)?data.transactions:[];
const existing=filter.value;
const names=new Set(tx.map(t=>t.category||'').filter(Boolean));
for(const list of Object.values(categories))for(const name of list)names.add(name);
filter.replaceChildren(new Option('All categories','all'),new Option('Uncategorized',''));
for(const name of [...names].sort())filter.add(new Option(name,name));
filter.value=[...filter.options].some(o=>o.value===existing)?existing:'all';
for(const [kind,target] of [['deposit','vaultCatDeposits'],['withdrawal','vaultCatWithdrawals']]){
const totals=new Map();
for(const t of tx){if(t.type!==kind)continue;const amount=Number(t.amount);if(!Number.isFinite(amount)||amount<=0)continue;const name=t.category||'Uncategorized';totals.set(name,(totals.get(name)||0)+amount)}
const host=document.getElementById(target);if(!host)continue;host.replaceChildren();
const rows=[...totals].sort((a,b)=>b[1]-a[1]);if(!rows.length){const p=document.createElement('p');p.className='footnote';p.textContent='No recorded transactions yet.';host.append(p);continue}
const max=Math.max(...rows.map(x=>x[1]));
for(const [name,value] of rows){const row=document.createElement('div');row.className='vault-cat-row';const heading=document.createElement('div');heading.className='vault-cat-row-heading';const title=document.createElement('span');title.textContent=name;const amt=document.createElement('strong');amt.textContent=money(value);heading.append(title,amt);const track=document.createElement('div');track.className='vault-cat-track';const bar=document.createElement('div');bar.className='vault-cat-bar';bar.style.width=`${value/max*100}%`;track.append(bar);row.append(heading,track);host.append(row)}
}
}
window.addEventListener('vault-updated',render);
window.addEventListener('storage',e=>{if(e.key===KEY)render()});
const history=document.getElementById('history');
if(history){let timer;new MutationObserver(()=>{clearTimeout(timer);timer=setTimeout(render,150)}).observe(history,{childList:true})}
render();
})();

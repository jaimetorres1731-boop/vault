
(()=>{'use strict';
const $=id=>document.getElementById(id);
const MAIN='vault-deployment-v3',UI='vault-v40-preferences';
const defaults={theme:'navy',order:[],hidden:[]};
let prefs;try{prefs={...defaults,...JSON.parse(localStorage.getItem(UI)||'{}')}}catch{prefs={...defaults}}
const safe=(s)=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const get=()=>{try{const data=JSON.parse(localStorage.getItem(MAIN)||'null');return data&&data.settings&&Array.isArray(data.transactions)?data:{settings:{starting:0,goal:0,start:'',end:''},transactions:[]}}catch{return {settings:{starting:0,goal:0,start:'',end:''},transactions:[]}}};
const save=()=>{try{localStorage.setItem(UI,JSON.stringify(prefs))}catch{}};
const card=(title,html)=>{const el=document.createElement('section');el.className='v40-panel';el.innerHTML='<h3>'+title+'</h3>'+html;return el};
const field=(id,label,type='text')=>'<div><label for="'+id+'">'+label+'</label><input id="'+id+'" type="'+type+'"></div>';
function ready(){
 const home=$('vault-page-home')?.querySelector('.vault-page-content');
 const transactions=$('activity');
 const insights=$('vault-page-insights')?.querySelector('.vault-page-content');
 const settings=$('vault-page-settings')?.querySelector('.vault-page-content');
 if(!home||!transactions||!insights||!settings)return;
 document.body.dataset.v40Theme=prefs.theme;
 // Quick add uses existing validated transaction form to preserve data integrity.
 const quick=card('Quick add','<p class="v40-muted">Record a deposit or withdrawal without leaving the dashboard.</p><div class="v40-fields"><div><label for="v40Type">Type</label><select id="v40Type"><option value="deposit">Deposit</option><option value="withdrawal">Withdrawal</option></select></div>'+field('v40Amount','Amount ($)','number')+'</div>'+field('v40Note','Note (optional)')+'<div class="v40-row"><button class="btn primary" id="v40Add">Save transaction</button></div><p id="v40QuickMsg" class="v40-muted" role="status"></p>');
 home.insertBefore(quick,home.children[1]||null);
 $('v40Amount').min='0.01';$('v40Amount').step='0.01';$('v40Note').maxLength=100;
 $('v40Add').onclick=()=>{
 const amount=Number($('v40Amount').value),data=get();
 if(!Number.isFinite(amount)||amount<=0){$('v40QuickMsg').textContent='Enter a positive amount.';return}
 if(!data){$('v40QuickMsg').textContent='Savings data unavailable.';return}
 const bal=Number(data.settings?.starting||0)+data.transactions.reduce((n,t)=>n+(t.type==='deposit'?Number(t.amount):-Number(t.amount)),0);
 if($('v40Type').value==='withdrawal'&&amount>bal){$('v40QuickMsg').textContent='Withdrawal exceeds savings.';return}
 $('type').value=$('v40Type').value;$('amount').value=amount.toFixed(2);
 $('date').value=new Date().toLocaleDateString('en-CA');if(!$('date').value.match(/^\d{4}-\d\d-\d\d$/)){const d=new Date();$('date').value=[d.getFullYear(),String(d.getMonth()+1).padStart(2,'0'),String(d.getDate()).padStart(2,'0')].join('-')}
 $('note').value=$('v40Note').value;$('txCategory').value='';
 const before=(get().transactions||[]).length;$('transactionForm').requestSubmit();const after=(get().transactions||[]).length;const success=after===before+1;$('v40QuickMsg').textContent=success?'Transaction saved.':'Transaction not saved. Review the transaction form.';if(success){$('v40Amount').value='';$('v40Note').value=''}
 };
 // Enhanced filters work alongside the existing text, type, category filters.
 const filter=card('More transaction filters','<div class="v40-fields">'+field('v40From','From','date')+field('v40To','Through','date')+'<div><label for="v40Sort">Sort transactions</label><select id="v40Sort"><option value="newest">Newest first</option><option value="oldest">Oldest first</option><option value="high">Highest amount</option><option value="low">Lowest amount</option></select></div></div><div class="v40-row"><button class="btn" id="v40ClearFilters">Clear additional filters</button></div>');
 transactions.append(filter);
 const history=$('history');
 let busy=false;
 function applyFilters(){
  if(busy)return;busy=true;
  const from=$('v40From').value,to=$('v40To').value,sort=$('v40Sort').value;
  const data=get();
  const rows=[...history.querySelectorAll('li')];
  rows.forEach(li=>{
    const text=li.querySelector('small')?.textContent||'';
    const day=text.slice(0,10);
    li.hidden=!!((from&&day<from)||(to&&day>to));
  });
  {
   const ordered=rows.map((li,i)=>({li,i,day:li.querySelector('small')?.textContent.slice(0,10)||'',amount:Number((li.querySelector('.txright strong')?.textContent||'').replace(/[^0-9.]/g,''))||0}));
   ordered.sort((a,b)=>sort==='oldest'?a.day.localeCompare(b.day)||a.i-b.i:sort==='newest'?b.day.localeCompare(a.day)||a.i-b.i:sort==='high'?b.amount-a.amount||a.i-b.i:a.amount-b.amount||a.i-b.i);
   ordered.forEach((x,i)=>{if(history.children[i]!==x.li)history.insertBefore(x.li,history.children[i]||null)});
  }
  busy=false;
 }
 const observer=new MutationObserver(()=>{if(!busy)requestAnimationFrame(applyFilters)});
 observer.observe(history,{childList:true});
 for(const id of ['v40From','v40To','v40Sort'])$(id).addEventListener('change',applyFilters);
 $('v40ClearFilters').onclick=()=>{for(const id of ['v40From','v40To'])$(id).value='';$('v40Sort').value='newest';$('txSearch').value='';$('txFilter').value='all';$('txSearch').dispatchEvent(new Event('input'));applyFilters()};
 // Customizable home cards, preserving the primary savings balance.
 
 
 const dashboard=card('Customize homepage','<p class="v40-muted">Hide or reorder cards. The primary balance stays visible.</p><div id="v40CardList"></div><div class="v40-row"><button class="btn" id="v40ResetLayout">Reset layout</button></div>');
 settings.append(dashboard);
 const cards=()=>[...home.children].filter(el=>el!==quick&&el!==dashboard&&el.matches('.card,.vault-countdown,#vaultMonthlyPulse')); 
 cards().forEach((el,i)=>{if(!el.dataset.v40Id)el.dataset.v40Id=el.id||'home-card-'+i});
 const primary=cards().find(el=>el.querySelector('#balance'))?.dataset.v40Id;
 function applyLayout(){
 const list=cards();
 for(const id of prefs.order){const el=list.find(x=>x.dataset.v40Id===id);if(el)home.append(el)}
 for(const el of cards())el.hidden=el.dataset.v40Id!==primary&&prefs.hidden.includes(el.dataset.v40Id);
 }
 function renderLayout(){
 const list=$('v40CardList');list.replaceChildren();
 cards().forEach((el,i)=>{
  const id=el.dataset.v40Id,locked=id===primary,row=document.createElement('div');row.className='v40-item';
  const title=document.createElement('span');title.textContent=el.querySelector('h2,h3')?.textContent.trim()|| (locked?'Savings balance':id);
  const controls=document.createElement('div');controls.className='v40-row';controls.style.margin=0;
  const toggle=document.createElement('button');toggle.className='btn';toggle.textContent=locked?'Always visible':prefs.hidden.includes(id)?'Show':'Hide';toggle.disabled=locked;
  toggle.onclick=()=>{prefs.hidden=prefs.hidden.includes(id)?prefs.hidden.filter(x=>x!==id):[...prefs.hidden,id];save();applyLayout();renderLayout()};
  const up=document.createElement('button');up.className='btn';up.textContent='↑';up.disabled=i===0||locked;up.setAttribute('aria-label','Move card up');
  up.onclick=()=>{const arr=cards(),idx=arr.findIndex(x=>x.dataset.v40Id===id);if(idx>0&&arr[idx-1].dataset.v40Id!==primary){home.insertBefore(el,arr[idx-1]);prefs.order=cards().map(x=>x.dataset.v40Id);save();renderLayout()}};
  const down=document.createElement('button');down.className='btn';down.textContent='↓';down.disabled=i===cards().length-1||locked;down.setAttribute('aria-label','Move card down');
  down.onclick=()=>{const arr=cards(),idx=arr.findIndex(x=>x.dataset.v40Id===id);if(idx<arr.length-1){home.insertBefore(arr[idx+1],el);prefs.order=cards().map(x=>x.dataset.v40Id);save();renderLayout()}};
  controls.append(toggle,up,down);row.append(title,controls);list.append(row);
 });
 }
 $('v40ResetLayout').onclick=()=>{prefs.order=[];prefs.hidden=[];save();cards().forEach((el,i)=>{el.hidden=false});renderLayout()};
 applyLayout();renderLayout();
 // Theme selector.
 const theme=card('Color theme','<label for="v40Theme">Color theme</label><select id="v40Theme"><option value="navy">Premium navy</option><option value="midnight">Midnight black</option><option value="emerald">Emerald</option><option value="slate">Slate</option></select><p class="v40-muted">Your theme is saved on this device.</p>');
 const existingAppearance=[...settings.querySelectorAll('.vault-experience-card')].find(el=>el.querySelector('h3')?.textContent==='Appearance');if(existingAppearance){existingAppearance.querySelector('h3').textContent='Appearance & accent';existingAppearance.append(theme)}else settings.append(theme);$('v40Theme').value=prefs.theme;$('v40Theme').onchange=e=>{prefs.theme=e.target.value;document.body.dataset.v40Theme=prefs.theme;save()};
 // Print-to-PDF report; generated locally using browser print dialog.
 const report=card('PDF monthly savings report','<p class="v40-muted">Choose a month and select Save as PDF in your browser print dialog.</p><div class="v40-fields">'+field('v40Month','Report month','month')+'</div><div class="v40-row"><button class="btn primary" id="v40Print">Create PDF report</button></div>');
 insights.append(report);$('v40Month').value=new Date().toISOString().slice(0,7);
 $('v40Print').onclick=()=>{
 const data=get(),month=$('v40Month').value;if(!data||!/^\d{4}-\d{2}$/.test(month))return;
 const tx=[...data.transactions].sort((a,b)=>a.date.localeCompare(b.date));
 const before=tx.filter(t=>t.date<month).reduce((n,t)=>n+(t.type==='deposit'?Number(t.amount):-Number(t.amount)),Number(data.settings.starting)||0);
 const inMonth=tx.filter(t=>t.date.startsWith(month)),deposits=inMonth.filter(t=>t.type==='deposit').reduce((n,t)=>n+Number(t.amount),0),withdrawals=inMonth.filter(t=>t.type==='withdrawal').reduce((n,t)=>n+Number(t.amount),0);
 const fmt=n=>new Intl.NumberFormat('en-US',{style:'currency',currency:'USD'}).format(n);
 const w=window.open('','_blank');if(!w){alert('Allow popups to generate the report.');return}
 const rows=inMonth.map(t=>'<tr><td>'+safe(t.date)+'</td><td>'+safe(t.type)+'</td><td>'+safe(t.category||'—')+'</td><td>'+safe(t.note||'')+'</td><td>'+fmt(t.amount)+'</td></tr>').join('');
 w.document.write('<!doctype html><html><head><title>Vault Report '+safe(month)+'</title><style>body{font:14px system-ui;padding:35px;color:#132237}h1{color:#133b60}table{width:100%;border-collapse:collapse}td,th{border-bottom:1px solid #ccd6df;text-align:left;padding:8px}header{margin-bottom:26px}.summary{display:grid;grid-template-columns:repeat(2,1fr);gap:14px;margin:20px 0}.summary div{padding:14px;border:1px solid #cbd5df;border-radius:9px}@media print{button{display:none}}</style></head><body><header><h1>VAULT · Monthly savings report</h1><p>'+safe(month)+'</p></header><div class="summary"><div>Starting balance<br><b>'+fmt(before)+'</b></div><div>Deposits<br><b>'+fmt(deposits)+'</b></div><div>Withdrawals<br><b>'+fmt(withdrawals)+'</b></div><div>Net saved<br><b>'+fmt(deposits-withdrawals)+'</b></div><div>Ending balance<br><b>'+fmt(before+deposits-withdrawals)+'</b></div></div><h2>Transactions</h2><table><thead><tr><th>Date</th><th>Type</th><th>Category</th><th>Note</th><th>Amount</th></tr></thead><tbody>'+rows+'</tbody></table><p>Private local report · Not a bank statement</p><button onclick="window.print()">Print / Save as PDF</button></body></html>');w.document.close();w.focus();setTimeout(()=>w.print(),350);
 };
 // Safer import: intercept before legacy importer, validate and preview before confirmation.
 const backup=card('Verified savings-only backup','<p class="v40-muted">This JSON contains savings settings and transactions only, not optional goals, planners or preferences. For a complete backup of Vault data, use Download full backup in Data & backup. Neither backup includes your PIN. Keep backup files private.</p><div class="v40-row"><button class="btn" id="v40Backup">Download verified backup</button></div><label for="v40Restore">Preview a backup before restoring</label><input type="file" id="v40Restore" accept=".json,application/json"><div id="v40RestorePreview" class="v40-preview" role="status"></div><div class="v40-row"><button class="btn" id="v40ConfirmRestore" hidden>Confirm restore</button></div>');
 settings.append(backup);
 $('v40Backup').onclick=()=>{const data=get();if(!data)return;const payload={app:'deployment-savings-tracker',version:4,exportedAt:new Date().toISOString(),settings:data.settings,transactions:data.transactions};const url=URL.createObjectURL(new Blob([JSON.stringify(payload,null,2)],{type:'application/json'}));const a=document.createElement('a');a.href=url;a.download='vault-backup-'+new Date().toISOString().slice(0,10)+'.json';a.click();setTimeout(()=>URL.revokeObjectURL(url),3000);window.dispatchEvent(new Event('vault-backup-created'));};
 let candidate=null,selection=0,loading=false;
 const realDate=s=>{if(!/^\d{4}-\d{2}-\d{2}$/.test(s))return false;const [y,m,d]=s.split('-').map(Number);if(y<1||m<1||m>12||d<1)return false;return d<=new Date(Date.UTC(y,m,0)).getUTCDate()};
 $('v40Restore').onchange=async e=>{const seq=++selection;candidate=null;loading=true;$('v40ConfirmRestore').hidden=true;$('v40ConfirmRestore').disabled=true;const f=e.target.files[0];$('v40RestorePreview').textContent=f?'Checking selected backup…':'';if(!f){loading=false;return}try{if(f.size>5000000)throw Error('File is too large');const obj=JSON.parse(await f.text());if(seq!==selection)return;if(obj.app!=='deployment-savings-tracker'||!obj.settings||!Array.isArray(obj.transactions)||obj.transactions.length>100000||!Number.isFinite(Number(obj.settings.starting))||Number(obj.settings.starting)<0||!Number.isFinite(Number(obj.settings.goal))||Number(obj.settings.goal)<0||obj.transactions.some(t=>!t||!['deposit','withdrawal'].includes(t.type)||!Number.isFinite(t.amount)||t.amount<=0||!realDate(t.date)||typeof t.id!=='string'))throw Error('Not a valid Vault backup');candidate={settings:obj.settings,transactions:obj.transactions,preferences:obj.preferences};$('v40RestorePreview').textContent='Backup is valid. '+obj.transactions.length+' transactions; savings goal: $'+Number(obj.settings.goal).toFixed(2)+'. Restoring will replace current savings records.';$('v40ConfirmRestore').hidden=false;$('v40ConfirmRestore').disabled=false}catch(err){if(seq===selection)$('v40RestorePreview').textContent=err.message}finally{if(seq===selection)loading=false}};
 $('v40ConfirmRestore').onclick=()=>{if(loading||!candidate||!confirm('Replace all current savings records with this backup? This cannot be undone unless you have another backup.'))return;try{localStorage.setItem(MAIN,JSON.stringify({settings:candidate.settings,transactions:candidate.transactions}));if(candidate.preferences&&typeof candidate.preferences==='object')localStorage.setItem(UI,JSON.stringify(candidate.preferences));location.reload()}catch{alert('Unable to save restored records.')}};
 // Connection indicator.
 const status=document.createElement('div');status.className='v40-muted';status.style.margin='12px 0';status.setAttribute('role','status');status.id='v40Offline';
 const updateStatus=()=>status.textContent=navigator.onLine?'● Online · Vault records stay on this device':'● Offline · Existing saved records remain available';
 settings.append(status);addEventListener('online',updateStatus);addEventListener('offline',updateStatus);updateStatus();
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',ready);else ready();
})();

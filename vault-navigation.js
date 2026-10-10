
(()=>{'use strict';
const $=id=>document.getElementById(id);
const root=$('dashboard'),sidebar=document.querySelector('.sidebar'),mobile=document.querySelector('.mobile-nav');
if(!root||!sidebar||!mobile)return;
const definitions=[
{id:'home',name:'Dashboard',icon:'⌂',desc:'Your savings balance, deployment progress and next steps.'},
{id:'transactions',name:'Transactions',icon:'⇄',desc:'Record, review and correct deposits and withdrawals.'},
{id:'goals',name:'Savings Goals',icon:'◎',desc:'Primary savings goal, optional goals and milestones.'},
{id:'calendar',name:'Calendar',icon:'▦',desc:'Review savings activity by date.'},
{id:'insights',name:'Insights',icon:'↗',desc:'Forecasts, reports, checkpoints and financial health.'},
{id:'payday',name:'Payday Planner',icon:'▣',desc:'Plan recurring payday savings and set reminders.'},
{id:'settings',name:'Settings',icon:'⚙',desc:'Privacy, backups, data protection and deployment settings.'}
];
const oldChildren=[...root.children];
const find=id=>document.getElementById(id);
const used=new Set();
function take(el,panel){if(el&&!used.has(el)){used.add(el);panel.append(el)}}
const pages={};
for(const def of definitions){
 const page=document.createElement('section');page.className='vault-page';page.id='vault-page-'+def.id;page.setAttribute('aria-label',def.name);
 const head=document.createElement('div');head.className='vault-page-heading';
 const text=document.createElement('div');const h=document.createElement('h2');h.textContent=def.name;const p=document.createElement('p');p.textContent=def.desc;text.append(h,p);head.append(text);
 const content=document.createElement('div');content.className='vault-page-content';page.append(head,content);pages[def.id]=content;root.append(page)
}
// Preserve every original node and its event listeners. Only reorganize DOM locations.
take(find('v12Overview'),pages.home);
take(oldChildren[0],pages.home);
take(oldChildren[1],pages.home);
take(oldChildren[5],pages.home);
take(find('plan'),pages.transactions);
take(find('activity'),pages.transactions);
take(find('v12Activity'),pages.transactions);
take(find('goals'),pages.goals);
take(find('calendarSection'),pages.calendar);
take(oldChildren[2],pages.insights);
take(oldChildren[3],pages.insights);
take(find('insights'),pages.insights);
take(find('monthlyReport'),pages.insights);
take(find('v12Health'),pages.insights);
take(find('v12Planner'),pages.payday);
take(find('reminders'),pages.payday);
take(find('data'),pages.settings);
take(find('v12Recovery'),pages.settings);
for(const item of oldChildren)if(!used.has(item))take(item,pages.settings);
root.classList.remove('grid');root.classList.add('vault-pages');
const nav=sidebar.querySelector('.nav');
if(nav)nav.remove();
const collapsedKey='vault-sidebar-collapsed';
const collapse=document.createElement('button');collapse.className='vault-nav-collapse';collapse.type='button';
const label=document.createElement('span');label.className='vault-collapse-text';
const symbol=document.createElement('span');symbol.setAttribute('aria-hidden','true');collapse.append(symbol,label);
function updateCollapse(){const closed=document.body.classList.contains('vault-side-collapsed');symbol.textContent=closed?'»':'«';label.textContent=closed?'':'  Collapse sidebar';collapse.setAttribute('aria-label',closed?'Expand sidebar':'Collapse sidebar');collapse.title=closed?'Expand sidebar':'Collapse sidebar';collapse.setAttribute('aria-expanded',String(!closed))}
try{if(localStorage.getItem(collapsedKey)==='true')document.body.classList.add('vault-side-collapsed')}catch{}
collapse.onclick=()=>{document.body.classList.toggle('vault-side-collapsed');try{localStorage.setItem(collapsedKey,String(document.body.classList.contains('vault-side-collapsed')))}catch{}updateCollapse()};
updateCollapse();sidebar.insertBefore(collapse,sidebar.querySelector('.sidebar-note'));
const navlinks=document.createElement('nav');navlinks.className='vault-nav-links';navlinks.setAttribute('aria-label','Vault sections');sidebar.insertBefore(navlinks,sidebar.querySelector('.sidebar-note'));
mobile.replaceChildren();mobile.classList.add('vault-mobile-nav');mobile.setAttribute('aria-label','Mobile sections');
const moreMenu=document.createElement('div');moreMenu.className='vault-mobile-menu';moreMenu.id='vaultMobileMore';moreMenu.setAttribute('aria-label','More sections');document.body.append(moreMenu);
function link(def,short=false){const a=document.createElement('a');a.href='#'+def.id;a.className='vault-nav-link';a.title=def.name;const ic=document.createElement('span');ic.className='vault-nav-icon';ic.setAttribute('aria-hidden','true');ic.textContent=def.icon;const t=document.createElement('span');t.className='vault-nav-text';t.textContent=short&&def.id==='transactions'?'Activity':short&&def.id==='settings'?'Settings':def.name;a.append(ic,t);a.onclick=e=>{e.preventDefault();activate(def.id);history.replaceState(null,'','#'+def.id)};return a}
for(const def of definitions)navlinks.append(link(def));
for(const id of ['home','transactions','goals','insights'])mobile.append(link(definitions.find(d=>d.id===id),true));
const more=document.createElement('button');more.type='button';more.className='vault-nav-link vault-mobile-more';more.setAttribute('aria-label','More sections');more.setAttribute('aria-expanded','false');const mi=document.createElement('span');mi.className='vault-nav-icon';mi.textContent='⋯';const mt=document.createElement('span');mt.className='vault-nav-text';mt.textContent='More';more.append(mi,mt);mobile.append(more);
for(const id of ['calendar','payday','settings'])moreMenu.append(link(definitions.find(d=>d.id===id)));
function closeMore(){moreMenu.classList.remove('is-open');more.setAttribute('aria-expanded','false')}
more.onclick=()=>{const open=moreMenu.classList.toggle('is-open');more.setAttribute('aria-expanded',String(open))};
document.addEventListener('keydown',e=>{if(e.key==='Escape')closeMore()});
document.addEventListener('click',e=>{if(!moreMenu.contains(e.target)&&!more.contains(e.target))closeMore()});
function activate(id){if(!pages[id])id='home';for(const def of definitions){const panel=find('vault-page-'+def.id);panel.classList.toggle('vault-page-active',def.id===id);panel.hidden=def.id!==id}
for(const a of document.querySelectorAll('.vault-nav-link[href]')){if(a.getAttribute('href')==='#'+id)a.setAttribute('aria-current','page');else a.removeAttribute('aria-current')}
closeMore();window.scrollTo({top:0,behavior:'instant'});document.title='Vault | '+definitions.find(d=>d.id===id).name}
function hashToTab(){const h=location.hash.replace('#','');return ({dashboard:'home',activity:'transactions',plan:'transactions',data:'settings',calendarSection:'calendar',monthlyReport:'insights',v12Overview:'home',v12Activity:'transactions',v12Planner:'payday',v12Health:'insights',v12Recovery:'settings',reminders:'payday'})[h]||h}
window.addEventListener('hashchange',()=>activate(hashToTab()));
// Route existing shortcut buttons into their new tab while retaining their original behavior.
for(const id of ['addShortcut','withdrawShortcut']){const b=find(id);if(b)b.addEventListener('click',()=>{activate('transactions');history.replaceState(null,'','#transactions')})}
activate(hashToTab());
})();

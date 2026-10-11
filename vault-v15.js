(()=>{'use strict';
const KEY='vault-v15-dashboard-layout';
const widgets=[
 {id:'balance',title:'Total Savings',description:'Balance, goal progress and quick actions',locked:true},
 {id:'overview',title:'Financial Overview',description:'Savings pace and monthly metrics'},
 {id:'deployment',title:'Deployment Progress',description:'Timeline and countdown'},
 {id:'stats',title:'Quick Stats',description:'Savings summary at a glance'}
];
const defaultLayout=widgets.map(w=>({id:w.id,visible:true}));
const home=document.querySelector('#vault-page-home .vault-page-content');
if(!home)return;
const original=[...home.children];
const nodes={balance:original.find(n=>n.classList.contains('hero')),overview:document.getElementById('v12Overview'),deployment:original.find(n=>n.textContent.includes('Deployment progress')),stats:original.find(n=>n.textContent.includes('Quick stats'))};
if(Object.values(nodes).some(n=>!n))return;
function read(){try{const saved=JSON.parse(localStorage.getItem(KEY)||'null');if(!Array.isArray(saved))return defaultLayout.map(x=>({...x}));const seen=new Set();const clean=[];for(const item of saved){if(!item||!widgets.some(w=>w.id===item.id)||seen.has(item.id))continue;seen.add(item.id);clean.push({id:item.id,visible:item.id==='balance'||item.visible!==false})}for(const item of defaultLayout)if(!seen.has(item.id))clean.push({...item});const b=clean.findIndex(x=>x.id==='balance');if(b>0)clean.unshift(clean.splice(b,1)[0]);return clean}catch{return defaultLayout.map(x=>({...x}))}}
let layout=read();
function save(){try{localStorage.setItem(KEY,JSON.stringify(layout))}catch{}}
const bar=document.createElement('div');bar.className='vault-v15-toolbar';
const subtitle=document.createElement('p');subtitle.textContent='Your dashboard, your way.';
const customize=document.createElement('button');customize.type='button';customize.className='btn';customize.textContent='⚙ Customize dashboard';customize.setAttribute('aria-haspopup','dialog');
bar.append(subtitle,customize);home.before(bar);
const dialog=document.createElement('dialog');dialog.className='vault-v15-dialog';dialog.setAttribute('aria-labelledby','vaultV15Title');
const header=document.createElement('div');header.className='vault-v15-head';const title=document.createElement('h2');title.id='vaultV15Title';title.textContent='Customize dashboard';const close=document.createElement('button');close.type='button';close.className='vault-v15-iconbtn';close.textContent='×';close.setAttribute('aria-label','Close customization');header.append(title,close);
const help=document.createElement('p');help.className='vault-v15-help';help.textContent='Show, hide, or reorder dashboard sections. Total Savings always stays first. Changes save automatically on this device.';
const controls=document.createElement('div');controls.className='vault-v15-controls';
const footer=document.createElement('div');footer.className='vault-v15-footer';const reset=document.createElement('button');reset.type='button';reset.className='btn';reset.textContent='Reset layout';const done=document.createElement('button');done.type='button';done.className='btn primary';done.textContent='Done';footer.append(reset,done);
dialog.append(header,help,controls,footer);document.body.append(dialog);
function open(){if(typeof dialog.showModal==='function')dialog.showModal();else dialog.setAttribute('open','');paintControls()}
function dismiss(){if(typeof dialog.close==='function'&&dialog.open)dialog.close();else dialog.removeAttribute('open')}
customize.addEventListener('click',open);close.addEventListener('click',dismiss);done.addEventListener('click',dismiss);dialog.addEventListener('click',e=>{if(e.target===dialog)dismiss()});
reset.addEventListener('click',()=>{layout=defaultLayout.map(x=>({...x}));apply();paintControls()});
function apply(){
 for(const entry of layout){const node=nodes[entry.id];home.append(node);node.hidden=!entry.visible;node.classList.toggle('vault-v15-hidden',!entry.visible)}
 save();
}
function paintControls(){controls.replaceChildren();for(let i=0;i<layout.length;i++){
 const entry=layout[i],w=widgets.find(w=>w.id===entry.id);
 const row=document.createElement('div');row.className='vault-v15-control';
 const desc=document.createElement('div');desc.className='vault-v15-label';const strong=document.createElement('strong');strong.textContent=w.title;const small=document.createElement('small');small.textContent=w.description;desc.append(strong,small);
 const actions=document.createElement('div');actions.className='vault-v15-actions';
 const toggle=document.createElement('label');toggle.className='vault-v15-toggle';const input=document.createElement('input');input.type='checkbox';input.checked=entry.visible;input.disabled=!!w.locked;input.setAttribute('aria-label','Show '+w.title);input.addEventListener('change',()=>{entry.visible=input.checked;apply()});toggle.append(input,document.createTextNode(w.locked?'Always shown':'Show'));actions.append(toggle);
 for(const [label,direction,icon] of [['Move up',-1,'↑'],['Move down',1,'↓']]){const button=document.createElement('button');button.type='button';button.className='vault-v15-iconbtn';button.textContent=icon;button.title=label+' '+w.title;button.setAttribute('aria-label',label+' '+w.title);button.disabled=!!w.locked||(direction===-1?i<=1:i===0||i===layout.length-1);button.addEventListener('click',()=>{const target=i+direction;[layout[i],layout[target]]=[layout[target],layout[i]];apply();paintControls();const buttons=[...controls.querySelectorAll('button')];const next=buttons.find(b=>b.getAttribute('aria-label')===label+' '+w.title);if(next&&!next.disabled)next.focus()});actions.append(button)}
 row.append(desc,actions);controls.append(row)
}}
apply();
})();

(()=>{'use strict';
const KEY='vault-deployment-v3';
const form=document.getElementById('transactionForm'),panel=document.getElementById('transactionPanel');
if(!form||!panel)return;
const type=document.getElementById('type'),amount=document.getElementById('amount'),date=document.getElementById('date'),note=document.getElementById('note');
const host=document.createElement('div');host.className='v13-modal';host.id='v13Modal';host.setAttribute('aria-hidden','true');
const dialog=document.createElement('div');dialog.className='v13-dialog';dialog.setAttribute('role','dialog');dialog.setAttribute('aria-modal','true');dialog.setAttribute('aria-labelledby','v13Title');
const head=document.createElement('div');head.className='v13-head';const title=document.createElement('h2');title.id='v13Title';title.textContent='Add money';
const close=document.createElement('button');close.type='button';close.className='v13-close';close.textContent='×';close.setAttribute('aria-label','Close transaction window');head.append(title,close);
const warning=document.createElement('p');warning.className='v13-warning';warning.hidden=true;warning.textContent='Review the withdrawal amount carefully before confirming.';
const parent=panel.parentNode,placeholder=document.createElement('div');placeholder.className='card v13-transaction-entry';
const intro=document.createElement('div');intro.style.flex='1';intro.innerHTML='<h2 style="margin:0 0 7px">Record a transaction</h2><p class="small" style="margin:0">Add money or withdraw from your savings without leaving this page.</p>';
const depositBtn=document.createElement('button');depositBtn.className='btn primary';depositBtn.type='button';depositBtn.textContent='＋ Add money';
const withdrawBtn=document.createElement('button');withdrawBtn.className='btn';withdrawBtn.type='button';withdrawBtn.textContent='⊖ Withdraw';
placeholder.append(intro,depositBtn,withdrawBtn);parent.replaceChild(placeholder,panel);
dialog.append(head,warning,panel);host.append(dialog);document.body.append(host);
const submit=form.querySelector('[type=submit]');let previousFocus=null,undoTimer=null,lastUndoId=null;
const read=()=>{try{return JSON.parse(localStorage.getItem(KEY)||'null')}catch{return null}};
function open(kind){previousFocus=document.activeElement;type.value=kind;title.textContent=kind==='withdrawal'?'Withdraw money':'Add money';warning.hidden=kind!=='withdrawal';if(submit)submit.textContent=kind==='withdrawal'?'Review & withdraw':'Save deposit';host.classList.add('is-open');host.setAttribute('aria-hidden','false');document.body.style.overflow='hidden';setTimeout(()=>amount.focus(),0)}
function dismiss(){host.classList.remove('is-open');host.setAttribute('aria-hidden','true');document.body.style.overflow='';if(previousFocus&&previousFocus.isConnected)previousFocus.focus()}
close.onclick=dismiss;host.addEventListener('mousedown',e=>{if(e.target===host)dismiss()});
document.addEventListener('keydown',e=>{if(!host.classList.contains('is-open'))return;if(e.key==='Escape'){e.preventDefault();dismiss()}else if(e.key==='Tab'){const items=[...dialog.querySelectorAll('button,input,select,textarea,[tabindex]:not([tabindex="-1"])')].filter(x=>!x.disabled&&x.getClientRects().length);if(!items.length)return;const first=items[0],last=items[items.length-1];if(e.shiftKey&&document.activeElement===first){e.preventDefault();last.focus()}else if(!e.shiftKey&&document.activeElement===last){e.preventDefault();first.focus()}}});
depositBtn.onclick=()=>open('deposit');withdrawBtn.onclick=()=>open('withdrawal');
for(const [id,kind] of [['addShortcut','deposit'],['withdrawShortcut','withdrawal']]){const button=document.getElementById(id);if(button)button.onclick=()=>open(kind)}
const toast=document.createElement('div');toast.className='v13-undo';toast.setAttribute('role','status');const toastText=document.createElement('span');toastText.textContent='Transaction saved';const undo=document.createElement('button');undo.type='button';undo.textContent='Undo';toast.append(toastText,undo);document.body.append(toast);
function hideUndo(){toast.classList.remove('is-visible');lastUndoId=null;clearTimeout(undoTimer)}
function showUndo(id){hideUndo();lastUndoId=id;toast.classList.add('is-visible');undoTimer=setTimeout(hideUndo,10000)}
undo.onclick=()=>{const current=read();if(!current||!Array.isArray(current.transactions)||!current.transactions.some(t=>t.id===lastUndoId)){hideUndo();return}const next={...current,transactions:current.transactions.filter(t=>t.id!==lastUndoId)};try{localStorage.setItem(KEY,JSON.stringify(next));hideUndo();location.reload()}catch{alert('Could not undo this transaction. Please edit it in your transaction history.')}};
let beforeIds=[];
form.addEventListener('submit',e=>{const existing=read();beforeIds=Array.isArray(existing?.transactions)?existing.transactions.map(t=>t.id):[];
if(type.value==='withdrawal'){
const value=Number(amount.value);if(!(value>0))return;
const balance=Number(existing?.settings?.starting||0)+(existing?.transactions||[]).reduce((sum,t)=>sum+(t.type==='deposit'?Number(t.amount):-Number(t.amount)),0);
if(value>balance)return; // Existing validation explains the problem.
if(!window.confirm(`Withdraw ${new Intl.NumberFormat('en-US',{style:'currency',currency:'USD'}).format(value)} from your recorded savings?`)){e.preventDefault();e.stopImmediatePropagation();return}
}
},true);
form.addEventListener('submit',()=>{setTimeout(()=>{const current=read();const added=current?.transactions?.find(t=>!beforeIds.includes(t.id));if(!added)return;dismiss();showUndo(added.id)},0)});
})();
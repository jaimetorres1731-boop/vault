(()=>{'use strict';
function init(){
 const $=id=>document.getElementById(id);
 const home=$('vault-page-home'),military=$('vault-v21');
 if(!home||!military)return;
 const pay=$('vault-page-military'),bills=$('vault-page-bills');
 if(!pay||!bills)return;
 pay.querySelector('.vault-page-content').append(military);
 const billSection=$('v21BillForm')?.closest('.v21-section');
 if(billSection)bills.querySelector('.vault-page-content').append(billSection);
 // Home: balance, deployment progress and shortcut actions. Other cards remain in Insights.
 const insights=$('vault-page-insights')?.querySelector('.vault-page-content');
 const homeContent=home.querySelector('.vault-page-content');
 [...homeContent.children].forEach((card,i)=>{if(i>2&&insights)insights.append(card)});
 home.querySelector('h2').textContent='Home';
 home.querySelector('.vault-page-heading p').textContent='Savings at a glance';
 const rateYear=$('v21-rateYear'),grade=$('v21-grade'),years=$('v21-years'),base=$('v21-base'),bas=$('v21-bas');
 const rates={
 'E-1':[2407.20,2407.20,2407.20,2407.20,2407.20,2407.20],
 'E-2':[2697.90,2697.90,2697.90,2697.90,2697.90,2697.90],
 'E-3':[2836.80,3015.00,3198.00,3198.00,3198.00,3198.00],
 'E-4':[3142.20,3303.00,3482.40,3658.50,3815.40,3815.40],
 'E-5':[3342.90,3598.20,3775.80,3946.80,4110.00,4299.90],
 'E-6':[3401.10,3743.10,3908.10,4068.90,4235.70,4612.80],
 'E-7':[3932.10,4291.50,4456.20,4673.10,4843.80,5135.70]
 };
 const thresholds=[0,2,3,4,6,8];
 const ref=document.createElement('div');ref.className='v22-reference';
 ref.innerHTML='<strong>2026 published rate assistant</strong><p>Use Apply to copy published base pay (E-1 through E-7, up to 8 years) and BAS. Other grades or years require the official DFAS table. Applying rates never saves automatically.</p><div class="v21-controls"><button type="button" class="btn" id="v22ApplyBase">Apply base pay</button><button type="button" class="btn" id="v22ApplyBas">Apply BAS</button></div><p id="v22RateStatus" role="status" class="v21-muted"></p><p class="v21-muted"><a href="https://www.dfas.mil/militarymembers/payentitlements/Pay-Tables/" target="_blank" rel="noopener noreferrer">Official DFAS pay tables</a></p>';
 $('v21Fields').after(ref);
 const status=$('v22RateStatus');
 function apply(input,value,label){input.value=value.toFixed(2);input.dispatchEvent(new Event('change',{bubbles:true}));status.textContent=label+' applied. Select Save planner to retain.'}
 $('v22ApplyBase').onclick=()=>{
  const y=Number(years.value),table=rates[grade.value];
  if(Number(rateYear.value)!==2026||!table||!Number.isFinite(y)||y<0||y>8){status.textContent='No verified automatic base rate for this selection. Use the official DFAS table and enter it manually.';return}
  const index=thresholds.reduce((a,t,i)=>y>=t?i:a,0);
  apply(base,table[index],'2026 base pay');
 };
 $('v22ApplyBas').onclick=()=>{
  if(Number(rateYear.value)!==2026){status.textContent='Only 2026 BAS is included. Verify another year manually.';return}
  apply(bas,grade.value.startsWith('O-')?328.48:476.95,'2026 BAS');
 };
 const zip=$('v21-zip');
 const bahInfo=document.createElement('p');bahInfo.className='v21-muted';
 bahInfo.innerHTML='BAH requires the authorized ZIP, dependency status and correct BAH type. <a href="https://www.travel.dod.mil/Allowances/Basic-Allowance-for-Housing/BAH-Rate-Lookup/" target="_blank" rel="noopener noreferrer">Look up official BAH rates</a>, then enter the confirmed monthly rate. This offline app does not automatically fetch BAH.';
 zip.parentElement.after(bahInfo);
 const per=$('v21-perdiem');
 const perInfo=document.createElement('p');perInfo.className='v21-muted';
 perInfo.innerHTML='Per diem depends on location, dates, lodging, meals and travel orders. <a href="https://www.gsa.gov/travel/plan-book/per-diem-rates" target="_blank" rel="noopener noreferrer">Check GSA locality rates</a> and <a href="https://www.travel.dod.mil/Travel-Transportation-Rates/Per-Diem/" target="_blank" rel="noopener noreferrer">DoD travel rules</a>. Full and reduced days are calculated separately.';
 per.parentElement.after(perInfo);
 document.body.classList.add('vault-v22');
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init);else init();
})();
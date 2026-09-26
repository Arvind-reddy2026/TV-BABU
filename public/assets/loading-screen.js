/* TV Babu branded loader + saving-state indicator. */
(()=>{
 const reduce=window.matchMedia('(prefers-reduced-motion: reduce)').matches;
 const loader=document.getElementById('tvbabu-loader');
 let dismissed=false;
 const hideInitial=()=>{if(!loader||dismissed)return;dismissed=true;loader.classList.add('is-leaving');window.setTimeout(()=>loader.remove(),740);};
 const started=performance.now();
 const minimum=reduce?3000:3600;
 const ready=()=>window.setTimeout(hideInitial,Math.max(0,minimum-(performance.now()-started)));
 if(loader){if(document.readyState==='complete')ready();else window.addEventListener('load',ready,{once:true});window.setTimeout(hideInitial,12000);}
 // Add a branded overlay for database/storage/API mutations while they are in flight.
 const overlay=document.createElement('div');overlay.id='tvbabu-saving-overlay';overlay.setAttribute('role','status');overlay.setAttribute('aria-live','polite');overlay.innerHTML='<div class="saving-card"><img src="/assets/tv-babu-emblem.webp" alt="TV Babu emblem"><div class="saving-spinner" aria-hidden="true"></div><strong id="tvbabu-saving-title">Saving your changes…</strong><p id="tvbabu-saving-caption">Please wait while we securely update the information.</p><div class="saving-track" aria-hidden="true"><span></span></div></div>';
 document.body.appendChild(overlay);
 let active=0,showAt=0,hideTimer=null;
 const show=label=>{active++;if(hideTimer){clearTimeout(hideTimer);hideTimer=null;}if(active===1){showAt=performance.now();overlay.classList.add('is-visible');}const title=document.getElementById('tvbabu-saving-title');const caption=document.getElementById('tvbabu-saving-caption');if(title)title.textContent=label||'Saving your changes…';if(caption)caption.textContent='Please wait while we securely update the information.';};
 const hide=()=>{active=Math.max(0,active-1);if(active)return;const wait=Math.max(180,450-(performance.now()-showAt));hideTimer=setTimeout(()=>{if(active===0)overlay.classList.remove('is-visible');},wait);};
 const nativeFetch=window.fetch.bind(window);
 window.fetch=function(input,init={}){
   let url='',method=String(init?.method||'GET').toUpperCase();
   try{if(input instanceof Request){url=input.url;if(!init?.method)method=input.method.toUpperCase();}else url=String(input||'');}catch{}
   const isWrite=['POST','PUT','PATCH','DELETE'].includes(method);
   const isTarget=/\/rest\/v1\/|\/storage\/v1\/object\/|\/api\/(?:appointment|admin|content|media|gallery|updates|events|grievance|notification|privacy|upload)/i.test(url);
   const shouldShow=isWrite&&isTarget&&!/\/api\/(?:translate|ai-news)\b/i.test(url);
   if(shouldShow)show(/appointment/i.test(url)?'Updating appointment…':/storage/i.test(url)?'Uploading media…':'Saving your changes…');
   let promise;
   try{promise=nativeFetch(input,init);}catch(err){if(shouldShow)hide();throw err;}
   return Promise.resolve(promise).finally(()=>{if(shouldShow)hide();});
 };
 window.TVBabuLoading={show:(label)=>show(label),hide:()=>hide()};
})();

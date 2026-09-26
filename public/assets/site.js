import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm';
import { SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY } from './supabase-config.js';
const db=createClient(SUPABASE_URL,SUPABASE_PUBLISHABLE_KEY,{auth:{persistSession:true,autoRefreshToken:true,detectSessionInUrl:true}});
let lang=localStorage.getItem('lang')||'en';let site={};let syncing=false;let latestRibbonData={updates:[],events:[],media:[]};let publicUpdates=[];
const $=id=>document.getElementById(id);const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const ui={en:{navAbout:'ABOUT',navPriorities:'PRIORITIES',navUpdates:'UPDATES',navEvents:'EVENTS',navGallery:'GALLERY',contact:'CONTACT ↗',eyebrow:'● PEOPLE · PROGRESS · PURPOSE',know:'KNOW TV BABU',ourPriorities:'OUR PRIORITIES',leader:'LEADER',constituency:'CONSTITUENCY',state:'STATE',publicService:'PUBLIC SERVICE',publicProfile:'PUBLIC PROFILE',listen:'LISTEN',serve:'SERVE',develop:'DEVELOP',deliver:'DELIVER',about:'ABOUT TV BABU',aboutTitle:'A leader who',aboutTitle2:'shows up.',aboutMuted:'Clear information about public engagement, constituency activities and development priorities. Built to keep citizens connected with the work that matters.',peopleFirst:'People first.',progressAlways:'Progress always.',prioritiesKicker:'02 / PRIORITIES',prioritiesTitle:'WHAT WE',prioritiesTitle2:'STAND FOR.',prioritiesDesc:'Focused on everyday needs — infrastructure, opportunity, welfare and stronger communities.',latest:'03 / LATEST',ground:'ON THE',ground2:'GROUND.',events:'05 / EVENTS',eventsTitle:'MEET.',eventsTitle2:'ENGAGE.',eventsDesc:'Upcoming public meetings, programmes and constituency activities.',gallery:'06 / GALLERY',people:'PEOPLE.',moments:'MOMENTS.',galleryDesc:'Meetings, programmes and moments from public service across Anekal.',karnataka:'KARNATAKA ↗',connect:'07 / CONNECT',voice:'YOUR VOICE.',yourAnekal:'YOUR ANEKAL.',contactDesc:'For enquiries and direct contact, use the office details or connect through the social links below.',name:'NAME',phone:'PHONE',area:'VILLAGE / AREA',message:'WRITE YOUR MESSAGE',send:'SEND MESSAGE →',footer:'BJP LEADER · ANEKAL',tagline:'PEOPLE · PROGRESS · PURPOSE'},kn:{navAbout:'ನಮ್ಮ ಬಗ್ಗೆ',navPriorities:'ಆದ್ಯತೆಗಳು',navUpdates:'ನವೀಕರಣಗಳು',navEvents:'ಕಾರ್ಯಕ್ರಮಗಳು',navGallery:'ಗ್ಯಾಲರಿ',contact:'ಸಂಪರ್ಕಿಸಿ ↗',eyebrow:'● ಜನರು · ಪ್ರಗತಿ · ಉದ್ದೇಶ',know:'ಟಿ.ವಿ. ಬಾಬು ಬಗ್ಗೆ ತಿಳಿಯಿರಿ',ourPriorities:'ನಮ್ಮ ಆದ್ಯತೆಗಳು',leader:'ನಾಯಕ',constituency:'ಕ್ಷೇತ್ರ',state:'ರಾಜ್ಯ',publicService:'ಸಾರ್ವಜನಿಕ ಸೇವೆ',publicProfile:'ಸಾರ್ವಜನಿಕ ಪ್ರೊಫೈಲ್',listen:'ಆಲಿಸಿ',serve:'ಸೇವೆ',develop:'ಅಭಿವೃದ್ಧಿ',deliver:'ಪೂರೈಸಿ',about:'ಟಿ.ವಿ. ಬಾಬು ಬಗ್ಗೆ',aboutTitle:'ಜನರಿಗಾಗಿ',aboutTitle2:'ಸದಾ ಮುಂಚೂಣಿಯಲ್ಲಿ.',aboutMuted:'ಸಾರ್ವಜನಿಕ ಸಂಪರ್ಕ, ಕ್ಷೇತ್ರದ ಚಟುವಟಿಕೆಗಳು ಮತ್ತು ಅಭಿವೃದ್ಧಿಯ ಆದ್ಯತೆಗಳ ಕುರಿತು ಸ್ಪಷ್ಟ ಮಾಹಿತಿ. ಜನರಿಗೆ ಅಗತ್ಯವಾದ ಕೆಲಸಗಳೊಂದಿಗೆ ಸಂಪರ್ಕದಲ್ಲಿರಲು ಈ ತಾಣ ಸಹಾಯ ಮಾಡುತ್ತದೆ.',peopleFirst:'ಜನರೇ ಮೊದಲಿಗೆ.',progressAlways:'ಪ್ರಗತಿಯೇ ಗುರಿ.',prioritiesKicker:'02 / ಆದ್ಯತೆಗಳು',prioritiesTitle:'ನಾವು',prioritiesTitle2:'ನಂಬಿರುವುದು.',prioritiesDesc:'ಮೂಲಸೌಕರ್ಯ, ಅವಕಾಶ, ಕಲ್ಯಾಣ ಮತ್ತು ಬಲಿಷ್ಠ ಸಮುದಾಯಗಳಂತಹ ದೈನಂದಿನ ಅಗತ್ಯಗಳಿಗೆ ಆದ್ಯತೆ.',latest:'03 / ಇತ್ತೀಚಿನ',ground:'ಕ್ಷೇತ್ರದ',ground2:'ಸುದ್ದಿ.',events:'05 / ಕಾರ್ಯಕ್ರಮಗಳು',eventsTitle:'ಭೇಟಿ.',eventsTitle2:'ತೊಡಗಿಸಿಕೊಳ್ಳಿ.',eventsDesc:'ಮುಂಬರುವ ಸಾರ್ವಜನಿಕ ಸಭೆಗಳು, ಕಾರ್ಯಕ್ರಮಗಳು ಮತ್ತು ಕ್ಷೇತ್ರ ಚಟುವಟಿಕೆಗಳು.',gallery:'06 / ಗ್ಯಾಲರಿ',people:'ಜನರು.',moments:'ಕ್ಷಣಗಳು.',galleryDesc:'ಅನೇಕಲ್‌ನ ಸಾರ್ವಜನಿಕ ಸೇವೆಯ ಸಭೆಗಳು, ಕಾರ್ಯಕ್ರಮಗಳು ಮತ್ತು ವಿಶೇಷ ಕ್ಷಣಗಳು.',karnataka:'ಕರ್ನಾಟಕ ↗',connect:'07 / ಸಂಪರ್ಕ',voice:'ನಿಮ್ಮ ಧ್ವನಿ.',yourAnekal:'ನಿಮ್ಮ ಅನೇಕಲ್.',contactDesc:'ವಿಚಾರಣೆಗಳು ಮತ್ತು ನೇರ ಸಂಪರ್ಕಕ್ಕಾಗಿ ಕಚೇರಿ ವಿವರಗಳನ್ನು ಅಥವಾ ಕೆಳಗಿನ ಸಾಮಾಜಿಕ ಸಂಪರ್ಕಗಳನ್ನು ಬಳಸಿ.',name:'ಹೆಸರು',phone:'ದೂರವಾಣಿ',area:'ಗ್ರಾಮ / ಪ್ರದೇಶ',message:'ನಿಮ್ಮ ಸಂದೇಶ ಬರೆಯಿರಿ',send:'ಸಂದೇಶ ಕಳುಹಿಸಿ →',footer:'ಬಿಜೆಪಿ ನಾಯಕ · ಅನೇಕಲ್',tagline:'ಜನರು · ಪ್ರಗತಿ · ಉದ್ದೇಶ'}};
function applyUi(){const t=ui[lang];document.documentElement.lang=lang==='kn'?'kn':'en';document.title=`${site[lang]?.name||site.en?.name||'TV Babu'} | ${t.publicService}`;const map={navAbout:t.navAbout,navPriorities:t.navPriorities,navUpdates:t.navUpdates,navEvents:t.navEvents,navGallery:t.navGallery,navContact:t.contact,eyebrow:t.eyebrow,know:t.know,ourPriorities:t.ourPriorities,leaderLabel:t.leader,constituencyLabel:t.constituency,stateLabel:t.state,publicService:t.publicService,publicProfile:t.publicProfile,tick1:t.listen,tick2:t.serve,tick3:t.develop,tick4:t.deliver,aboutKicker:t.about,aboutTitle:t.aboutTitle,aboutTitle2:t.aboutTitle2,aboutMuted:t.aboutMuted,peopleFirst:t.peopleFirst,progressAlways:t.progressAlways,prioritiesKicker:t.prioritiesKicker,prioritiesTitle:t.prioritiesTitle,prioritiesTitle2:t.prioritiesTitle2,prioritiesDesc:t.prioritiesDesc,latest:t.latest,ground:t.ground,ground2:t.ground2,eventsKicker:t.events,eventsTitle:t.eventsTitle,eventsTitle2:t.eventsTitle2,eventsDesc:t.eventsDesc,galleryKicker:t.gallery,people:t.people,moments:t.moments,galleryDesc:t.galleryDesc,karnataka:t.karnataka,connect:t.connect,tick1b:t.listen,tick2b:t.serve,voice:t.voice,yourAnekal:t.yourAnekal,contactDesc:t.contactDesc,name:t.name,phone:t.phone,area:t.area,message:t.message,send:t.send,footerLabel:t.footer,footerTag:t.tagline,nameInput:'',phoneInput:'',areaInput:'',messageInput:''};Object.entries(map).forEach(([id,text])=>{const el=$(id);if(el&&text)el.textContent=text});const ph={nameInput:t.name,phoneInput:t.phone,areaInput:t.area,messageInput:t.message};Object.entries(ph).forEach(([id,text])=>{const el=$(id);if(el)el.placeholder=text});}
function renderLatestRibbon(){
 const section=$('latestRibbon'),track=$('latestRibbonTrack');if(!section||!track)return;
 const items=[
  ...latestRibbonData.updates.map(x=>({kind:lang==='kn'?'ನವೀಕರಣ':'Update',title:lang==='kn'?(x.title_kn||x.title):(x.title||x.title_kn),date:x.published_at||x.updated_at||x.created_at||x.date,href:'#updates'})),
  ...latestRibbonData.events.map(x=>({kind:lang==='kn'?'ಕಾರ್ಯಕ್ರಮ':'Event',title:lang==='kn'?(x.title_kn||x.title):(x.title||x.title_kn),date:x.created_at||x.updated_at||x.date,href:'#events'})),
  ...latestRibbonData.media.map(x=>({kind:lang==='kn'?'ಹೊಸ ಫೋಟೋ':'New photo',title:(x.name||'').replace(/\.[^.]+$/,'').replace(/[-_]+/g,' ').trim()|| (lang==='kn'?'ಗ್ಯಾಲರಿಯಲ್ಲಿ ಹೊಸ ಫೋಟೋ':'New gallery photo'),date:x.created_at||x.updated_at,href:'#gallery'}))
 ].filter(x=>x.title).sort((a,b)=>new Date(b.date||0)-new Date(a.date||0)).slice(0,10);
 if(!items.length){section.hidden=true;track.innerHTML='';return;}
 const make=x=>`<a class="latest-ribbon-item" href="${x.href}"><span class="latest-ribbon-kind">${esc(x.kind)}</span><span>${esc(x.title)}</span><span class="latest-ribbon-arrow" aria-hidden="true">↗</span></a>`;
 const copy=items.map(make).join('');track.innerHTML=`<div class="latest-ribbon-group">${copy}</div><div class="latest-ribbon-group" aria-hidden="true">${items.map(x=>`<a class="latest-ribbon-item" href="${x.href}" tabindex="-1"><span class="latest-ribbon-kind">${esc(x.kind)}</span><span>${esc(x.title)}</span><span class="latest-ribbon-arrow" aria-hidden="true">↗</span></a>`).join('')}</div>`;section.hidden=false;
}
const CACHE_KEY='tvbabu_public_cache_v51';
function savePublicCache(payload){try{localStorage.setItem(CACHE_KEY,JSON.stringify({at:Date.now(),...payload}))}catch(_) {}}
function hydratePublicCache(){try{const raw=localStorage.getItem(CACHE_KEY);if(!raw)return false;const payload=JSON.parse(raw);if(!payload||!Array.isArray(payload.site))return false;site=Object.fromEntries(payload.site.map(x=>[x.language,x]));applyUi();render(site[lang]||site.en||{});renderPriorities(payload.priorities||[]);renderUpdates(payload.updates||[]);renderEvents(payload.events||[]);if(Array.isArray(payload.media)){renderGallery(payload.media);latestRibbonData.media=payload.media}latestRibbonData.updates=payload.updates||[];latestRibbonData.events=payload.events||[];renderLatestRibbon();return true}catch(e){console.warn('Public cache unavailable',e);return false}}
async function fetchPublicDataDirect(){const results=await Promise.allSettled([db.from('site_content').select('*').order('language'),db.from('priorities').select('*').eq('status','published').order('sort_order'),db.from('updates').select('*').eq('status','published').order('date',{ascending:false}).limit(6),db.from('events').select('*').eq('status','published').order('date',{ascending:true}).limit(8)]);const siteR=results[0],priorR=results[1],updR=results[2],evtR=results[3];const unpack=r=>r.status==='fulfilled'&&!r.value.error?r.value.data||[]:[];const payload={site:unpack(siteR),priorities:unpack(priorR),updates:unpack(updR),events:unpack(evtR)};if(!payload.site.length&&!payload.priorities.length&&!payload.updates.length&&!payload.events.length){const err=[siteR,priorR,updR,evtR].find(r=>r.status==='rejected'||(r.status==='fulfilled'&&r.value.error));throw new Error(err?.status==='fulfilled'?err.value.error.message:String(err?.reason||'No public data returned'));}return payload}
async function load(){if(syncing)return;syncing=true;try{let payload;try{const response=await fetch('/api/public-data',{cache:'no-store'});const result=await response.json();if(!response.ok||!result.ok)throw new Error(result.error||'Public data endpoint unavailable');payload=result;}catch(apiErr){console.warn('Public API unavailable; loading data directly from Supabase:',apiErr.message);payload=await fetchPublicDataDirect();}if(!Array.isArray(payload.events)||!payload.events.length||payload.errors?.events){try{const direct=await db.from('events').select('*').eq('status','published').order('date',{ascending:true}).limit(40);if(!direct.error&&Array.isArray(direct.data))payload.events=direct.data;else if(direct.error)console.warn('Direct public event query failed:',direct.error.message)}catch(eventErr){console.warn('Direct public event query failed:',eventErr)}}site=Object.fromEntries((payload.site||[]).map(x=>[x.language,x]));applyUi();render(site[lang]||site.en||{});renderPriorities(payload.priorities||[]);renderUpdates(payload.updates||[]);renderEvents(payload.events||[]);latestRibbonData.updates=payload.updates||[];latestRibbonData.events=payload.events||[];renderLatestRibbon();savePublicCache(payload);loadGallery().catch(e=>console.error(e));}catch(e){console.error('Public site sync failed:',e);if(!hydratePublicCache()){applyUi();const msg=lang==='kn'?'ವಿಷಯವನ್ನು ಲೋಡ್ ಮಾಡಲು ಸಾಧ್ಯವಾಗಲಿಲ್ಲ. ದಯವಿಟ್ಟು ಮತ್ತೆ ಪ್ರಯತ್ನಿಸಿ.':'Unable to load the latest website content. Please refresh and try again.';if($('heroDescription'))$('heroDescription').textContent=msg;}}finally{syncing=false;}}
async function loadGallery(){try{const response=await fetch('/api/public-media',{cache:'no-store'});const payload=await response.json();if(!response.ok||!payload.ok)throw new Error(payload.error||'Could not load gallery');renderGallery(payload.media||[]);latestRibbonData.media=payload.media||[];renderLatestRibbon();try{const raw=localStorage.getItem(CACHE_KEY);if(raw){const cached=JSON.parse(raw);cached.media=payload.media||[];localStorage.setItem(CACHE_KEY,JSON.stringify(cached));}}catch(_){} }catch(e){console.error('Gallery load failed:',e);if(!$('galleryGrid').children.length)$('galleryGrid').innerHTML=`<p class="muted">${lang==='kn'?'ಗ್ಯಾಲರಿ ತಾತ್ಕಾಲಿಕವಾಗಿ ಲಭ್ಯವಿಲ್ಲ.':'Gallery is temporarily unavailable.'}</p>`}}
function setContactLink(id,value,kind){const el=$(id);if(!el)return;const v=String(value||'').trim();if(!v){el.textContent=lang==='kn'?'ನಿರ್ವಾಹಕರಿಂದ ಸೇರಿಸಿ':'Add in Admin';el.removeAttribute('href');el.removeAttribute('target');el.classList.add('empty');return}el.classList.remove('empty');el.textContent=v;if(kind==='email')el.href=`mailto:${v}`;else if(kind==='phone')el.href=`tel:${v.replace(/[^+\d]/g,'')}`;else el.href=v}
function normalizeWhatsApp(v){const raw=String(v||'').trim();if(!raw)return '';if(/^https?:\/\//i.test(raw))return raw;let digits=raw.replace(/\D/g,'');if(digits.length===10)digits='91'+digits;return digits?`https://wa.me/${digits}`:''}
function setSocial(id,value,kind,label){const el=$(id);if(!el)return;const v=String(value||'').trim();if(!v){el.hidden=true;return}let href=v;if(kind==='whatsapp')href=normalizeWhatsApp(v);if(!href){el.hidden=true;return}el.hidden=false;el.href=href;const text=el.querySelector('span');if(text)text.textContent=label}
function render(s){applyUi();const isKn=lang==='kn';$('navName').textContent=isKn?(s.name||'TV Babu'):(s.name||'TV Babu').toUpperCase();$('leaderName').textContent=s.name||'TV Babu';$('constituency').textContent=(s.constituency||'Anekal').replace(/,.*$/,'');$('aboutPlace').textContent=isKn?(s.constituency||'ಅನೇಕಲ್ · ಕರ್ನಾಟಕ'):(s.constituency||'Anekal · Karnataka').toUpperCase();$('heroDescription').textContent=s.description||'';$('bioText').textContent=s.bio||'';if($('visionText'))$('visionText').textContent=s.vision||'';setContactLink('contactPhone',s.contact_phone,'phone');setContactLink('contactEmail',s.contact_email,'email');const addr=$('contactAddress');if(addr){const office=String(s.contact_address||'').trim();addr.textContent=office||(isKn?'ನಿರ್ವಾಹಕರಿಂದ ಸೇರಿಸಿ':'Add office address in Admin');if(office){addr.href=`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(office)}`;addr.target='_blank';addr.rel='noopener noreferrer';addr.classList.remove('empty');}else{addr.removeAttribute('href');addr.removeAttribute('target');addr.classList.add('empty');}}const hours=$('contactHours');if(hours)hours.textContent=s.contact_hours|| (isKn?'ನಿರ್ವಾಹಕರಿಂದ ಸೇರಿಸಿ':'Add office hours in Admin');setSocial('socialWhatsapp',s.whatsapp,'whatsapp','WhatsApp');setSocial('socialFacebook',s.facebook,'url','Facebook');setSocial('socialInstagram',s.instagram,'url','Instagram');setSocial('socialYouTube',s.youtube,'url','YouTube');const hero=$('heroPhoto'); if(hero){const fallback='/assets/tv-babu-cutout.png';const desired=s.hero_image||fallback;hero.hidden=false;hero.onerror=()=>{if(hero.src!==location.origin+fallback){hero.src=fallback}else{hero.hidden=true}};const current=hero.getAttribute('src')||'';if(current!==desired){hero.src=desired}}const heroSize=Number(s.hero_photo_size??122); const heroY=Number(s.hero_photo_y??-5); document.documentElement.style.setProperty('--hero-photo-size',`${heroSize}%`); document.documentElement.style.setProperty('--hero-photo-y',`${heroY}%`);const headline=(s.headline||'POWER IN SERVICE.').trim();const words=headline.split(/\s+/);const cut=Math.max(1,Math.ceil(words.length/2));$('heroHeadline').innerHTML=`${esc(words.slice(0,cut).join(' '))}<br><em>${esc(words.slice(cut).join(' ')||'')}</em>`;$('langBtn').textContent=lang==='en'?'ಕನ್ನಡ':'EN'}
function renderPriorities(a){const kn=lang==='kn';const icons=['01','02','03','04'];const clean=(a||[]).filter(x=>x&&x.area&&!isPlaceholderRecord(x)&&!/^[A-Za-z]:\\|localhost-v\d|priority-fix/i.test(String(x.area))).slice(0,4);$('priorityGrid').innerHTML=clean.length?clean.map((x,i)=>`<article><div class="priority-icon">${icons[i]}</div><h3>${esc(kn?(x.area_kn||x.area):x.area)}</h3><p>${esc(kn?(x.description_kn||x.description):x.description)}</p></article>`).join(''):`<p class="muted">${kn?'ಆದ್ಯತೆಗಳ ವಿವರಗಳು ಶೀಘ್ರದಲ್ಲೇ ಇಲ್ಲಿ ಕಾಣಿಸುತ್ತವೆ.':'Priorities will appear here soon.'}</p>`}
function isPlaceholderRecord(x){const fields=['title','title_kn','type','type_kn','area','description','description_kn'];return fields.some(k=>/\bdemo\b|\bplaceholder\b|^test(?:\s|$)/i.test(String(x?.[k]||'').trim()));}
function updateImageUrls(value){if(!value)return[];if(Array.isArray(value))return value.filter(Boolean);const s=String(value);try{const a=JSON.parse(s);if(Array.isArray(a))return a.filter(Boolean)}catch(_){}return s?[s]:[]}
function bindUpdateCarousels(){document.querySelectorAll('#updateGrid .update-slides').forEach(sl=>{if(sl.dataset.bound==='1')return;sl.dataset.bound='1';const slides=[...sl.querySelectorAll('.update-slide')],dots=[...sl.querySelectorAll('.update-dots i')];let idx=0;const show=i=>{idx=(i+slides.length)%slides.length;slides.forEach((im,n)=>im.classList.toggle('active',n===idx));dots.forEach((d,n)=>d.classList.toggle('active',n===idx));};sl.querySelector('.update-prev')?.addEventListener('click',e=>{e.stopPropagation();show(idx-1)});sl.querySelector('.update-next')?.addEventListener('click',e=>{e.stopPropagation();show(idx+1)});if(slides.length>1)sl._timer=setInterval(()=>show(idx+1),4500);});}
function openNewsDetail(item){
  const dialog=$('newsDetailDialog');if(!dialog||!item)return;
  const kn=lang==='kn';
  const title=kn?(item.title_kn||item.title||''):(item.title||item.title_kn||'');
  const type=kn?(item.type_kn||item.type||'ನವೀಕರಣ'):(item.type||'UPDATE');
  const desc=kn?(item.description_kn||item.description||''):(item.description||'');
  const date=item.date?new Date(item.date).toLocaleDateString(kn?'kn-IN':'en-IN',{day:'2-digit',month:'long',year:'numeric'}):'';
  $('newsDetailMeta').textContent=[type,date].filter(Boolean).join(' · ');
  $('newsDetailTitle').textContent=title;
  $('newsDetailBody').textContent=desc;
  const img=$('newsDetailImage'),url=updateImageUrls(item.image_url)[0]||'';
  if(url){img.src=url;img.alt=title;img.hidden=false;}else{img.removeAttribute('src');img.alt='';img.hidden=true;}
  dialog.hidden=false;
  try{if(typeof dialog.showModal==='function'&&!dialog.open)dialog.showModal();else dialog.setAttribute('open','');}catch(err){dialog.setAttribute('open','');dialog.style.display='block';console.warn('Native news dialog fallback used:',err)}
  $('newsDetailClose')?.focus({preventScroll:true});
}
function renderUpdates(a){
  const kn=lang==='kn';
  const items=Array.isArray(a)?a.filter(x=>x&&!isPlaceholderRecord(x)):[];
  publicUpdates=items;
  $('updateGrid').innerHTML=items.length?items.map((x,i)=>{
    const imgs=updateImageUrls(x.image_url);
    const slides=imgs.length>1?`<div class="update-slides" role="group" aria-label="Photo carousel">${imgs.map((u,j)=>`<img src="${esc(u)}" alt="" loading="lazy" class="update-slide ${j===0?'active':''}">`).join('')}<button type="button" class="update-prev" aria-label="Previous photo">‹</button><button type="button" class="update-next" aria-label="Next photo">›</button><div class="update-dots">${imgs.map((_,j)=>`<i class="${j===0?'active':''}"></i>`).join('')}</div></div>`:(imgs[0]?`<div class="update-single-photo"><img src="${esc(imgs[0])}" alt="" loading="lazy"></div>`:'');
    const date=x.date?new Date(x.date).toLocaleDateString(kn?'kn-IN':'en-IN',{day:'2-digit',month:'short',year:'numeric'}):'';
    const type=kn?(x.type_kn||x.type||'ನವೀಕರಣ'):(x.type||'UPDATE');
    const title=kn?(x.title_kn||x.title||''):(x.title||x.title_kn||'');
    const desc=kn?(x.description_kn||x.description||''):(x.description||'');
    return `<article class="update news-card"><div class="update-visual">${slides}</div><div class="update-card-body"><small>${esc(type)}${date?` · ${esc(date)}`:''}</small><h3>${esc(title)}</h3><p class="news-card-excerpt">${esc(desc)}</p><button type="button" class="card-more news-read-more" data-news-index="${i}">${kn?'ಪೂರ್ಣ ಸುದ್ದಿ ಓದಿ':'READ FULL NEWS'} <b aria-hidden="true">↗</b></button></div></article>`;
  }).join(''):`<p class="muted">${kn?'ಹೊಸ ಸಾರ್ವಜನಿಕ ನವೀಕರಣಗಳು ಇಲ್ಲಿ ಕಾಣಿಸುತ್ತವೆ.':'New public updates will appear here.'}</p>`;
  bindUpdateCarousels();
  document.querySelectorAll('#updateGrid [data-news-index]').forEach(btn=>btn.addEventListener('click',()=>openNewsDetail(publicUpdates[Number(btn.dataset.newsIndex)])));
}

function formatEventTime(x,kn){const start=x.start_time?String(x.start_time).slice(0,5):'';const end=x.end_time?String(x.end_time).slice(0,5):'';if(!start)return kn?'ಸಮಯವನ್ನು ನಿರ್ವಾಹಕರು ಸೇರಿಸುತ್ತಾರೆ':'Time to be announced';return end?`${start} – ${end}`:start;}
function eventImageUrl(value){
  if(!value)return '';
  if(Array.isArray(value))return value[0]||'';
  const s=String(value).trim();
  try{const a=JSON.parse(s);if(Array.isArray(a))return a[0]||'';}catch(_){ }
  return s;
}
function renderEvents(a){
  const kn=lang==='kn';
  const now=new Date();
  const todayKey=`${now.getFullYear()}-${String(now.getMonth()+1).padStart(2,'0')}-${String(now.getDate()).padStart(2,'0')}`;
  const events=(a||[]).filter(x=>{if(!x||!x.date||String(x.status||'').toLowerCase()!=='published')return false;const eventDay=String(x.date).slice(0,10);return eventDay>=todayKey;}).sort((x,y)=>String(x.date).localeCompare(String(y.date))).slice(0,8);
  $('eventGrid').innerHTML=events.length?events.map((x,i)=>{
    const d=new Date(`${x.date}T00:00:00`);
    const day=d.toLocaleDateString(kn?'kn-IN':'en-IN',{day:'2-digit'});
    const month=d.toLocaleDateString(kn?'kn-IN':'en-IN',{month:'short'}).toUpperCase();
    const title=kn?(x.title_kn||x.title):x.title;
    const type=kn?(x.type_kn||x.type||'ಕಾರ್ಯಕ್ರಮ'):(x.type||'EVENT');
    const desc=kn?(x.description_kn||x.description||''):(x.description||'');
    const loc=x.location||'';
    const rawImage=eventImageUrl(x.image_url);
    const image=rawImage.startsWith(location.origin+'/')?rawImage:`/api/storage-image?url=${encodeURIComponent(rawImage)}`;
    const imageHtml=rawImage?`<div class="event-image"><img src="${esc(image)}" alt="${esc(title||'Event photo')}" loading="lazy" onerror="this.closest('.event-image').classList.add('image-error')"></div>`:'';
    return `<article data-event-card-id="${esc(x.id)}" class="event-card ${x.featured?'featured ':''}collapsible-card" tabindex="0" aria-expanded="false">${imageHtml}<div class="event-body"><div class="event-date"><b>${esc(day)}</b><small>${esc(month)}</small></div><div class="event-content"><small class="event-type">${esc(type)}</small><h3>${esc(title||'')}</h3><div class="event-meta"><span>◷ ${esc(formatEventTime(x,kn))}</span>${loc?`<span>⌖ ${esc(loc)}</span>`:''}</div>${Number.isFinite(Number(x.registration_capacity))&&Number(x.registration_capacity)>0?`<div class="event-capacity-status" role="status" aria-live="polite">${kn?`ಒಟ್ಟು ${esc(x.registration_capacity)} ಟೋಕನ್‌ಗಳು`:`Capacity: ${esc(x.registration_capacity)} tokens`}</div>`:''}<p class="collapsible-description">${esc(desc)}</p>${(x.registration_enabled===true||x.registration_enabled==='true'||x.registration_open===true||x.registration_open==='true')&&x.status==='published'&&String(x.date||'').slice(0,10)>=todayKey?`<button type="button" class="event-register" data-event-register="${esc(x.id)}">${kn?'ನೋಂದಣಿ ಮಾಡಿ':'REGISTER'}</button>`:''}<span class="card-more">${kn?'ವಿವರಗಳನ್ನು ನೋಡಲು ಕ್ಲಿಕ್ ಮಾಡಿ':'CLICK TO READ MORE'} <b>↗</b></span></div></div><div class="event-arrow">↗</div></article>`;
  }).join(''):`<div class="event-empty"><strong>${kn?'ಯಾವುದೇ ಮುಂಬರುವ ಕಾರ್ಯಕ್ರಮಗಳಿಲ್ಲ.':'No upcoming events yet.'}</strong><span>${kn?'ಹೊಸ ಕಾರ್ಯಕ್ರಮಗಳನ್ನು ನಿರ್ವಾಹಕರು ಸೇರಿಸುತ್ತಾರೆ.':'Upcoming events added by Admin will appear here.'}</span></div>`;
  document.querySelectorAll('#eventGrid [data-event-register]').forEach(btn=>btn.addEventListener('click',e=>{e.stopPropagation();window.dispatchEvent(new CustomEvent('tvbabu:register-event',{detail:{eventId:btn.dataset.eventRegister}}));}));
  document.querySelectorAll('#eventGrid .collapsible-card').forEach(card=>{const toggle=()=>{const open=card.classList.toggle('expanded');card.setAttribute('aria-expanded',String(open));};card.addEventListener('click',toggle);card.addEventListener('keydown',e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();toggle()}});});
  refreshEventCapacity(events).catch(err=>console.warn('Could not refresh event booking capacity:',err));
}
async function refreshEventCapacity(events){
 const limited=(events||[]).filter(x=>Number.isFinite(Number(x.registration_capacity))&&Number(x.registration_capacity)>0);
 await Promise.all(limited.map(async ev=>{
  const {data,error}=await db.rpc('get_event_registration_availability',{p_event_id:ev.id});
  if(error||!data)return;const row=Array.isArray(data)?data[0]:data;if(!row)return;
  const card=[...document.querySelectorAll('#eventGrid [data-event-card-id]')].find(el=>el.dataset.eventCardId===String(ev.id));if(!card)return;
  const label=card.querySelector('.event-capacity-status');if(!label)return;const full=!!row.is_full;
  label.textContent=full?(lang==='kn'?'ಬುಕಿಂಗ್ ಮುಚ್ಚಲಾಗಿದೆ — ಎಲ್ಲಾ ಸೀಟುಗಳು ಭರ್ತಿಯಾಗಿವೆ':'Booking Closed — Seats Filled'):(lang==='kn'?`${row.seats_remaining} ಟೋಕನ್‌ಗಳು ಲಭ್ಯ`:`${row.seats_remaining} ${Number(row.seats_remaining)===1?'token':'tokens'} remaining`);
  label.classList.toggle('is-full',full);
  const button=card.querySelector('[data-event-register]');if(button&&full){button.disabled=true;button.textContent=lang==='kn'?'ಬುಕಿಂಗ್ ಮುಚ್ಚಲಾಗಿದೆ':'BOOKING CLOSED';button.setAttribute('aria-label','Booking closed — seats filled');}
 }));
}

function renderGallery(albums){
 const items=(albums||[]).filter(x=>Array.isArray(x.photo_urls)?x.photo_urls.length>0:!!(x.url||x.name)).slice(0,6);
 $('galleryGrid').innerHTML=items.length?items.map((x,i)=>{
  const urls=Array.isArray(x.photo_urls)?x.photo_urls.filter(Boolean):(x.url?[x.url]:[]);
  const title=x.title||((x.name||'').replace(/\.[^.]+$/,'').replace(/[-_]+/g,' ').trim())||(lang==='kn'?'ಸಾರ್ವಜನಿಕ ಸೇವೆ':'Public service');
  const desc=x.description||'';
  const mosaic=urls.slice(0,4).map((url,n)=>`<img src="${esc(url)}" alt="${esc(title)} — photo ${n+1}" loading="lazy" onerror="this.style.display='none'">`).join('');
  const more=urls.length>4?`<span class="gallery-album-count">+${urls.length-4}</span>`:'';
  return `<article class="gallery-album-card" tabindex="0" role="button" aria-label="${esc((lang==='kn'?'ವಿವರಗಳನ್ನು ತೆರೆಯಿರಿ: ':'Open album: ')+title)}" data-album-index="${i}"><div class="gallery-album-mosaic count-${Math.min(urls.length,4)}">${mosaic}${more}</div><div class="gallery-album-copy"><span class="gallery-album-kicker">${String(i+1).padStart(2,'0')} / ${esc(lang==='kn'?'ಸಾರ್ವಜನಿಕ ಸೇವೆ':'GALLERY ALBUM')} · ${urls.length} ${esc(lang==='kn'?'ಫೋಟೋಗಳು':'photos')}</span><h3>${esc(title)}</h3>${desc?`<p>${esc(desc)}</p>`:''}<span class="gallery-album-open">${lang==='kn'?'ಪೂರ್ಣ ವಿವರಗಳನ್ನು ಓದಿ ↗':'READ FULL STORY ↗'}</span></div></article>`;
 }).join(''):`<p class="muted">${lang==='kn'?'ಗ್ಯಾಲರಿ ಫೋಟೋಗಳು ಇಲ್ಲಿ ಕಾಣಿಸುತ್ತವೆ.':'Gallery photos will appear here.'}</p>`;
 document.querySelectorAll('#galleryGrid .gallery-album-card').forEach((card,i)=>{
  const open=()=>openGalleryAlbum(items[i]);
  card.addEventListener('click',open);
  card.addEventListener('keydown',e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();open();}});
 });
 $('galleryMore').textContent=(albums||[]).length>6?(lang==='kn'?'ಇನ್ನಷ್ಟು ಫೋಟೋಗಳು ನಿರ್ವಾಹಕರಿಂದ ಸೇರಿಸಲಾಗುತ್ತವೆ.':'More albums can be added from the admin panel.') : '';
}
function openGalleryAlbum(album){
 if(!album)return;
 const dialog=$('galleryAlbumDialog');if(!dialog)return;
 const urls=Array.isArray(album.photo_urls)?album.photo_urls.filter(Boolean):(album.url?[album.url]:[]);
 const title=album.title||((album.name||'').replace(/\.[^.]+$/,'').replace(/[-_]+/g,' ').trim())||(lang==='kn'?'ಸಾರ್ವಜನಿಕ ಸೇವೆ':'Public service');
 $('galleryAlbumDialogTitle').textContent=title;
 $('galleryAlbumDialogDescription').textContent=album.description||'';
 $('galleryAlbumDialogPhotos').innerHTML=urls.map((url,i)=>`<figure><img src="${esc(url)}" alt="${esc(title)} — photo ${i+1}" loading="lazy"><figcaption>${String(i+1).padStart(2,'0')} / ${urls.length}</figcaption></figure>`).join('');
 if(typeof dialog.showModal==='function')dialog.showModal();else dialog.setAttribute('open','');
 document.body.classList.add('modal-open');
}
function closeGalleryAlbum(){const dialog=$('galleryAlbumDialog');if(!dialog)return;if(typeof dialog.close==='function'&&dialog.open)dialog.close();else dialog.removeAttribute('open');document.body.classList.remove('modal-open');}
$('galleryAlbumDialogClose')?.addEventListener('click',closeGalleryAlbum);
$('galleryAlbumDialogDone')?.addEventListener('click',closeGalleryAlbum);
$('galleryAlbumDialog')?.addEventListener('click',e=>{if(e.target===$('galleryAlbumDialog'))closeGalleryAlbum();});
$('galleryAlbumDialog')?.addEventListener('close',()=>document.body.classList.remove('modal-open'));

function openLightbox(url){const box=$('lightbox'),img=$('lightboxImg');if(!box||!img)return;img.src=url;box.hidden=false;document.body.style.overflow='hidden'}
function closeLightbox(){const box=$('lightbox');if(!box)return;box.hidden=true;$('lightboxImg').src='';document.body.style.overflow=''}
$('lightboxClose')?.addEventListener('click',closeLightbox);
$('newsDetailClose')?.addEventListener('click',()=>{const d=$('newsDetailDialog');if(d?.open)d.close();else if(d)d.hidden=true});$('newsDetailDone')?.addEventListener('click',()=>{const d=$('newsDetailDialog');if(d?.open)d.close();else if(d)d.hidden=true});$('newsDetailDialog')?.addEventListener('click',e=>{if(e.target===$('newsDetailDialog'))$('newsDetailDialog').close()});$('lightbox')?.addEventListener('click',e=>{if(e.target.id==='lightbox')closeLightbox()});document.addEventListener('keydown',e=>{if(e.key==='Escape'){closeLightbox();closeGalleryAlbum();}});
const menuBtn=$('menuBtn');const mainNav=$('mainNav');menuBtn?.addEventListener('click',()=>{const open=mainNav?.classList.toggle('open');menuBtn.setAttribute('aria-expanded',String(!!open))});mainNav?.querySelectorAll('a').forEach(a=>a.addEventListener('click',()=>{mainNav.classList.remove('open');menuBtn?.setAttribute('aria-expanded','false')}));
window.toggleLang=()=>{lang=lang==='en'?'kn':'en';localStorage.setItem('lang',lang);applyUi();render(site[lang]||site.en||{});};
function startLiveSync(){
  window.addEventListener('storage',e=>{if(e.key==='tvbabu_sync')load();});
  document.addEventListener('visibilitychange',()=>{if(!document.hidden)load();});
  window.addEventListener('focus',()=>load());
  setInterval(()=>{if(!document.hidden)load();},10000);
}

const contactMessageForm=$('contactMessageForm');
contactMessageForm?.addEventListener('submit',e=>{
  e.preventDefault();
  const status=$('contactMessageStatus');
  const recipient=String(site[lang]?.contact_email||site.en?.contact_email||'').trim();
  if(!recipient){if(status)status.textContent='The office email is not configured yet. Please use the phone or social contact details.';return;}
  const data=new FormData(contactMessageForm);
  const subject=encodeURIComponent(`Website enquiry from ${String(data.get('name')||'Website visitor').trim()}`);
  const body=encodeURIComponent(`Name: ${String(data.get('name')||'').trim()}\nEmail: ${String(data.get('email')||'').trim()}\n\nMessage:\n${String(data.get('message')||'').trim()}`);
  if(status)status.textContent='Opening your email app to send this message…';
  window.location.href=`mailto:${recipient}?subject=${subject}&body=${body}`;
});

function initHomeAnimations(){
 const targets=document.querySelectorAll('main > section, .ticker, .latest-ribbon, footer, .gallery-album-card, .update-card, .event-card, .priority-card');
 targets.forEach((el,i)=>{el.classList.add('home-reveal');el.style.setProperty('--reveal-delay',`${Math.min(i%5,4)*70}ms`);});
 if(!('IntersectionObserver' in window)){targets.forEach(el=>el.classList.add('is-visible'));return;}
 const observer=new IntersectionObserver(entries=>entries.forEach(entry=>{if(entry.isIntersecting){entry.target.classList.add('is-visible');observer.unobserve(entry.target);}}),{threshold:.08,rootMargin:'0px 0px -35px 0px'});
 targets.forEach(el=>observer.observe(el));
}
initHomeAnimations();
hydratePublicCache();
load().catch(e=>console.error(e));
startLiveSync();

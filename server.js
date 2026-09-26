const https = require('https');
const dns = require('dns');
dns.setDefaultResultOrder('ipv4first');
const http = require('http');
const fs = require('fs');
const path = require('path');
const { URL } = require('url');
const PORT = Number(process.env.PORT || 3000);
const ROOT = __dirname;
const PUBLIC = path.join(ROOT, 'public');
function mime(p) { return {'.html':'text/html; charset=utf-8','.js':'text/javascript; charset=utf-8','.css':'text/css; charset=utf-8','.svg':'image/svg+xml','.png':'image/png','.jpg':'image/jpeg','.jpeg':'image/jpeg','.webp':'image/webp','.ico':'image/x-icon'}[path.extname(p).toLowerCase()] || 'application/octet-stream'; }
function send(res,status,headers,body){
  const securityHeaders={
    'X-Content-Type-Options':'nosniff',
    'X-Frame-Options':'SAMEORIGIN',
    'Referrer-Policy':'strict-origin-when-cross-origin',
    'Permissions-Policy':'camera=(), microphone=(), geolocation=()',
    'Cross-Origin-Resource-Policy':'same-site',
    'Cross-Origin-Opener-Policy':'same-origin',
    'X-Permitted-Cross-Domain-Policies':'none',
    'Content-Security-Policy':"frame-ancestors 'self'; object-src 'none'; base-uri 'self'; form-action 'self'",
    ...headers
  };
  res.writeHead(status,securityHeaders);res.end(body);
}
const rateBuckets=new Map();
function rateLimit(req,res,{limit=30,windowMs=15*60*1000}={}){
  const now=Date.now();
  const ip=req.socket.remoteAddress||'unknown';
  let bucket=rateBuckets.get(ip);
  if(!bucket||now-bucket.start>=windowMs) bucket={start:now,count:0};
  bucket.count++; rateBuckets.set(ip,bucket);
  if(rateBuckets.size>5000){for(const [key,value] of rateBuckets){if(now-value.start>=windowMs)rateBuckets.delete(key);}}
  if(bucket.count>limit){
    const retry=Math.max(1,Math.ceil((windowMs-(now-bucket.start))/1000));
    send(res,429,{'Content-Type':'application/json; charset=utf-8','Cache-Control':'no-store','Retry-After':String(retry)},JSON.stringify({ok:false,error:'Too many requests. Please try again later.'}));
    return false;
  }
  return true;
}
const SUPABASE_URL = 'https://vncdpfmkrovrvuwfudsq.supabase.co';

function readBody(req, max=20000){return new Promise((resolve,reject)=>{let chunks=[],size=0,settled=false;req.on('data',c=>{if(settled)return;size+=c.length;if(size>max){settled=true;reject(new Error('Request too large'));req.resume();return;}chunks.push(c);});req.on('end',()=>{if(!settled)resolve(Buffer.concat(chunks).toString('utf8'));});req.on('error',e=>{if(!settled)reject(e);});});}
async function translateText(text, direction='en|kn'){
  const value=String(text??'').trim();
  if(!value) return '';
  const endpoint='https://api.mymemory.translated.net/get?q='+encodeURIComponent(value)+'&langpair='+encodeURIComponent(direction);
  const response=await fetch(endpoint,{headers:{'User-Agent':'TV-Babu-CMS/20'}});
  if(!response.ok) throw new Error(`Translation service returned ${response.status}`);
  const data=await response.json();
  const translated=data?.responseData?.translatedText;
  if(!translated) throw new Error('Translation service returned no translation');
  return translated;
}
async function translateApi(req,res){
  if(!rateLimit(req,res,{limit:25,windowMs:10*60*1000})) return;
  try{
    const body=JSON.parse(await readBody(req));
    const texts=Array.isArray(body?.texts)?body.texts.map(x=>String(x??'')):[];
    if(!texts.length||texts.length>20||texts.some(t=>t.length>5000)) return send(res,400,{'Content-Type':'application/json; charset=utf-8'},JSON.stringify({ok:false,error:'Send 1–20 text fields, each no longer than 5,000 characters.'}));
    const translations=[];
    const direction=(body?.direction==='kn|en')?'kn|en':'en|kn';
    for(const text of texts) translations.push(await translateText(text,direction));
    return send(res,200,{'Content-Type':'application/json; charset=utf-8','Cache-Control':'no-store'},JSON.stringify({ok:true,translations}));
  }catch(e){const tooLarge=e?.message==='Request too large';return send(res,tooLarge?413:502,{'Content-Type':'application/json; charset=utf-8','Cache-Control':'no-store'},JSON.stringify({ok:false,error:tooLarge?'Request too large':'Translation service temporarily unavailable'}));}
}


const SUPABASE_KEY = process.env.SUPABASE_PUBLISHABLE_KEY || 'sb_publishable_6Fp1jtiR8PgrsPOW3CLzZA_gkhmPwr4';
async function supaFetch(pathname, options={}){
  const response = await fetch(new URL(pathname, SUPABASE_URL), {
    ...options,
    headers:{'apikey':SUPABASE_KEY,'Authorization':`Bearer ${SUPABASE_KEY}`,'Content-Type':'application/json',...(options.headers||{})}
  });
  const text = await response.text();
  let data; try{ data=text?JSON.parse(text):null; }catch{ data=text; }
  if(!response.ok) throw new Error(data?.message || data?.error || text || `Supabase HTTP ${response.status}`);
  return data;
}
async function publicData(res){
  const results = await Promise.allSettled([
    supaFetch('/rest/v1/site_content?select=*&order=language.asc'),
    supaFetch('/rest/v1/priorities?select=*&status=eq.published&order=sort_order.asc'),
    supaFetch('/rest/v1/updates?select=*&status=eq.published&order=date.desc&limit=6'),
    supaFetch('/rest/v1/events?select=*&status=eq.published&order=date.asc&limit=40'),
    supaFetch('/rest/v1/site_notifications?select=*&is_active=eq.true&order=created_at.desc&limit=8')
  ]);
  const [siteR, prioritiesR, updatesR, eventsR, notificationsR] = results;
  const site = siteR.status==='fulfilled' ? siteR.value : [];
  const priorities = prioritiesR.status==='fulfilled' ? prioritiesR.value : [];
  const updates = updatesR.status==='fulfilled' ? updatesR.value : [];
  const events = eventsR.status==='fulfilled' ? eventsR.value : [];
  const notifications = notificationsR.status==='fulfilled' ? notificationsR.value : [];
  const errors = {
    site: siteR.status==='rejected' ? 'Temporarily unavailable' : null,
    priorities: prioritiesR.status==='rejected' ? 'Temporarily unavailable' : null,
    updates: updatesR.status==='rejected' ? 'Temporarily unavailable' : null,
    events: eventsR.status==='rejected' ? 'Temporarily unavailable' : null,
    notifications: notificationsR.status==='rejected' ? 'Temporarily unavailable' : null
  };
  const ok = siteR.status==='fulfilled' || prioritiesR.status==='fulfilled' || updatesR.status==='fulfilled' || eventsR.status==='fulfilled';
  return send(res,200,{'Content-Type':'application/json; charset=utf-8','Cache-Control':'no-store'},JSON.stringify({ok,site,priorities,updates,events,notifications,errors}));
}
async function publicMedia(res){
  try{
    let albums=[];
    try{
      albums=await supaFetch('/rest/v1/gallery_albums?select=id,title,description,photo_urls,status,created_at,updated_at&status=eq.published&order=created_at.desc');
    }catch(_){albums=[];}
    if(Array.isArray(albums)&&albums.length){
      const media=albums.map(a=>({id:a.id,title:a.title||'',description:a.description||'',photo_urls:Array.isArray(a.photo_urls)?a.photo_urls:[],created_at:a.created_at,updated_at:a.updated_at}));
      return send(res,200,{'Content-Type':'application/json; charset=utf-8','Cache-Control':'no-store'},JSON.stringify({ok:true,media}));
    }
    const objects=await supaFetch('/storage/v1/object/list/tv-babu-media',{method:'POST',body:JSON.stringify({prefix:'gallery',limit:100,offset:0,sortBy:{column:'created_at',order:'desc'}})});
    const media=(objects||[]).filter(x=>x.name && !x.name.startsWith('.')).map(x=>({name:x.name,title:'',description:'',photo_urls:[new URL('/storage/v1/object/public/tv-babu-media/gallery/'+encodeURIComponent(x.name),SUPABASE_URL).toString()],created_at:x.created_at||null,updated_at:x.updated_at||null}));
    return send(res,200,{'Content-Type':'application/json; charset=utf-8','Cache-Control':'no-store'},JSON.stringify({ok:true,media}));
  }catch(e){
    return send(res,502,{'Content-Type':'application/json; charset=utf-8','Cache-Control':'no-store'},JSON.stringify({ok:false,error:e.message||String(e)}));
  }
}

function storageProxyUrl(raw){
  try{
    const u=new URL(String(raw||''));
    const base=new URL(SUPABASE_URL);
    if(u.origin!==base.origin) return null;
    if(!u.pathname.startsWith('/storage/v1/object/public/tv-babu-media/')) return null;
    return u.toString();
  }catch{return null}
}
async function storageImageProxy(req,res){
  const reqUrl=new URL(req.url,`http://localhost:${PORT}`);
  const raw=reqUrl.searchParams.get('url');
  const target=storageProxyUrl(raw);
  if(!target) return send(res,400,{'Content-Type':'text/plain'},'Invalid storage URL');
  try{
    const controller=new AbortController();
    const timeout=setTimeout(()=>controller.abort(),10000);
    let upstream;
    try{upstream=await fetch(target,{headers:{'User-Agent':'TV-Babu-Public/1'},signal:controller.signal});}finally{clearTimeout(timeout);}
    if(!upstream.ok) return send(res,upstream.status,{'Content-Type':'text/plain; charset=utf-8'},`Storage returned ${upstream.status}`);
    const contentType=(upstream.headers.get('content-type')||'').split(';')[0].toLowerCase();
    if(!['image/jpeg','image/png','image/webp','image/gif','image/avif'].includes(contentType)) return send(res,415,{'Content-Type':'text/plain; charset=utf-8'},'Unsupported media type');
    const declared=Number(upstream.headers.get('content-length')||0);
    if(declared>10*1024*1024) return send(res,413,{'Content-Type':'text/plain; charset=utf-8'},'Image is too large');
    const body=Buffer.from(await upstream.arrayBuffer());
    if(body.length>10*1024*1024) return send(res,413,{'Content-Type':'text/plain; charset=utf-8'},'Image is too large');
    return send(res,200,{'Content-Type':contentType,'X-Content-Type-Options':'nosniff','Cache-Control':'public, max-age=300'},body);
  }catch(e){
    return send(res,502,{'Content-Type':'text/plain; charset=utf-8','Cache-Control':'no-store'},'Image service temporarily unavailable');
  }
}


async function aiNewsApi(req,res){
  if(!rateLimit(req,res,{limit:8,windowMs:10*60*1000})) return;
  const apiKey=process.env.OPENAI_API_KEY;
  if(!apiKey) return send(res,503,{'Content-Type':'application/json; charset=utf-8','Cache-Control':'no-store'},JSON.stringify({ok:false,error:'AI writing is not configured. Set OPENAI_API_KEY on the server.'}));
  const auth=String(req.headers.authorization||'');
  const token=auth.match(/^Bearer\s+(.+)$/i)?.[1];
  if(!token) return send(res,401,{'Content-Type':'application/json; charset=utf-8'},JSON.stringify({ok:false,error:'Admin session required.'}));
  try{
    const userResponse=await fetch(new URL('/auth/v1/user',SUPABASE_URL),{headers:{apikey:SUPABASE_KEY,Authorization:`Bearer ${token}`}});
    if(!userResponse.ok) return send(res,401,{'Content-Type':'application/json; charset=utf-8'},JSON.stringify({ok:false,error:'Admin session is invalid or expired.'}));
    const user=await userResponse.json();
    if(String(user?.email||'').toLowerCase()!=='its.manukumar13@gmail.com') return send(res,403,{'Content-Type':'application/json; charset=utf-8'},JSON.stringify({ok:false,error:'This account is not authorized to generate drafts.'}));
    const body=JSON.parse(await readBody(req,16000));
    const topic=String(body?.topic||'').trim(),facts=String(body?.facts||'').trim(),audience=String(body?.audience||'Anekal residents').trim(),tone=String(body?.tone||'Clear and informative').trim();
    if(topic.length<3||topic.length>200||facts.length<10||facts.length>12000) return send(res,400,{'Content-Type':'application/json; charset=utf-8'},JSON.stringify({ok:false,error:'Provide a topic and verified facts (10–12,000 characters).'}));
    const response=await fetch('https://api.openai.com/v1/chat/completions',{method:'POST',headers:{Authorization:`Bearer ${apiKey}`,'Content-Type':'application/json'},body:JSON.stringify({model:process.env.OPENAI_MODEL||'gpt-4o-mini',temperature:0.4,messages:[{role:'system',content:'You are a careful newsroom writing assistant. Draft a factual, neutral public information update using only the facts supplied. Never invent names, dates, numbers, claims, quotes, promises, or outcomes. Mark missing information as [CONFIRM]. Return a concise headline and body. Include a separate verification checklist.'},{role:'user',content:`Topic: ${topic}\nAudience: ${audience}\nTone: ${tone}\nVerified facts only:\n${facts}`} ]})});
    const result=await response.json();
    if(!response.ok) return send(res,502,{'Content-Type':'application/json; charset=utf-8'},JSON.stringify({ok:false,error:'AI provider request failed. Check the server AI configuration.'}));
    const draft=result?.choices?.[0]?.message?.content;
    if(!draft) throw new Error('No draft returned');
    return send(res,200,{'Content-Type':'application/json; charset=utf-8','Cache-Control':'no-store'},JSON.stringify({ok:true,draft}));
  }catch(e){const large=e?.message==='Request too large';return send(res,large?413:502,{'Content-Type':'application/json; charset=utf-8','Cache-Control':'no-store'},JSON.stringify({ok:false,error:large?'Request too large':'Unable to generate a draft right now.'}));}
}


async function appointmentNotifyApi(req,res){
  if(!rateLimit(req,res,{limit:30,windowMs:10*60*1000})) return;
  const token=String(req.headers.authorization||'').replace(/^Bearer\s+/i,'').trim();
  if(!token) return send(res,401,{'Content-Type':'application/json; charset=utf-8'},JSON.stringify({ok:false,error:'Admin session required.'}));
  try{
    const userResponse=await fetch(new URL('/auth/v1/user',SUPABASE_URL),{headers:{apikey:SUPABASE_KEY,Authorization:`Bearer ${token}`}});
    if(!userResponse.ok) return send(res,401,{'Content-Type':'application/json; charset=utf-8'},JSON.stringify({ok:false,error:'Admin session is invalid or expired.'}));
    const user=await userResponse.json();
    if(String(user?.email||'').toLowerCase()!=='its.manukumar13@gmail.com') return send(res,403,{'Content-Type':'application/json; charset=utf-8'},JSON.stringify({ok:false,error:'This account is not authorized to send appointment messages.'}));
    const body=JSON.parse(await readBody(req,12000));
    const appointmentId=String(body?.appointmentId||'').trim();
    if(!/^[0-9a-f-]{30,40}$/i.test(appointmentId)) return send(res,400,{'Content-Type':'application/json; charset=utf-8'},JSON.stringify({ok:false,error:'Invalid appointment identifier.'}));
    // Fetch authoritative details using the caller's authenticated session and RLS.
    const rowResponse=await fetch(new URL(`/rest/v1/appointment_requests?id=eq.${encodeURIComponent(appointmentId)}&select=full_name,phone,status,reference_number,appointment_token,confirmed_date,confirmed_time,preferred_date,preferred_time,office_location,notification_consent`,SUPABASE_URL),{headers:{apikey:SUPABASE_KEY,Authorization:`Bearer ${token}`}});
    const rows=await rowResponse.json();
    if(!rowResponse.ok||!Array.isArray(rows)||!rows[0]) return send(res,404,{'Content-Type':'application/json; charset=utf-8'},JSON.stringify({ok:false,error:'Appointment not found or not accessible.'}));
    const a=rows[0];
    if(a.notification_consent!==true) return send(res,200,{'Content-Type':'application/json; charset=utf-8','Cache-Control':'no-store'},JSON.stringify({ok:true,sent:false,configured:true,consent:false,channel,error:'Citizen has not opted in to SMS/WhatsApp. In-portal notification remains available.'}));
    if(!['confirmed','rescheduled','cancelled','rejected'].includes(a.status)) return send(res,400,{'Content-Type':'application/json; charset=utf-8'},JSON.stringify({ok:false,error:'Only approval, reschedule, cancellation, or rejection updates trigger a message.'}));
    const date=a.confirmed_date||a.preferred_date||'To be confirmed';
    const time=a.confirmed_time||a.preferred_time||'To be confirmed';
    let message;
    if(a.status==='confirmed') message=`TV Babu: Your appointment is APPROVED for ${date} at ${time}. Token: ${a.appointment_token||'will be shown in your Citizen Portal'}. Location: ${a.office_location||'TV Babu Public Service Office'}. Ref: ${a.reference_number||''}`;
    else if(a.status==='rescheduled') message=`TV Babu: Your appointment has been RESCHEDULED to ${date} at ${time}. Token: ${a.appointment_token||'check Citizen Portal'}. Location: ${a.office_location||'TV Babu Public Service Office'}. Ref: ${a.reference_number||''}`;
    else if(a.status==='cancelled') message=`TV Babu: Your appointment has been CANCELLED. Ref: ${a.reference_number||''}. Please check your Citizen Portal for details.`;
    else message=`TV Babu: Your appointment request was NOT APPROVED. Ref: ${a.reference_number||''}. Please check your Citizen Portal for details.`;
    const sid=process.env.TWILIO_ACCOUNT_SID,auth=process.env.TWILIO_AUTH_TOKEN;
    const channel=String(body?.channel||'whatsapp').toLowerCase()==='sms'?'sms':'whatsapp';
    const from=channel==='sms'?process.env.TWILIO_SMS_FROM:process.env.TWILIO_WHATSAPP_FROM;
    if(!sid||!auth||!from) return send(res,200,{'Content-Type':'application/json; charset=utf-8','Cache-Control':'no-store'},JSON.stringify({ok:true,sent:false,configured:false,channel,error:'Messaging provider credentials are not configured. In-portal notification remains available.'}));
    let digits=String(a.phone||'').replace(/[^0-9+]/g,'');
    if(/^\d{10}$/.test(digits)) digits='+91'+digits;
    else if(/^91\d{10}$/.test(digits)) digits='+'+digits;
    if(!/^\+[1-9]\d{7,14}$/.test(digits)) return send(res,400,{'Content-Type':'application/json; charset=utf-8'},JSON.stringify({ok:false,error:'Citizen phone number must be a valid international number (E.164); add the country code before sending.'}));
    const to=channel==='whatsapp'?`whatsapp:${digits}`:digits;
    const fromAddress=channel==='whatsapp'?(String(from).startsWith('whatsapp:')?String(from):`whatsapp:${from}`):String(from);
    const form=new URLSearchParams({To:to,From:fromAddress,Body:message});
    const tw=await fetch(`https://api.twilio.com/2010-04-01/Accounts/${encodeURIComponent(sid)}/Messages.json`,{method:'POST',headers:{Authorization:'Basic '+Buffer.from(`${sid}:${auth}`).toString('base64'),'Content-Type':'application/x-www-form-urlencoded'},body:form});
    const twData=await tw.json().catch(()=>({}));
    if(!tw.ok) return send(res,502,{'Content-Type':'application/json; charset=utf-8'},JSON.stringify({ok:false,sent:false,configured:true,channel,error:'Messaging provider rejected the message. Check the Twilio sender, destination consent, and WhatsApp template/window requirements.'}));
    return send(res,200,{'Content-Type':'application/json; charset=utf-8','Cache-Control':'no-store'},JSON.stringify({ok:true,sent:true,channel,messageId:twData.sid||null}));
  }catch(e){return send(res,502,{'Content-Type':'application/json; charset=utf-8'},JSON.stringify({ok:false,error:'Unable to send appointment message right now.'}));}
}

function supabaseHealth(res){
  const target = new URL('/auth/v1/settings', SUPABASE_URL);
  const r = https.get(target, {headers:{'apikey': SUPABASE_KEY,'User-Agent':'TV-Babu-CMS/17'}}, up=>{
    let body=''; up.on('data',c=>body+=c); up.on('end',()=>{const ok=up.statusCode>=200&&up.statusCode<300;send(res,ok?200:502,{'Content-Type':'application/json; charset=utf-8','Cache-Control':'no-store'},JSON.stringify({ok,status:up.statusCode}));});
  });
  r.setTimeout(8000,()=>r.destroy(new Error('Connection timed out after 8 seconds')));
  r.on('error',()=>send(res,502,{'Content-Type':'application/json; charset=utf-8','Cache-Control':'no-store'},JSON.stringify({ok:false,error:'Supabase health check temporarily unavailable'})));
}
const server=http.createServer((req,res)=>{
  const u=new URL(req.url,`http://localhost:${PORT}`);
  if (u.pathname === '/api/supabase-health') return supabaseHealth(res);
  if (u.pathname === '/api/ai-news' && req.method === 'POST') return aiNewsApi(req,res);
  if (u.pathname === '/api/appointment-notify' && req.method === 'POST') return appointmentNotifyApi(req,res);
  if (u.pathname === '/api/public-data') return publicData(res);
  if (u.pathname === '/api/public-media') return publicMedia(res);
  if (u.pathname === '/api/storage-image') return storageImageProxy(req,res);
  if (u.pathname === '/api/translate' && req.method === 'POST') return translateApi(req,res);
  if(req.method!=='GET' && req.method!=='HEAD') return send(res,405,{'Content-Type':'text/plain; charset=utf-8','Allow':'GET, HEAD'},'Method not allowed');
  let decodedPath;try{decodedPath=decodeURIComponent(u.pathname);}catch{return send(res,400,{'Content-Type':'text/plain; charset=utf-8'},'Invalid URL path');}
  const rel=decodedPath==='/'?'index.html':decodedPath==='/admin'?'admin.html':decodedPath==='/features-admin'?'features-admin.html':decodedPath==='/privacy'?'privacy.html':decodedPath.replace(/^\/+/, '');
  const f=path.resolve(PUBLIC,rel);
  if((f!==PUBLIC&&!f.startsWith(PUBLIC+path.sep))||!fs.existsSync(f)||!fs.statSync(f).isFile()) return send(res,404,{'Content-Type':'text/plain; charset=utf-8'},'Not found');
  send(res,200,{'Content-Type':mime(f),'Cache-Control':'no-store'},fs.readFileSync(f));
});
server.listen(PORT,()=>console.log(`TV Babu website: http://localhost:${PORT}`));

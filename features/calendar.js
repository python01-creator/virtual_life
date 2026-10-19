
/* ROOM_CALENDAR_V1: private Google events, memory-only access token. */
(() => {
 const scope='https://www.googleapis.com/auth/calendar.events.readonly';
 let month=new Date(new Date().getFullYear(),new Date().getMonth(),1),selected=dayKey(new Date()),events=[],token='',expires=0,busy=false,status='Google 캘린더를 연결하면 내 일정을 여기서 볼 수 있어요.',revision=0,loadedMonth='';
 function dayKey(d){return [d.getFullYear(),String(d.getMonth()+1).padStart(2,'0'),String(d.getDate()).padStart(2,'0')].join('-');}
 function eventOn(e,key){const start=e.start?.date||dayKey(new Date(e.start?.dateTime));const end=e.end?.date||dayKey(new Date(e.end?.dateTime));return start<=key&&(e.end?.date?key<end:key<=end);}
 const html=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
 const clientId=()=>window.LIFE_HQ_CONFIG?.googleCalendarClientId||'';
 function active(){return document.getElementById('room-calendar')!==null;}
 function calendarSnapshot(){
 const today=dayKey(new Date()),hasToken=!!(token&&Date.now()<expires),ready=loadedMonth===dayKey(new Date(new Date().getFullYear(),new Date().getMonth(),1));
 return {configured:!!clientId(),connected:hasToken,busy,status,ready,events:ready?events.filter(e=>eventOn(e,today)).map(e=>({title:e.summary||'제목 없는 일정',location:e.location||'',allDay:!!e.start?.date,start:e.start?.dateTime||e.start?.date||''})):[]};
 }
 function announce(){window.dispatchEvent(new CustomEvent('life-calendar-change',{detail:calendarSnapshot()}));}
 function render(){
 if(!active())return;
 const today=dayKey(new Date()),y=month.getFullYear(),m=month.getMonth(),offset=month.getDay(),days=new Date(y,m+1,0).getDate();
 const rows=loadedMonth===dayKey(month)?events:[];
 const hasToken=token&&Date.now()<expires;
 document.getElementById('room-calendar').innerHTML=`<div class="eyebrow">MY CALENDAR</div><h2>내 방에서 보는 일정</h2><div class="room-cal-toolbar"><button class="ghost" id="cal-prev" aria-label="이전 달">‹</button><strong>${y}년 ${m+1}월</strong><button class="ghost" id="cal-next" aria-label="다음 달">›</button><button class="ghost" id="cal-today">오늘</button></div><p class="room-cal-status" role="status">${html(busy?'일정을 불러오는 중…':status)}</p><div class="room-cal-grid" role="group" aria-label="${y}년 ${m+1}월 날짜 선택">${['일','월','화','수','목','금','토'].map(d=>`<span class="room-cal-week">${d}</span>`).join('')}${'<span></span>'.repeat(offset)}${Array.from({length:days},(_,i)=>{const key=dayKey(new Date(y,m,i+1)),count=rows.filter(e=>eventOn(e,key)).length+(window.lifeStudy?.has(key)?1:0);return `<button class="room-cal-day ${key===selected?'selected':''} ${key===today?'today':''}" data-cal-date="${key}" aria-pressed="${key===selected}" aria-label="${m+1}월 ${i+1}일${count?', 일정 '+count+'개':''}">${i+1}${count?'<i aria-hidden="true"></i>':''}</button>`;}).join('')}</div><h3>${selected===today?'오늘':html(selected)}의 일정</h3><div id="cal-agenda"></div><div class="actions"><button class="primary" id="cal-connect" ${busy||!clientId()?'disabled':''}>${hasToken?'다른 Google 계정 연결':'Google 캘린더 연결'}</button>${hasToken?'<button class="ghost" id="cal-refresh">새로고침</button><button class="ghost" id="cal-disconnect">연결 해제</button>':''}</div><p class="room-cal-note">일정을 읽어서 보여주기만 해요. Google 일정 원본은 수정하지 않아요.<br>운영실 로그인과 다른 Google 계정도 연결할 수 있어요.${!clientId()?'<br>화면은 준비됐고, 관리자 연결값만 한 번 넣으면 바로 사용할 수 있어요.':''}</p>`;
 const agenda=document.getElementById('cal-agenda'),list=rows.filter(e=>eventOn(e,selected));
 if(!hasToken||loadedMonth!==dayKey(month)){agenda.innerHTML='<p class="room-cal-empty">'+(busy?'일정을 확인하고 있어요.':hasToken?'이 달의 일정을 아직 불러오지 못했어요.':'Google 연결 후 이곳에 일정이 표시돼요.')+'</p>';}
 else if(!list.length)agenda.innerHTML='<p class="room-cal-empty">이날 등록된 일정이 없어요.</p>';
 else for(const e of list){const article=document.createElement('article');article.className='room-cal-event';const time=e.start?.date?'하루 종일':new Date(e.start.dateTime).toLocaleTimeString('ko-KR',{hour:'2-digit',minute:'2-digit'});article.innerHTML=`<span>${html(time)}</span><strong>${html(e.summary||'제목 없는 일정')}</strong>${e.location?'<p>'+html(e.location)+'</p>':''}`;agenda.append(article);}
 document.getElementById('cal-prev').onclick=()=>changeMonth(-1);document.getElementById('cal-next').onclick=()=>changeMonth(1);
 document.getElementById('cal-today').onclick=()=>{const now=new Date();selected=dayKey(now);month=new Date(now.getFullYear(),now.getMonth(),1);render();if(hasToken)load();};
 document.querySelectorAll('[data-cal-date]').forEach(b=>b.onclick=()=>{selected=b.dataset.calDate;render();});
 window.lifeStudy?.renderCalendar(selected);document.getElementById('cal-connect').onclick=connect;
 if(hasToken){document.getElementById('cal-refresh').onclick=load;document.getElementById('cal-disconnect').onclick=()=>{const old=token;clear();window.google?.accounts.oauth2.revoke(old,()=>{});};}
 }
 function clear(){revision++;token='';expires=0;events=[];loadedMonth='';busy=false;status='연결을 해제했어요. 다시 연결할 수 있어요.';render();announce();}
 function changeMonth(delta){month=new Date(month.getFullYear(),month.getMonth()+delta,1);selected=dayKey(month);render();if(token&&Date.now()<expires)load();}
 async function load(){
 const mine=++revision,start=new Date(month),end=new Date(month.getFullYear(),month.getMonth()+1,1),monthKey=dayKey(month);
 if(!token||Date.now()>=expires){clear();status='일정을 보려면 Google 계정을 다시 연결해 주세요.';render();return;}
 busy=true;render();const access=token;let collected=[],page='';
 try{do{const q=new URLSearchParams({timeMin:start.toISOString(),timeMax:end.toISOString(),singleEvents:'true',orderBy:'startTime',maxResults:'2500',timeZone:Intl.DateTimeFormat().resolvedOptions().timeZone});if(page)q.set('pageToken',page);const response=await fetch('https://www.googleapis.com/calendar/v3/calendars/primary/events?'+q,{headers:{Authorization:'Bearer '+access},cache:'no-store',signal:AbortSignal.timeout(15000)});if(!response.ok){if(response.status===401){token='';expires=0;}throw Error(response.status===401?'로그인이 만료됐어요. Google 계정을 다시 연결해 주세요.':response.status===403?'일정 읽기 권한이나 Google 연결 설정을 확인해 주세요.':'일정을 불러오지 못했어요. 잠시 후 새로고침해 주세요.');}const data=await response.json();collected.push(...(data.items||[]).filter(e=>e.status!=='cancelled'));page=data.nextPageToken||'';}while(page&&mine===revision);
 if(mine!==revision)return;events=collected;loadedMonth=monthKey;status='Google 기본 캘린더 · 방금 불러왔어요';
 }catch(error){if(mine!==revision)return;status=error.name==='TimeoutError'?'연결이 오래 걸려요. 새로고침해 주세요.':error.message;if(!token){events=[];loadedMonth='';}}
 finally{if(mine===revision){busy=false;render();announce();}}
 }
 let library;
 function prepare(){if(window.google?.accounts?.oauth2)return Promise.resolve();if(library)return library;library=new Promise((resolve,reject)=>{const s=document.createElement('script');s.src='https://accounts.google.com/gsi/client';s.onload=resolve;s.onerror=()=>{library=null;reject(Error('Google 연결 화면을 불러오지 못했어요.'));};document.head.append(s);});return library;}
 function connect(){if(!window.google?.accounts?.oauth2){status='Google 연결을 준비하고 있어요. 잠시 후 다시 눌러 주세요.';render();prepare().catch(e=>{status=e.message;render();});return;}
 const auth=google.accounts.oauth2.initTokenClient({client_id:clientId(),scope,include_granted_scopes:false,callback:response=>{if(response.error||!response.access_token||!google.accounts.oauth2.hasGrantedAllScopes(response,scope)){status='일정 읽기 권한 연결이 완료되지 않았어요.';render();return;}revision++;events=[];loadedMonth='';token=response.access_token;expires=Date.now()+Math.max(0,Number(response.expires_in||3600)-60)*1000;load();},error_callback:()=>{status='연결창이 닫혔어요. 원할 때 다시 연결할 수 있어요.';render();}});auth.requestAccessToken({prompt:'select_account'});}
 const original=openPanel;openPanel=function(key){original(key);if(key!=='calendar')return;document.getElementById('panel-content').innerHTML='<section id="room-calendar"></section>';render();if(clientId())prepare().catch(e=>{status=e.message;render();});if(token)load();};
 window.lifeCalendar={snapshot:calendarSnapshot,open:()=>openPanel('calendar'),refreshToday:()=>{const now=new Date();month=new Date(now.getFullYear(),now.getMonth(),1);selected=dayKey(now);if(token&&Date.now()<expires)return load();announce();}};
 document.addEventListener('visibilitychange',()=>{if(!document.hidden&&expires&&Date.now()>=expires)clear();});
 window.addEventListener('pagehide',clear);
 const css=document.createElement('style');css.textContent='.room-cal-toolbar{display:flex;align-items:center;justify-content:space-between;gap:8px;margin:20px 0}.room-cal-grid{display:grid;grid-template-columns:repeat(7,minmax(0,1fr));gap:5px}.room-cal-week{text-align:center;font-size:12px;color:#78816f;padding:6px}.room-cal-day{border:1px solid transparent;border-radius:12px;background:#f0f1e8;color:#3f4e3b;min-height:42px;position:relative;padding:8px 2px 13px}.room-cal-day.today{border-color:#77916b}.room-cal-day.selected{background:#526d4b;color:white}.room-cal-day i{position:absolute;bottom:5px;left:calc(50% - 2px);width:4px;height:4px;border-radius:50%;background:currentColor}.room-cal-status,.room-cal-note,.room-cal-empty{font-size:12px;color:#77816f;line-height:1.7}.room-cal-status{min-height:2em}.room-cal-event{padding:12px 0;border-top:1px solid #ddd}.room-cal-event span{display:block;font-size:12px;color:#738168;margin-bottom:5px}.room-cal-event strong{overflow-wrap:anywhere}.room-cal-event p{margin:4px 0;font-size:12px}#room-calendar .actions{display:flex;flex-wrap:wrap;gap:8px;margin-top:20px}#room-calendar button:disabled{opacity:.55;cursor:default}';document.head.append(css);
})();

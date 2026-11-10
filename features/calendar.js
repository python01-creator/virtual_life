
/* Saved records belong to their recorded date, not their last edit date. */
(function(root){
 const day=d=>[d.getFullYear(),String(d.getMonth()+1).padStart(2,'0'),String(d.getDate()).padStart(2,'0')].join('-');
 function dateOf(record){
  const recorded=String(record.when||'').match(/^\d{4}-\d{2}-\d{2}(?=$|T|\s)/)?.[0];
  if(recorded){const d=new Date(recorded+'T12:00:00');return Number.isFinite(d.getTime())&&day(d)===recorded?recorded:'';}
  if(!record.created)return '';const created=new Date(record.created);return Number.isFinite(created.getTime())?day(created):'';
 }
 function index(records,home){const dates=new Map();for(const r of records){if(!r||r.deleted||r.home!==home||typeof r.id!=='string')continue;if(r.kind==='study'&&!String(r.body||'').trim())continue;const date=dateOf(r);if(!date)continue;if(!dates.has(date))dates.set(date,[]);dates.get(date).push(r);}return dates;}
 const api={dateOf,index};if(typeof module==='object'&&module.exports)module.exports=api;else root.CalendarRecordsCore=api;
})(typeof window==='object'?window:globalThis);

/* ROOM_CALENDAR_V1: private Google events, memory-only access token. */
(() => {
 if(typeof window==='undefined')return;
 const scope='https://www.googleapis.com/auth/calendar.events.readonly';
 let month=new Date(new Date().getFullYear(),new Date().getMonth(),1),selected=dayKey(new Date()),events=[],token='',expires=0,busy=false,status='Google 캘린더를 연결하면 내 일정을 여기서 볼 수 있어요.',revision=0,loadedMonth='';
 function dayKey(d){return [d.getFullYear(),String(d.getMonth()+1).padStart(2,'0'),String(d.getDate()).padStart(2,'0')].join('-');}
 function eventOn(e,key){const start=e.start?.date||dayKey(new Date(e.start?.dateTime));const end=e.end?.date||dayKey(new Date(e.end?.dateTime));return start<=key&&(e.end?.date?key<end:key<=end);}
 const html=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
 const clientId=()=>window.LIFE_HQ_CONFIG?.googleCalendarClientId||'';
 function active(){return document.getElementById('room-calendar')!==null;}
 function recordIndex(){return window.CalendarRecordsCore.index(typeof lifeRecords==='undefined'?[]:lifeRecords,typeof lifeHome==='undefined'?'':lifeHome.id);}
 function recordsOn(index,date){const list=index.get(date)||[];return window.lifeStudy?.has(date)&&!list.some(r=>r.kind==='study')?[...list,{id:'calendar-study',kind:'study',when:date,title:'공부 기록'}]:list;}
 async function refreshRecords(){const root=document.getElementById('room-calendar');try{await window.lifeAppReady;await lifeRefresh();if(root&&root===document.getElementById('room-calendar'))render();}catch{const note=root?.querySelector('#cal-record-status');if(note)note.textContent='저장된 기록을 새로 불러오지 못했어요. 잠시 후 캘린더를 다시 열어 주세요.';}}
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
 const saved=recordIndex();
 const dayButtons=Array.from({length:days},(_,i)=>{const key=dayKey(new Date(y,m,i+1)),scheduleCount=rows.filter(e=>eventOn(e,key)).length,recordCount=recordsOn(saved,key).length+taskHistoryOn(key).length;return `<button class="room-cal-day ${key===selected?'selected':''} ${key===today?'today':''}" data-cal-date="${key}" aria-pressed="${key===selected}" aria-label="${m+1}월 ${i+1}일${scheduleCount?', 일정 '+scheduleCount+'개':''}${recordCount?', 기록 '+recordCount+'개':''}">${i+1}${scheduleCount||recordCount?'<i aria-hidden="true"></i>':''}</button>`;}).join('');
 document.getElementById('room-calendar').innerHTML=`<div class="eyebrow">MY CALENDAR</div><h2>내 일정과 하루의 기록</h2><div class="room-cal-toolbar"><button class="ghost" id="cal-prev" aria-label="이전 달">‹</button><strong>${y}년 ${m+1}월</strong><button class="ghost" id="cal-next" aria-label="다음 달">›</button><button class="ghost" id="cal-today">오늘</button></div><p class="room-cal-status" role="status">${html(busy?'일정을 불러오는 중…':status)}</p><div class="room-cal-grid" role="group" aria-label="${y}년 ${m+1}월 날짜 선택">${['일','월','화','수','목','금','토'].map(d=>`<span class="room-cal-week">${d}</span>`).join('')}${'<span></span>'.repeat(offset)}${dayButtons}</div><p class="room-cal-note">● 일정이나 저장한 기록이 있는 날이에요. 날짜를 눌러 펼쳐 보세요.</p><section id="cal-tasks"></section><section id="cal-records"></section><h3>${selected===today?'오늘':html(selected)}의 일정</h3><div id="cal-agenda"></div><div class="actions"><button class="primary" id="cal-connect" ${busy||!clientId()?'disabled':''}>${hasToken?'다른 Google 계정 연결':'Google 캘린더 연결'}</button>${hasToken?'<button class="ghost" id="cal-refresh">새로고침</button><button class="ghost" id="cal-disconnect">연결 해제</button>':''}</div><p class="room-cal-note">운영실 기록은 Google 연결 없이도 볼 수 있어요. Google 일정 원본은 수정하지 않아요.<br>운영실 로그인과 다른 Google 계정도 연결할 수 있어요.${!clientId()?'<br>화면은 준비됐고, 관리자 연결값만 한 번 넣으면 바로 사용할 수 있어요.':''}</p>`;
 const agenda=document.getElementById('cal-agenda'),list=rows.filter(e=>eventOn(e,selected));
 if(!hasToken||loadedMonth!==dayKey(month)){agenda.innerHTML='<p class="room-cal-empty">'+(busy?'일정을 확인하고 있어요.':hasToken?'이 달의 일정을 아직 불러오지 못했어요.':'Google 연결 후 이곳에 일정이 표시돼요.')+'</p>';}
 else if(!list.length)agenda.innerHTML='<p class="room-cal-empty">이날 등록된 일정이 없어요.</p>';
 else for(const e of list){const article=document.createElement('article');article.className='room-cal-event';const time=e.start?.date?'하루 종일':new Date(e.start.dateTime).toLocaleTimeString('ko-KR',{hour:'2-digit',minute:'2-digit'});article.innerHTML=`<span>${html(time)}</span><strong>${html(e.summary||'제목 없는 일정')}</strong>${e.location?'<p>'+html(e.location)+'</p>':''}`;agenda.append(article);}
 document.getElementById('cal-prev').onclick=()=>changeMonth(-1);document.getElementById('cal-next').onclick=()=>changeMonth(1);
 document.getElementById('cal-today').onclick=()=>{const now=new Date();selected=dayKey(now);month=new Date(now.getFullYear(),now.getMonth(),1);render();if(hasToken)load();};
 document.querySelectorAll('[data-cal-date]').forEach(b=>b.onclick=()=>{selected=b.dataset.calDate;render();});
 renderTasksOnDate();renderRecords(recordsOn(saved,selected));document.getElementById('cal-connect').onclick=connect;
 if(hasToken){document.getElementById('cal-refresh').onclick=load;document.getElementById('cal-disconnect').onclick=()=>{const old=token;clear();window.google?.accounts.oauth2.revoke(old,()=>{});};}
 }
 function renderTasksOnDate(){
  const target=document.getElementById('cal-tasks'),tasks=taskHistoryOn(selected);
  const isPast=selected<localDay();
  const groups=[{done:true,label:'완료한 일'},{done:false,label:isPast?'미완료':'해야 할 일'}];
  target.innerHTML=`<h3>${html(selected)}의 할 일</h3>${tasks.length?groups.map(({done,label})=>{
   const rows=tasks.map((task,index)=>({task,index})).filter(({task})=>!!task.done===done);
   return `<h4>${label} (${rows.length})</h4>${rows.length?`<ul>${rows.map(({task,index})=>`<li>${html(task.text)}${isPast&&!done?` <button class="ghost" type="button" data-cal-carry="${index}">오늘로 옮기기</button>`:''}</li>`).join('')}</ul>`:'<p class="room-cal-empty">없어요.</p>'}`;
  }).join(''):'<p class="room-cal-empty">이날 기록된 할 일이 없어요.</p>'}`;
  target.querySelectorAll('[data-cal-carry]').forEach(button=>button.onclick=()=>{
   if(bringTaskToToday(selected,Number(button.dataset.calCarry))){button.disabled=true;button.textContent='오늘에 추가됨';}
  });
 }
 function renderRecords(records){
  const target=document.getElementById('cal-records');
  const labels={diary:'일기',study:'공부',writing:'글쓰기',inspiration:'영감',travel:'여행',journey:'이야기',childhood:'어린 시절',growth:'성장'};
  target.innerHTML=`<h3>${html(selected)}의 기록 (${records.length})</h3><p id="cal-record-status" class="room-cal-note" role="status"></p><div class="room-cal-record-list"></div><div class="actions"><button class="ghost" id="cal-write-diary">이날 일기 쓰기</button><button class="ghost" id="cal-open-study">공부 기록 열기</button></div>`;
  const list=target.querySelector('.room-cal-record-list');
  if(!records.length)list.innerHTML='<p class="room-cal-empty">이날 저장한 기록이 없어요.</p>';
  for(const record of records){const button=document.createElement('button');button.type='button';button.className='room-cal-record';button.innerHTML=`<small>${html(labels[record.kind]||'기록')}</small><strong>${html(record.title||'제목 없는 기록')}</strong><span aria-hidden="true">›</span>`;button.onclick=()=>{document.querySelector('#panel').close();if(record.kind==='study')window.lifeStudy?.open(selected);else lifeRead(record.id);};list.append(button);}
  target.querySelector('#cal-write-diary').onclick=()=>{document.querySelector('#panel').close();const record=records.find(r=>r.kind==='diary');record?diaryRead(record.id):diaryForm(selected);};
  target.querySelector('#cal-open-study').onclick=()=>{document.querySelector('#panel').close();window.lifeStudy?.open(selected);};
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
 const original=openPanel;openPanel=function(key){original(key);if(key!=='calendar')return;document.getElementById('panel-content').innerHTML='<section id="room-calendar"></section>';render();refreshRecords();if(clientId())prepare().catch(e=>{status=e.message;render();});if(token)load();};
 window.lifeCalendar={snapshot:calendarSnapshot,open:()=>openPanel('calendar'),refreshToday:()=>{const now=new Date();month=new Date(now.getFullYear(),now.getMonth(),1);selected=dayKey(now);if(token&&Date.now()<expires)return load();announce();}};
 document.addEventListener('visibilitychange',()=>{if(!document.hidden&&expires&&Date.now()>=expires)clear();});
 window.addEventListener('pagehide',clear);
 window.addEventListener('life-study-saved',()=>{if(active())render();});
 document.addEventListener('life-session-ended',()=>{revision++;token='';expires=0;events=[];loadedMonth='';busy=false;document.getElementById('room-calendar')?.remove();announce();});
 const recordCss=document.createElement('style');recordCss.textContent='.room-cal-record-list{display:grid;gap:7px}.room-cal-record{display:grid;grid-template-columns:minmax(0,1fr) auto;gap:4px 10px;width:100%;min-width:0;text-align:left;border:1px solid #d6ddce;border-radius:11px;background:#f3f4eb;color:#40513b;padding:11px 13px}.room-cal-record small{font-size:11px;color:#74816d}.room-cal-record strong{grid-column:1;font-size:13px;overflow-wrap:anywhere}.room-cal-record>span{grid-column:2;grid-row:1/3;align-self:center}.room-cal-record:hover,.room-cal-record:focus-visible{background:#e8eddd;border-color:#809373}#cal-records{margin-top:18px}';document.head.append(recordCss);
 const css=document.createElement('style');css.textContent='.room-cal-toolbar{display:flex;align-items:center;justify-content:space-between;gap:8px;margin:20px 0}.room-cal-grid{display:grid;grid-template-columns:repeat(7,minmax(0,1fr));gap:5px}.room-cal-week{text-align:center;font-size:12px;color:#78816f;padding:6px}.room-cal-day{border:1px solid transparent;border-radius:12px;background:#f0f1e8;color:#3f4e3b;min-height:42px;position:relative;padding:8px 2px 13px}.room-cal-day.today{border-color:#77916b}.room-cal-day.selected{background:#526d4b;color:white}.room-cal-day i{position:absolute;bottom:5px;left:calc(50% - 2px);width:4px;height:4px;border-radius:50%;background:currentColor}.room-cal-status,.room-cal-note,.room-cal-empty{font-size:12px;color:#77816f;line-height:1.7}.room-cal-status{min-height:2em}.room-cal-event{padding:12px 0;border-top:1px solid #ddd}.room-cal-event span{display:block;font-size:12px;color:#738168;margin-bottom:5px}.room-cal-event strong{overflow-wrap:anywhere}.room-cal-event p{margin:4px 0;font-size:12px}#room-calendar .actions{display:flex;flex-wrap:wrap;gap:8px;margin-top:20px}#room-calendar button:disabled{opacity:.55;cursor:default}';document.head.append(css);
})();

/* WORK_TIME_CORE_V1 */
(function(root){
 const hour=3600000,day=24*hour,offset=9*hour;
 function startDay(t){return Math.floor((t+offset)/day)*day-offset;}
 function dateKey(t){return new Date(t+offset).toISOString().slice(0,10);}
 function weekStart(t){const d=startDay(t),dow=new Date(d+offset).getUTCDay();return d-((dow+6)%7)*day;}
 function lunchFor(t,lunchByDate={}){const v=lunchByDate[dateKey(t)];if(v?.enabled===false)return null;if(v&&Number.isInteger(v.start)&&Number.isInteger(v.end)&&v.start>=0&&v.end<=1440&&v.end>v.start)return {start:v.start,end:v.end};return {start:780,end:840};}
 function effective(start,end,lunchByDate={}){let total=0;if(!Number.isFinite(start)||!Number.isFinite(end)||end<=start)return 0;
 for(let d=startDay(start);d<end;d+=day){const a=Math.max(start,d),b=Math.min(end,d+day),l=lunchFor(d,lunchByDate);total+=Math.max(0,b-a)-(l?Math.max(0,Math.min(b,d+l.end*60000)-Math.max(a,d+l.start*60000)):0);}return total;}
 function sum(rows,from,to,mode,lunchByDate={}){let n=0;for(const r of rows){if(mode&&r.mode!==mode)continue;const a=Math.max(r.start,from),b=Math.min(r.end,r.stopAt||Infinity,to);n+=effective(a,b,lunchByDate);}return n;}
 function stats(rows,active,now,lunchByDate={}){const all=rows.concat(active?[{...active,end:now}]:[]),d=startDay(now),w=weekStart(now);return {today:sum(all,d,d+day,null,lunchByDate),week:sum(all,w,w+7*day,null,lunchByDate),weekRemote:sum(all,w,w+7*day,'remote',lunchByDate),todayRemote:sum(all,d,d+day,'remote',lunchByDate),todayOffice:sum(all,d,d+day,'office',lunchByDate),weekStart:w,days:Array.from({length:7},(_,i)=>({date:dateKey(w+i*day),time:sum(all,w+i*day,w+(i+1)*day,null,lunchByDate)}))};}
 function inLunch(t,lunchByDate={}){const l=lunchFor(t,lunchByDate),m=(t-startDay(t))/60000;return !!l&&m>=l.start&&m<l.end;}
 function overlaps(rows,item,exclude){return rows.some(r=>r.id!==exclude&&item.start<r.end&&item.end>r.start);}
 function policy(t,mode,exception=false){const d=startDay(t),clock=(t-d)/hour,dow=new Date(d+offset).getUTCDay();if(mode==='remote'&&[1,2,4,5].includes(dow)&&clock>=11&&clock<16)return '오늘 11~16시는 회사 근무 시간이에요. 재택은 16시부터 가능해요.';if(clock>=22&&!exception)return '22시 이후에는 특별근무 사유가 필요해요.';return '';}
 function cutoff(t,mode,exception=false){const d=startDay(t),clock=(t-d)/hour,dow=new Date(d+offset).getUTCDay();if(mode==='remote'&&[1,2,4,5].includes(dow)&&clock<11)return d+11*hour;return d+(exception?24:22)*hour;}
 function finishAt(now,remaining,deadline,lunchByDate={}){if(remaining<=0)return now;if(effective(now,deadline,lunchByDate)<remaining)return null;let lo=now,hi=deadline;for(let i=0;i<45;i++){const mid=(lo+hi)/2;if(effective(now,mid,lunchByDate)>=remaining)hi=mid;else lo=mid;}return Math.ceil(hi);}
 function leaveTotal(byDate,from,to){
  return Object.entries(byDate).reduce((total,[date,days])=>
   total+(date>=from&&date<to&&(days===1||days===.5)?days:0),0);
 }
 const api={hour,day,startDay,dateKey,weekStart,lunchFor,effective,sum,stats,inLunch,overlaps,policy,cutoff,finishAt,leaveTotal};if(typeof module==='object'&&module.exports)module.exports=api;else root.WorkTimeCore=api;
})(typeof window==='object'?window:globalThis);

/* WORKDAY_V1 */
(async()=>{
 if(window.lifeCloud){try{await window.lifeCloud.ready;await window.lifeAppReady;}catch{return;}}await window.placeRoomsReady;
 const C=window.WorkTimeCore,user=window.lifeCloud?(await window.lifeCloud.ready).id:'local',key='life-workday-v1:'+user+':'+lifeHome.id,cloudKey='workday-v1:'+lifeHome.id;
 const empty=()=>({version:1,rows:[],active:null,personal:false,mode:'office',log:[],lunchByDate:{},leaveByDate:{},leaveAllowance:{}}),copy=x=>JSON.parse(JSON.stringify(x));let data=empty(),message='',route=null,office=false,undo=null,saving=false;
 const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
 const valid=x=>x?.version===1&&Array.isArray(x.rows)&&Array.isArray(x.log);
 function clean(x){if(!valid(x))return null;const n=copy(x);delete n.autoStart;delete n.autoHold;delete n.holdDate;if(!n.lunchByDate||typeof n.lunchByDate!=='object'||Array.isArray(n.lunchByDate))n.lunchByDate={};
 for(const field of ['leaveByDate','leaveAllowance']){
  if(!n[field]||typeof n[field]!=='object'||Array.isArray(n[field]))n[field]={};
 }
 return n;}
 function localRead(){try{return clean(JSON.parse(localStorage.getItem(key)));}catch{return null;}}
 function localWrite(value){try{localStorage.setItem(key,JSON.stringify(value));}catch{}}
 async function read(fresh=false,requireServer=false){if(window.lifeCloud&&fresh){try{const remote=clean(await window.lifeCloud.getSetting(cloudKey));if(remote){data=remote;localWrite(remote);return data;}const legacy=localRead();if(legacy){data=legacy;await window.lifeCloud.setSetting(cloudKey,legacy);return data;}}catch(error){if(requireServer)throw error;message='서버 근무기록을 불러오지 못했어요. 연결을 확인해 주세요.';}}const cached=localRead();if(cached)data=cached;return data;}
 async function write(next){if(saving)return false;saving=true;const before=copy(data);try{if(window.lifeCloud)await window.lifeCloud.setSetting(cloudKey,next);data=next;localWrite(next);return true;}catch{data=before;localWrite(before);toast('서버에 근무 기록을 저장하지 못했어요. 기록은 변경되지 않았어요.');return false;}finally{saving=false;}}
 function record(n,type,mode){n.log.unshift({at:Date.now(),type,mode});}
 function showBlocked(text,fromPlace){message=text;if(fromPlace)document.querySelector('#place-dialog')?.close();render(true);if(fromPlace&&!dialog.open)dialog.showModal();}
 function stats(){return C.stats(data.rows,data.active,Date.now(),data.lunchByDate);}
 async function stop(reason='근무 종료'){await read(true);if(!data.active)return;const n=copy(data),a=n.active;n.rows.push({...a,end:Math.max(a.start,Math.min(Date.now(),a.stopAt))});n.active=null;record(n,reason,a.mode);if(await write(n)){undo=null;route=null;standUp();message=reason+' · 서버에 기록했어요.';render(true);}}
 async function start(mode,fromPlace=false){await read(true);if(data.active){message=fromPlace?'이미 근무 기록 중이에요.':'진행 중인 근무를 먼저 쉬거나 종료해 주세요.';render(true);return;}const now=Date.now(),reason=dialog.querySelector('[name=exception]')?.value.trim()||'',personal=data.personal===true,problem=personal?C.policy(now,mode,!!reason):'';
 if(problem){showBlocked(problem,fromPlace);return;}if(personal&&mode==='remote'&&C.inLunch(now,data.lunchByDate)){showBlocked('지금은 설정한 점심시간이에요. 휴게시간이 끝난 뒤 재택 근무를 시작해 주세요.',fromPlace);return;}
 const used=stats().weekRemote;if(personal&&mode==='remote'&&used>=20*C.hour){showBlocked('이번 주 재택 20시간을 모두 사용했어요. 회사 근무로 시작해 주세요.',fromPlace);return;}
 let end=personal?C.cutoff(now,mode,!!reason):Number.MAX_SAFE_INTEGER;
 if(personal&&mode==='remote'){const remaining=20*C.hour-used;let lo=now,hi=end;if(C.effective(now,hi,data.lunchByDate)>remaining){for(let i=0;i<45;i++){const mid=(lo+hi)/2;if(C.effective(now,mid,data.lunchByDate)>remaining)hi=mid;else lo=mid;}end=Math.floor(lo);}}
 const n=copy(data);n.mode=mode;n.active={id:crypto.randomUUID(),start:now,mode,personal,automatic:false,stopAt:end,exception:personal?reason:''};record(n,fromPlace?'회사 선택 · 출근':'근무 시작',mode);if(!await write(n))return;if(fromPlace)undo={id:n.active.id,until:Date.now()+10000};message=fromPlace?'회사를 선택한 시각으로 출근했어요. 잘못 눌렀다면 10초 안에 취소할 수 있어요.':personal?(mode==='remote'?'재택':'회사')+' 근무를 시작했어요.':'근무를 시작했어요.';if(office)walkToDesk();else if(mode==='remote')pose('desk');render(true);}
 async function undoStart(){if(!undo||Date.now()>undo.until)return;await read(true);if(data.active?.id!==undo.id)return;const n=copy(data);n.active=null;record(n,'잘못 누른 출근 취소','office');if(await write(n)){undo=null;route=null;standUp();message='출근 기록을 취소했어요.';render(true);}}
 const dialog=document.createElement('dialog');dialog.id='workday-dialog';dialog.setAttribute('aria-label','근무 시간 관리');document.body.append(dialog);
 const button=document.createElement('button');button.id='workday-status-button';button.className='ghost';button.textContent='◷ 근무 시간';button.hidden=true;button.onclick=show;document.querySelector('.header-right').append(button);
 const deskButton=document.createElement('button');deskButton.className='office-desk-hit';deskButton.hidden=true;deskButton.setAttribute('aria-label','내 자리의 노트북 · 업무 기록 열기');deskButton.title='내 자리 · 업무 기록';deskButton.onclick=show;document.querySelector('.canvas-wrap').append(deskButton);
 canvas.addEventListener('keydown',e=>{if(office&&['e','Enter'].includes(e.key)&&Math.hypot(player.x-500,player.y-360)<125){e.preventDefault();e.stopImmediatePropagation();show();}},true);
 async function show(){correcting=false;keys.clear();render(true);if(!dialog.open)dialog.showModal();await read(true);if(dialog.open&&!correcting)render(true);}
 // Furniture opens this API directly; the status button label changes during work.
 window.lifeWorkday={open:show};
 function withPending(action){return async e=>{const pressed=e.currentTarget;pressed.disabled=true;try{await action();}finally{pressed.disabled=false;}};}
 const simpleStyle=document.createElement('style');simpleStyle.textContent='#workday-dialog .work-attendance{display:grid;grid-template-columns:1fr 1fr;gap:14px;background:#e9efdf;border-radius:16px;padding:18px;margin-top:18px}#workday-dialog .work-attendance small{display:block;font-size:12px;color:#74816a}#workday-dialog .work-attendance strong{display:block;font-size:28px;font-variant-numeric:tabular-nums;margin-top:8px}#workday-dialog .work-attendance>p{grid-column:1/-1;font-size:12px;margin:0;padding-top:10px;border-top:1px solid #d5decb;color:#68775f}#workday-dialog .work-main-action,#workday-dialog .work-manual-action{display:block;width:100%;min-height:46px;margin:10px 0}#workday-dialog .work-main-action{font-size:17px;font-weight:700}#workday-dialog .work-manual-action{font-size:12px}#workday-dialog #work-history,#workday-dialog #work-more{border-top:1px solid #dce1d4;padding-top:14px}#workday-dialog .work-row button{display:block;margin-top:8px}#workday-dialog .work-time-fields{display:grid;grid-template-columns:1fr 1fr;gap:12px}#workday-dialog .work-time-fields label{min-width:0}#workday-dialog .work-time-fields input{min-width:0}@media(max-width:380px){#workday-dialog .work-attendance{padding:14px;gap:10px}#workday-dialog .work-attendance strong{font-size:25px}}#workday-dialog .work-weekly{padding:18px;margin:18px 0;background:#edf0e6;border:1px solid #d9e1ce;border-radius:18px}#workday-dialog .work-week-heading{display:flex;justify-content:space-between;gap:8px;align-items:center}#workday-dialog .work-week-heading h3{margin:0;font-size:15px}#workday-dialog .work-week-heading>span{font-size:11px;color:#78816d}#workday-dialog .work-week-number{display:flex;align-items:baseline;flex-wrap:wrap;gap:6px;margin:14px 0 8px;font-variant-numeric:tabular-nums}#workday-dialog .work-week-number strong{font-size:24px}#workday-dialog .work-week-number span{font-size:13px}#workday-dialog .work-week-number small{margin-left:auto;font-size:12px}#workday-dialog #work-week-progress{display:block;width:100%;height:14px;accent-color:#849e75}#workday-dialog #work-week-remaining{font-size:13px}#workday-dialog .work-week-days{display:grid;grid-template-columns:repeat(7,minmax(0,1fr));gap:4px;margin:18px 0}#workday-dialog .work-week-days>div{min-width:0;padding:8px 2px;text-align:center;border-radius:9px}#workday-dialog .work-week-days .is-today{background:#dce6d1}#workday-dialog .work-week-days span,#workday-dialog .work-week-days small,#workday-dialog .work-week-days strong{display:block;font-size:10px;line-height:1.6;overflow-wrap:anywhere}#workday-dialog .work-week-days small{color:#7d8772}#workday-dialog .work-week-days strong{font-size:10px;margin-top:5px}#workday-dialog .work-net-today{font-size:14px}#workday-dialog #work-live-label{display:block;margin-top:6px;font-size:11px;color:#6e7e65}#workday-dialog #work-lunch{min-height:40px;font-size:12px}@media(max-width:420px){#workday-dialog .work-weekly{padding:13px}#workday-dialog .work-week-number strong{font-size:21px}#workday-dialog .work-week-heading{flex-wrap:wrap}}';simpleStyle.textContent += `
 #workday-dialog .work-today-heading { grid-column:1/-1;display:flex;justify-content:space-between;align-items:center;gap:8px;flex-wrap:wrap;font-size:13px;color:#46593d; }
 #workday-dialog #work-live-label { margin:0;padding:4px 8px;border-radius:8px;background:#fff9;color:inherit;font-weight:700; }
 #workday-dialog .work-quick-actions { display:flex;gap:6px;flex-wrap:wrap; }
 #workday-dialog .work-quick-actions button { flex:1 1 auto;min-height:44px;font-size:12px; }
 #workday-dialog #work-week-breakdown { margin:12px 0 0; }
 #workday-dialog input[type=checkbox] { display:inline;width:auto;margin:0 6px 0 0; }
 #workday-dialog .work-history-nav { display:flex;align-items:center;justify-content:space-between;gap:6px;margin:12px 0;font-size:12px;text-align:center; }
 #workday-dialog .work-history-nav button { min-height:44px;font-size:12px; }
 #workday-dialog .work-history-nav button:disabled { opacity:.45; }
 #workday-dialog .work-time-fields label[hidden] { display:none; }
 `;
 document.head.append(simpleStyle);
 let viewState='', historyWeek=null;
 const duration=(ms,live=false)=>{const minutes=Math.floor(Math.max(0,ms)/60000),h=Math.floor(minutes/60),m=minutes%60;return (h?h+'시간'+(m?' '+m+'분':''):m+'분')+(live?' '+Math.floor(Math.max(0,ms)/1000)%60+'초':'');};
 function refreshMetrics(){if(correcting||!dialog.open)return;const st=stats(),goal=40*C.hour,leave=weeklyLeave(st.weekStart),total=st.week+leave,pct=Math.min(100,total/goal*100);const text=(id,value)=>{const el=dialog.querySelector(id);if(el)el.textContent=value;};text('#work-week-total',duration(total));text('#work-week-credit',leave?'실근무 '+duration(st.week)+' + 연차 '+duration(leave):'');text('#work-week-remaining',total>=goal?'이번 주 40시간을 채웠어요.':'40시간까지 '+duration(Math.ceil((goal-total)/60000)*60000)+' 남았어요.');text('#work-today-total',duration(st.today,!!data.active));text('#work-live-label',data.active?(C.inLunch(Date.now(),data.lunchByDate)?'점심시간 · 근무시간에서 제외':'근무 중'):dialog.querySelector('#work-live-label')?.dataset.idle);const bar=dialog.querySelector('#work-week-progress');if(bar){bar.value=Math.min(40,total/C.hour);bar.setAttribute('aria-valuetext',duration(total)+' / 40시간');}text('#work-week-percent',Math.floor(pct)+'%');st.days.forEach((d,i)=>text('#work-day-'+i,d.time?duration(d.time):'—'));}
 function weeklyMarkup(now){const st=stats(),today=C.dateKey(now),days=['월','화','수','목','금','토','일'];return `<section class="work-weekly" aria-label="이번 주 40시간"><div class="work-week-heading"><h3>이번 주 40시간</h3><span>${st.days[0].date.slice(5).replace('-','/')} – ${st.days[6].date.slice(5).replace('-','/')}</span></div><p class="work-week-number"><strong id="work-week-total"></strong><span> / 40시간</span><small id="work-week-percent"></small></p><progress id="work-week-progress" aria-label="이번 주 근무 목표" max="40" value="0"></progress><p id="work-week-remaining"></p><p class="work-note" id="work-week-credit"></p><details id="work-week-breakdown"><summary>요일별 근무시간 보기</summary><div class="work-week-days">${st.days.map((d,i)=>`<div ${d.date===today?'class="is-today"':''}><span>${days[i]}</span><small>${Number(d.date.slice(8))}일</small><strong id="work-day-${i}"></strong>${leaveBadge(d.date)}</div>`).join('')}</div></details></section>`;}
 const weekdayNames=['월','화','수','목','금','토','일'];
 const dateStamp=date=>Date.parse(date+'T00:00:00+09:00');
 const shortDate=date=>date.slice(5).replace('-','/');
 const clock=t=>new Date(t).toLocaleTimeString('ko-KR',{timeZone:'Asia/Seoul',hour:'2-digit',minute:'2-digit'});
 const leaveBadge=date=>data.leaveByDate[date]===1?'<small>연차</small>':data.leaveByDate[date]===.5?'<small>반차</small>':'';
 function weeklyLeave(week){
  const end=Math.min(week+7*C.day,C.startDay(Date.now())+C.day);
  return C.leaveTotal(data.leaveByDate,C.dateKey(week),C.dateKey(end))*8*C.hour;
 }
 function historyMarkup(now){
  const current=C.weekStart(now);
  const oldest=data.rows.reduce((week,row)=>Math.min(week,C.weekStart(row.start)),
   Object.keys(data.leaveByDate).map(dateStamp).filter(Number.isFinite).reduce((week,date)=>Math.min(week,C.weekStart(date)),current));
  const week=Math.max(oldest,Math.min(current,historyWeek??current));
  historyWeek=week;
  const days=C.stats(data.rows,null,week,data.lunchByDate).days;
  const rows=data.rows.filter(row=>row.start<week+7*C.day&&row.end>week).sort((a,b)=>a.start-b.start);
  return `<div class="work-history-nav">
    <button class="ghost" id="work-prev-week" ${week<=oldest?'disabled':''}>이전 주</button>
    <strong>${days[0].date} ~ ${shortDate(days[6].date)}</strong>
    <button class="ghost" id="work-next-week" ${week>=current?'disabled':''}>다음 주</button>
   </div>
   <div class="work-week-days">${days.map((day,i)=>`<div><span>${weekdayNames[i]}</span><small>${shortDate(day.date)}</small><strong>${day.time?duration(day.time):'—'}</strong>${leaveBadge(day.date)}</div>`).join('')}</div>
   ${days.map((day,i)=>{
    const from=week+i*C.day;
    const shifts=rows.filter(row=>row.start<from+C.day&&row.end>from);
    const leave=leaveBadge(day.date);
    if(!shifts.length&&!leave)return '';
    return `<details id="work-history-${day.date}"><summary>${shortDate(day.date)} (${weekdayNames[i]}) ${day.time?duration(day.time):''} ${leave}</summary>
     ${shifts.map(row=>`<article class="work-row"><p>출근 ${clock(row.start)} → 퇴근 ${clock(row.end)}${row.mode==='remote'?' · 재택':''}</p><button class="ghost" data-correct="${esc(row.id)}">시간 수정</button></article>`).join('')}</details>`;
   }).join('')}`;
 }
 function leaveSettings(){
  correcting=true;
  dialog.innerHTML=`<h2>연차 관리</h2>
   <p class="work-note">연차는 8시간, 반차는 4시간으로 해당 날짜가 되면 주간 40시간 목표에 반영돼요.</p>
   <form id="work-leave-form">
    <label>날짜<input name="date" type="date" required value="${C.dateKey(Date.now())}"></label>
    <label>휴가<select name="leave"><option value="0">없음</option><option value="1">연차 1일</option><option value="0.5">반차 0.5일</option></select></label>
    <label>올해 부여받은 연차 (일, 선택)<input name="allowance" type="number" min="0" step="0.5" inputmode="decimal"></label>
    <p id="work-leave-balance"></p>
    <p id="work-leave-error" role="alert"></p>
    <button class="primary">저장</button>
    <button type="button" class="ghost" id="work-leave-back">돌아가기</button>
   </form>`;
  const form=dialog.querySelector('form'),{date,leave,allowance}=form.elements;
  const balance=()=>{
   if(!date.value)return;
   const year=Number(date.value.slice(0,4));
   const used=C.leaveTotal(data.leaveByDate,year+'-01-01',(year+1)+'-01-01')-(data.leaveByDate[date.value]||0)+Number(leave.value);
   const rest=allowance.value===''?'':' · 남은 연차 '+(Number(allowance.value)-used)+'일';
   dialog.querySelector('#work-leave-balance').textContent=year+'년 등록한 연차 '+used+'일'+rest;
  };
  let shownYear;
  const loadDate=()=>{
   leave.value=data.leaveByDate[date.value]??0;
   const year=date.value.slice(0,4);
   if(year!==shownYear){allowance.value=data.leaveAllowance[year]??'';shownYear=year;}
   balance();
  };
  date.onchange=loadDate;leave.onchange=balance;allowance.oninput=balance;loadDate();
  dialog.querySelector('#work-leave-back').onclick=()=>{correcting=false;render(true);};
  form.onsubmit=async event=>{
   event.preventDefault();
   const dateKey=date.value,days=Number(leave.value),year=dateKey.slice(0,4),limit=allowance.valueAsNumber;
   const submit=form.querySelector('button.primary'),error=form.querySelector('#work-leave-error');
   if(submit.disabled)return;
   submit.disabled=true;
   try{
    await read(true,true);
    const next=copy(data);
    if(days)next.leaveByDate[dateKey]=days;else delete next.leaveByDate[dateKey];
    if(Number.isFinite(limit))next.leaveAllowance[year]=limit;else delete next.leaveAllowance[year];
    if(await write(next)){correcting=false;message='연차 정보를 저장했어요.';render(true);}
    else error.textContent='저장하지 못했어요. 다시 시도해 주세요.';
   }catch{error.textContent='서버 기록을 불러오지 못했어요. 연결을 확인해 주세요.';}
   finally{submit.disabled=false;}
  };
 }
 function render(force=false){if(correcting&&!force)return;const now=Date.now(),a=data.active,personal=a?a.personal!==false:data.personal===true;
 button.hidden=!a;button.textContent=a?'● 근무 중':'◷ 근무 시간';button.classList.toggle('work-active',!!a);if(a)button.style.setProperty('display','inline-flex','important');else button.style.removeProperty('display');
 if(!dialog.open&&!force)return;const signature=JSON.stringify(data);if(!force&&signature===viewState&&dialog.querySelector('.work-weekly')){refreshMetrics();return;}
 if(dialog.open&&!force&&dialog.contains(document.activeElement)&&document.activeElement.matches("input,textarea,select"))return;
 const today=C.dateKey(now),all=data.rows.concat(a?[{...a,end:now}]:[]);
 const expanded=Array.from(dialog.querySelectorAll('details[open]')).map(d=>d.id);
 const todayRows=all.filter(r=>C.dateKey(r.start)===today).sort((x,y)=>x.start-y.start);
 const pastStart=a&&C.dateKey(a.start)!==today;
 const first=a?.start??todayRows[0]?.start,last=todayRows.at(-1);
 const startText=first?clock(first):'—',endText=!a&&last?clock(last.end):'—';
 dialog.innerHTML=`<button class="close" id="work-close" aria-label="근무창 닫기">×</button><h2>출퇴근 기록</h2>
 <section class="work-attendance" aria-label="오늘의 출퇴근">
   <div class="work-today-heading"><span id="work-live-label" data-idle="${last?'퇴근 완료':'출근 전'}"></span><span>오늘 근무 <b id="work-today-total"></b></span></div>
   <div><small>${pastStart?'이전 출근 · '+esc(C.dateKey(a.start)):'출근'}</small><strong>${startText}</strong></div>
   <div><small>퇴근</small><strong>${endText}</strong></div>
 </section>
 <button class="primary work-main-action" id="${a?'work-stop':'work-office'}">${a?'지금 퇴근':'지금 출근'}</button>
 ${message?'<p class="work-status" role="status">'+esc(message)+'</p>':''}
 ${undo&&undo.until>now?'<button class="ghost work-undo" id="work-undo">방금 출근 취소</button>':''}
 <div class="work-quick-actions">
 ${a?'<button class="ghost" id="work-adjust-active">출근 시간 수정</button>':''}
 <button class="ghost" id="work-manual">시간 직접 입력</button>
 <button class="ghost" id="work-lunch">점심시간 조정</button>
 <button class="ghost" id="work-leave">연차 관리</button>
 </div>
 ${weeklyMarkup(now)}
 <details id="work-history"><summary>지난 출퇴근 기록</summary>${historyMarkup(now)}</details>
 <details id="work-more"><summary>기타 설정</summary><div class="actions">${a?'<button class="ghost" id="work-pause">잠깐 쉬기</button>':personal?'<button class="ghost" id="work-remote">재택 근무 시작</button>':''}</div>
 ${personal?`<p class="work-note">하루 8시간 · 주간 재택 20시간 · 22시 이후 근무 제한</p>${!a?'<label>특별근무 사유 (선택)<input name="exception" maxlength="200" placeholder="필요한 날에만 입력"></label>':''}`:''}<button class="ghost" id="work-backup">근무 기록 백업</button></details><p class="work-note">내 계정에 저장되는 출퇴근 기록이에요.</p>`;
 const option=document.createElement('label');option.className='work-note';option.innerHTML=`<input type="checkbox" id="work-personal" ${personal?'checked':''} ${a?'disabled':''} style="display:inline;width:auto"> 내 회사 근무규칙 사용`;dialog.querySelector('#work-backup').before(option);
 const help=document.createElement('p');help.className='work-note';help.textContent='선택 사항: 하루 8시간 · 설정한 점심시간 제외 · 주간 재택 20시간 · 코어타임·22시 제한. 본인에게 해당할 때만 켜세요. 변경은 다음 근무부터 적용돼요.';option.after(help);dialog.querySelector('#work-more').append(option,help);

 dialog.querySelector('#work-personal').onchange=async e=>{await read(true);if(data.active)return;const n=copy(data);n.personal=e.target.checked;if(await write(n)){message=n.personal?'내 회사 규칙을 켰어요. 다음 근무부터 적용돼요.':'기본 시작·종료 모드로 바꿨어요.';render(true);}};
 for(const detail of dialog.querySelectorAll('details'))if(expanded.includes(detail.id))detail.open=true;
 dialog.querySelector('#work-close').onclick=()=>dialog.close();dialog.querySelector('#work-undo')?.addEventListener('click',undoStart);if(a){dialog.querySelector('#work-pause').onclick=()=>stop('휴식 시작');dialog.querySelector('#work-stop').onclick=withPending(()=>stop('근무 종료'));}else{dialog.querySelector('#work-office').onclick=withPending(()=>start('office'));if(dialog.querySelector('#work-remote'))dialog.querySelector('#work-remote').onclick=()=>start('remote');}
 dialog.querySelector('#work-leave').onclick=leaveSettings;
 for(const [id,direction] of [['#work-prev-week',-1],['#work-next-week',1]]){
  dialog.querySelector(id).onclick=()=>{historyWeek+=direction*7*C.day;render(true);dialog.querySelector(id+':not(:disabled)')?.focus();};
 }
 viewState=signature;dialog.querySelector('#work-lunch').onclick=lunchSettings;dialog.querySelector('#work-adjust-active')?.addEventListener('click',adjustActive);refreshMetrics();
 dialog.querySelectorAll('[data-correct]').forEach(b=>b.onclick=()=>correct(b.dataset.correct));dialog.querySelector('#work-manual').onclick=manual;dialog.querySelector('#work-backup').onclick=()=>{const url=URL.createObjectURL(new Blob([JSON.stringify(data,null,2)],{type:'application/json'})),link=document.createElement('a');link.href=url;link.download='근무기록-'+today+'.json';link.click();setTimeout(()=>URL.revokeObjectURL(url),1000);};
 }
 const timeValue=minutes=>String(Math.floor(minutes/60)).padStart(2,'0')+':'+String(minutes%60).padStart(2,'0');
 const timeMinutes=value=>/^\d{2}:\d{2}$/.test(value)?Number(value.slice(0,2))*60+Number(value.slice(3)):NaN;
 function lunchSettings(){correcting=true;const date=C.dateKey(Date.now());dialog.innerHTML=`<h2>점심시간 조정</h2><p class="work-note">기본은 13:00–14:00이에요. 선택한 날짜의 합계에 적용돼요.</p><form id="work-lunch-form"><label>날짜<input name="date" type="date" required value="${date}"></label><label><input name="none" type="checkbox" style="display:inline;width:auto"> 이날은 점심시간 제외 안 함</label><div class="work-time-fields"><label>점심 시작<input name="start" type="time" required></label><label>점심 종료<input name="end" type="time" required></label></div><p role="alert" id="lunch-error"></p><button class="primary">점심시간 저장</button><button type="button" class="ghost" id="lunch-back">돌아가기</button></form>`;const form=dialog.querySelector('form'),load=()=>{const t=Date.parse(form.elements.date.value+'T00:00:00+09:00');if(!Number.isFinite(t))return;const l=C.lunchFor(t,data.lunchByDate);form.elements.none.checked=!l;form.elements.start.value=timeValue(l?.start??780);form.elements.end.value=timeValue(l?.end??840);toggle();},toggle=()=>{form.elements.start.disabled=form.elements.end.disabled=form.elements.none.checked;};form.elements.date.onchange=load;form.elements.none.onchange=toggle;load();dialog.querySelector('#lunch-back').onclick=()=>{correcting=false;render(true);};form.onsubmit=async e=>{e.preventDefault();if(saving)return;const date=form.elements.date.value,start=timeMinutes(form.elements.start.value),end=timeMinutes(form.elements.end.value),none=form.elements.none.checked,error=dialog.querySelector('#lunch-error');if(!/^\d{4}-\d{2}-\d{2}$/.test(date)||!none&&(!Number.isFinite(start)||!Number.isFinite(end)||start<0||end>1440||end<=start)){error.textContent='점심 시작과 종료 순서를 확인해 주세요.';return;}const submit=form.querySelector('button[type=submit],button.primary');submit.disabled=true;try{await read(true);const n=copy(data);n.lunchByDate={...(n.lunchByDate||{}),[date]:none?{enabled:false}:{start,end}};record(n,'점심시간 수정',n.active?.mode||n.mode);if(n.active?.personal!==false&&n.active?.mode==='remote'){const now=Date.now(),limit=C.cutoff(n.active.start,'remote',!!n.active.exception);n.active.stopAt=C.finishAt(now,Math.max(0,20*C.hour-C.stats(n.rows,n.active,now,n.lunchByDate).weekRemote),limit,n.lunchByDate)??limit;}if(await write(n)){correcting=false;message=date+' 점심시간을 저장했어요.';render(true);}else error.textContent='저장하지 못했어요. 다시 시도해 주세요.';}finally{submit.disabled=false;}};}
 function adjustActive(){if(!data.active)return;correcting=true;const original=copy(data.active),val=t=>new Date(t+9*C.hour).toISOString().slice(0,16);dialog.innerHTML=`<h2>출근시간 수정</h2><p class="work-note">시작 시각만 바꿔요. 퇴근 전까지 실시간 기록이 계속돼요.</p><form id="work-active-form"><label>출근 · 한국 시간<input name="start" type="datetime-local" required max="${val(Date.now())}" value="${val(original.start)}"></label><p id="active-error" role="alert"></p><button class="primary">수정하고 실시간 기록 계속</button><button type="button" class="ghost" id="active-back">돌아가기</button></form>`;const form=dialog.querySelector('form');dialog.querySelector('#active-back').onclick=()=>{correcting=false;render(true);};form.onsubmit=async e=>{e.preventDefault();if(saving)return;const from=Date.parse(form.elements.start.value+'+09:00'),now=Date.now(),error=dialog.querySelector('#active-error');if(!Number.isFinite(from)||from>now){error.textContent='출근시간은 현재 시각 이전으로 입력해 주세요.';return;}await read(true);if(!data.active||data.active.id!==original.id||data.active.start!==original.start){error.textContent='다른 창이나 기기에서 근무 기록이 바뀌었어요. 돌아가서 다시 확인해 주세요.';return;}if(C.overlaps(data.rows,{start:from,end:now})){error.textContent='다른 근무 기록과 시간이 겹쳐요.';return;}const n=copy(data),a=n.active,personal=a.personal!==false,limit=personal?C.cutoff(from,a.mode,!!a.exception):Number.MAX_SAFE_INTEGER;if(personal&&(C.policy(from,a.mode,!!a.exception)||limit<now)){error.textContent='설정한 회사 근무규칙의 허용 시간을 벗어났어요.';return;}n.log.unshift({at:now,type:'진행 중 출근시간 수정',before:copy(a)});a.start=from;a.stopAt=limit;if(personal&&a.mode==='remote'&&C.stats(n.rows,a,now,n.lunchByDate).weekRemote>20*C.hour){error.textContent='수정하면 이번 주 재택 시간이 20시간을 넘어요.';return;}if(personal&&a.mode==='remote')a.stopAt=C.finishAt(now,20*C.hour-C.stats(n.rows,a,now,n.lunchByDate).weekRemote,limit,n.lunchByDate)??limit;form.querySelector('button').disabled=true;if(await write(n)){correcting=false;message='출근시간을 수정했어요. 실시간 기록은 계속돼요.';render(true);}else{error.textContent='저장하지 못했어요. 기존 출근시간은 그대로예요.';form.querySelector('button').disabled=false;}};}
 let correcting=false;function correct(id){correcting=true;const r=data.rows.find(x=>x.id===id);if(!r)return;const val=t=>new Date(t+9*C.hour).toISOString().slice(0,16);dialog.innerHTML=`<h2>근무 시간 바로잡기</h2><form id="work-correct"><label>시작 · 한국 시간<input name="start" type="datetime-local" required value="${val(r.start)}"></label><label>종료 · 한국 시간<input name="end" type="datetime-local" required value="${val(r.end)}"></label><label>수정 사유<input name="note" required maxlength="200"></label><p id="correct-error" role="alert"></p><button class="primary">수정 저장</button><button type="button" class="ghost" id="correct-cancel">돌아가기</button></form>`;const back=()=>{correcting=false;render(true);dialog.querySelector('#work-history').open=true;};dialog.querySelector('#correct-cancel').onclick=back;dialog.querySelector('form').onsubmit=async e=>{e.preventDefault();const f=new FormData(e.target),from=Date.parse(f.get('start')+'+09:00'),to=Date.parse(f.get('end')+'+09:00'),error=dialog.querySelector('#correct-error');await read(true);if(!(to>from)||to>Date.now()||C.dateKey(from)!==C.dateKey(to)){error.textContent='같은 날의 시작·종료 순서와 현재 시각을 확인해 주세요.';return;}if(C.overlaps(data.rows,{start:from,end:to},id)||data.active&&from<Date.now()&&to>data.active.start){error.textContent='다른 근무 기록과 시간이 겹쳐요.';return;}const note=f.get('note').trim();if(!note)return;const n=copy(data),item=n.rows.find(x=>x.id===id);if(!item){error.textContent='다른 기기에서 기록이 변경됐어요. 목록으로 돌아가 다시 열어 주세요.';return;}n.log.unshift({at:Date.now(),type:'시간 수정',before:copy(item),note});Object.assign(item,{start:from,end:to,stopAt:item.personal===false?Number.MAX_SAFE_INTEGER:C.cutoff(from,item.mode,!!item.exception)});if(item.personal!==false&&(C.policy(from,item.mode,!!item.exception)||to>item.stopAt)){error.textContent='근무 제한 시간을 넘길 수 없어요. 특별근무 기록은 사유와 함께 시작해 주세요.';return;}if(item.personal!==false&&C.stats(n.rows,null,from,n.lunchByDate).weekRemote>20*C.hour){error.textContent='수정하면 그 주의 재택 시간이 20시간을 넘어요.';return;}if(await write(n)){message='수정 이력과 함께 서버에 저장했어요.';back();}};}
 function manual(){correcting=true;const date=C.dateKey(Date.now());dialog.innerHTML=`<button class="close" id="manual-back" aria-label="근무 기록으로 돌아가기">×</button><h2>출퇴근 직접 입력</h2><p class="work-note">출근시간을 입력하고 지금까지 실시간으로 이어갈 수도 있어요. (한국 시간)</p><form id="work-manual-form">${data.active?'':'<label><input type="checkbox" name="state" value="live"> 아직 근무 중이에요</label>'}<label>날짜<input name="date" type="date" required max="${date}" value="${date}"></label><div class="work-time-fields"><label>출근 시간<input name="start" type="time" required></label><label>퇴근 시간<input name="end" type="time" required></label></div><details><summary>재택·메모 (선택)</summary>${data.personal?'<label>근무 방식<select name="mode"><option value="office">회사</option><option value="remote">재택</option></select></label>':''}<label>메모<input name="note" maxlength="200" placeholder="필요할 때만 남겨 주세요"></label></details><p id="manual-error" role="alert"></p><button class="primary">기록 저장</button><button type="button" class="ghost" id="manual-cancel">돌아가기</button></form>`;const form=dialog.querySelector('form'),back=()=>{correcting=false;render(true);};dialog.querySelector('#manual-back').onclick=back;dialog.querySelector('#manual-cancel').onclick=back;if(form.elements.state)form.elements.state.onchange=()=>{const live=form.elements.state.checked;form.elements.end.closest('label').hidden=live;form.elements.end.disabled=live;form.elements.end.required=!live;form.querySelector('button.primary').textContent=live?'이 출근시간부터 실시간 기록':'기록 저장';};form.onsubmit=async e=>{e.preventDefault();if(saving)return;const f=new FormData(form),live=f.get('state')==='live',now=Date.now(),from=Date.parse(f.get('date')+'T'+f.get('start')+'+09:00'),to=live?now:Date.parse(f.get('date')+'T'+f.get('end')+'+09:00'),error=dialog.querySelector('#manual-error');await read(true);const personal=data.personal===true,mode=personal?f.get('mode')||'office':'office';if(!Number.isFinite(from)||!Number.isFinite(to)||!(to>=from)||!live&&to===from||to>now||C.dateKey(from)!==C.dateKey(to)){error.textContent='같은 날의 출근·퇴근 순서와 현재 시각을 확인해 주세요.';return;}if(live&&data.active){error.textContent='이미 실시간 기록 중이에요. 돌아가서 출근시간 수정을 눌러 주세요.';return;}if(C.overlaps(data.rows,{start:from,end:to})||data.active&&from<now&&to>data.active.start){error.textContent='다른 근무 기록과 시간이 겹쳐요.';return;}const stopAt=personal?C.cutoff(from,mode,false):Number.MAX_SAFE_INTEGER;if(personal&&(C.policy(from,mode,false)||to>stopAt)){error.textContent='회사 근무규칙의 허용 시간을 벗어났어요.';return;}const n=copy(data),item={id:crypto.randomUUID(),start:from,mode,personal,automatic:false,manual:true,stopAt,note:String(f.get('note')||'').trim()};if(live){n.active=item;n.mode=mode;}else{item.end=to;n.rows.push(item);n.rows.sort((a,b)=>a.start-b.start);}n.log.unshift({at:now,type:live?'출근시간 입력 · 실시간 시작':'수동 기록 추가',mode,note:item.note,recordId:item.id});if(personal&&C.stats(n.rows,n.active,to,n.lunchByDate).weekRemote>20*C.hour){error.textContent='추가하면 그 주의 재택 시간이 20시간을 넘어요.';return;}if(live&&personal&&mode==='remote')item.stopAt=C.finishAt(now,20*C.hour-C.stats(n.rows,item,now,n.lunchByDate).weekRemote,stopAt,n.lunchByDate)??stopAt;form.querySelector('button.primary').disabled=true;if(await write(n)){correcting=false;message=live?'입력한 출근시간부터 실시간으로 기록하고 있어요.':'출퇴근 시간을 저장했어요.';if(!live)historyWeek=C.weekStart(from);render(true);if(!live)dialog.querySelector('#work-history').open=true;}else{error.textContent='저장하지 못했어요. 다시 시도해 주세요.';form.querySelector('button.primary').disabled=false;}};}
 const originalBounds=objects.map(o=>({...o}));const baseDraw=drawRoom,baseLayout=roomApplyLayout,basePose=pose,baseMove=move;let lastT=0;
 roomApplyLayout=function(){if(!office||roomPrefs.activeSpace==='dream'){for(const o of objects){const old=originalBounds.find(b=>b.id===o.id);o.w=old.w;o.h=old.h;}return baseLayout();}const boxes={focus:[407,290,185,95],notion:[407,260,185,95],calendar:[744,116,48,60],today:[128,113,110,80],study:[735,260,90,115],rest:[100,445,220,95]};for(const o of objects){const b=boxes[o.id];if(b)[o.x,o.y,o.w,o.h]=b;}};
 pose=function(kind){if(!office||roomPrefs.activeSpace==='dream')return basePose(kind);route=null;keys.clear();posture=kind;if(kind==='desk'){player.x=500;player.y=410;}else{player.x=200;player.y=490;}$('#panel').close();canvas.focus({preventScroll:true});};
 move=function(dx,dy,dt){if(dx||dy)route=null;return baseMove(dx,dy,dt);};
 function walkToDesk(){if(!office||roomPrefs.activeSpace==='dream')return;posture='stand';player.x=500;player.y=550;route=[{x:500,y:430},{x:500,y:410}];}
 function placeChanged(place){const viewportTop=window.scrollY;office=place?.kind==='office';route=null;if(['dream','office'].includes(roomPrefs.activeSpace))roomPrefs.activeSpace='current';document.querySelector('.room-top>span:first-of-type').textContent=office?'MY OFFICE':'HOME OFFICE';roomApplyLayout();if(office&&place?.source==='selection'&&!data.active)start('office',true);requestAnimationFrame(()=>window.scrollTo({top:viewportTop,left:0,behavior:'auto'}));}
 window.addEventListener('life-place-changed',e=>placeChanged(e.detail));

 drawRoom=function(t){deskButton.hidden=!office||roomPrefs.activeSpace==='dream'||roomEditing;if(!office||roomPrefs.activeSpace==='dream')return baseDraw(t);const dt=Math.min((t-lastT)/1000||0,.04);lastT=t;
 if(route&&!document.hidden){const next=route[0],dx=next.x-player.x,dy=next.y-player.y,d=Math.hypot(dx,dy),step=dt*115;if(d<=step+1){player.x=next.x;player.y=next.y;route.shift();if(!route.length){route=null;posture='desk';}}else{player.x+=dx/d*step;player.y+=dy/d*step;walk+=dt;}}
 // The shared interior renderer owns the company-room background and furniture.
 // Keep only route state here so the office is never painted twice.
 return baseDraw(t);
 };
 async function tick(fresh=false){await read(fresh);if(data.active&&Date.now()>=data.active.stopAt){const mode=data.active.mode;await stop(mode==='remote'?'재택 가능 시간 종료 · 자동 일시정지':'22시 제한 · 자동 일시정지');}if(undo&&Date.now()>undo.until)undo=null;render();}
 window.addEventListener('storage',e=>{if(e.key===key)tick();});document.addEventListener('visibilitychange',()=>{if(!document.hidden)tick(true);});
 await read(true);if(data.active&&C.dateKey(data.active.start)!==C.dateKey(Date.now()))message='이전 날짜에 시작한 근무가 아직 진행 중이에요. 근무창에서 종료한 뒤 시간을 수정해 주세요.';placeChanged(window.placeRooms?.current());await tick();setInterval(tick,15000);setInterval(()=>{if(!document.hidden)refreshMetrics();},1000);
 const style=document.createElement('style');style.textContent='.office-desk-hit{position:absolute;left:47.5%;top:39.5%;width:10.5%;height:16%;z-index:4;border:2px solid transparent;border-radius:10px;background:transparent;cursor:pointer}.office-desk-hit:hover,.office-desk-hit:focus-visible{border-color:#f4dc91;background:#fff2b21f;outline:none}.office-desk-hit[hidden]{display:none}#workday-dialog{width:min(640px,94vw);max-height:90vh;overflow:auto;border:1px solid #d7dece;background:#faf8f2;border-radius:22px;padding:28px;color:#3b4b35}#workday-dialog::backdrop{background:#25332180}.work-metrics,.work-period{display:grid;grid-template-columns:1fr 1fr;gap:12px}.work-metrics>div,.work-period>p{padding:18px;background:#e9efdf;border-radius:16px;margin:0}.work-metrics small,.work-metrics span,.work-period span{display:block;font-size:12px;color:#758268}.work-metrics strong,.work-period strong{display:block;font-size:24px;margin:12px 0}.work-status{font-size:14px;line-height:1.8}.work-undo{margin-top:-4px}.work-rules{padding:15px;background:#f0ede1;border-radius:13px}.work-rules p,.work-note{font-size:12px;line-height:1.8;color:#78816d}.header-right .work-active{background:#55735d;color:#fff;border-color:#55735d}#workday-dialog .actions{display:flex;flex-wrap:wrap;gap:10px;margin:20px 0}#workday-dialog label{display:block;font-size:13px;margin:14px 0}#workday-dialog input,#workday-dialog select{display:block;width:100%;box-sizing:border-box;padding:12px;border:1px solid #d8ddce;border-radius:10px;margin-top:8px;background:white;color:inherit}.work-row{padding:14px 0;border-bottom:1px solid #ddd}#workday-dialog details{margin:20px 0}#workday-dialog summary{font-size:13px;cursor:pointer}@media(max-width:520px){#workday-dialog{padding:22px 18px}.work-metrics,.work-period{grid-template-columns:1fr}.work-metrics strong,.work-period strong{font-size:20px}.office-desk-hit{left:45%;width:16%;min-height:44px}.header-right .work-active{display:inline-flex!important;max-width:145px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}}';document.head.append(style);
})();

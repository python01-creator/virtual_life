(() => {
 let selected=localDay(),month=selected.slice(0,7),busy=false;
 const esc=lifeText;
 const rows=()=>lifeRecords.filter(r=>r.home===lifeHome.id&&!r.deleted&&r.kind==='schedule').sort((a,b)=>a.when.localeCompare(b.when));
 function snapshot(){return {configured:true,connected:true,ready:true,busy,status:'HQ 서버 캘린더',events:rows().filter(r=>r.when.slice(0,10)===localDay()).map(r=>({title:r.title,start:r.when,allDay:!r.when.includes('T'),location:r.place||''}))};}
 function announce(){window.dispatchEvent(new CustomEvent('life-calendar-change',{detail:snapshot()}));}
 async function refresh(){busy=true;try{await window.lifeAppReady;await lifeRefresh();render();announce();}catch{document.querySelector('#hq-calendar-status')?.replaceChildren('일정을 불러오지 못했어요. 다시 열어 주세요.');}finally{busy=false;}}
 function render(){
  const root=document.querySelector('#hq-server-calendar');if(!root)return;
  const first=new Date(month+'-01T12:00:00'),count=new Date(first.getFullYear(),first.getMonth()+1,0).getDate(),events=rows();
  root.innerHTML='<h2>내 캘린더</h2><div class="actions"><button class="ghost" data-month="-1">이전 달</button><strong>'+esc(month)+'</strong><button class="ghost" data-month="1">다음 달</button></div><div class="room-cal-grid">'+['일','월','화','수','목','금','토'].map(x=>'<span class="room-cal-week">'+x+'</span>').join('')+'<span></span>'.repeat(first.getDay())+Array.from({length:count},(_,i)=>{const day=month+'-'+String(i+1).padStart(2,'0');const has=lifeRecords.some(r=>!r.deleted&&r.home===lifeHome.id&&window.CalendarRecordsCore.dateOf(r)===day);return '<button class="room-cal-day '+(selected===day?'selected':'')+'" data-day="'+day+'">'+(i+1)+(has?'<i></i>':'')+'</button>';}).join('')+'</div><h3>'+esc(selected)+'</h3><p id="hq-calendar-status" role="status"></p><div id="hq-events"></div><div class="actions"><button class="primary" id="hq-add-event">일정 추가</button></div><h3>이날의 기록</h3><div id="hq-day-records"></div>';
  for(const b of root.querySelectorAll('[data-month]'))b.onclick=()=>{first.setMonth(first.getMonth()+Number(b.dataset.month));month=first.getFullYear()+'-'+String(first.getMonth()+1).padStart(2,'0');selected=month+'-01';render();};
  for(const b of root.querySelectorAll('[data-day]'))b.onclick=()=>{selected=b.dataset.day;render();};
  root.querySelector('#hq-add-event').onclick=()=>edit();
  const list=root.querySelector('#hq-events');
  for(const row of events.filter(r=>r.when.slice(0,10)===selected)){const b=document.createElement('button');b.className='room-cal-record';b.textContent=(row.when.slice(11,16)||'하루 종일')+' · '+row.title;b.onclick=()=>edit(row);list.append(b);}
  if(!list.childElementCount)list.textContent='등록된 일정이 없어요.';
  for(const row of lifeRecords.filter(r=>!r.deleted&&r.home===lifeHome.id&&r.kind!=='schedule'&&window.CalendarRecordsCore.dateOf(r)===selected)){const b=document.createElement('button');b.className='room-cal-record';b.textContent=row.title||'기록';b.onclick=()=>{document.querySelector('#panel').close();lifeRead(row.id);};root.querySelector('#hq-day-records').append(b);}
 }
 function edit(row){
  const root=document.querySelector('#hq-server-calendar'),owner=window.lifeCloud?.userId,home=lifeHome.id;
  root.innerHTML='<h2>'+ (row?'일정 수정':'일정 추가')+'</h2><form><label class="field">제목<input name="title" required maxlength="180" value="'+esc(row?.title||'')+'"></label><label class="field">날짜<input name="date" type="date" required value="'+esc(row?.when.slice(0,10)||selected)+'"></label><label class="field">시간 (선택)<input name="time" type="time" value="'+esc(row?.when.slice(11,16)||'')+'"></label><label class="field">장소<input name="place" maxlength="200" value="'+esc(row?.place||'')+'"></label><label class="field">메모<textarea name="body" maxlength="5000">'+esc(row?.body||'')+'</textarea></label><p role="status"></p><div class="actions"><button class="primary">저장</button><button class="ghost" type="button">돌아가기</button></div></form>';
  const form=root.querySelector('form');form.querySelector('[type=button]').onclick=render;
  form.onsubmit=async e=>{e.preventDefault();if(busy)return;busy=true;form.querySelector('button').disabled=true;try{const f=new FormData(form),now=new Date().toISOString(),title=String(f.get('title')).trim();if(!title)throw Error('제목을 적어 주세요.');if(owner!==window.lifeCloud?.userId||home!==lifeHome.id)throw Error('로그인 상태를 확인해 주세요.');await lifePut({...row,id:row?.id||crypto.randomUUID(),home,kind:'schedule',title,when:f.get('date')+(f.get('time')?'T'+f.get('time'):''),place:String(f.get('place')),body:String(f.get('body')),share:false,created:row?.created||now,updated:now});await lifeRefresh();render();announce();}catch(error){form.querySelector('[role=status]').textContent=error.message||'저장하지 못했어요.';form.querySelector('button').disabled=false;}finally{busy=false;}};
 }
 const old=openPanel;openPanel=function(key){if(key!=='calendar')return old(key);document.querySelector('#panel-content').innerHTML='<section id="hq-server-calendar"></section>';keys.clear();if(!document.querySelector('#panel').open)document.querySelector('#panel').showModal();render();refresh();};
 window.lifeCalendar={open:()=>openPanel('calendar'),snapshot,refreshToday:refresh};
})();

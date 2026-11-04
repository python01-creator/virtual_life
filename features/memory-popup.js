/* MEMORY_POPUP_V1 */
(async()=>{
 if(window.lifeCloud){try{await window.lifeCloud.ready;await window.lifeAppReady;}catch{return;}}
 if(!roomPrefs.chocoWallV2){roomPrefs.chocoWallV2=true;roomPrefs.layout.memory={x:0,y:0};lifeRoomSave();}
 const originalParent=lifeShell.parentNode;let memoryOpen=false,memoryRecordsOpen=false,stopMemoryRoom=()=>{};
 const memoryName=()=>String(roomPrefs.memorySpaceName||'쪼꼬').trim().slice(0,20)||'쪼꼬';window.lifeMemorySpaceName=memoryName;
 const baseLabel=label;label=function(text,...args){return baseLabel(text==='쪼꼬'?memoryName():text,...args);};
 const owner=window.lifeCloud?.userId;
 function applyMemoryName(){
  const name=memoryName();
  // Category templates use innerHTML; keep user text in textContent-only surfaces.
  lifeCategories.choco[0]='나의 기억';lifeCategories.choco[1]='소중한 기억을 모아두는 나만의 공간';
  button?.setAttribute('aria-label',name+' MEMORY · 추억 팝업');if(button)button.title=name;
  for(const selector of ['[data-life="choco"]','[data-more-action="choco"]']){const item=document.querySelector(selector);if(item)item.textContent='💛 '+name;}
  if(lifePage!=='choco')return;
  lifeShell.querySelector('.choco-hero')?.remove();
  const header=lifeShell.querySelector('.life-heading'),heading=header?.querySelector('h1');if(!heading)return;
  heading.textContent=name;header.querySelector('.eyebrow')?.remove();header.querySelector('p')?.remove();
  const search=lifeShell.querySelector('#life-search');if(search)search.placeholder='기억 찾기';
  const empty=lifeShell.querySelector('.empty-state');if(empty)empty.textContent='아직 남긴 기억이 없어요.';
  if(header.querySelector('#memory-name-edit'))return;
  const actions=document.createElement('div');actions.className='memory-header-actions';
  const edit=document.createElement('button');edit.type='button';edit.id='memory-name-edit';edit.className='ghost';edit.textContent='공간 이름 편집';
  const add=header.querySelector('#life-add');actions.append(edit);if(add){add.textContent='＋ 기록 남기기';actions.append(add);}header.append(actions);
  edit.onclick=()=>{
   const form=document.createElement('form');form.className='memory-name-form';
   form.innerHTML='<input name="name" aria-label="공간 이름" maxlength="20" required autocomplete="off"><div class="memory-name-actions"><button class="primary" type="submit">저장</button><button class="ghost" type="button" data-memory-cancel>취소</button></div><p class="save-state" role="status"></p>';
   const input=form.elements.name;input.value=memoryName();heading.hidden=true;heading.after(form);edit.hidden=true;
   const cancel=()=>{form.remove();heading.hidden=false;edit.hidden=false;edit.focus();};
   form.querySelector('[data-memory-cancel]').onclick=cancel;
   form.onkeydown=e=>{if(e.key==='Escape'){e.preventDefault();e.stopPropagation();cancel();}};
   form.onsubmit=async e=>{
    e.preventDefault();const next=input.value.trim().slice(0,20),status=form.querySelector('[role="status"]');
    if(!next){status.textContent='이름을 입력해 주세요.';input.focus();return;}
    if(window.lifeCloud&&(!owner||owner!==window.lifeCloud.userId)){status.textContent='로그인 상태를 확인해 주세요.';return;}
    const controls=[...form.querySelectorAll('input,button')];controls.forEach(el=>el.disabled=true);status.textContent='저장 중…';
    try{
     const prefs={...roomPrefs,memorySpaceName:next};
     if(window.lifeCloud)await window.lifeCloud.setSetting(lifeKey('room'),prefs);
     if(window.lifeCloud&&owner!==window.lifeCloud.userId)return;
     roomPrefs.memorySpaceName=next;
     try{localStorage.setItem(lifeKey('room'),JSON.stringify(roomPrefs));}catch{}
     applyMemoryName();if(lifePage==='choco')lifeRender();toast('공간 이름을 저장했어요.');
    }catch{status.textContent='이름을 저장하지 못했어요. 다시 시도해 주세요.';controls.forEach(el=>el.disabled=false);}
   };
   input.focus({preventScroll:true});input.select();
  };
 }
 function memoryOfferings(stage){
  const view=memoryPanel('추모 선반');
  const editor=document.createElement('section');editor.className='memory-offerings-editor';editor.setAttribute('aria-label','좋아하던 것들 놓기');
  editor.innerHTML='<h3>좋아하던 것들</h3><div class="memory-offerings-list"></div><form class="memory-offerings-form"><label>종류<select name="kind"><option value="snack">🍪 간식</option><option value="toy">🧸 장난감</option><option value="flower">🌼 꽃</option><option value="keepsake">🎁 소중한 물건</option></select></label><label>이름<input name="name" maxlength="30" required placeholder="좋아하던 간식이나 물건"></label><label class="wide">짧은 추억 (선택)<input name="memory" maxlength="160" placeholder="이걸 보면 떠오르는 기억"></label><div class="memory-offerings-actions wide"><button class="primary" type="submit">선반에 놓기</button></div></form><p class="memory-offerings-status" role="status"></p>';
  view.body.append(editor);const list=editor.querySelector('.memory-offerings-list'),form=editor.querySelector('form'),status=editor.querySelector('[role="status"]');
  const allItems=()=>Array.isArray(roomPrefs.memoryOfferings)?roomPrefs.memoryOfferings:[];const items=()=>allItems().filter(x=>!x.stored).slice(0,6);
  const kinds={snack:'🍪',toy:'🧸',flower:'🌼',keepsake:'🎁'};let busy=false;
  function draw(){list.replaceChildren();for(const item of allItems()){const row=document.createElement('div');row.className='memory-offering-row';const icon=document.createElement('span');icon.textContent=kinds[item.kind]||'🎁';const text=document.createElement('div'),title=document.createElement('strong'),memo=document.createElement('p');title.textContent=item.name;memo.textContent=item.memory||'';text.append(title,memo);const remove=document.createElement('button');remove.type='button';remove.className='ghost';remove.textContent=item.stored?'다시 놓기':'거두기';remove.onclick=()=>{if(item.stored&&items().length>=6){status.textContent='선반에는 여섯 개까지 놓을 수 있어요.';return;}save(allItems().map(x=>x.id===item.id?{...x,stored:!x.stored}:x),item.stored?'다시 선반에 놓았어요.':'거두어 보관했어요. 언제든 다시 놓을 수 있어요.');};row.append(icon,text,remove);list.append(row);}form.querySelector('[type="submit"]').disabled=items().length>=6;}
  async function save(next,message){
   if(busy)return;if(window.lifeCloud&&(!owner||owner!==window.lifeCloud.userId)){status.textContent='로그인 상태를 확인해 주세요.';return;}
   busy=true;editor.querySelectorAll('button,input,select').forEach(el=>el.disabled=true);status.textContent='저장 중…';
   try{const prefs={...roomPrefs,memoryOfferings:next};if(window.lifeCloud)await window.lifeCloud.setSetting(lifeKey('room'),prefs);if(window.lifeCloud&&owner!==window.lifeCloud.userId)return;roomPrefs.memoryOfferings=next;try{localStorage.setItem(lifeKey('room'),JSON.stringify(roomPrefs));}catch{}form.reset();draw();const tray=stage.querySelector('.memory-offering-tray');tray?.replaceChildren();for(const item of next.filter(x=>!x.stored).slice(0,6)){const icon=document.createElement('span');icon.textContent=kinds[item.kind]||'🎁';tray?.append(icon);}status.textContent=message+(next.filter(x=>!x.stored).length>=6?' 선반에는 여섯 개까지 놓을 수 있어요.':'');}
   catch{status.textContent='저장하지 못했어요. 다시 시도해 주세요.';}
   finally{busy=false;editor.querySelectorAll('button,input,select').forEach(el=>el.disabled=false);draw();}
  }
  form.onsubmit=e=>{e.preventDefault();const name=form.elements.name.value.trim();if(!name||items().length>=6)return;save([...allItems(),{id:crypto.randomUUID(),kind:form.elements.kind.value,name,memory:form.elements.memory.value.trim()}],'마음을 담아 선반에 놓았어요.');};
  draw();
 }
 // Keep record actions inside the existing memory dialog, with the room behind them.
 let closeMemoryPanel=()=>{};
 function memoryPanel(title){
  const returnTarget=document.activeElement;closeMemoryPanel();lifeDialog.scrollTop=0;
  const overlay=document.createElement('div');overlay.className='memory-inner-overlay';
  const panel=document.createElement('section');panel.className='memory-inner-panel';panel.setAttribute('role','region');panel.setAttribute('aria-label',title);
  const close=document.createElement('button');close.type='button';close.className='ghost memory-inner-close';close.textContent='← 기억의 방';
  const body=document.createElement('div');body.className='memory-inner-body';panel.append(close,body);overlay.append(panel);lifeDialog.append(overlay);lifeDialog.classList.add('memory-child-open');lifeShell.inert=true;close.focus({preventScroll:true});
  let restore=()=>{};const cleanup=()=>{if(lifeEditorDirty&&body.querySelector('#story-form'))lifeKeepDraft();restore();overlay.remove();lifeShell.inert=false;lifeDialog.classList.remove('memory-child-open');lifeDialog.removeEventListener('cancel',escape);closeMemoryPanel=()=>{};(returnTarget?.isConnected&&lifeShell.contains(returnTarget)?returnTarget:lifeShell.querySelector('.memory-scene-shelf'))?.focus({preventScroll:true});};
  const escape=e=>{e.preventDefault();e.stopImmediatePropagation();cleanup();};lifeDialog.addEventListener('cancel',escape);close.onclick=cleanup;overlay.onclick=e=>{if(e.target===overlay)cleanup();};closeMemoryPanel=cleanup;
  return {body,onClose:fn=>{restore=fn;}};
 }
 const memoryShowBase=lifeShow;lifeShow=function(html){if(html&&memoryOpen&&lifePage==='choco'&&lifeShell.querySelector('.memory-room-stage')?.isConnected){const view=memoryPanel('기억 읽고 쓰기');view.body.innerHTML=html;keys.clear();return;}closeMemoryPanel();return memoryShowBase(html);};
 function memoryFramePhoto(body,stage,ownRecords){
  const box=document.createElement('section');box.className='memory-frame-editor';
  box.innerHTML='<div class="memory-frame-preview"></div><label class="field">액자에 넣을 사진<input type="file" accept="image/jpeg,image/png,image/webp" aria-label="액자 사진 선택"><small>JPG · PNG · WebP. 사진을 고른 뒤 저장해 주세요.</small></label><button class="primary" type="button" disabled>액자 사진 저장</button><p class="save-state" role="status"></p>';
  body.append(box);const preview=box.querySelector('.memory-frame-preview'),input=box.querySelector('input'),save=box.querySelector('button'),status=box.querySelector('[role="status"]');let pending='',saving=false;
  const safe=photo=>typeof photo==='string'&&/^(data:image\/(?:png|jpeg|webp);base64,|https:\/\/)/.test(photo);
  function show(photo){preview.replaceChildren();if(!safe(photo)){const empty=document.createElement('p');empty.textContent='좋아하는 사진을 액자에 넣어 주세요.';preview.append(empty);return;}const image=document.createElement('img');image.src=photo;image.alt='추억 액자 사진';image.referrerPolicy='no-referrer';preview.append(image);}
  show(safe(roomPrefs.memoryFramePhoto)?roomPrefs.memoryFramePhoto:ownRecords.find(r=>safe(r.photo))?.photo);
  input.onchange=async()=>{const file=input.files[0];if(!file)return;pending='';save.disabled=true;status.textContent='사진을 준비하는 중…';try{if(file.size>15000000)throw Error('size');const photo=await lifePhoto(file);if(photo.length>2500000)throw Error('size');pending=photo;show(photo);save.disabled=false;status.textContent='미리보기예요. 저장하면 방 안 액자에도 보여요.';}catch(e){status.textContent=e.message==='size'?'사진이 너무 커요. 조금 작은 사진을 골라 주세요.':'사진을 열 수 없어요. JPG, PNG, WebP 파일을 골라 주세요.';}};
  save.onclick=async()=>{if(!pending||saving)return;if(window.lifeCloud&&(!owner||owner!==window.lifeCloud.userId)){status.textContent='로그인 상태를 확인해 주세요.';return;}saving=true;input.disabled=true;save.disabled=true;status.textContent='저장 중…';try{const photo=pending,prefs={...roomPrefs,memoryFramePhoto:photo};if(window.lifeCloud)await window.lifeCloud.setSetting(lifeKey('room'),prefs);if(window.lifeCloud&&owner!==window.lifeCloud.userId)return;roomPrefs.memoryFramePhoto=photo;try{localStorage.setItem(lifeKey('room'),JSON.stringify(roomPrefs));}catch{}const frame=stage.querySelector('.memory-scene-frame');if(frame){let image=frame.querySelector('img');if(!image){image=document.createElement('img');image.className='memory-frame-photo';image.alt='';image.referrerPolicy='no-referrer';frame.prepend(image);}image.src=photo;}pending='';status.textContent='액자 사진을 저장했어요.';}catch{status.textContent='저장하지 못했어요. 다시 눌러 주세요.';}finally{saving=false;input.disabled=false;save.disabled=!pending;}};
 }
 function memoryRoom(){
  stopMemoryRoom();if(!window.lifeMemoryRoom)return;
  const header=lifeShell.querySelector('.life-heading'),toolbar=lifeShell.querySelector('.life-toolbar'),results=lifeShell.querySelector('#life-results');if(!header||!toolbar||!results)return;
  const stage=document.createElement('section');stage.className='memory-room-stage';header.after(stage);
  const records=document.createElement('details');records.className='memory-records-panel';records.open=memoryRecordsOpen||!!lifeFilter;records.ontoggle=()=>{if(records.isConnected)memoryRecordsOpen=records.open;};
  const summary=document.createElement('summary');summary.textContent='기록 모아보기 · '+results.querySelectorAll('.memory-card').length;records.append(summary,toolbar,results);stage.after(records);
  const browse=(frame=false)=>{const title=frame?'추억 액자':'기억 책장';const view=memoryPanel(title);const heading=document.createElement('h2');heading.textContent=title;view.body.append(heading);if(frame)memoryFramePhoto(view.body,stage,ownRecords);records.open=true;view.body.append(records);view.onClose(()=>{stage.after(records);records.open=false;memoryRecordsOpen=false;});const search=records.querySelector('#life-search');if(search){search.oninput=()=>{const query=search.value.trim().toLocaleLowerCase();let count=0;for(const card of results.querySelectorAll('.memory-card')){card.hidden=!card.textContent.toLocaleLowerCase().includes(query);if(!card.hidden)count++;}records.querySelector('.life-count').textContent=count+'개의 이야기';let empty=records.querySelector('.memory-search-empty');if(!empty){empty=document.createElement('p');empty.className='memory-search-empty';empty.textContent='찾는 기억이 없어요.';results.append(empty);}empty.hidden=count>0;};search.focus({preventScroll:true});}};
  const ownRecords=lifeRecords.filter(r=>r.home===lifeHome.id&&r.kind==='choco'&&!r.deleted);
  stopMemoryRoom=window.lifeMemoryRoom.mount(stage,{name:memoryName(),records:ownRecords,framePhoto:roomPrefs.memoryFramePhoto,onFrame:()=>browse(true),offerings:Array.isArray(roomPrefs.memoryOfferings)?roomPrefs.memoryOfferings.filter(x=>!x.stored):[],onOfferings:()=>memoryOfferings(stage),onBrowse:()=>browse(),onLetter:()=>{if(window.lifeCloud&&window.lifeCloud.userId!==owner)return;lifeEdit(null,'choco',memoryName()+'에게');}});
 }
 function memoryReturn(){if(lifeDialog.querySelector('.memory-inner-overlay'))return;const root=document.querySelector('#life-content');if(!root||root.querySelector('#memory-return'))return;const back=document.createElement('button');back.id='memory-return';back.type='button';back.className='ghost memory-return';back.textContent='← 기억의 방';back.onclick=()=>{if(lifeEditorDirty)lifeKeepDraft();openMemory();};root.prepend(back);}
 function mount(){memoryOpen=true;lifeDialog.classList.add('memory-active');document.querySelector('main').hidden=false;lifeShell.querySelector('.object-back')?.remove();lifeShell.hidden=false;lifeShow('');document.querySelector('#life-content').append(lifeShell);lifeShell.classList.add('memory-in-dialog');memoryRoom();}
 const renderBase=lifeRender;lifeRender=function(){if(lifePage==='choco'&&!lifeShell.isConnected){lifeShell.hidden=true;originalParent.append(lifeShell);}if(lifePage==='choco'){const records=lifeShell.querySelector('.memory-records-panel');if(records)memoryRecordsOpen=records.open;}const result=renderBase();if(lifePage==='choco'){applyMemoryName();mount();}return result;};
 async function openMemory(){await lifeRefresh();lifeFilter='';lifePage='choco';lifeRender();lifeDialog.scrollTop=0;keys.clear();}
 const goBase=lifeGo;lifeGo=async function(k){if(k==='choco')return openMemory();return goBase(k);};
 const editBase=lifeEdit;lifeEdit=function(...args){editBase(...args);if((args[0]?.kind||args[1])!=='choco')return;if(!lifeShell.isConnected)stopMemoryRoom();memoryOpen=true;memoryReturn();const form=document.querySelector('#story-form');if(!form)return;if(!args[0]&&args[2]?.endsWith('에게')){const heading=lifeDialog.querySelector('.memory-inner-panel h2');if(heading)heading.textContent='편지 쓰기';}const submit=form.onsubmit;form.onsubmit=async e=>{await submit(e);await new Promise(resolve=>setTimeout(resolve,0));if(!lifeDialog.open||!document.querySelector('#story-form'))await openMemory();};};
 lifeDialog.addEventListener('close',()=>{if(lifeDialog.open||!memoryOpen)return;closeMemoryPanel();stopMemoryRoom();memoryOpen=false;lifeDialog.classList.remove('memory-active');lifeShell.classList.remove('memory-in-dialog');lifeShell.hidden=true;if(lifeShell.parentNode!==originalParent)originalParent.append(lifeShell);if(lifePage==='choco'){lifePage='room';document.querySelector('main').hidden=false;}});
 document.addEventListener('life-session-ended',()=>{closeMemoryPanel();stopMemoryRoom();lifeShell.querySelector('.memory-room-stage')?.replaceChildren();});
 const readBase=lifeRead;lifeRead=function(id){readBase(id);const record=lifeRecords.find(r=>r.id===id);if(record?.kind!=='choco')return;if(!lifeShell.isConnected)stopMemoryRoom();memoryOpen=true;memoryReturn();const remove=document.querySelector('#life-delete');if(remove)remove.onclick=async()=>{remove.disabled=true;try{await lifePut({...record,deleted:true,updated:new Date().toISOString()});await openMemory();toast('기억을 휴지통으로 옮겼어요.');}catch{toast('저장하지 못했어요. 다시 시도해 주세요.');remove.disabled=false;}};};
 const button=document.createElement('button');button.className='memory-object-link';button.setAttribute('aria-label','쪼꼬 MEMORY · 추억 팝업');button.title='쪼꼬 · 소중한 추억';button.onclick=openMemory;document.querySelector('.canvas-wrap').append(button);const draw=drawRoom;drawRoom=function(t){button.hidden=roomPrefs.activeSpace==='dream'||roomPrefs.activeSpace==='office'||roomPrefs.activeSpace==='family'||roomEditing;return draw(t);};
 applyMemoryName();lifeMenu();
 const personalStyle=document.createElement('style');personalStyle.textContent='.memory-in-dialog .life-heading{align-items:center;flex-direction:row;flex-wrap:wrap;gap:12px;margin:0 0 16px}.memory-in-dialog .life-heading>div:first-child{flex:1;min-width:160px}.memory-in-dialog .life-heading h1{font-size:24px;margin:0;overflow-wrap:anywhere}.memory-header-actions{display:flex;align-items:center;gap:8px;flex-wrap:wrap}.memory-header-actions button{min-height:36px;padding:8px 11px;font-size:12px}.memory-header-actions #memory-name-edit{border:0;background:transparent;color:#78816d}.memory-name-form{display:grid;gap:8px;max-width:100%;margin:0}.memory-name-form input{width:100%;min-width:0;font-size:22px;font-weight:650;border:1px solid #aab89c;border-radius:9px;padding:7px 10px;background:#fffdf7;color:var(--ink)}.memory-name-actions{display:flex;gap:6px}.memory-name-actions button{min-height:34px;padding:6px 12px;font-size:12px}.memory-name-form .save-state:empty{display:none}.memory-in-dialog .life-toolbar{margin:12px 0}.memory-in-dialog .empty-state{padding:28px 14px}.memory-in-dialog .life-heading:has(.memory-name-form) .memory-header-actions{display:none}@media(max-width:560px){.memory-in-dialog .life-heading{gap:10px}.memory-header-actions{gap:4px}.memory-header-actions button{font-size:11px;padding:8px}.memory-in-dialog .life-heading h1{font-size:22px}}';document.head.append(personalStyle);
 const clock=document.createElement('button');clock.className='focus-clock-hit';clock.setAttribute('aria-label','포커스 데스크 시계 · 포커스 타이머');clock.title='포커스 타이머';clock.onclick=()=>openPanel('focus');document.querySelector('.canvas-wrap').append(clock);const drawClock=drawRoom;drawRoom=function(t){clock.hidden=roomEditing||['dream','office','family'].includes(roomPrefs.activeSpace);const p=roomPrefs.layout.focus||{x:0,y:0};clock.style.left=(220+p.x)/9.6+'%';clock.style.top=(302+p.y)/6.5+'%';return drawClock(t);};
 const clockStyle=document.createElement('style');clockStyle.textContent='.focus-clock-hit{position:absolute;width:3.65%;height:5.23%;background:transparent;border:0;border-radius:3px;padding:0;cursor:pointer;z-index:2}.focus-clock-hit[hidden]{display:none}.focus-clock-hit:hover,.focus-clock-hit:focus-visible{outline:2px solid #e4c77d;outline-offset:2px}';document.head.append(clockStyle);
 const style=document.createElement('style');style.textContent='.memory-object-link{position:absolute;left:26%;top:15.38%;width:6%;height:8.6%;border:2px solid transparent;border-radius:6px;background:transparent;cursor:pointer}.memory-object-link:hover,.memory-object-link:focus-visible{border-color:#f9e5ad;outline:none}.memory-object-link[hidden]{display:none}.memory-in-dialog{padding:0!important;max-width:100%;margin:0}.memory-in-dialog .life-heading h1{font-size:24px}.memory-in-dialog .choco-hero{padding:20px;grid-template-columns:55px 1fr;gap:12px}.memory-in-dialog .choco-hero .symbol{font-size:36px}.memory-in-dialog .choco-hero blockquote{font-size:16px}.memory-in-dialog .life-grid{grid-template-columns:repeat(2,minmax(0,1fr))}@media(max-width:560px){.memory-in-dialog .life-grid{grid-template-columns:1fr}.memory-in-dialog .choco-hero{grid-template-columns:1fr}}';document.head.append(style);
})();



/* MEMORY_POPUP_V1 */
(async()=>{
 if(window.lifeCloud){try{await window.lifeCloud.ready;await window.lifeAppReady;}catch{return;}}
 if(!roomPrefs.chocoWallV2){roomPrefs.chocoWallV2=true;roomPrefs.layout.memory={x:0,y:0};lifeRoomSave();}
 const originalParent=lifeShell.parentNode;let memoryOpen=false;
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
 function mount(){memoryOpen=true;document.querySelector('main').hidden=false;lifeShell.querySelector('.object-back')?.remove();lifeShell.hidden=false;lifeShow('');document.querySelector('#life-content').append(lifeShell);lifeShell.classList.add('memory-in-dialog');}
 const renderBase=lifeRender;lifeRender=function(){if(lifePage==='choco'&&!lifeShell.isConnected){lifeShell.hidden=true;originalParent.append(lifeShell);}const result=renderBase();if(lifePage==='choco'){applyMemoryName();mount();}return result;};
 async function openMemory(){await lifeRefresh();lifeFilter='';lifePage='choco';lifeRender();keys.clear();}
 const goBase=lifeGo;lifeGo=async function(k){if(k==='choco')return openMemory();return goBase(k);};
 const editBase=lifeEdit;lifeEdit=function(...args){editBase(...args);if((args[0]?.kind||args[1])!=='choco')return;memoryOpen=true;const form=document.querySelector('#story-form');if(!form)return;const submit=form.onsubmit;form.onsubmit=async e=>{await submit(e);await new Promise(resolve=>setTimeout(resolve,0));if(!lifeDialog.open||!document.querySelector('#story-form'))await openMemory();};};
 lifeDialog.addEventListener('close',()=>{if(lifeDialog.open||!memoryOpen)return;memoryOpen=false;lifeShell.classList.remove('memory-in-dialog');lifeShell.hidden=true;if(lifeShell.parentNode!==originalParent)originalParent.append(lifeShell);if(lifePage==='choco'){lifePage='room';document.querySelector('main').hidden=false;}});
 const readBase=lifeRead;lifeRead=function(id){readBase(id);const record=lifeRecords.find(r=>r.id===id);if(record?.kind!=='choco')return;memoryOpen=true;const remove=document.querySelector('#life-delete');if(remove)remove.onclick=async()=>{remove.disabled=true;try{await lifePut({...record,deleted:true,updated:new Date().toISOString()});await openMemory();toast('기억을 휴지통으로 옮겼어요.');}catch{toast('저장하지 못했어요. 다시 시도해 주세요.');remove.disabled=false;}};};
 const button=document.createElement('button');button.className='memory-object-link';button.setAttribute('aria-label','쪼꼬 MEMORY · 추억 팝업');button.title='쪼꼬 · 소중한 추억';button.onclick=openMemory;document.querySelector('.canvas-wrap').append(button);const draw=drawRoom;drawRoom=function(t){button.hidden=roomPrefs.activeSpace==='dream'||roomPrefs.activeSpace==='office'||roomPrefs.activeSpace==='family'||roomEditing;return draw(t);};
 applyMemoryName();lifeMenu();
 const personalStyle=document.createElement('style');personalStyle.textContent='.memory-in-dialog .life-heading{align-items:center;flex-direction:row;flex-wrap:wrap;gap:12px;margin:0 0 16px}.memory-in-dialog .life-heading>div:first-child{flex:1;min-width:160px}.memory-in-dialog .life-heading h1{font-size:24px;margin:0;overflow-wrap:anywhere}.memory-header-actions{display:flex;align-items:center;gap:8px;flex-wrap:wrap}.memory-header-actions button{min-height:36px;padding:8px 11px;font-size:12px}.memory-header-actions #memory-name-edit{border:0;background:transparent;color:#78816d}.memory-name-form{display:grid;gap:8px;max-width:100%;margin:0}.memory-name-form input{width:100%;min-width:0;font-size:22px;font-weight:650;border:1px solid #aab89c;border-radius:9px;padding:7px 10px;background:#fffdf7;color:var(--ink)}.memory-name-actions{display:flex;gap:6px}.memory-name-actions button{min-height:34px;padding:6px 12px;font-size:12px}.memory-name-form .save-state:empty{display:none}.memory-in-dialog .life-toolbar{margin:12px 0}.memory-in-dialog .empty-state{padding:28px 14px}.memory-in-dialog .life-heading:has(.memory-name-form) .memory-header-actions{display:none}@media(max-width:560px){.memory-in-dialog .life-heading{gap:10px}.memory-header-actions{gap:4px}.memory-header-actions button{font-size:11px;padding:8px}.memory-in-dialog .life-heading h1{font-size:22px}}';document.head.append(personalStyle);
 const clock=document.createElement('button');clock.className='focus-clock-hit';clock.setAttribute('aria-label','포커스 데스크 시계 · 포커스 타이머');clock.title='포커스 타이머';clock.onclick=()=>openPanel('focus');document.querySelector('.canvas-wrap').append(clock);const drawClock=drawRoom;drawRoom=function(t){clock.hidden=roomEditing||['dream','office','family'].includes(roomPrefs.activeSpace);const p=roomPrefs.layout.focus||{x:0,y:0};clock.style.left=(220+p.x)/9.6+'%';clock.style.top=(302+p.y)/6.5+'%';return drawClock(t);};
 const clockStyle=document.createElement('style');clockStyle.textContent='.focus-clock-hit{position:absolute;width:3.65%;height:5.23%;background:transparent;border:0;border-radius:3px;padding:0;cursor:pointer;z-index:2}.focus-clock-hit[hidden]{display:none}.focus-clock-hit:hover,.focus-clock-hit:focus-visible{outline:2px solid #e4c77d;outline-offset:2px}';document.head.append(clockStyle);
 const style=document.createElement('style');style.textContent='.memory-object-link{position:absolute;left:26%;top:15.38%;width:6%;height:8.6%;border:2px solid transparent;border-radius:6px;background:transparent;cursor:pointer}.memory-object-link:hover,.memory-object-link:focus-visible{border-color:#f9e5ad;outline:none}.memory-object-link[hidden]{display:none}.memory-in-dialog{padding:0!important;max-width:100%;margin:0}.memory-in-dialog .life-heading h1{font-size:24px}.memory-in-dialog .choco-hero{padding:20px;grid-template-columns:55px 1fr;gap:12px}.memory-in-dialog .choco-hero .symbol{font-size:36px}.memory-in-dialog .choco-hero blockquote{font-size:16px}.memory-in-dialog .life-grid{grid-template-columns:repeat(2,minmax(0,1fr))}@media(max-width:560px){.memory-in-dialog .life-grid{grid-template-columns:1fr}.memory-in-dialog .choco-hero{grid-template-columns:1fr}}';document.head.append(style);
})();



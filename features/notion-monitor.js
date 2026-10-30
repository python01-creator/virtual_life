/* NOTION_MONITOR_HIT_V2 */
(async()=>{
 if(window.lifeCloud){try{await window.lifeCloud.ready;await window.lifeAppReady;}catch{return;}}
 const b=document.createElement('button');b.className='notion-monitor-hit';b.setAttribute('aria-label','모니터 · Notion 허브');b.title='Notion 허브';b.style.cssText='position:absolute;left:70.3%;top:40.15%;width:7.92%;height:10.15%;background:transparent;border:0;cursor:pointer;z-index:2';
 const entries=[['home','노션 개인홈','notion'],['diary','노션 일기장',null],['plan','인생 계획','plan'],['vision','비전 보드','vision'],['routine','루틴 서재','routine']];
 const allowed=url=>{const valid=safeURL(String(url||'').trim());if(!valid)return '';try{const host=new URL(valid).hostname;return ['notion.so','www.notion.so','notion.com','www.notion.com','app.notion.com','notion.site'].includes(host)||host.endsWith('.notion.site')?valid:'';}catch{return '';}};
 function read(kind,key){if(kind==='diary'){try{return localStorage.getItem(lifeKey('notion-diary-url'))||'';}catch{return '';}}return state.links[key]||'';}
 function write(kind,key,url){if(kind==='diary')localStorage.setItem(lifeKey('notion-diary-url'),url);else{state.links[key]=url;save();}}
 function hub(){
  const panel=document.querySelector('#panel'),content=document.querySelector('#panel-content');
  content.innerHTML='<div class="eyebrow">PRIVATE NOTION HUB</div><h2>나의 노션 서랍</h2><p>연결한 페이지를 이 팝업에서 먼저 고른 뒤, 필요할 때만 Notion에서 열어요.</p><div class="notion-hub-grid"></div><div class="notion-hub-detail"><p class="life-note">주소는 공개 코드에 넣지 않고 내 설정에만 보관해요.</p></div>';
  const grid=content.querySelector('.notion-hub-grid'),detail=content.querySelector('.notion-hub-detail');
  function select(kind){
   const entry=entries.find(([id])=>id===kind);if(!entry)return;const [,title,key]=entry,url=allowed(read(kind,key));
   content.querySelectorAll('[data-notion-entry]').forEach(x=>x.setAttribute('aria-pressed',String(x.dataset.notionEntry===kind)));
   detail.replaceChildren();const heading=document.createElement('h3');heading.textContent=title;detail.append(heading);
   if(url){
    const note=document.createElement('p');note.className='life-note';note.textContent='연결됨 · 이 팝업을 닫지 않고 새 탭에서 안전하게 열 수 있어요.';
    const actions=document.createElement('div');actions.className='actions';const open=document.createElement('a');open.className='primary';open.href=url;open.target='_blank';open.rel='noopener noreferrer';open.textContent='Notion에서 열기';const edit=document.createElement('button');edit.className='ghost';edit.type='button';edit.textContent='주소 바꾸기';edit.onclick=()=>form(true);actions.append(open,edit);detail.append(note,actions);return;
   }
   form(false);
   function form(replace){
    detail.replaceChildren(heading);const note=document.createElement('p');note.className='life-note';note.textContent=replace?'새 주소를 저장하면 이 항목의 연결만 바뀌어요.':'아직 주소가 연결되지 않았어요.';
    const form=document.createElement('form'),label=document.createElement('label'),input=document.createElement('input'),saveButton=document.createElement('button'),status=document.createElement('p');label.className='field';label.textContent=title+' 주소';input.type='url';input.required=true;input.value=replace?url:'';input.placeholder='https://www.notion.so/…';input.setAttribute('aria-label',title+' 주소');label.append(input);saveButton.className='primary';saveButton.textContent=replace?'새 주소 저장':'주소 연결';status.setAttribute('role','status');form.append(label,saveButton,status);form.onsubmit=e=>{e.preventDefault();const next=allowed(input.value);if(!next){status.textContent='Notion 페이지 주소를 넣어 주세요.';return;}write(kind,key,next);select(kind);};detail.append(note,form);
   }
  }
  for(const [kind,title,key]of entries){const button=document.createElement('button'),connected=!!allowed(read(kind,key));button.className='notion-hub-card';button.type='button';button.dataset.notionEntry=kind;button.innerHTML='<strong>'+lifeText(title)+'</strong><span>'+(connected?'연결됨':'주소 연결')+'</span>';button.onclick=()=>select(kind);grid.append(button);}
  const work=document.createElement('button');work.className='notion-hub-card';work.type='button';work.innerHTML='<strong>근무기록</strong><span>HQ에서 열기</span>';work.onclick=()=>{const button=[...document.querySelectorAll('.header-right button')].find(x=>x.textContent.includes('근무 시간'));if(button?.onclick){panel.close();button.onclick();}else toast('근무기록을 준비하고 있어요.');};grid.append(work);
  select(entries.find(([kind,,key])=>allowed(read(kind,key)))?.[0]||'home');if(!panel.open)panel.showModal();keys.clear();
 }
 const previousOpen=openPanel;openPanel=function(key){if(key==='notion')return hub();return previousOpen(key);};b.onclick=hub;document.querySelector('.canvas-wrap').append(b);const draw=drawRoom;drawRoom=function(t){b.hidden=roomEditing||['dream','office','family'].includes(roomPrefs.activeSpace);return draw(t);};
 const style=document.createElement('style');style.textContent='.notion-hub-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:9px;margin:18px 0}.notion-hub-card{display:grid;gap:4px;text-align:left;padding:13px;border:1px solid var(--line,#d8ddce);border-radius:12px;background:#f7f5ed;color:inherit}.notion-hub-card[aria-pressed="true"]{border-color:#78906f;background:#eaf0e3}.notion-hub-card span{font-size:11px;opacity:.68}.notion-hub-detail{padding:14px;border-radius:14px;background:#f1f4ea}.notion-hub-detail h3{margin-top:0}.notion-hub-detail .actions a{display:inline-flex;align-items:center;text-decoration:none}@media(max-width:520px){.notion-hub-grid{grid-template-columns:1fr 1fr}.notion-hub-card{padding:11px 9px}}';document.head.append(style);
})();



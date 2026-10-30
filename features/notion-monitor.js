/* NOTION_MONITOR_HIT_V1 */
(async()=>{if(window.lifeCloud){try{await window.lifeCloud.ready;await window.lifeAppReady;}catch{return;}}const b=document.createElement('button');b.className='notion-monitor-hit';b.setAttribute('aria-label','모니터 · Notion 허브');b.title='Notion 허브';b.style.cssText='position:absolute;left:70.3%;top:40.15%;width:7.92%;height:10.15%;background:transparent;border:0;cursor:pointer;z-index:2';function hub(){
 const panel=document.querySelector('#panel'),content=document.querySelector('#panel-content');
 content.innerHTML='<div class="eyebrow">NOTION HUB</div><h2>나의 업무와 기록</h2><div class="actions" id="notion-hub-tabs"><button class="ghost" data-hub-tab="work">근무기록</button><button class="ghost" data-hub-tab="home">노션 개인홈</button><button class="ghost" data-hub-tab="diary">노션 일기장</button></div><div id="notion-hub-content"><p>열고 싶은 항목을 골라 주세요.</p></div>';
 const area=content.querySelector('#notion-hub-content');
 content.querySelectorAll('[data-hub-tab]').forEach(tab=>tab.onclick=()=>{
  content.querySelectorAll('[data-hub-tab]').forEach(t=>t.setAttribute('aria-pressed',String(t===tab)));
  const kind=tab.dataset.hubTab;
  if(kind==='work'){const work=[...document.querySelectorAll('.header-right button')].find(x=>x.textContent.includes('근무 시간'));if(work?.onclick){panel.close();work.onclick();}else area.textContent='근무기록을 준비하고 있어요. 잠시 뒤 다시 눌러 주세요.';return;}
  let url=kind==='home'?state.links.notion:'';if(kind==='diary')try{url=localStorage.getItem(lifeKey('notion-diary-url'))||'';}catch{}
  area.replaceChildren();const title=kind==='home'?'노션 개인홈':'노션 일기장';
  if(safeURL(url)){window.open(safeURL(url),'_blank','noopener,noreferrer');panel.close();return;}
  const form=document.createElement('form'),label=document.createElement('label'),input=document.createElement('input'),saveButton=document.createElement('button'),status=document.createElement('p');
  label.className='field';label.textContent=title+' 주소';input.type='url';input.required=true;input.placeholder='https://www.notion.so/…';input.setAttribute('aria-label',title+' 주소');label.append(input);saveButton.className='primary';saveButton.textContent='주소 연결';status.setAttribute('role','status');form.append(label,saveButton,status);area.append(form);
  form.onsubmit=e=>{e.preventDefault();const valid=safeURL(input.value.trim());let host='';try{host=new URL(valid).hostname;}catch{}if(!valid||!(['notion.so','www.notion.so','notion.com','www.notion.com','app.notion.com','notion.site'].includes(host)||host.endsWith('.notion.site'))){status.textContent='Notion 페이지 주소를 넣어 주세요.';return;}if(kind==='home'){state.links.notion=valid;save();}else localStorage.setItem(lifeKey('notion-diary-url'),valid);tab.onclick();};
 });if(!panel.open)panel.showModal();keys.clear();
}const previousOpen=openPanel;openPanel=function(key){if(key==='notion')return hub();return previousOpen(key);};b.onclick=hub;document.querySelector('.canvas-wrap').append(b);const draw=drawRoom;drawRoom=function(t){b.hidden=roomEditing||['dream','office','family'].includes(roomPrefs.activeSpace);return draw(t);};})();

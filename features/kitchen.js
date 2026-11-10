/* A small kitchen for the home room. */
(() => {
 const wrap=document.querySelector('.canvas-wrap');
 const setting='kitchen-pantry-v1';
 const recipes=[
  ['달걀볶음밥',['달걀','밥'],'달걀을 먼저 볶고 밥을 넣어 함께 볶아요.'],
  ['두부 달걀덮밥',['두부','달걀','밥'],'두부를 노릇하게 굽고 풀어 놓은 달걀을 넣어 익힌 뒤 밥에 올려요.'],
  ['김치볶음밥',['김치','밥'],'잘게 자른 김치를 볶다가 밥을 넣고 섞어요.'],
  ['참치김치덮밥',['참치','김치','밥'],'김치와 참치를 함께 볶아 밥에 올려요.'],
  ['감자 달걀 샐러드',['감자','달걀'],'감자와 달걀을 익혀 으깬 뒤 함께 섞어요.'],
  ['토마토 달걀볶음',['토마토','달걀'],'토마토를 볶아 부드러워지면 풀어 놓은 달걀을 넣어 익혀요.'],
  ['바나나 요거트',['바나나','요거트'],'바나나를 썰어 요거트에 올려요.'],
  ['토마토 치즈 토스트',['토마토','치즈','식빵'],'식빵에 토마토와 치즈를 올리고 치즈가 녹을 때까지 구워요.']
 ];
 const aliases=new Map([['계란','달걀'],['햇반','밥'],['즉석밥','밥'],['참치캔','참치'],['캔참치','참치'],['방울토마토','토마토'],['요구르트','요거트']]);
 const parse=text=>[...new Set(text.split(/[,\n]+/).map(value=>value.trim().slice(0,40)).filter(Boolean))].slice(0,60);
 const glyphs={
  fridge:'<rect x="10" y="4" width="60" height="100" rx="9" fill="#9cab9e" stroke="#627c70" stroke-width="3"/><g class="kitchen-door"><rect x="14" y="7" width="51" height="93" rx="7" fill="#dbe8d6"/><path d="M14 39h51M54 19v11m0 23v17" stroke="#829c89" stroke-width="4" stroke-linecap="round"/><rect x="22" y="53" width="15" height="12" rx="2" fill="#f1ce9d"/></g>',
  counter:'<rect x="7" y="55" width="117" height="49" rx="4" fill="#c29d7c" stroke="#93765a" stroke-width="3"/><path d="M15 63h46v32H15zM68 63h48v32H68z" fill="#e5c5a0"/><path d="M45 72h9m21 0h9" stroke="#9a795c" stroke-width="3" stroke-linecap="round"/><rect x="3" y="44" width="125" height="13" rx="5" fill="#f1e1c4" stroke="#ac9070" stroke-width="3"/><rect x="15" y="39" width="44" height="6" rx="2" fill="#a07d5b"/><path d="M74 28h37l-4 15H78z" fill="#78947f"/><path d="M79 27q13-10 27 0" fill="none" stroke="#587465" stroke-width="3"/><g class="kitchen-steam" fill="none" stroke="#758c79" stroke-width="2.5" stroke-linecap="round"><path d="M85 25q-6-6 0-12t0-10m11 21q-6-6 0-12t0-10m10 23q-6-6 0-12t0-10"/></g>'
 };
 let request=0;
 function panel(body){
  const other=document.querySelector('#panel');
  if(other?.open)other.close();
  lifeShow('<h2 id="hq-kitchen-title">'+body.title+'</h2>'+body.html);
  return document.querySelector('#life-content');
 }
 async function open(mode){
  const token=++request;
  const title=mode==='fridge'?'냉장고':'조리대';
  const content=panel({title,html:'<p role="status">재료를 불러오는 중…</p>'});
  const heading=content.querySelector('#hq-kitchen-title');
  const current=()=>token===request&&heading.isConnected&&lifeDialog.open;
  let pantry;
  try{
   await window.lifeAppReady;
   const stored=await window.lifeCloud.getSetting(setting);
   pantry=Array.isArray(stored)?stored.filter(item=>typeof item==='string'):[];
  }catch{
   if(current())content.querySelector('[role=status]').textContent='재료를 불러오지 못했어요. 잠시 후 다시 열어 주세요.';
   return;
  }
  if(!current())return;
  if(mode==='fridge'){
   content.insertAdjacentHTML('beforeend','<form><label class="field">있는 재료<textarea name="ingredients" rows="5" maxlength="2500" placeholder="달걀, 밥, 김치"></textarea></label><p>쉼표나 줄바꿈으로 재료를 나눠 적어요.</p><button class="primary">재료 저장</button></form>');
   const form=content.querySelector('form'),status=content.querySelector('[role=status]');
   status.textContent='';
   form.elements.ingredients.value=pantry.join(', ');
   form.onsubmit=async event=>{
    event.preventDefault();
    const button=form.querySelector('button');
    button.disabled=true;
    try{
     await window.lifeCloud.setSetting(setting,parse(form.elements.ingredients.value));
     status.textContent='냉장고에 저장했어요.';
    }catch{status.textContent='저장하지 못했어요. 다시 시도해 주세요.';}
    finally{button.disabled=false;}
   };
   return;
  }
  const have=new Set(pantry.map(item=>aliases.get(item)||item));
  const matches=recipes.map(([name,ingredients,method])=>({name,method,missing:ingredients.filter(item=>!have.has(item)),count:ingredients.length}))
   .filter(row=>row.missing.length<row.count&&row.missing.length<=1)
   .sort((a,b)=>a.missing.length-b.missing.length||b.count-a.count);
  content.querySelector('[role=status]').textContent=matches.length?'기록한 재료를 기준으로 골랐어요.':'맞는 메뉴가 아직 없어요. 냉장고에 재료를 더 적어 보세요.';
  content.insertAdjacentHTML('beforeend',matches.map(row=>`<article class="kitchen-recipe"><h3>${row.name}</h3><p><strong>${row.missing.length?'추가 재료 · '+row.missing[0]:'있는 재료로 가능'}</strong></p><p>${row.method}</p></article>`).join('')+'<button type="button" class="ghost" id="kitchen-open-fridge">냉장고 보기</button>');
  content.querySelector('#kitchen-open-fridge').onclick=()=>open('fridge');
 }
 const reducedMotion=matchMedia('(prefers-reduced-motion: reduce)');
 let useRequest=0,usingButton=null;
 function useFurniture(button,id,walk){
  if(roomEditing)return;
  const token=++useRequest;
  usingButton?.classList.remove('is-using');
  usingButton=null;
  const stillHere=()=>token===useRequest&&!roomEditing&&button.getClientRects().length&&
   lifePage==='room'&&!document.querySelector('dialog[open]');
  const arrive=()=>{
   if(!stillHere())return;
   if(reducedMotion.matches){open(id);return;}
   usingButton=button;
   button.classList.add('is-using');
   setTimeout(()=>{
    if(token!==useRequest)return;
    button.classList.remove('is-using');
    usingButton=null;
    if(stillHere())open(id);
   },420);
  };
  if(!walk||reducedMotion.matches||!window.lifeRoomInteraction){arrive();return;}
  const room=roomWorldBounds(),furniture=button.getBoundingClientRect();
  const x=(furniture.left+furniture.width/2-room.left)*960/room.width;
  const y=(furniture.bottom-room.top)*650/room.height+14;
  if(!window.lifeRoomInteraction.walkTo(x,Math.min(roomWalkBottom(),y),arrive))arrive();
 }
 for(const [id,label,x,width] of [['fridge','냉장고',427,80],['counter','조리대',510,132]]){
  const button=document.createElement('button');
  button.type='button';button.className='kitchen-furniture';button.title=label;button.setAttribute('aria-label',label);
  button.style.left=x/9.6+'%';button.style.width=width/9.6+'%';
  button.innerHTML=`<svg viewBox="0 0 ${width} 108" aria-hidden="true">${glyphs[id]}</svg>`;
  button.onclick=event=>useFurniture(button,id,event.detail!==0);
  wrap.append(button);
 }
 const style=document.createElement('style');
 style.textContent=`
 .canvas-wrap>.kitchen-furniture{position:absolute;top:77%;height:16.62%;z-index:4;background:none;border:0;padding:0;cursor:pointer}
 .kitchen-furniture svg{display:block;width:100%;height:100%;filter:drop-shadow(1px 3px 2px #51402b35)}
 .room-viewport.is-portrait-deep .kitchen-furniture{top:calc(77% + (var(--portrait-canvas-height) - 100%) * .48)}
 body:is([data-place-kind="office"],[data-interior="office"],[data-interior="bedroom"]) .kitchen-furniture{display:none}
 .kitchen-door{transform-box:fill-box;transform-origin:left center}
 .kitchen-furniture.is-using .kitchen-door{animation:kitchen-door-open .42s ease both}
 .kitchen-steam{opacity:0}
 .kitchen-furniture.is-using .kitchen-steam{animation:kitchen-steam-rise .42s ease-out both}
 @keyframes kitchen-door-open{0%{transform:scaleX(1)}65%,100%{transform:scaleX(.3)}}
 @keyframes kitchen-steam-rise{0%{opacity:0;transform:translateY(6px)}40%{opacity:.9}100%{opacity:0;transform:translateY(-5px)}}
 .kitchen-recipe{padding:.65rem .85rem;margin:.55rem 0;background:#edf1e7;border-radius:12px}
 .kitchen-recipe h3,.kitchen-recipe p{margin:.3rem 0}
 `;
 document.head.append(style);
})();

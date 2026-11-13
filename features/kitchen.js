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
 const fridgeNote=document.createElement('span');
 fridgeNote.className='kitchen-magnet';
 fridgeNote.hidden=true;
 function showNote(name){
  fridgeNote.textContent=name;
  fridgeNote.hidden=!name;
 }
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
  let pantry,plan;
  try{
   await window.lifeAppReady;
   const [stored,savedPlan]=await Promise.all([window.lifeCloud.getSetting(setting),window.lifeCloud.getSetting('kitchen-menu-v1')]);
   plan={next:savedPlan?.next||'',favorites:Array.isArray(savedPlan?.favorites)?savedPlan.favorites:[]};
   showNote(plan.next);
   pantry=Array.isArray(stored)?stored.filter(item=>typeof item==='string'):[];
  }catch{
   if(current())content.querySelector('[role=status]').textContent='재료를 불러오지 못했어요. 잠시 후 다시 열어 주세요.';
   return;
  }
  if(!current())return;
  const missingFor=([,ingredients],items)=>ingredients.filter(ingredient=>!items.some(item=>(aliases.get(item)||item)===ingredient));
  const next=recipes.find(([name])=>name===plan.next);
  function nextText(items){
   if(!next)return '붙여둔 메뉴가 없어요.';
   const missing=missingFor(next,items);
   return next[0]+' · '+(missing.length?'더 필요한 재료 '+missing.join(', '):'이제 만들 수 있어요');
  }
  if(mode==='fridge'){
   content.insertAdjacentHTML('beforeend','<form><label class="field">있는 재료<textarea name="ingredients" rows="5" maxlength="2500" placeholder="달걀, 밥, 김치"></textarea></label><p>쉼표나 줄바꿈으로 재료를 나눠 적어요.</p><button class="primary">재료 저장</button></form>');
   const form=content.querySelector('form'),status=content.querySelector('[role=status]');
   status.textContent=nextText(pantry);
   form.elements.ingredients.value=pantry.join(', ');
   form.onsubmit=async event=>{
    event.preventDefault();
    const button=form.querySelector('button');
    button.disabled=true;
    try{
     const ingredients=parse(form.elements.ingredients.value);
     await window.lifeCloud.setSetting(setting,ingredients);
     status.textContent='저장했어요. '+nextText(ingredients);
    }catch{status.textContent='저장하지 못했어요. 다시 시도해 주세요.';}
    finally{button.disabled=false;}
   };
   return;
  }
  const matches=recipes.map((recipe,index)=>({name:recipe[0],method:recipe[2],missing:missingFor(recipe,pantry),count:recipe[1].length,index}))
   .filter(row=>row.name===plan.next||plan.favorites.includes(row.name)||row.missing.length<row.count&&row.missing.length<=1)
   .sort((a,b)=>Number(b.name===plan.next)-Number(a.name===plan.next)||Number(plan.favorites.includes(b.name))-Number(plan.favorites.includes(a.name))||a.missing.length-b.missing.length||b.count-a.count);
  content.querySelector('[role=status]').textContent=matches.length?'기록한 재료를 기준으로 골랐어요.':'맞는 메뉴가 아직 없어요. 냉장고에 재료를 더 적어 보세요.';
  content.insertAdjacentHTML('beforeend',matches.map(row=>`<article class="kitchen-recipe"><h3>${row.name}</h3><p><strong>${row.missing.length?'추가 재료 · '+row.missing.join(', '):'있는 재료로 가능'}</strong></p><p>${row.method}</p><div class="actions"><button class="ghost" data-pin="${row.index}">${row.name===plan.next?'냉장고 메모 떼기':'냉장고에 붙이기'}</button><button class="ghost" data-favorite="${row.index}">${plan.favorites.includes(row.name)?'단골에서 빼기':'다음에도 해 먹을래'}</button></div></article>`).join('')+'<button type="button" class="ghost" id="kitchen-open-fridge">냉장고 보기</button>');
  let saving=false;
  content.querySelectorAll('[data-pin],[data-favorite]').forEach(button=>button.onclick=async()=>{
   if(saving)return;
   const pin=button.hasAttribute('data-pin');
   const [name]=recipes[Number(pin?button.dataset.pin:button.dataset.favorite)];
   const updated={...plan};
   if(pin)updated.next=plan.next===name?'':name;
   else updated.favorites=plan.favorites.includes(name)?plan.favorites.filter(item=>item!==name):[...plan.favorites,name];
   saving=true;
   button.disabled=true;
   try{
    await window.lifeCloud.setSetting('kitchen-menu-v1',updated);
    showNote(updated.next);
    if(current())open(mode);
   }catch{if(current())content.querySelector('[role=status]').textContent='메뉴를 저장하지 못했어요.';}
   finally{saving=false;button.disabled=false;}
  });
  content.querySelector('#kitchen-open-fridge').onclick=()=>open('fridge');
 }
 const reducedMotion=matchMedia('(prefers-reduced-motion: reduce)');
 let useRequest=0,usingButton=null;
 function useFurniture(button,id,walk){
  if(roomEditing)return;
  const token=++useRequest;
  window.lifeKitchenAction=null;
  usingButton?.classList.remove('is-using');
  usingButton=null;
  const stillHere=()=>token===useRequest&&!roomEditing&&button.getClientRects().length&&
   lifePage==='room'&&!document.querySelector('dialog[open]');
  const arrive=()=>{
   if(!stillHere())return;
   if(reducedMotion.matches){open(id);return;}
   usingButton=button;
   window.lifeKitchenAction={kind:id,start:performance.now(),x:player.x,y:player.y};
   button.classList.add('is-using');
   setTimeout(()=>{
    if(token!==useRequest)return;
    button.classList.remove('is-using');
    usingButton=null;
    if(stillHere()&&window.lifeKitchenAction?.x===player.x&&window.lifeKitchenAction?.y===player.y)open(id);
    window.lifeKitchenAction=null;
   },820);
  };
  if(!walk||reducedMotion.matches||!window.lifeRoomInteraction){arrive();return;}
  const room=roomWorldBounds(),furniture=button.getBoundingClientRect();
  const x=(furniture.left+furniture.width/2-room.left)*960/room.width+(id==='fridge'?-21:16);
  const y=(furniture.bottom-room.top)*650/room.height+(id==='fridge'?-7:14);
  if(!window.lifeRoomInteraction.walkTo(x,Math.min(roomWalkBottom(),y),arrive))arrive();
 }
 for(const [id,label,x,width] of [['fridge','냉장고',427,80],['counter','조리대',510,132]]){
  const button=document.createElement('button');
  button.type='button';button.className='kitchen-furniture';button.title=label;button.setAttribute('aria-label',label);
  button.style.left=x/9.6+'%';button.style.width=width/9.6+'%';
  button.innerHTML=`<svg viewBox="0 0 ${width} 108" aria-hidden="true">${glyphs[id]}</svg>`;
  button.onclick=event=>useFurniture(button,id,event.detail!==0);
  if(id==='fridge')button.append(fridgeNote);
  wrap.append(button);
 }
 Promise.resolve(window.lifeAppReady).then(async()=>{
  if(request===0){
   const saved=await window.lifeCloud.getSetting('kitchen-menu-v1');
   if(request===0)showNote(saved?.next||'');
  }
 }).catch(()=>{});
 const style=document.createElement('style');
 style.textContent=`
 .canvas-wrap>.kitchen-furniture{position:absolute;top:77%;height:16.62%;z-index:4;background:none;border:0;padding:0;cursor:pointer}
 .kitchen-furniture svg{display:block;width:100%;height:100%;filter:drop-shadow(1px 3px 2px #51402b35)}
 .room-viewport.is-portrait-deep .kitchen-furniture{top:calc(77% + (var(--portrait-canvas-height) - 100%) * .48)}
 body:is([data-place-kind="office"],[data-interior="office"],[data-interior="bedroom"]) .kitchen-furniture{display:none}
 .kitchen-magnet{position:absolute;top:44%;left:14%;max-width:76%;padding:1px 3px;background:#fff0b8;color:#594a37;font-size:clamp(5px,1vw,10px);line-height:1.15;border-radius:2px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
 .kitchen-door{transform-box:fill-box;transform-origin:left center}
 .kitchen-furniture.is-using .kitchen-magnet{visibility:hidden}
 .kitchen-furniture.is-using .kitchen-door{animation:kitchen-door-open .82s ease both}
 .kitchen-steam{opacity:0}
 .kitchen-furniture.is-using .kitchen-steam{animation:kitchen-steam-rise .82s ease-out both}
 @keyframes kitchen-door-open{0%,22%,100%{transform:scaleX(1)}55%,76%{transform:scaleX(.3)}}
 @keyframes kitchen-steam-rise{0%{opacity:0;transform:translateY(6px)}40%{opacity:.9}100%{opacity:0;transform:translateY(-5px)}}
 .kitchen-recipe{padding:.65rem .85rem;margin:.55rem 0;background:#edf1e7;border-radius:12px}
 .kitchen-recipe h3,.kitchen-recipe p{margin:.3rem 0}
 `;
 document.head.append(style);
})();

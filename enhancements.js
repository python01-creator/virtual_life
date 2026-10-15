(function(){
'use strict';
const prompts=[
 '오늘 마음에 오래 남은 장면은 무엇이었나요?',
 '요즘의 나에게 가장 필요한 한 문장을 적어본다면?',
 '아무도 모르는 나만의 작은 기쁨은 무엇인가요?',
 '오늘의 공기와 빛을 한 문장으로 묘사해 보세요.',
 '다시 돌아가 천천히 보고 싶은 순간이 있나요?',
 '지금 내려놓아도 괜찮은 마음은 무엇인가요?',
 '최근 나를 웃게 만든 사소한 일을 기록해 보세요.',
 '내일의 나에게 조용히 부탁하고 싶은 것은 무엇인가요?'
];
const gardenStages=['씨앗','새싹','어린잎','푸른 식물','꽃이 핀 식물'];
const gardenIcons=['◉','🌱','🪴','🌿','🌸'];
let garden=null,gardenBusy=false;

lifeCategories.write=['문장 씨앗','한 문장에서 시작하는 조용한 글쓰기','✎'];
lifeCategories.garden=['느린빛 온실','나의 기록과 함께 천천히 자라는 식물','☘'];

const baseMenu=lifeMenu;
lifeMenu=function(){
 baseMenu();
 const decorate=lifeNav.querySelector('[data-life="decorate"]');
 for(const [page,label] of [['write','✎ 문장 씨앗'],['garden','☘ 느린빛 온실']]){
  const b=document.createElement('button');b.dataset.life=page;b.className=lifePage===page?'active':'';b.textContent=label;b.onclick=()=>lifeGo(page);lifeNav.insertBefore(b,decorate);
 }
};

const baseRender=lifeRender;
lifeRender=function(){
 lifeShell.classList.remove('page-arrive');void lifeShell.offsetWidth;lifeShell.classList.add('page-arrive');
 if(lifePage==='write'){renderWriting();return;}
 if(lifePage==='garden'){renderGarden();return;}
 baseRender();
};

function promptToday(){
 const d=new Date(),seed=Number(String(d.getFullYear())+String(d.getMonth()+1).padStart(2,'0')+String(d.getDate()).padStart(2,'0'))+(d.getHours()>=19?1:0);
 return prompts[seed%prompts.length];
}
function renderWriting(){
 const recent=lifeRecords.filter(r=>r.kind==='writing').sort((a,b)=>(b.updated||'').localeCompare(a.updated||'')).slice(0,6);
 lifeShell.innerHTML=`<div class="life-heading"><div><div class="eyebrow">A SMALL PROMPT FOR YOU</div><h1>✎ 문장 씨앗</h1><p>잘 쓰려고 애쓰지 않아도 괜찮아요. 한 문장에서 시작해요.</p></div></div>
 <section class="prompt-hero"><span>오늘의 문장 씨앗</span><blockquote>${lifeText(promptToday())}</blockquote><div class="actions"><button class="primary" id="prompt-write">이 문장으로 쓰기</button><button class="ghost" id="prompt-random">다른 문장 보기</button></div></section>
 <div class="life-heading"><div><h2>최근에 쓴 글</h2></div><button class="ghost" id="free-write">빈 페이지에서 쓰기</button></div>
 <div class="life-grid">${recent.map(lifeCard).join('')||'<div class="empty-state">아직 글이 없어요.<br>오늘의 한 문장을 천천히 시작해 보세요.</div>'}</div>`;
 lifeBind();$('#prompt-write').onclick=()=>openWriter(promptToday());$('#free-write').onclick=()=>openWriter('');$('#prompt-random').onclick=()=>{const next=prompts[Math.floor(Math.random()*prompts.length)];lifeShell.querySelector('.prompt-hero blockquote').textContent=next;$('#prompt-write').onclick=()=>openWriter(next);};
}
function openWriter(prompt){
 const key=lifeKey('gentle-writing-draft');let draft={};try{draft=JSON.parse(localStorage.getItem(key))||{};}catch{}
 lifeShow(`<div class="writer-shell"><div class="eyebrow">QUIET WRITING</div><p class="writer-prompt">${lifeText(prompt||'마음이 가는 곳에서 시작해 보세요.')}</p><form id="gentle-writer"><input name="title" maxlength="180" value="${lifeText(draft.title||'')}" placeholder="제목은 나중에 붙여도 좋아요"><textarea name="body" maxlength="100000" autofocus placeholder="첫 문장을 적어 보세요…">${lifeText(draft.body||'')}</textarea><div class="writer-footer"><span id="writer-count">0자</span><span id="writer-state">서두르지 않아도 괜찮아요.</span></div><div class="actions"><button class="primary">내 글로 저장</button><button class="ghost" type="button" id="writer-draft">임시 보관</button></div></form></div>`);
 const f=$('#gentle-writer'),body=f.elements.body,count=()=>$('#writer-count').textContent=body.value.length+'자';count();body.oninput=()=>{count();clearTimeout(body.draftTimer);body.draftTimer=setTimeout(()=>keepDraft(f,key),700);};$('#writer-draft').onclick=()=>keepDraft(f,key);
 f.onsubmit=async e=>{e.preventDefault();const v=Object.fromEntries(new FormData(f));if(!v.body.trim()){$('#writer-state').textContent='한 문장이라도 적어 주세요.';return;}const now=new Date().toISOString(),record={id:lifeID(),home:lifeHome.id,kind:'writing',title:v.title.trim()||v.body.trim().slice(0,24),body:v.body.trim(),when:lifeDate(),tags:prompt?'문장 씨앗':'자유 글쓰기',prompt,share:false,comments:[],created:now,updated:now};try{await lifePut(record);localStorage.removeItem(key);await rewardWriting();lifeDialog.close();await lifeRefresh();renderWriting();toast('글을 저장했어요. 온실에 마음빛 하나가 모였어요.');}catch{$('#writer-state').textContent='서버에 저장하지 못했어요. 연결을 확인해 주세요.';}};
 setTimeout(()=>body.focus(),50);
}
function keepDraft(f,key){const v=Object.fromEntries(new FormData(f));localStorage.setItem(key,JSON.stringify(v));$('#writer-state').textContent='이 기기에 임시 보관했어요.';}

function freshGarden(){return {plant:'나의 첫 화분',xp:0,water:70,sun:70,lastWater:0,lastSun:0,lastVisit:Date.now(),dew:0};}
async function loadGarden(){if(garden)return garden;garden=await window.lifeCloud.getSetting('garden')||freshGarden();garden.water=Math.max(0,(garden.water||0)-Math.floor((Date.now()-(garden.lastVisit||Date.now()))/21600000)*5);garden.sun=Math.max(0,(garden.sun||0)-Math.floor((Date.now()-(garden.lastVisit||Date.now()))/28800000)*4);garden.lastVisit=Date.now();await window.lifeCloud.setSetting('garden',garden);return garden;}
function stage(){return garden.xp>=14?4:garden.xp>=8?3:garden.xp>=4?2:garden.xp>=1?1:0;}
async function renderGarden(){
 if(gardenBusy)return;gardenBusy=true;try{await loadGarden();const s=stage(),healthy=garden.water>=30&&garden.sun>=30;
 lifeShell.innerHTML=`<div class="life-heading"><div><div class="eyebrow">A GARDEN THAT GROWS WITH YOU</div><h1>☘ 느린빛 온실</h1><p>조금씩 돌보고, 기록하며 모은 마음빛으로 천천히 키워요.</p></div><span class="dew">마음빛 ${garden.dew||0} ✦</span></div>
 <section class="garden-window ${healthy?'healthy':'sleepy'}"><div class="garden-sky"><i></i><span class="butterfly">❦</span></div><div class="plant-stage" aria-label="${gardenStages[s]}"><span>${gardenIcons[s]}</span></div><div class="pot">${lifeText(garden.plant||'나의 화분')}</div></section>
 <div class="garden-status"><div><span>물</span><meter min="0" max="100" value="${garden.water}"></meter><b>${garden.water}%</b></div><div><span>햇빛</span><meter min="0" max="100" value="${garden.sun}"></meter><b>${garden.sun}%</b></div><div><span>성장</span><meter min="0" max="14" value="${garden.xp}"></meter><b>${gardenStages[s]}</b></div></div>
 <div class="actions garden-actions"><button class="primary" id="garden-water">💧 물 한 모금</button><button class="ghost" id="garden-sun">☀ 빛자리 열기</button><button class="ghost" id="garden-name">화분 이름 붙이기</button></div>
 <p class="life-note">하루에 한 번 물과 빛을 챙기면 잘 자라요. 너무 자주 눌러도 식물이 재촉받지는 않아요. 글 한 편을 저장할 때마다 마음빛도 하나 생겨요.</p>`;
 $('#garden-water').onclick=()=>care('water');$('#garden-sun').onclick=()=>care('sun');$('#garden-name').onclick=renamePlant;
 }catch{lifeShell.innerHTML='<div class="empty-state">정원을 불러오지 못했어요.<br>연결 상태를 확인해 주세요.</div>';}finally{gardenBusy=false;}
}
async function care(kind){const field=kind==='water'?'lastWater':'lastSun',elapsed=Date.now()-(garden[field]||0);if(elapsed<6*3600000){toast(kind==='water'?'아직 흙이 촉촉해요.':'오늘 받은 햇빛이 충분해요.');return;}garden[field]=Date.now();garden[kind]=Math.min(100,(garden[kind]||0)+28);if(garden.water>=30&&garden.sun>=30)garden.xp=Math.min(14,(garden.xp||0)+1);await window.lifeCloud.setSetting('garden',garden);gardenBusy=false;renderGarden();toast(kind==='water'?'물이 흙으로 스며들어요.':'따뜻한 햇살을 받았어요.');}
function renamePlant(){lifeShow(`<h2>화분 이름 붙이기</h2><form id="plant-name"><label class="field">이름<input name="name" maxlength="30" value="${lifeText(garden.plant||'')}"></label><button class="primary">이 이름으로 부르기</button></form>`);$('#plant-name').onsubmit=async e=>{e.preventDefault();garden.plant=String(new FormData(e.target).get('name')).trim()||'나의 화분';await window.lifeCloud.setSetting('garden',garden);lifeDialog.close();gardenBusy=false;renderGarden();};}
async function rewardWriting(){await loadGarden();garden.dew=(garden.dew||0)+1;if(garden.dew%3===0)garden.xp=Math.min(14,(garden.xp||0)+1);await window.lifeCloud.setSetting('garden',garden);}

document.addEventListener('click',e=>{const b=e.target.closest('button');if(!b)return;b.classList.remove('soft-pop');void b.offsetWidth;b.classList.add('soft-pop');});
lifeMenu();
})();

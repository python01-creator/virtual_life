/* A private, independent memory room. No changes to the main room's player or pets. */
(()=>{
 'use strict';
 const W=820,H=520;
 const offeringKinds={snack:'🍪',toy:'🧸',flower:'🌼',keepsake:'🎁'};
 const art=`<svg class="memory-room-art" viewBox="0 0 820 520" aria-hidden="true">
 <defs>
  <radialGradient id="mem-light"><stop stop-color="#fffef8" stop-opacity=".85"/><stop offset=".3" stop-color="#fffbed" stop-opacity=".35"/><stop offset="1" stop-color="#fffbed" stop-opacity="0"/></radialGradient>
  <linearGradient id="mem-wall" x2="0" y2="1"><stop stop-color="#f8f2e5"/><stop offset="1" stop-color="#e9e4d2"/></linearGradient>
  <linearGradient id="mem-sky" x2="0" y2="1"><stop stop-color="#bedbd6"/><stop offset="1" stop-color="#edf1d9"/></linearGradient>
  <linearGradient id="mem-floor" x2="0" y2="1"><stop stop-color="#d6bb92"/><stop offset="1" stop-color="#ead7b6"/></linearGradient>
  <clipPath id="mem-window"><path d="M316 241V129a94 94 0 0 1 188 0v112z"/></clipPath>
  <filter id="mem-shadow"><feDropShadow dx="0" dy="5" stdDeviation="5" flood-color="#725a40" flood-opacity=".13"/></filter>
 </defs>
 <rect x="12" y="12" width="796" height="496" rx="24" fill="#c2cbb4"/>
 <path d="M26 34q0-8 12-8h744q12 0 12 12v259H26z" fill="url(#mem-wall)"/>
 <path d="M26 292h768v194q0 8-12 8H38q-12 0-12-12z" fill="url(#mem-floor)"/>
 <path d="M26 292h768" stroke="#b7a385" stroke-width="12"/>
 <g stroke="#baa17c" opacity=".32" stroke-width="2"><path d="M26 336h768M26 382h768M26 430h768M26 478h768"/><path d="M180 296v40m280-40v40m240-40v40M95 338v43m250-43v43m270-43v43M210 384v45m270-45v45m250-45v45M100 432v45m270-45v45m260-45v45"/></g>
 <path d="M305 247V129a105 105 0 0 1 210 0v118z" fill="#b2a17f"/>
 <g clip-path="url(#mem-window)"><rect x="310" y="30" width="200" height="220" fill="url(#mem-sky)"/>
 <g fill="#fffdf1" opacity=".95"><ellipse cx="357" cy="119" rx="32" ry="10"/><ellipse cx="345" cy="110" rx="17" ry="15"/><ellipse cx="457" cy="86" rx="32" ry="10"/><ellipse cx="467" cy="77" rx="16" ry="13"/></g>
 <path d="M305 216q64-53 117-12t100-18v70H305" fill="#b1c69b"/><path d="M300 244q80-45 135-9t95-18v40H300" fill="#87a87f"/>
 <path d="M410 40v205M310 168h200" stroke="#e8dfc7" stroke-width="7"/></g>
 <path d="M300 248h220" stroke="#a18e6d" stroke-width="12" stroke-linecap="round"/>
 <g fill="#eee3ca"><path d="M281 56q21 65 7 202l28-1q10-133-5-201z"/><path d="M516 56q-15 69-5 201l28 1q-14-137 7-202z"/></g>
 <path d="M277 54h274" stroke="#9b886b" stroke-width="7" stroke-linecap="round"/>
 <path d="M322 253l-80 188h344L493 253" fill="#fff9d3" opacity=".16"/>
 <g filter="url(#mem-shadow)"><path d="M118 101l19-16 19 16" fill="none" stroke="#a89677" stroke-width="2"/>
 <rect x="82" y="105" width="110" height="116" rx="9" fill="#ad8d66"/><rect x="90" y="113" width="94" height="100" rx="5" fill="#f9eed8"/>
 <path d="M137 178c-35-21-29-45-10-41q8 1 10 9 3-8 11-9c20-4 25 20-11 41" fill="#c6a394"/>
 <path d="M76 237h123" stroke="#b3946f" stroke-width="8" stroke-linecap="round"/>
 <rect x="91" y="220" width="20" height="13" rx="3" fill="#b9c6a7"/><path d="M101 222v-18m0 8q-15-3-10-13 11 1 10 13m0-8q14 0 12-11-12 0-12 11" fill="#91a77a" stroke="#91a77a" stroke-width="2"/></g>
 <g filter="url(#mem-shadow)"><rect x="620" y="117" width="65" height="69" rx="5" fill="#b69a74"/><rect x="628" y="125" width="49" height="53" fill="#fbf0d8"/><path d="M644 148l9-10 9 10-9 10z" fill="#cfba80"/><path d="M652 135v-5m0 36v-5m-18-12h5m26 0h5" stroke="#b7aa8c" stroke-width="2"/></g>
 <g filter="url(#mem-shadow)"><rect x="68" y="319" width="112" height="104" rx="7" fill="#a98b67"/><rect x="77" y="328" width="94" height="38" fill="#c4aa85"/><rect x="77" y="374" width="94" height="39" fill="#c4aa85"/>
 <g stroke="#f3e7cf" stroke-width="2"><path d="M90 333v29m17-29v29m18-29v29m21-29v29"/></g><g fill="#80957a"><rect x="84" y="331" width="14" height="31" rx="2"/><rect x="118" y="330" width="17" height="32" rx="2"/><rect x="142" y="386" width="18" height="25" rx="2"/></g><g fill="#cfaa91"><rect x="100" y="334" width="13" height="28" rx="2"/><rect x="139" y="330" width="20" height="32" rx="2"/></g>
 <rect x="87" y="390" width="47" height="9" rx="2" fill="#efe1c2"/><rect x="89" y="400" width="44" height="9" rx="2" fill="#9baa8a"/><path d="M81 423v8m84-8v8" stroke="#8c7256" stroke-width="7"/></g>
 <ellipse cx="324" cy="411" rx="122" ry="45" fill="#b7b899" opacity=".43"/>
 <ellipse cx="324" cy="402" rx="115" ry="42" fill="#d9dfc3"/><ellipse cx="324" cy="399" rx="96" ry="30" fill="none" stroke="#c5cfac" stroke-width="3"/>
 <g class="memory-room-star" aria-hidden="true">
 <ellipse cx="310" cy="391" rx="26" ry="5" fill="#fffcf0" opacity=".12"/>
 <circle class="memory-star-halo" cx="310" cy="351" r="35" fill="url(#mem-light)"/>
 <circle cx="310" cy="351" r="16" fill="url(#mem-light)"/>
 <path d="M310 341q1.4 8.6 10 10-8.6 1.4-10 10-1.4-8.6-10-10 8.6-1.4 10-10" fill="#fffdf3"/>
 <circle cx="310" cy="351" r="2.3" fill="#fffefa"/>
 <g class="memory-star-sparkles" fill="#fffdf3"><circle cx="286" cy="338" r="1.1"/><circle cx="334" cy="358" r="1.3"/><circle cx="321" cy="326" r=".9"/></g>
 </g>
 <g filter="url(#mem-shadow)"><path d="M576 366v55m153-55v55" stroke="#967653" stroke-width="10"/><rect x="561" y="325" width="184" height="49" rx="5" fill="#b7946c"/><rect x="555" y="317" width="196" height="15" rx="5" fill="#d1b28c"/>
 <path d="M601 296h78v23h-78z" fill="#faf1db"/><path d="M640 298v19" stroke="#c7b493" stroke-width="2"/><path d="M608 304h24m-24 6h24m16-6h23m-23 6h23" stroke="#b8ac91" stroke-width="1.5"/>
 <path d="M682 278l5 3-17 26-5 3 1-6z" fill="#778d74"/>
 <path d="M720 288v27m-13 0h26" stroke="#9a885f" stroke-width="5"/><path d="M703 265h34l10 25h-54z" fill="#e7d5a0"/>
 <rect x="625" y="412" width="50" height="18" rx="6" fill="#9eaf91"/><path d="M632 429v14m36-14v14" stroke="#8d9272" stroke-width="5"/></g>
 <g fill="#91a47e"><path d="M752 254q-29-29-21-48 26 10 21 48m0-18q26-30 28-6-4 15-28 16"/><path d="M752 250v42" stroke="#81966f" stroke-width="4"/></g><path d="M737 276h32l-5 28h-22z" fill="#bfa386"/>
 <path d="M360 485h100" stroke="#bea27c" stroke-width="4" stroke-linecap="round"/>
 </svg>`;
 const css=document.createElement('style');css.textContent=`
 #life-dialog.memory-child-open{overflow:hidden!important}.memory-inner-overlay{position:absolute;inset:0;z-index:15;display:flex;align-items:center;justify-content:center;padding:20px;background:#45513d66;backdrop-filter:blur(2px)}.memory-inner-panel{box-sizing:border-box;width:100%;max-height:100%;overflow:auto;overscroll-behavior:contain;background:var(--paper,#faf8ef);border-radius:16px;padding:20px;box-shadow:0 10px 36px #26361f33}.memory-inner-close{margin-bottom:12px;min-height:40px}.memory-inner-panel h2{margin-top:0;font-size:21px}.memory-inner-panel .memory-records-panel{border:0;margin:0;padding:0}.memory-inner-panel .memory-records-panel>summary{display:none}@media(max-width:420px){.memory-inner-overlay{padding:10px}.memory-inner-panel{padding:14px}}

 .memory-offering-tray{position:absolute;left:68%;top:36%;width:23%;height:12%;display:flex;align-items:center;justify-content:center;gap:5%;border-bottom:8px solid #ba9c76;border-radius:5px;pointer-events:none}.memory-offering-tray span{font-size:clamp(13px,3vw,25px);filter:drop-shadow(0 2px 1px #725a4033)}.memory-scene-offerings{left:67%;top:35%;width:25%;height:14%}
 .memory-offerings-editor{margin:12px 0;padding:16px;border:1px solid #d7ddc8;border-radius:14px;background:#faf8ee}.memory-offerings-editor h3{margin:0 0 10px;font-size:16px}.memory-offerings-editor label{display:grid;gap:5px;font-size:12px}.memory-offerings-form{display:grid;grid-template-columns:110px 1fr;gap:10px}.memory-offerings-form input,.memory-offerings-form select{box-sizing:border-box;width:100%;min-width:0;padding:9px;border:1px solid #cbd2bd;border-radius:8px;background:#fffdf8;font:inherit}.memory-offerings-form .wide{grid-column:1/-1}.memory-offerings-actions{display:flex;gap:8px;flex-wrap:wrap;margin-top:10px}.memory-offerings-actions button{min-height:40px;font-size:12px;padding:8px 12px}.memory-offerings-list{display:grid;gap:8px;margin-bottom:14px}.memory-offering-row{display:flex;gap:10px;align-items:center;padding:10px;background:#fffdf6;border-radius:9px}.memory-offering-row>div{flex:1;min-width:0;overflow-wrap:anywhere}.memory-offering-row strong{font-size:13px}.memory-offering-row p{font-size:12px;margin:4px 0 0;white-space:pre-wrap}.memory-offering-row button{font-size:11px;min-height:36px}.memory-offerings-status{font-size:12px;margin:8px 0 0}.memory-offerings-status:empty{display:none}@media(max-width:420px){.memory-offerings-form{grid-template-columns:1fr}.memory-offerings-editor{padding:12px}}

 .memory-in-dialog .life-heading{padding-right:28px}.memory-room-stage{margin:12px 0}.memory-room-scene{position:relative;isolation:isolate;width:100%;aspect-ratio:820/520;overflow:hidden;border-radius:16px;background:#d9dfcb;touch-action:manipulation;outline-offset:3px;user-select:none;-webkit-user-select:none}
 .memory-room-art{position:absolute;inset:0;width:100%;height:100%;pointer-events:none}.memory-scene-furniture{position:absolute;border:0!important;background:transparent!important;padding:0!important;color:#655e4e;cursor:pointer;z-index:3;min-height:0!important;min-width:0!important;touch-action:manipulation}
 .memory-scene-furniture:focus-visible{outline:2px solid #839477;outline-offset:2px;border-radius:8px}.memory-scene-furniture:hover .memory-scene-label{background:#fff9e6;color:#4e624b}.memory-scene-label{position:absolute;top:100%;left:50%;transform:translateX(-50%);white-space:nowrap;font-size:clamp(8px,1.8vw,11px);line-height:1.4;background:#faf5e0c9;padding:3px 7px;border-radius:20px;box-shadow:0 2px 6px #725c3110}
 .memory-scene-frame{left:9.3%;top:19%;width:15%;height:26%}.memory-scene-shelf{left:7.8%;top:60%;width:15%;height:21%}.memory-scene-rest{left:26%;top:61%;width:25%;height:17%}.memory-scene-desk{left:67.5%;top:52%;width:25%;height:26%}
 .memory-frame-photo{position:absolute;left:12%;top:12%;width:76%;height:71%;object-fit:cover;border-radius:2px;pointer-events:none}
 .memory-room-visitor{position:absolute;width:7.1%;z-index:4;pointer-events:none;transform:translate(-50%,-100%);will-change:left,top}.memory-room-visitor:after{content:'';position:absolute;bottom:-1px;left:15%;width:70%;height:8%;background:#715e462e;border-radius:50%;z-index:-1}.memory-room-visitor img{display:block;width:100%;height:auto}.memory-room-visitor.is-walking img{animation:memory-step .28s ease-in-out infinite alternate}
 .memory-room-target{position:absolute;width:3.5%;aspect-ratio:2;border:1px solid #faf4d3c9;border-radius:50%;transform:translate(-50%,-50%);pointer-events:none;z-index:2}.memory-room-caption{display:flex;justify-content:space-between;align-items:center;gap:10px;margin:7px 2px 0;font-size:11px;color:#7a806e}.memory-room-caption button{border:0;background:transparent;color:#62765a;padding:4px;min-height:28px;font-size:11px}
 .memory-room-note{position:absolute;left:50%;top:12%;transform:translateX(-50%);z-index:5;background:#fffcf1f5;border:1px solid #d3d8c4;border-radius:14px;padding:13px;width:min(76%,300px);box-shadow:0 8px 30px #4e5d3824;user-select:text}.memory-room-note h3{font-size:16px;margin:0 20px 5px 0!important;overflow-wrap:anywhere}.memory-room-note p{font-size:11px!important;line-height:1.6!important;margin:0 0 8px!important}.memory-room-note .actions{gap:5px;margin:0!important}.memory-room-note .actions button{font-size:11px;padding:7px 9px;min-height:32px;flex:1 1 auto}.memory-room-note-close{position:absolute;right:7px;top:5px;border:0;background:transparent;font-size:20px;color:#7b8174;min-height:25px!important;padding:0 4px}
 .memory-room-star{transform-origin:310px 350px}.memory-star-sparkles{opacity:0}.is-greeting .memory-room-star{animation:memory-star-float 6s ease-in-out infinite}.is-greeting .memory-star-halo{animation:memory-star-glow 4.8s ease-in-out infinite}.is-greeting .memory-star-sparkles{animation:memory-star-twinkle 4.6s ease-in-out infinite}.is-greeting .memory-star-sparkles circle:nth-child(2){animation:memory-star-twinkle 5s 1.2s ease-in-out infinite}.is-greeting .memory-star-sparkles circle:nth-child(3){animation:memory-star-twinkle 5.8s .6s ease-in-out infinite}
 @keyframes memory-star-float{50%{transform:translateY(-2px)}}@keyframes memory-star-glow{50%{opacity:.6;transform:scale(1.08);transform-origin:310px 350px}}@keyframes memory-star-twinkle{0%,100%{opacity:.08}50%{opacity:.75}}
 .memory-records-panel{margin-top:14px;border-top:1px solid #dedfce;padding-top:10px}.memory-records-panel>summary{font-size:12px;color:#68775f;cursor:pointer;padding:8px 0}.memory-return{margin-bottom:14px;font-size:12px}
 @keyframes memory-step{to{transform:translateY(-2px)}}@keyframes memory-breathe{50%{transform:scale(1.015,.99)}}@keyframes memory-heart{50%{transform:translateY(-2px);opacity:.6}}
 @media(prefers-reduced-motion:reduce){.is-greeting .memory-star-sparkles{opacity:1}.is-greeting .memory-star-halo{opacity:.65}.memory-room-star,.memory-star-halo,.memory-star-sparkles,.memory-star-sparkles circle,.memory-room-visitor img{animation:none!important}}
 @media(pointer:coarse){.memory-scene-furniture{min-height:44px!important;min-width:44px!important}}
 @media(max-width:420px){.memory-room-scene{border-radius:12px}.memory-scene-label{padding:2px 5px}.memory-room-note{padding:9px;top:5%}.memory-room-note h3{font-size:14px}.memory-room-note .actions button{font-size:10px;padding:5px}.memory-room-caption{font-size:10px}}
 `;document.head.append(css);
 function mount(host,options){
  host.replaceChildren();const scene=document.createElement('div');scene.className='memory-room-scene';scene.tabIndex=0;scene.setAttribute('role','group');scene.setAttribute('aria-label','기억의 방. 가구를 누르거나 방향키로 이동하고 Enter로 선택하세요.');scene.innerHTML=art;host.append(scene);
  let alive=true,frame=0,last=0,route=[],afterMove=null,pos={x:410,y:462};const held=new Set(),reduced=matchMedia('(prefers-reduced-motion: reduce)');
  const obstacles=[[60,395,125,40],[214,355,181,53],[558,345,193,49]],points=[];
  const free=(x,y)=>x>=60&&x<=760&&y>=300&&y<=480&&!obstacles.some(([a,b,w,h])=>x>a&&x<a+w&&y>b&&y<b+h);
  for(let y=300;y<=480;y+=20)for(let x=60;x<=760;x+=20)if(free(x,y))points.push({x,y,key:x+','+y});
  const grid=new Map(points.map(p=>[p.key,p]));
  const nearest=p=>points.reduce((best,q)=>!best||Math.hypot(q.x-p.x,q.y-p.y)<Math.hypot(best.x-p.x,best.y-p.y)?q:best,null);
  const target=document.createElement('i');target.className='memory-room-target';target.hidden=true;scene.append(target);
  const visitor=document.createElement('div');visitor.className='memory-room-visitor';visitor.setAttribute('aria-hidden','true');const avatar=document.createElement('img');avatar.src='./assets/avatar-cute-stand.webp';avatar.alt='';visitor.append(avatar);scene.append(visitor);
  const update=()=>{visitor.style.left=pos.x/W*100+'%';visitor.style.top=pos.y/H*100+'%';};update();
  const note=document.createElement('aside');note.className='memory-room-note';note.hidden=true;note.setAttribute('aria-label','함께 쉬는 자리');scene.append(note);
  function closeNote(){note.hidden=true;scene.classList.remove('is-greeting');}
  function meet(){
   scene.classList.add('is-greeting');avatar.src='./assets/avatar-cute-sit.webp';
   note.innerHTML='<button type="button" class="memory-room-note-close" aria-label="만나기 창 닫기">×</button><h3></h3><p>함께 쉬는 동안, 소중한 마음을 담은 별이 반짝여요.</p><div class="actions"><button type="button" class="primary" data-memory-letter>편지 남기기</button><button type="button" class="ghost" data-memory-browse>추억 펼치기</button></div>';
   note.querySelector('h3').textContent=options.name;note.querySelector('.memory-room-note-close').onclick=closeNote;note.querySelector('[data-memory-letter]').onclick=options.onLetter;note.querySelector('[data-memory-browse]').onclick=()=>{closeNote();options.onBrowse();};note.hidden=false;
  }
  const tray=document.createElement('div');tray.className='memory-offering-tray';tray.setAttribute('aria-hidden','true');for(const item of (options.offerings||[]).slice(0,6)){const icon=document.createElement('span');icon.textContent=offeringKinds[item.kind]||offeringKinds.keepsake;tray.append(icon);}scene.append(tray);
  const furniture=[
   {className:'offerings',label:'좋아하던 것들',aria:'추모 선반 · 좋아하던 물건과 간식 놓기',x:740,y:300,run:options.onOfferings},
   {className:'frame',label:'추억 액자',aria:'추억 액자 · 사진과 기억 보기',x:180,y:300,run:options.onBrowse},
   {className:'shelf',label:'기억 책장',aria:'기억 책장 · 기록 모아보기',x:200,y:440,run:options.onBrowse},
   {className:'rest',label:'함께 쉬기',aria:'함께 쉬는 자리 · 만나기',x:410,y:420,run:meet},
   {className:'desk',label:'편지 쓰기',aria:'편지 책상 · 편지 남기기',x:650,y:440,run:options.onLetter}
  ];
  function go(x,y,action){
   held.clear();closeNote();avatar.src='./assets/avatar-cute-stand.webp';const start=nearest(pos),end=nearest({x,y});if(!start||!end)return;
   const queue=[start],previous=new Map([[start.key,null]]);for(let i=0;i<queue.length&&!previous.has(end.key);i++){const p=queue[i];for(const [dx,dy]of [[20,0],[-20,0],[0,20],[0,-20]]){const next=grid.get((p.x+dx)+','+(p.y+dy));if(next&&!previous.has(next.key)){previous.set(next.key,p);queue.push(next);}}}
   if(!previous.has(end.key))return;const path=[];for(let p=end;p;p=previous.get(p.key))path.unshift({x:p.x,y:p.y});route=path;afterMove=action||null;
   Object.assign(target.style,{left:end.x/W*100+'%',top:end.y/H*100+'%'});target.hidden=false;
   if(reduced.matches){pos={x:end.x,y:end.y};route=[];target.hidden=true;update();const done=afterMove;afterMove=null;done?.();}
  }
  for(const item of furniture){const button=document.createElement('button');button.type='button';button.className='memory-scene-furniture memory-scene-'+item.className;button.setAttribute('aria-label',item.aria);const label=document.createElement('span');label.className='memory-scene-label';label.textContent=item.label;button.append(label);button.onclick=e=>{e.stopPropagation();if(item.className==='rest')go(item.x,item.y,item.run);else{held.clear();route=[];afterMove=null;target.hidden=true;closeNote();item.run?.();}};scene.append(button);
   if(item.className==='frame'){const record=(options.records||[]).find(r=>typeof r.photo==='string'&&/^(data:image\/(?:png|jpeg|webp);base64,|https:\/\/)/.test(r.photo));if(record){const photo=document.createElement('img');photo.className='memory-frame-photo';photo.src=record.photo;photo.alt='';photo.referrerPolicy='no-referrer';button.prepend(photo);}}
  }
  scene.addEventListener('pointerdown',e=>{if(!note.hidden&&!note.contains(e.target)&&!e.target.closest('.memory-scene-furniture'))closeNote();});
  scene.addEventListener('click',e=>{if(e.target.closest('button,.memory-room-note'))return;const r=scene.getBoundingClientRect(),x=(e.clientX-r.left)*W/r.width,y=(e.clientY-r.top)*H/r.height;if(y>=300){scene.focus({preventScroll:true});go(x,y);}});
  scene.addEventListener('keydown',e=>{
   const key=e.key.toLowerCase();if(key==='escape'&&!note.hidden){e.preventDefault();e.stopPropagation();closeNote();return;}
   if(e.target.closest('.memory-room-note'))return;
   if(['arrowleft','arrowright','arrowup','arrowdown','w','a','s','d'].includes(key)){e.preventDefault();e.stopPropagation();route=[];afterMove=null;target.hidden=true;closeNote();avatar.src='./assets/avatar-cute-stand.webp';held.add(key);}
   if(['enter','e'].includes(key)&&e.target===scene){e.preventDefault();e.stopPropagation();const closest=furniture.reduce((a,b)=>Math.hypot(a.x-pos.x,a.y-pos.y)<Math.hypot(b.x-pos.x,b.y-pos.y)?a:b);go(closest.x,closest.y,closest.run);}
  });
  const keyup=e=>held.delete(e.key.toLowerCase()),release=()=>held.clear();window.addEventListener('keyup',keyup);window.addEventListener('blur',release);document.addEventListener('visibilitychange',release);scene.addEventListener('focusout',e=>{if(!scene.contains(e.relatedTarget)){release();route=[];afterMove=null;target.hidden=true;visitor.classList.remove('is-walking');}});
  const caption=document.createElement('div');caption.className='memory-room-caption';caption.innerHTML='<span>가구를 눌러 둘러보세요.</span><button type="button">기록 모아보기</button>';caption.querySelector('button').onclick=options.onBrowse;host.append(caption);
  function destroy(){if(!alive)return;alive=false;cancelAnimationFrame(frame);window.removeEventListener('keyup',keyup);window.removeEventListener('blur',release);document.removeEventListener('visibilitychange',release);held.clear();}
  function tick(now){
   if(!alive)return;if(!host.isConnected){destroy();return;}const dt=Math.min(.035,(now-last)/1000||0);last=now;
   if(!document.hidden){let moving=false;
    if(held.size){let dx=(held.has('arrowright')||held.has('d')?1:0)-(held.has('arrowleft')||held.has('a')?1:0),dy=(held.has('arrowdown')||held.has('s')?1:0)-(held.has('arrowup')||held.has('w')?1:0);const length=Math.hypot(dx,dy)||1,speed=210*dt;dx=dx/length*speed;dy=dy/length*speed;if(free(pos.x+dx,pos.y))pos.x+=dx;if(free(pos.x,pos.y+dy))pos.y+=dy;moving=!!(dx||dy);}
    else if(route.length){const next=route[0],dx=next.x-pos.x,dy=next.y-pos.y,d=Math.hypot(dx,dy),step=430*dt;if(d<=step){pos={x:next.x,y:next.y};route.shift();}else{pos.x+=dx/d*step;pos.y+=dy/d*step;}moving=true;if(!route.length){target.hidden=true;const done=afterMove;afterMove=null;done?.();}}
    visitor.classList.toggle('is-walking',moving&&!reduced.matches);update();
   }frame=requestAnimationFrame(tick);
  }frame=requestAnimationFrame(tick);return destroy;
 }
 window.lifeMemoryRoom={mount};
})();

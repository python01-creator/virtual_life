(() => {
 const entry=document.createElement('button');
 entry.type='button';
 const door={x:816,y:78,width:58,height:124};
 window.lifeFrontDoor=door;
 entry.className='ocean-entry';
 entry.innerHTML='<span class="ocean-door-leaf" aria-hidden="true"></span>';
 entry.setAttribute('aria-label','현관문 · 집 밖으로');
 document.querySelector('.canvas-wrap').append(entry);

 const outdoors=document.createElement('section');
 outdoors.className='hq-outdoors';
 outdoors.hidden=true;
 document.body.append(outdoors);
 const room=document.querySelector('main');
 let stopOcean=()=>{};
 const reducedMotion=matchMedia('(prefers-reduced-motion: reduce)');
 const surf=new Audio('./assets/ambience-ocean.mp3');
 surf.preload='none';
 surf.loop=true;
 surf.volume=.48;
 let muted=false;
 function startSurf(){
  if(!muted)surf.play().catch(()=>{});
 }
 function stopSurf(){
  surf.pause();
  surf.currentTime=0;
 }
 function drawBeach(canvas){
  const ctx=canvas.getContext('2d');
  let frame;
  function paint(time){
   const gradient=(top,bottom,colors)=>{
    const fill=ctx.createLinearGradient(0,top,0,bottom);
    colors.forEach(([at,color])=>fill.addColorStop(at,color));
    return fill;
   };
   ctx.fillStyle=gradient(0,125,[[0,'#6aa9cc'],[.68,'#b9dae4'],[1,'#eff0db']]);
   ctx.fillRect(0,0,640,125);
   for(const [x,y,rx,ry] of [[94,48,57,10],[139,44,31,11],[466,62,80,8],[495,56,34,10]]){
    const mist=ctx.createRadialGradient(x,y,0,x,y,rx);
    mist.addColorStop(0,'#fffdf1a0');
    mist.addColorStop(1,'#fffdf100');
    ctx.fillStyle=mist;
    ctx.beginPath();
    ctx.ellipse(x,y,rx,ry,0,0,Math.PI*2);
    ctx.fill();
   }
   ctx.fillStyle=gradient(124,350,[[0,'#28647f'],[.32,'#338594'],[.72,'#66b7b1'],[1,'#a2c9b2']]);
   ctx.fillRect(0,124,640,236);
   for(let row=0;row<30;row++){
    const depth=row/29;
    const y=126+depth*depth*200;
    const swell=Math.sin(row*2.4+time/1150);
    ctx.strokeStyle=row%3===0?'#dafff147':'#14576c2a';
    ctx.lineWidth=.4+depth*1.8;
    ctx.beginPath();
    for(let x=0;x<=640;x+=5){
     const ripple=Math.sin(x/(23+depth*28)+row+time/1700);
     ctx.lineTo(x,y+ripple*depth*4+swell*depth*3);
    }
    ctx.stroke();
   }
   const shore=(x)=>262+x*.095+Math.sin(x/102)*9;
   const tide=Math.sin(time/960)*13+Math.sin(time/1900)*5;
   const waterEdge=x=>shore(x)+tide+Math.sin(x/39-time/820)*4+Math.sin(x/15+time/950)*1.6;
   function below(edge,fill){
    ctx.fillStyle=fill;
    ctx.beginPath();
    ctx.moveTo(0,360);
    for(let x=0;x<=640;x+=4)ctx.lineTo(x,edge(x));
    ctx.lineTo(640,360);
    ctx.fill();
   }
   below(waterEdge,gradient(250,360,[[0,'#a88a6b'],[.45,'#cfaf87'],[1,'#ecd0a2']]));
   below(x=>shore(x)+24+(waterEdge(x)-shore(x))*.25,'#e9cba182');
   ctx.fillStyle='#795c4438';
   for(let grain=0;grain<320;grain++){
    const x=(grain*173.17)%640,y=282+(grain*31.73)%78;
    if(y>shore(x)+24+(waterEdge(x)-shore(x))*.25)ctx.fillRect(x,y,grain%7===0?1.6:.8,.8);
   }
   for(let band=0;band<3;band++){
    ctx.strokeStyle=['#f7fff2e0','#effff4a0','#ebfff455'][band];
    ctx.lineWidth=[2.2,1.3,.8][band];
    ctx.beginPath();
    for(let x=0;x<=640;x+=3){
     const y=waterEdge(x)-band*4+Math.sin(x/9-band+time/600)*band;
     if(x===0||(band&&Math.sin(x/21+band)<-.4))ctx.moveTo(x,y);
     else ctx.lineTo(x,y);
    }
    ctx.stroke();
   }
   for(let speck=0;speck<150;speck++){
    const x=speck*89.31%640;
    const drift=(speck*3.17+time/490)%15;
    ctx.fillStyle=`rgba(246,255,245,${(1-drift/15)*.65})`;
    ctx.fillRect(x,waterEdge(x)-drift,1+speck%3,.85);
   }
   if(!reducedMotion.matches)frame=requestAnimationFrame(paint);
  }
  paint(0);
  return ()=>cancelAnimationFrame(frame);
 }
 function goHome(){
  stopOcean();
  stopSurf();
  outdoors.hidden=true;
  room.inert=false;
  outdoors.replaceChildren();
  entry.focus({preventScroll:true});
 }
 function openPath(){
  outdoors.hidden=false;
  room.inert=true;
  outdoors.innerHTML=`<header><h2>집 앞</h2><button type="button" data-home>집으로</button></header>
   <div class="hq-coastal-path">
    <span class="hq-path-house" aria-hidden="true">⌂</span>
    <div class="hq-path-avatar" aria-hidden="true">
     <img class="hq-walk-body" alt="">
     <img class="hq-walk-foot left" alt="">
     <img class="hq-walk-foot right" alt="">
    </div>
    <button type="button" class="hq-path-beach">해변까지 걷기</button>
   </div>`;
  outdoors.querySelector('[data-home]').onclick=goHome;
  const avatar=outdoors.querySelector('.hq-path-avatar');
  for(const part of avatar.querySelectorAll('img'))part.src=currentAvatarFrame(0).src;
  const beach=outdoors.querySelector('.hq-path-beach');
  beach.onclick=()=>{
   beach.disabled=true;
   startSurf();
   if(matchMedia('(prefers-reduced-motion: reduce)').matches){openBeach();return;}
   const travel=avatar.animate([
    {left:'13%',top:'79%'},{left:'37%',top:'65%'},{left:'61%',top:'51%'},{left:'79%',top:'37%'}
   ],{duration:2600,easing:'linear',fill:'forwards'});
   avatar.classList.add('is-walking');
   stopOcean=()=>{
    travel.cancel();
    avatar.classList.remove('is-walking');
   };
   travel.finished.then(openBeach).catch(()=>{});
  };
  beach.focus({preventScroll:true});
 }
 function openBeach(){
  stopOcean();
  window.lifeRoomInteraction?.cancel();
  keys.clear();
  outdoors.hidden=false;
  room.inert=true;
  outdoors.innerHTML=`<header><h2>해변</h2><button type="button" data-home>집으로</button></header>
   <button class="hq-beach-water" type="button"><canvas width="640" height="360" aria-hidden="true"></canvas><span>바다에 들어가기</span></button>
   <button type="button" data-surf aria-pressed="${!muted}">파도 소리</button>`;
  outdoors.querySelector('[data-home]').onclick=goHome;
  const water=outdoors.querySelector('.hq-beach-water');
  stopOcean=drawBeach(water.querySelector('canvas'));
  startSurf();
  const sound=outdoors.querySelector('[data-surf]');
  sound.onclick=()=>{
   muted=!muted;
   sound.setAttribute('aria-pressed',String(!muted));
   if(muted)stopSurf();else startSurf();
  };
  water.onclick=openOcean;
  water.focus({preventScroll:true});
 }
 function openOcean(){
  stopOcean();
  stopSurf();
  outdoors.innerHTML=`<header><h2>프리다이빙 바다</h2><button type="button" id="hq-ocean-exit">해변으로</button></header>
   <canvas id="hq-ocean" width="640" height="380" tabindex="0" aria-label="프리다이빙 바다. 방향키나 화면 터치로 이동"></canvas>
   <p id="hq-ocean-status" role="status">해변</p>
   <div class="actions"><button class="primary" id="hq-dive">잠수하기</button><button class="ghost" id="hq-surface">수면으로</button></div>`;
  const canvas=document.querySelector('#hq-ocean'),ctx=canvas.getContext('2d');
  const dive=document.querySelector('#hq-dive'),surface=document.querySelector('#hq-surface');
  const status=document.querySelector('#hq-ocean-status');
  const avatar=currentAvatarFrame(0);
  const waterline=100;
  const position={x:320,y:70},target={...position};
  let swimming=false,frame=0,last=0,angle=0;
  function setSwimming(value){
   swimming=value;
   target.x=position.x;
   target.y=value?190:70;
   dive.disabled=value;
   surface.disabled=!value;
   status.textContent=value?'물속 · 방향키나 터치로 헤엄치기':'해변 · 잠수하기를 눌러 바다에 들어가요';
   canvas.focus({preventScroll:true});
  }
  dive.onclick=()=>setSwimming(true);
  surface.onclick=()=>setSwimming(false);
  document.querySelector('#hq-ocean-exit').onclick=openBeach;
  canvas.onclick=event=>{
   if(!swimming)return;
   const bounds=canvas.getBoundingClientRect();
   target.x=Math.max(42,Math.min(598,(event.clientX-bounds.left)*640/bounds.width));
   target.y=Math.max(126,Math.min(338,(event.clientY-bounds.top)*380/bounds.height));
  };
  canvas.onkeydown=event=>{
   const delta={ArrowLeft:[-32,0],ArrowRight:[32,0],ArrowUp:[0,-26],ArrowDown:[0,26]}[event.key];
   if(!swimming||!delta)return;
   event.preventDefault();
   event.stopPropagation();
   target.x=Math.max(42,Math.min(598,target.x+delta[0]));
   target.y=Math.max(126,Math.min(338,target.y+delta[1]));
  };
  let facing=1;
  function drawDiver(time,dx,dy){
   if(Math.abs(dx)>4)facing=Math.sign(dx);
   const speed=Math.hypot(dx,dy);
   const kick=Math.sin(time/85)*Math.min(1,speed/26);
   ctx.scale(facing,1);
   ctx.rotate(angle);
   function flipper(phase,color){
    ctx.save();
    ctx.translate(-9,3);
    ctx.rotate(phase);
    ctx.fillStyle=color;
    ctx.beginPath();
    ctx.roundRect(-21,-3,23,6,3);
    ctx.fill();
    ctx.translate(-19,0);
    ctx.rotate(-phase*.45);
    ctx.fillStyle='#5de4c3';
    ctx.beginPath();
    ctx.moveTo(2,-2);
    ctx.quadraticCurveTo(-7,-6,-15,-5);
    ctx.lineTo(-15,4);
    ctx.quadraticCurveTo(-7,5,2,2);
    ctx.fill();
    ctx.restore();
   }
   flipper(-kick*.48,'#263c54');
   ctx.fillStyle='#213148';
   ctx.beginPath();
   ctx.roundRect(-13,-8,29,16,7);
   ctx.fill();
   flipper(kick*.48,'#344961');
   ctx.fillStyle='#e5ac85';
   ctx.beginPath();
   ctx.ellipse(15,-3,9,8,0,0,Math.PI*2);
   ctx.fill();
   ctx.fillStyle='#514035';
   ctx.beginPath();
   ctx.ellipse(12,-6,7,6,-.3,0,Math.PI*2);
   ctx.fill();
   ctx.strokeStyle='#263c54';
   ctx.lineWidth=5;
   ctx.lineCap='round';
   ctx.beginPath();
   ctx.moveTo(6,1);
   ctx.quadraticCurveTo(16,8,24,3);
   ctx.stroke();
   ctx.strokeStyle='#e5ac85';
   ctx.lineWidth=3;
   ctx.beginPath();
   ctx.moveTo(23,3);
   ctx.lineTo(28,2);
   ctx.stroke();
   ctx.fillStyle='#a4ffec';
   ctx.fillRect(17,-6,7,4);
  }
  function draw(time){
   if(!canvas.isConnected||outdoors.hidden)return;
   const step=Math.min(32,last?time-last:16)*.005;
   const dx=target.x-position.x,dy=target.y-position.y;
   const desired=Math.max(-1.15,Math.min(1.15,Math.atan2(dy,Math.abs(dx)+12)));
   angle+=(desired-angle)*step;
   last=time;
   position.x+=(target.x-position.x)*step;
   position.y+=(target.y-position.y)*step;
   const sea=ctx.createLinearGradient(0,waterline,0,380);
   sea.addColorStop(0,'#81dfd5');
   sea.addColorStop(.35,'#278ea6');
   sea.addColorStop(1,'#102f56');
   const sky=ctx.createLinearGradient(0,0,0,waterline);
   sky.addColorStop(0,'#bedfe6');
   sky.addColorStop(1,'#fae5bd');
   ctx.fillStyle=sky;
   ctx.fillRect(0,0,640,380);
   ctx.fillStyle='#ffedbc';
   ctx.beginPath();
   ctx.arc(505,42,23,0,Math.PI*2);
   ctx.fill();
   ctx.fillStyle='#477e83';
   ctx.beginPath();
   ctx.moveTo(0,100);
   ctx.quadraticCurveTo(55,38,123,80);
   ctx.quadraticCurveTo(165,65,216,100);
   ctx.fill();
   ctx.fillStyle=sea;
   ctx.fillRect(0,waterline,640,280);
   ctx.save();
   ctx.beginPath();
   ctx.rect(0,waterline,640,280);
   ctx.clip();
   for(let i=0;i<5;i++){
    const x=68+i*127+Math.sin(time/2600+i)*19;
    const light=ctx.createLinearGradient(0,waterline,0,355);
    light.addColorStop(0,'#ecfff34d');
    light.addColorStop(1,'#ecfff300');
    ctx.fillStyle=light;
    ctx.beginPath();
    ctx.moveTo(x,waterline);
    ctx.lineTo(x+26,waterline);
    ctx.lineTo(x+172,355);
    ctx.lineTo(x+73,355);
    ctx.fill();
   }
   for(let layer=0;layer<2;layer++){
    ctx.fillStyle=layer?'#123b50':'#205d70';
    ctx.beginPath();
    ctx.moveTo(0,380);
    for(let x=0;x<=640;x+=8){
     const y=343+layer*18+Math.sin(x/51+layer)*9+Math.cos(x/27)*4;
     ctx.lineTo(x,y);
    }
    ctx.lineTo(640,380);
    ctx.fill();
   }
   ctx.strokeStyle='#5db8ad55';
   for(let i=0;i<13;i++){
    const x=18+i*49;
    const y=345+Math.sin(i)*12;
    ctx.beginPath();
    ctx.moveTo(x,380);
    ctx.quadraticCurveTo(x+16,365,x+Math.sin(time/950+i)*9,y);
    ctx.stroke();
   }
   ctx.restore();
   ctx.strokeStyle='#e8fff4aa';
   ctx.lineWidth=2;
   ctx.beginPath();
   for(let x=0;x<=640;x+=8)ctx.lineTo(x,waterline+Math.sin(x/23+time/600)*3);
   ctx.stroke();
   for(let i=0;i<7;i++){
    const x=(i*103+time*(.018+i*.002))%690-25,y=150+i*26;
    ctx.fillStyle=i%2?'#f2cc91':'#e2f8df';
    ctx.beginPath();
    ctx.ellipse(x,y,9,4,0,0,Math.PI*2);
    ctx.moveTo(x-6,y);
    ctx.lineTo(x-14,y-5);
    ctx.lineTo(x-14,y+5);
    ctx.fill();
   }
   ctx.save();
   ctx.translate(position.x,position.y);
   if(position.y>waterline+16){
    ctx.translate(0,Math.sin(time/330)*1.2);
    drawDiver(time,dx,dy);
   }else if(avatar.complete&&avatar.naturalWidth){
    const height=48,width=height*avatar.naturalWidth/avatar.naturalHeight;
    ctx.drawImage(avatar,-width/2,-height/2,width,height);
   }
   ctx.restore();
   frame=requestAnimationFrame(draw);
  }
  stopOcean=()=>cancelAnimationFrame(frame);
  setSwimming(true);
  frame=requestAnimationFrame(draw);
 }
 let doorOpening;
 entry.onclick=()=>{
  if(doorOpening||roomEditing||lifePage!=='room')return;
  const offset=roomPrefs.layout['front-door']||{x:0,y:0};
  const center=door.x+offset.x+door.width/2;
  const threshold=door.y+offset.y+door.height;
  const inFront=(x,y)=>Math.abs(x-center)<=door.width/2&&y>=threshold+28&&y<=threshold+56;
  window.lifeRoomInteraction?.walkTo(center,threshold+40,()=>{
   if(!inFront(player.x,player.y)||!entry.getClientRects().length)return;
   if(reducedMotion.matches){openPath();return;}
   const position={x:player.x,y:player.y};
   window.lifeKitchenAction={kind:'door',start:performance.now(),...position};
   doorOpening=entry.firstElementChild.animate(
    [{transform:'rotateY(0deg)'},{transform:'rotateY(-76deg)'}],
    {duration:520,easing:'ease-in-out',fill:'forwards'});
   doorOpening.finished.then(()=>{
    if(lifePage==='room'&&!roomEditing&&entry.getClientRects().length&&
       player.x===position.x&&player.y===position.y&&!document.querySelector('dialog[open]'))openPath();
   }).catch(()=>{}).finally(()=>{
    doorOpening.cancel();
    doorOpening=null;
   });
  },inFront);
 };
 outdoors.addEventListener('keydown',event=>{
  if(event.key==='Escape'){event.stopPropagation();goHome();}
 });
 document.addEventListener('life-session-ended',goHome);
 const style=document.createElement('style');
 style.textContent=`
 .canvas-wrap>.ocean-entry{position:absolute;left:85%;top:12%;width:6%;height:19%;z-index:6;padding:0;border:2px solid #735d46;border-radius:7px 7px 2px 2px;background:#463426;perspective:160px;cursor:pointer}
 .ocean-door-leaf{position:absolute;inset:0;border-radius:inherit;transform-origin:left center;background:linear-gradient(90deg,#95795d,#b79976 12%,#a88463 90%,#886a51);pointer-events:none}
 .ocean-door-leaf::after{content:'';position:absolute;right:15%;top:60%;width:12%;aspect-ratio:1;border-radius:50%;background:#f1d49b}
 body:is([data-interior="office"],[data-interior="bedroom"],[data-place-kind="office"]) .ocean-entry{display:none}
 .hq-coastal-path{position:relative;isolation:isolate;width:min(100%,840px);height:clamp(210px,58dvh,520px);overflow:hidden;border-radius:18px;background:linear-gradient(165deg,#c6e5df 0 29%,#5c9eac 30% 39%,#b1c89a 40% 100%)}
 .hq-coastal-path::before{content:'';position:absolute;inset:0;background:#e3c59a;clip-path:polygon(4% 83%,74% 36%,88% 34%,18% 92%);z-index:-1}
 .hq-path-house{position:absolute;left:7%;top:59%;color:#674e36;font-size:clamp(36px,8vw,76px);line-height:1}
 .hq-path-avatar{position:absolute;left:13%;top:79%;width:clamp(24px,6%,52px);transform:translate(-50%,-100%);pointer-events:none}
 .hq-path-avatar img{display:block;width:100%}
 .hq-walk-body{position:relative}
 .hq-walk-foot{position:absolute;inset:0;opacity:0}
 .hq-path-avatar.is-walking .hq-walk-body{clip-path:inset(0 0 18% 0);animation:hq-walk-body 345ms ease-in-out infinite alternate}
 .hq-path-avatar.is-walking .hq-walk-foot{opacity:1;animation:hq-walk-step 690ms ease-in-out infinite}
 .hq-walk-foot.left{clip-path:inset(82% 50% 0 0);transform-origin:39% 83%}
 .hq-walk-foot.right{clip-path:inset(82% 0 0 50%);transform-origin:61% 83%;animation-delay:-345ms!important}
 @keyframes hq-walk-body{from{transform:translateY(0) rotate(-2deg)}to{transform:translateY(-2%) rotate(2deg)}}
 @keyframes hq-walk-step{0%,100%{transform:translate(2%,0) rotate(-10deg)}48%{transform:translate(-4%,0) rotate(10deg)}72%{transform:translate(0,-4%) rotate(2deg)}}
 .hq-path-beach{position:absolute;left:79%;top:32%;transform:translate(-50%,-50%);white-space:nowrap}
 .hq-outdoors[hidden]{display:none}
 .hq-outdoors{position:fixed;inset:0;z-index:500;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:10px;padding:clamp(12px,3vw,32px);overflow:auto;background:#102f45;color:#f4fff9}
 .hq-outdoors header{display:flex;justify-content:space-between;align-items:center;gap:12px;width:min(100%,840px);padding:0;background:transparent;color:inherit}
 .hq-outdoors h2,.hq-outdoors p{margin:0}
 .hq-outdoors .actions{margin:0}
 .hq-beach-water{position:relative;width:min(100%,840px,104dvh);padding:0;overflow:hidden;border:0;border-radius:18px;background:#537e8d;color:#12394b}
 .hq-beach-water canvas{display:block;width:100%;height:auto}
 .hq-beach-water span{position:absolute;top:56%;left:50%;transform:translate(-50%,-50%);white-space:nowrap;padding:.65em 1.1em;border-radius:24px;background:#f3fff2}
 #hq-ocean{display:block;width:min(100%,calc(68dvh * 640 / 380));height:auto;border-radius:14px;background:#154e72;touch-action:manipulation}
 `;
 document.head.append(style);
})();

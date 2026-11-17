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
 const beachSurf=new Audio('./assets/ambience-beach.mp3');
 const diveSurf=new Audio('./assets/ambience-dive.mp3');
 for(const track of [beachSurf,diveSurf]){
  track.preload='none';
  track.loop=true;
  track.volume=.48;
 }
 let activeSurf=null,muted=false;
 function startSurf(track=beachSurf){
  if(activeSurf!==track)stopSurf();
  activeSurf=track;
  if(!muted)track.play().catch(()=>{});
 }
 function stopSurf(){
  if(!activeSurf)return;
  activeSurf.pause();
  activeSurf.currentTime=0;
  activeSurf=null;
 }
 function drawBeach(canvas,{watcher=true}={}){
  const ctx=canvas.getContext('2d');
  const avatar=currentAvatarFrame(0);
  const silhouette=document.createElement('canvas');
  silhouette.width=80;
  silhouette.height=80;
  const figure=silhouette.getContext('2d');
  let prepared=false;
  function drawWatcher(time){
   if(!prepared&&avatar.complete&&avatar.naturalWidth){
    const height=73,width=height*avatar.naturalWidth/avatar.naturalHeight;
    figure.drawImage(avatar,(80-width)/2,4,width,height);
    figure.globalCompositeOperation='source-atop';
    const shade=figure.createLinearGradient(20,0,62,80);
    shade.addColorStop(0,'#66625a');
    shade.addColorStop(.45,'#554d48');
    shade.addColorStop(.46,'#637568');
    shade.addColorStop(1,'#353f3b');
    figure.fillStyle=shade;
    figure.fillRect(0,0,80,80);
    prepared=true;
   }
   if(!prepared)return;
   ctx.fillStyle='#4f403742';
   ctx.beginPath();
   ctx.ellipse(158,334,17,3,0,0,Math.PI*2);
   ctx.fill();
   const sway=reducedMotion.matches?0:Math.sin(time/1250)*.55;
   ctx.drawImage(silhouette,118+sway,257);
  }
  let frame;
  function paint(time){
   const gradient=(top,bottom,colors)=>{
    const fill=ctx.createLinearGradient(0,top,0,bottom);
    colors.forEach(([at,color])=>fill.addColorStop(at,color));
    return fill;
   };
   ctx.fillStyle=gradient(0,125,[[0,'#89baf0'],[1,'#b1d5f5']]);
   ctx.fillRect(0,0,640,125);
   ctx.fillStyle=gradient(124,240,[[0,'#17668f'],[.31,'#209eb7'],[.65,'#6dd3cd'],[1,'#d2e8d8']]);
   ctx.fillRect(0,124,640,236);
   // A low breakwater and wind turbines along the far shore.
   ctx.fillStyle='#354b51';
   ctx.fillRect(317,127,323,5);
   ctx.fillRect(369,123,271,5);
   ctx.fillRect(502,119,138,5);
   for(let rock=0;rock<46;rock++){
    ctx.fillStyle=rock%3===0?'#273e47':'#567077';
    ctx.fillRect(319+rock*7,126+rock%4,4+rock%3,2);
   }
   for(const [x,y,height] of [[425,64,59],[501,96,27],[546,85,38],[605,100,23]]){
    ctx.fillStyle='#e5f2f4';
    ctx.fillRect(x-1,y,3,height);
    ctx.fillStyle='#a8c5d1';
    ctx.fillRect(x+1,y,1,height);
    ctx.save();
    ctx.translate(x,y);
    ctx.fillStyle='#f4fcfd';
    for(let blade=0;blade<3;blade++){
     const angle=-Math.PI/2+blade*Math.PI*2/3+(x%5)*.09;
     const length=height*.66;
     ctx.beginPath();
     ctx.moveTo(-1,1);
     ctx.lineTo(Math.cos(angle)*length,Math.sin(angle)*length);
     ctx.lineTo(2,-1);
     ctx.fill();
    }
    ctx.fillRect(-2,-2,4,4);
    ctx.restore();
   }
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
   const shore=(x)=>226+x*.026+Math.sin(x/102)*6;
   const tide=Math.sin(time/960)*6+Math.sin(time/1900)*3;
   const waterEdge=x=>shore(x)+tide+Math.sin(x/39-time/820)*4+Math.sin(x/15+time/950)*1.6;
   function below(edge,fill){
    ctx.fillStyle=fill;
    ctx.beginPath();
    ctx.moveTo(0,360);
    for(let x=0;x<=640;x+=4)ctx.lineTo(x,edge(x));
    ctx.lineTo(640,360);
    ctx.fill();
   }
   below(waterEdge,gradient(220,360,[[0,'#d2d7bd'],[.25,'#ece2c6'],[1,'#faf0d5']]));
   below(x=>shore(x)+24+(waterEdge(x)-shore(x))*.25,'#fff6de90');
   ctx.fillStyle='#a8977035';
   for(let grain=0;grain<320;grain++){
    const x=(grain*173.17)%640,y=250+(grain*31.73)%110;
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
   if(watcher)drawWatcher(time);
   if(!reducedMotion.matches)frame=requestAnimationFrame(paint);
  }
  const repaint=()=>{if(reducedMotion.matches)paint(0);};
  avatar.addEventListener('load',repaint);
  paint(0);
  return ()=>{
   avatar.removeEventListener('load',repaint);
   cancelAnimationFrame(frame);
  };
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
    <canvas width="640" height="360" aria-hidden="true"></canvas>
    <div class="hq-sand-prints" aria-hidden="true"></div>
    <div class="hq-path-avatar" aria-hidden="true">
     <img class="hq-walk-body" alt="">
     <img class="hq-walk-foot left" alt="">
     <img class="hq-walk-foot right" alt="">
    </div>
    <button type="button" class="hq-path-beach">해변까지 걷기</button>
   </div>`;
  outdoors.querySelector('[data-home]').onclick=goHome;
  const path=outdoors.querySelector('.hq-coastal-path');
  const stopPath=drawBeach(path.querySelector('canvas'),{watcher:false});
  stopOcean=stopPath;
  const prints=path.querySelector('.hq-sand-prints');
  const walkDuration=2600;
  const steps=11;
  const avatar=outdoors.querySelector('.hq-path-avatar');
  for(const part of avatar.querySelectorAll('img'))part.src=currentAvatarFrame(0).src;
  const beach=outdoors.querySelector('.hq-path-beach');
  beach.onclick=()=>{
   beach.disabled=true;
   startSurf();
   if(matchMedia('(prefers-reduced-motion: reduce)').matches){openBeach();return;}
   const travel=avatar.animate([
    {left:'13%',top:'88%'},{left:'37%',top:'90%'},{left:'61%',top:'92%'},{left:'79%',top:'94%'}
   ],{duration:walkDuration,easing:'linear',fill:'forwards'});
   for(let step=0;step<steps;step++){
    const progress=step/steps;
    const print=document.createElement('i');
    print.style.left=(13+progress*66)+'%';
    print.style.top=(88+progress*6+(step%2?.7:-.7))+'%';
    print.style.animationDelay=(progress*walkDuration)+'ms';
    prints.append(print);
   }
   avatar.classList.add('is-walking');
   stopOcean=()=>{
    stopPath();
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
  startSurf(diveSurf);
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
  const worldWidth=2100;
  const species=[
   ['산호 나비고기','#ffd577','#ff966a'],['청록 비늘돔','#79f4de','#6a91df'],
   ['딸기 안티아스','#ff9bc0','#f97273'],['은빛 유리돔','#edfff9','#8cc9ea'],
   ['보라 엔젤피시','#c6b2ff','#696aaf'],['노을 흰동가리','#ff9063','#fff3cd']
  ];
  const fish=species.map(([name,color,accent],i)=>({name,color,accent,x:455+i*290,y:179+(i*47)%120,i}));
  const collectionKey='life-ocean-fish:'+ (window.lifeCloud?.userId||'local');
  let collected=new Set();
  try{const saved=JSON.parse(localStorage.getItem(collectionKey)||'[]');if(Array.isArray(saved))collected=new Set(saved.filter(i=>Number.isInteger(i)&&i>=0&&i<species.length));}catch{}
  const log=document.createElement('button');
  log.type='button';
  log.className='ghost';
  log.onclick=()=>{
   const panel=outdoors.querySelector('.hq-fish-log');
   panel.hidden=!panel.hidden;
   log.setAttribute('aria-expanded',String(!panel.hidden));
  };
  log.setAttribute('aria-expanded','false');
  const list=document.createElement('ul');
  list.className='hq-fish-log';
  list.hidden=true;
  outdoors.querySelector('.actions').append(log);
  outdoors.append(list);
  function updateCollection(){
   log.textContent='물고기 도감 '+collected.size+'/'+species.length;
   list.replaceChildren(...species.map(([name],i)=>{
    const row=document.createElement('li');
    row.textContent=collected.has(i)?name:'아직 발견하지 못한 물고기';
    return row;
   }));
  }
  updateCollection();
  let cameraX=0;
  const clampX=x=>Math.max(42,Math.min(worldWidth-42,x));
  const clampY=y=>Math.max(126,Math.min(338,y));
  function drawFish(x,y,fish,time,heading){
   ctx.save();
   ctx.translate(x,y);
   ctx.scale(heading,1);
   const size=fish.i%3===1?1.15:1;
   ctx.scale(size,size);
   const tail=Math.sin(time/105+fish.i)*3;
   ctx.fillStyle=fish.accent;
   ctx.beginPath();
   ctx.moveTo(-10,0);ctx.quadraticCurveTo(-20,-7,-26,-10+tail);
   ctx.quadraticCurveTo(-23,0,-26,9+tail);ctx.closePath();ctx.fill();
   const skin=ctx.createLinearGradient(0,-10,0,10);
   skin.addColorStop(0,'#fff8db');skin.addColorStop(.28,fish.color);skin.addColorStop(1,fish.accent);
   ctx.fillStyle=skin;
   ctx.beginPath();ctx.ellipse(0,0,16,9,0,0,Math.PI*2);ctx.fill();
   ctx.save();ctx.clip();
   ctx.strokeStyle=fish.accent;ctx.lineWidth=2;
   for(const stripe of [-7,-1,5]){
    ctx.beginPath();ctx.moveTo(stripe-3,-10);ctx.quadraticCurveTo(stripe+4,0,stripe-4,10);ctx.stroke();
   }
   ctx.restore();
   ctx.fillStyle='#143942';
   ctx.beginPath();ctx.arc(10,-2,2.2,0,Math.PI*2);ctx.fill();
   ctx.restore();
  }
  let swimming=false,frame=0,last=0,angle=0;
  function setSwimming(value){
   swimming=value;
   target.x=position.x;
   target.y=value?190:70;
   dive.disabled=value;
   surface.disabled=!value;
   status.textContent=value?'방향키나 터치로 물고기 가까이 헤엄쳐 보세요':'해변 · 잠수하기를 눌러 바다에 들어가요';
   canvas.focus({preventScroll:true});
  }
  dive.onclick=()=>setSwimming(true);
  surface.onclick=()=>setSwimming(false);
  document.querySelector('#hq-ocean-exit').onclick=openBeach;
  canvas.onclick=event=>{
   if(!swimming)return;
   const bounds=canvas.getBoundingClientRect();
   target.x=clampX((event.clientX-bounds.left)*640/bounds.width+cameraX);
   target.y=clampY((event.clientY-bounds.top)*380/bounds.height);
  };
  canvas.onkeydown=event=>{
   const delta={ArrowLeft:[-32,0],ArrowRight:[32,0],ArrowUp:[0,-26],ArrowDown:[0,26]}[event.key];
   if(!swimming||!delta)return;
   event.preventDefault();
   event.stopPropagation();
   target.x=clampX(target.x+delta[0]);
   target.y=clampY(target.y+delta[1]);
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
   cameraX+=(Math.max(0,Math.min(worldWidth-640,position.x-320))-cameraX)*Math.min(1,step*1.7);
   const sea=ctx.createLinearGradient(0,waterline,0,380);
   sea.addColorStop(0,'#b0ffde');
   sea.addColorStop(.35,'#2dbfa4');
   sea.addColorStop(1,'#125c64');
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
    ctx.fillStyle=layer?'#225c62':'#3b8582';
    ctx.beginPath();
    ctx.moveTo(0,380);
    for(let x=0;x<=640;x+=8){
     const y=343+layer*18+Math.sin((x+cameraX*.64)/51+layer)*9+Math.cos((x+cameraX*.5)/27)*4;
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
   ctx.save();
   ctx.translate(-cameraX,0);
   for(let i=0;i<30;i++){
    const x=54+i*72,y=372-(i%4)*4;
    if(x<cameraX-35||x>cameraX+675)continue;
    ctx.strokeStyle=['#9ed7a6','#e69d9a','#91d4c2','#bbadcf'][i%4];
    ctx.lineWidth=2.4;
    ctx.lineCap='round';
    for(const branch of [-1,0,1]){
     const sway=Math.sin(time/1200+i)*4;
     ctx.beginPath();ctx.moveTo(x,y);
     ctx.quadraticCurveTo(x+branch*5,y-12,x+branch*13+sway,y-20-i%5*5);
     ctx.stroke();
    }
   }
   for(const f of fish){
    const phase=time/(1450+f.i*140)+f.i;
    const x=f.x+Math.sin(phase)*(44+f.i*4),y=f.y+Math.sin(phase*1.5)*15;
    if(swimming&&Math.hypot(position.x-x,position.y-y)<30&&!collected.has(f.i)){
     collected.add(f.i);
     try{localStorage.setItem(collectionKey,JSON.stringify([...collected]));}catch{}
     status.textContent=f.name+' 발견!';
     updateCollection();
    }
    if(x>=cameraX-32&&x<=cameraX+672)drawFish(x,y,f,time,Math.cos(phase)>=0?1:-1);
   }
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
 .hq-coastal-path{position:relative;isolation:isolate;width:min(100%,840px,104dvh);aspect-ratio:16/9;overflow:hidden;border-radius:18px;background:#e3c59a}
 .hq-coastal-path canvas{display:block;width:100%;height:100%}
 .hq-sand-prints{position:absolute;inset:0;pointer-events:none}
 .hq-sand-prints i{position:absolute;width:1.1%;height:1.4%;border-radius:55%;background:#9e775a75;box-shadow:inset 0 1px 1px #76523960;transform:rotate(73deg);opacity:0;animation:hq-sand-step 2.5s ease-out forwards}
 @keyframes hq-sand-step{0%{opacity:0}4%,40%{opacity:.85}100%{opacity:.12}}
 .hq-path-avatar{position:absolute;left:13%;top:88%;width:clamp(24px,6%,52px);transform:translate(-50%,-100%);pointer-events:none}
 .hq-path-avatar img{display:block;width:100%}
 .hq-walk-body{position:relative}
 .hq-walk-foot{position:absolute;inset:0;opacity:0}
 .hq-path-avatar.is-walking .hq-walk-body{clip-path:inset(0 0 18% 0);animation:hq-walk-body 345ms ease-in-out infinite alternate}
 .hq-path-avatar.is-walking .hq-walk-foot{opacity:1;animation:hq-walk-step 690ms ease-in-out infinite}
 .hq-walk-foot.left{clip-path:inset(82% 50% 0 0);transform-origin:39% 83%}
 .hq-walk-foot.right{clip-path:inset(82% 0 0 50%);transform-origin:61% 83%;animation-delay:-345ms!important}
 @keyframes hq-walk-body{from{transform:translateY(0) rotate(-2deg)}to{transform:translateY(-2%) rotate(2deg)}}
 @keyframes hq-walk-step{0%,100%{transform:translate(2%,0) rotate(-10deg)}48%{transform:translate(-4%,0) rotate(10deg)}72%{transform:translate(0,-4%) rotate(2deg)}}
 .hq-path-beach{position:absolute;left:79%;top:71%;transform:translate(-50%,-50%);white-space:nowrap}
 .hq-outdoors[hidden]{display:none}
 .hq-outdoors{position:fixed;inset:0;z-index:500;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:10px;padding:clamp(12px,3vw,32px);overflow:auto;background:#102f45;color:#f4fff9}
 .hq-outdoors header{display:flex;justify-content:space-between;align-items:center;gap:12px;width:min(100%,840px);padding:0;background:transparent;color:inherit}
 .hq-outdoors h2,.hq-outdoors p{margin:0}
 .hq-outdoors .actions{margin:0}
 .hq-beach-water{position:relative;width:min(100%,840px,104dvh);padding:0;overflow:hidden;border:0;border-radius:18px;background:#537e8d;color:#12394b}
 .hq-beach-water canvas{display:block;width:100%;height:auto}
 .hq-beach-water span{position:absolute;top:56%;left:50%;transform:translate(-50%,-50%);white-space:nowrap;padding:.65em 1.1em;border-radius:24px;background:#f3fff2}
 .hq-fish-log{margin:0;padding:8px 24px;max-height:22dvh;overflow:auto;background:#164d52;border-radius:10px}
 #hq-ocean{display:block;width:min(100%,calc(68dvh * 640 / 380));height:auto;border-radius:14px;background:#154e72;touch-action:manipulation}
 `;
 document.head.append(style);
})();

(() => {
 const entry=document.createElement('button');
 entry.type='button';
 entry.className='ghost ocean-entry';
 entry.textContent='🌊 바다';
 entry.style.setProperty('display','inline-flex','important'); document.querySelector('.header-right').append(entry);

 function openOcean(){
  window.lifeRoomInteraction?.cancel();
  lifeShow(`<h2>프리다이빙 바다</h2>
   <canvas id="hq-ocean" width="640" height="380" tabindex="0" aria-label="프리다이빙 바다. 방향키나 화면 터치로 이동"></canvas>
   <p id="hq-ocean-status" role="status">해변</p>
   <div class="actions"><button class="primary" id="hq-dive">잠수하기</button><button class="ghost" id="hq-surface">수면으로</button><button class="ghost" id="hq-ocean-exit">방으로 돌아가기</button></div>`);
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
  document.querySelector('#hq-ocean-exit').onclick=()=>lifeDialog.close();
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
   if(!canvas.isConnected||!lifeDialog.open)return;
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
  lifeDialog.addEventListener('close',()=>cancelAnimationFrame(frame),{once:true});
  setSwimming(false);
  frame=requestAnimationFrame(draw);
 }
 entry.onclick=openOcean;
 const style=document.createElement('style');
 style.textContent='.header-right>.ocean-entry{display:inline-flex!important;white-space:nowrap}#hq-ocean{display:block;width:min(100%,calc(58dvh * 640 / 380));height:auto;margin-inline:auto;border-radius:14px;background:#154e72;touch-action:manipulation}';
 document.head.append(style);
})();

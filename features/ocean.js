(() => {
 const entry=document.createElement('button');
 entry.type='button';
 entry.className='ghost ocean-entry';
 entry.textContent='🌊 바다';
 document.querySelector('.header-right').append(entry);

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
  let swimming=false,frame=0,last=0;
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
   target.x=Math.max(24,Math.min(616,(event.clientX-bounds.left)*640/bounds.width));
   target.y=Math.max(126,Math.min(338,(event.clientY-bounds.top)*380/bounds.height));
  };
  canvas.onkeydown=event=>{
   const delta={ArrowLeft:[-32,0],ArrowRight:[32,0],ArrowUp:[0,-26],ArrowDown:[0,26]}[event.key];
   if(!swimming||!delta)return;
   event.preventDefault();
   event.stopPropagation();
   target.x=Math.max(24,Math.min(616,target.x+delta[0]));
   target.y=Math.max(126,Math.min(338,target.y+delta[1]));
  };
  function draw(time){
   if(!canvas.isConnected||!lifeDialog.open)return;
   const step=Math.min(32,time-last)*.005;
   last=time;
   position.x+=(target.x-position.x)*step;
   position.y+=(target.y-position.y)*step;
   const sea=ctx.createLinearGradient(0,waterline,0,380);
   sea.addColorStop(0,'#5dc3c2');
   sea.addColorStop(1,'#154e72');
   ctx.fillStyle='#fbdfac';
   ctx.fillRect(0,0,640,380);
   ctx.fillStyle=sea;
   ctx.fillRect(0,waterline,640,280);
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
   if(avatar.complete&&avatar.naturalWidth){
    const height=48,width=height*avatar.naturalWidth/avatar.naturalHeight;
    ctx.save();
    ctx.translate(position.x,position.y);
    if(position.y>waterline+22)ctx.rotate((target.x<position.x?-.8:.8)*Math.min(1,Math.abs(target.x-position.x)/30));
    ctx.drawImage(avatar,-width/2,-height/2,width,height);
    ctx.restore();
   }
   frame=requestAnimationFrame(draw);
  }
  lifeDialog.addEventListener('close',()=>cancelAnimationFrame(frame),{once:true});
  setSwimming(false);
  frame=requestAnimationFrame(draw);
 }
 entry.onclick=openOcean;
 const style=document.createElement('style');
 style.textContent='.header-right>.ocean-entry{display:inline-flex!important;white-space:nowrap}#hq-ocean{display:block;width:100%;height:auto;max-height:58dvh;object-fit:contain;border-radius:14px;background:#154e72;touch-action:manipulation}';
 document.head.append(style);
})();

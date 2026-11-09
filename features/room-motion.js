/* ROOM_MOTION_AND_TOUCH_V1 */
(()=>{
 const wrap=document.querySelector('.canvas-wrap');
 const layer=document.createElement('canvas');layer.id='room-actors';layer.width=960;layer.height=650;layer.setAttribute('aria-hidden','true');wrap.append(layer);const ac=layer.getContext('2d');let human=null,pet=null;
 const pochacco = new Image();
 pochacco.src = './assets/pochacco.webp';
 const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
 let companion = null;

 function drawPochacco(t) {
  if (!human || !pochacco.complete || !pochacco.naturalWidth) return;
  const scene = window.lifeInterior?.roomKey?.() || roomPrefs.activeSpace;
  const preferred = { x: human.x + 42, y: human.y + 8 };
  const alternate = { x: human.x - 42, y: human.y + 8 };
  const target = [preferred, alternate].find(point =>
   point.x >= 82 && point.x <= 870 && point.y >= 203 && point.y <= 563 && !blocked(point.x, point.y)
  );
  if (!target) return;
  if (!companion || companion.scene !== scene || Math.hypot(target.x - companion.x, target.y - companion.y) > 240) {
   companion = { ...target, scene, time: t };
  }
  const dx = target.x - companion.x;
  const dy = target.y - companion.y;
  const distance = Math.hypot(dx, dy);
  const step = Math.min(distance, Math.min(48, Math.max(0, t - companion.time)) * .16);
  companion.time = t;
  let row = 0;
  if (distance > 2 && step > 0) {
   const x = companion.x + dx / distance * step;
   const y = companion.y + dy / distance * step;
   if (!blocked(x, y)) {
    Object.assign(companion, { x, y });
    row = dx < 0 ? 2 : 1;
   } else {
    Object.assign(companion, target);
   }
  }
  const frame = reducedMotion.matches ? 0 : Math.floor(t / 150) % (row ? 8 : 6);
  ac.drawImage(pochacco, frame * 192, row * 208, 192, 208, companion.x - 25, companion.y - 48, 50, 54);
 }
 // Keep sprites above both canvas furniture and SVG furniture, without taking taps.
 drawModernAvatar=(x,y,t,scale=1)=>{human={x,y,t,scale};};drawMongle=t=>{pet={t};};
 window.lifeRoomActors={begin(){human=pet=null;ac.clearRect(0,0,960,650);},end(t){
  if(pet&&mongleImage.complete&&mongleImage.naturalWidth){const counts={0:6,1:8,2:8,3:4,4:5},frame=Math.floor(t/150)%(counts[mongle.row]||6);ac.drawImage(mongleImage,frame*48,mongle.row*52,48,52,mongle.x-25,mongle.y-35,50,54);}
  drawPochacco(t);
  if(human){const {x,y,scale}=human,seated=posture==='sit'||posture==='desk',lying=posture==='lie',img=cuteAvatarFrames[lying?2:seated?1:0];if(img.complete&&img.naturalWidth){const bob=keys.size&&posture==='stand'?Math.abs(Math.sin(walk*11))*-2:Math.sin(t/1000)*.45,h=(lying?40:seated?51:65)*scale,w=h*img.naturalWidth/img.naturalHeight;ac.fillStyle='#6c574124';ac.beginPath();ac.ellipse(x,y+2,w*.34,4*scale,0,0,Math.PI*2);ac.fill();ac.drawImage(img,x-w/2,y-h+bob,w,h);}}
 }};
 const solids=[['today',337,461,70,65],['focus',91,290,194,135],['study',298,148,146,171],['notion',635,261,185,120],['rest',584,446,226,83],['plant',80,445,60,95]];
 function obstacles(){const custom=window.lifeInterior?.obstacles?.();if(custom?.replace)return custom.rects;if(roomPrefs.activeSpace==='family')return [[205,250,200,253],[465,335,85,69],[650,366,160,129]];return solids.map(([id,x,y,w,h])=>{const v=roomPrefs.layout[id]||{x:0,y:0};return [x+v.x,y+v.y,w,h];}).concat(custom?.rects||[]);}
 const baseBlocked=blocked;blocked=function(x,y){if(roomPrefs.activeSpace==='dream'||roomPrefs.activeSpace==='office')return baseBlocked(x,y);return obstacles().some(([a,b,w,h])=>x>a-12&&x<a+w+12&&y>b-6&&y<b+h+10);};
 function free(p){if(!blocked(p.x,p.y))return;let best=null,dist=Infinity;for(let y=203;y<=563;y+=12)for(let x=82;x<=870;x+=12){if(blocked(x,y))continue;const d=Math.hypot(x-p.x,y-p.y);if(d<dist){best={x,y};dist=d;}}if(best)Object.assign(p,best);}
 window.lifeRoomMotion={prepare(){if(typeof roomPrefs==='undefined'||roomEditing)return;if(posture==='stand')free(player);if(!window.lifeBedroomPetResting)free(mongle);}};
 const style=document.createElement('style');style.textContent='#room-actors{position:absolute;inset:0;width:100%;height:100%;z-index:7;pointer-events:none!important;background:transparent;cursor:inherit}.study-notebook-hit{min-width:0!important;min-height:0!important}.canvas-wrap button{touch-action:manipulation}.family-room-floor{pointer-events:none}.family-scene-hit{pointer-events:auto}';document.head.append(style);
})();




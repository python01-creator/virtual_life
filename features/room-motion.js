/* ROOM_MOTION_AND_TOUCH_V1 */
(()=>{
 const wrap=document.querySelector('.canvas-wrap');
 const layer=document.createElement('canvas');layer.id='room-actors';layer.width=960;layer.height=650;layer.setAttribute('aria-hidden','true');wrap.append(layer);const ac=layer.getContext('2d');let human=null,pet=null;
 // Keep sprites above both canvas furniture and SVG furniture, without taking taps.
 drawModernAvatar=(x,y,t,scale=1)=>{human={x,y,t,scale};};drawMongle=t=>{pet={t};};
 window.lifeRoomActors={begin(){human=pet=null;ac.clearRect(0,0,960,650);},end(t){
  if(pet&&mongleImage.complete&&mongleImage.naturalWidth){const counts={0:6,1:8,2:8,3:4,4:5},frame=Math.floor(t/150)%(counts[mongle.row]||6);ac.drawImage(mongleImage,frame*48,mongle.row*52,48,52,mongle.x-25,mongle.y-35,50,54);}
  if(human){const {x,y,scale}=human,seated=posture==='sit'||posture==='desk',lying=posture==='lie',img=cuteAvatarFrames[lying?2:seated?1:0];if(img.complete&&img.naturalWidth){const bob=keys.size&&posture==='stand'?Math.abs(Math.sin(walk*11))*-2:Math.sin(t/1000)*.45,h=(lying?40:seated?51:65)*scale,w=h*img.naturalWidth/img.naturalHeight;ac.fillStyle='#6c574124';ac.beginPath();ac.ellipse(x,y+2,w*.34,4*scale,0,0,Math.PI*2);ac.fill();ac.drawImage(img,x-w/2,y-h+bob,w,h);}}
 }};
 const solids=[['today',337,461,70,65],['focus',91,290,194,135],['study',298,148,146,171],['notion',635,261,185,120],['rest',584,446,226,83],['plant',80,445,60,95]];
 function obstacles(){if(roomPrefs.activeSpace==='family')return [[205,250,200,253],[465,335,85,69],[650,366,160,129]];return solids.map(([id,x,y,w,h])=>{const v=roomPrefs.layout[id]||{x:0,y:0};return [x+v.x,y+v.y,w,h];});}
 const baseBlocked=blocked;blocked=function(x,y){if(roomPrefs.activeSpace==='dream'||roomPrefs.activeSpace==='office')return baseBlocked(x,y);return obstacles().some(([a,b,w,h])=>x>a-12&&x<a+w+12&&y>b-6&&y<b+h+10);};
 function free(p){if(!blocked(p.x,p.y))return;let best=null,dist=Infinity;for(let y=203;y<=563;y+=12)for(let x=82;x<=870;x+=12){if(blocked(x,y))continue;const d=Math.hypot(x-p.x,y-p.y);if(d<dist){best={x,y};dist=d;}}if(best)Object.assign(p,best);}
 window.lifeRoomMotion={prepare(){if(typeof roomPrefs==='undefined'||roomEditing)return;if(posture==='stand')free(player);if(!(roomPrefs.activeSpace==='family'&&window.lifeBedroomPetResting))free(mongle);}};
 const style=document.createElement('style');style.textContent='#room-actors{position:absolute;inset:0;width:100%;height:100%;z-index:7;pointer-events:none!important;background:transparent;cursor:inherit}.study-notebook-hit{min-width:0!important;min-height:0!important}.canvas-wrap button{touch-action:manipulation}.family-room-floor{pointer-events:none}.family-scene-hit{pointer-events:auto}';document.head.append(style);
})();



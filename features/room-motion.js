/* ROOM_MOTION_AND_TOUCH_V1 */
(()=>{
 const wrap=document.querySelector('.canvas-wrap');
 const layer=document.createElement('canvas');layer.id='room-actors';layer.width=960;layer.height=650;layer.setAttribute('aria-hidden','true');wrap.append(layer);const ac=layer.getContext('2d');let human=null,pet=null;
 // Match the display density without changing room coordinates or hit targets.
 const worldWidth = 960;
 const worldHeight = 650;
 let resolutionDirty = true;
 let previousDpr = 0;
 new ResizeObserver(() => { resolutionDirty = true; }).observe(wrap);

 function syncResolution() {
  const dpr = window.devicePixelRatio || 1;
  if (!resolutionDirty && dpr === previousDpr) return;
  const bounds = canvas.getBoundingClientRect();
  if (!bounds.width || !bounds.height) return;
  resolutionDirty = false;
  previousDpr = dpr;
  // Limit the two animated surfaces to a combined five million backing pixels.
  const scale = Math.min(2, bounds.width * dpr / worldWidth, bounds.height * dpr / worldHeight);
  const width = Math.max(1, Math.round(worldWidth * scale));
  const height = Math.max(1, Math.round(worldHeight * scale));
  for (const surface of [canvas, layer]) {
   if (surface.width !== width) surface.width = width;
   if (surface.height !== height) surface.height = height;
  }
  ctx.setTransform(width / worldWidth, 0, 0, height / worldHeight, 0, 0);
  ac.setTransform(width / worldWidth, 0, 0, height / worldHeight, 0, 0);
  ctx.imageSmoothingEnabled = false;
  ac.imageSmoothingQuality = 'high';
 }
 const pochacco = new Image();
 pochacco.src = './assets/pochacco.webp';
 const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
 let companion = null;
 const companionOffsets = [[42, 8], [-42, 8], [0, 48], [42, 48], [-42, 48], [42, -36], [-42, -36], [0, -48]];

 function drawPochacco(t) {
  if (!human || !pochacco.complete || !pochacco.naturalWidth) return;
  const scene = window.lifeInterior?.roomKey?.() || roomPrefs.activeSpace;
  let target;
  for (const [offsetX, offsetY] of companionOffsets) {
   const x = human.x + offsetX;
   const y = human.y + offsetY;
   if (x >= 82 && x <= 870 && y >= 203 && y <= 563 && !blocked(x, y)) {
    target = { x, y };
    break;
   }
  }
  // An interaction can put the avatar inside furniture. Keep the last floor position
  // in this room when there is no clear space immediately beside the avatar.
  target ??= companion?.scene === scene ? companion : {
   x: Math.max(82, Math.min(870, human.x + 42)),
   y: Math.max(203, Math.min(563, human.y + 8))
  };
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
 const mongleTiming = [
  [1], // Use one stable pose for idle.
  [105, 105, 105, 105, 105, 105, 105, 105],
  [105, 105, 105, 105, 105, 105, 105, 105],
  [140, 140, 140, 280],
  [140, 140, 140, 140, 280]
 ];
 let mongleAnimationRow = -1;
 let mongleAnimationStart = 0;
 let mongleScene;
 let mongleSpeed = 0;
 let mongleFacing = 1;
 let followTarget = null;
 let nextFollowCheck = 0;
 const trail = [];
 const followOffsets = [[-48, 25], [-52, 0], [0, 48], [48, 27], [0, -48]];

 function floorPoint(x, y) {
  return x >= 85 && x <= 870 && y >= 200 && y <= 560 && !blocked(x, y);
 }

 function canReach(point) {
  const dx = point.x - mongle.x;
  const dy = point.y - mongle.y;
  const segments = Math.ceil(Math.hypot(dx, dy) / 10);
  for (let step = 1; step <= segments; step++) {
   if (!floorPoint(mongle.x + dx * step / segments, mongle.y + dy * step / segments)) return false;
  }
  return floorPoint(point.x, point.y);
 }

 function updateMongle(dt, time) {
  const scene = window.lifeInterior?.roomKey?.() || roomPrefs.activeSpace;
  if (scene !== mongleScene) {
   mongleScene = scene;
   trail.length = 0;
   followTarget = null;
   mongleSpeed = 0;
   nextFollowCheck = 0;
  }
  const canFollow = !window.lifeBedroomPetResting && Date.now() >= mongle.until &&
   posture === 'stand' && lifePage === 'room' && !roomEditing && !document.querySelector('dialog[open]');
  if (!canFollow) {
   mongleSpeed = 0;
   followTarget = null;
   nextFollowCheck = 0;
   trail.length = 0;
   if (Date.now() >= mongle.until) mongle.row = 0;
   return;
  }
  const last = trail.at(-1);
  if (!last || Math.hypot(player.x - last.x, player.y - last.y) >= 16) {
   trail.push({ x: player.x, y: player.y });
   if (trail.length > 24) trail.shift();
  }
  if (time >= nextFollowCheck) {
   nextFollowCheck = time + 120;
   const distanceToPlayer = Math.hypot(player.x - mongle.x, player.y - mongle.y);
   followTarget = null;
   if (distanceToPlayer > (mongleSpeed > 5 ? 45 : 62)) {
    const candidates = followOffsets.map(([x, y]) => ({ x: player.x + x, y: player.y + y }));
    followTarget = candidates.find(canReach);
    // If a corner blocks the direct route, follow the avatar's recent steps around it.
    followTarget ??= trail.findLast(point =>
     Math.hypot(point.x - player.x, point.y - player.y) >= 42 &&
     Math.hypot(point.x - mongle.x, point.y - mongle.y) >= 9 &&
     canReach(point)
    );
   }
  }
  const dx = (followTarget?.x ?? mongle.x) - mongle.x;
  const dy = (followTarget?.y ?? mongle.y) - mongle.y;
  const distance = Math.hypot(dx, dy);
  const desiredSpeed = Math.min(224, distance * 5);
  mongleSpeed += (desiredSpeed - mongleSpeed) * Math.min(1, dt * 9);
  const step = Math.min(distance, mongleSpeed * dt);
  mongle.row = 0;
  if (step < .12) return;
  const x = mongle.x + dx / distance * step;
  const y = mongle.y + dy / distance * step;
  if (!floorPoint(x, y)) {
   followTarget = null;
   nextFollowCheck = 0;
   mongleSpeed = 0;
   return;
  }
  if (Math.abs(dx) > 4) mongleFacing = dx > 0 ? 1 : 2;
  Object.assign(mongle, { x, y, row: mongleFacing });
 }

 function drawMongleSprite(time) {
  if (!pet || !mongleImage.complete || !mongleImage.naturalWidth) return;
  const row = mongleTiming[mongle.row] ? mongle.row : 0;
  const timings = mongleTiming[row];
  if (row !== mongleAnimationRow) {
   mongleAnimationRow = row;
   mongleAnimationStart = time;
  }
  const duration = timings.reduce((sum, value) => sum + value, 0);
  const elapsed = Math.max(0, time - mongleAnimationStart);
  let remaining = row >= 3 ? Math.min(elapsed, duration - 1) : elapsed % duration;
  let frame = 0;
  while (!reducedMotion.matches && remaining >= timings[frame]) {
   remaining -= timings[frame++];
  }
  ac.imageSmoothingEnabled = true;
  // Keep the paws fixed while a subtle breathing motion lifts the body.
  const breath = row === 0 && !reducedMotion.matches
   ? (1 - Math.cos(elapsed * 2 * Math.PI / 4200)) * .3
   : 0;
  ac.drawImage(mongleImage, frame * 192, row * 208, 192, 208,
   mongle.x - 25, mongle.y - 43 - breath, 50, 54 + breath);
 }
 // Keep sprites above both canvas furniture and SVG furniture, without taking taps.
 drawModernAvatar=(x,y,t,scale=1)=>{human={x,y,t,scale};};drawMongle=t=>{pet={t};};
 window.lifeRoomActors={begin(){syncResolution();human=pet=null;ac.clearRect(0,0,960,650);},end(t){
  drawMongleSprite(t);
  drawPochacco(t);
  if(human){const {x,y,scale}=human,seated=posture==='sit'||posture==='desk',lying=posture==='lie',img=currentAvatarFrame(lying?2:seated?1:0);if(img.complete&&img.naturalWidth){const bob=keys.size&&posture==='stand'?Math.abs(Math.sin(walk*11))*-2:Math.sin(t/1000)*.45,h=(lying?40:seated?51:65)*scale,w=h*img.naturalWidth/img.naturalHeight;ac.fillStyle='#6c574124';ac.beginPath();ac.ellipse(x,y+2,w*.34,4*scale,0,0,Math.PI*2);ac.fill();ac.drawImage(img,x-w/2,y-h+bob,w,h);}}
 }};
 const solids=[['today',337,461,70,65],['focus',91,290,194,135],['study',298,148,146,171],['notion',635,261,185,120],['rest',584,446,226,83],['plant',80,445,60,95]];
 function obstacles(){const custom=window.lifeInterior?.obstacles?.();if(custom?.replace)return custom.rects;if(roomPrefs.activeSpace==='family')return [[205,250,200,253],[465,335,85,69],[650,366,160,129]];return solids.map(([id,x,y,w,h])=>{const v=roomPrefs.layout[id]||{x:0,y:0};return [x+v.x,y+v.y,w,h];}).concat(custom?.rects||[]);}
 const baseBlocked=blocked;blocked=function(x,y){if(roomPrefs.activeSpace==='dream'||roomPrefs.activeSpace==='office')return baseBlocked(x,y);return obstacles().some(([a,b,w,h])=>x>a-12&&x<a+w+12&&y>b-6&&y<b+h+10);};
 function free(p){if(!blocked(p.x,p.y))return;let best=null,dist=Infinity;for(let y=203;y<=563;y+=12)for(let x=82;x<=870;x+=12){if(blocked(x,y))continue;const d=Math.hypot(x-p.x,y-p.y);if(d<dist){best={x,y};dist=d;}}if(best)Object.assign(p,best);}
 window.lifeRoomMotion={updateMongle,prepare(){if(typeof roomPrefs==='undefined'||roomEditing)return;if(posture==='stand')free(player);if(!window.lifeBedroomPetResting)free(mongle);}};
 const style=document.createElement('style');style.textContent='#room,#room-actors{image-rendering:auto!important}#room-actors{position:absolute;inset:0;width:100%;height:100%;z-index:7;pointer-events:none!important;background:transparent;cursor:inherit}.study-notebook-hit{min-width:0!important;min-height:0!important}.canvas-wrap button{touch-action:manipulation}.family-room-floor{pointer-events:none}.family-scene-hit{pointer-events:auto}';document.head.append(style);
})();




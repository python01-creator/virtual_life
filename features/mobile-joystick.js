/* MOBILE_JOYSTICK_V1 */
(()=>{
 'use strict';
 const pad=document.querySelector('.mobile-joystick');
 const knob=pad?.querySelector('.mobile-joystick-knob');
 if(!pad||!knob||typeof keys==='undefined')return;
 const held=new Set();
 const release=()=>{
  for(const key of held)keys.delete(key);
  held.clear();
  pad.classList.remove('is-active');
  knob.style.transform='translate(-50%,-50%)';
 };
 const move=e=>{
  const rect=pad.getBoundingClientRect();
  const dx=e.clientX-(rect.left+rect.width/2),dy=e.clientY-(rect.top+rect.height/2);
  const distance=Math.hypot(dx,dy),limit=rect.width*.31,scale=distance?Math.min(1,limit/distance):0;
  knob.style.transform=`translate(calc(-50% + ${dx*scale}px),calc(-50% + ${dy*scale}px))`;
  for(const key of held)keys.delete(key);
  held.clear();
  if(distance<rect.width*.1)return;
  const threshold=.32;
  if(dx/distance>threshold)held.add('arrowright');
  if(dx/distance<-threshold)held.add('arrowleft');
  if(dy/distance>threshold)held.add('arrowdown');
  if(dy/distance<-threshold)held.add('arrowup');
  if(posture!=='stand')standUp();
  for(const key of held)keys.add(key);
 };
 pad.addEventListener('pointerdown',e=>{
  if(e.pointerType==='mouse'&&e.button!==0)return;
  e.preventDefault();
  e.stopPropagation();
  window.lifeRoomInteraction?.cancel?.();
  pad.classList.add('is-active');
  pad.setPointerCapture(e.pointerId);
  move(e);
 });
 pad.addEventListener('click',e=>{e.preventDefault();e.stopImmediatePropagation();});
 pad.addEventListener('pointermove',e=>{if(pad.hasPointerCapture(e.pointerId)){e.preventDefault();move(e);}});
 pad.addEventListener('pointerup',release);
 pad.addEventListener('pointercancel',release);
 window.addEventListener('blur',release);
 document.addEventListener('visibilitychange',()=>{if(document.hidden)release();});
})();

/* Frame the room, not the unused canvas margin; retain the 960x650 world coordinates. */
(()=>{
 'use strict';
 const world=document.querySelector('.canvas-wrap'),room=document.querySelector('.room-wrap');if(!world||!room)return;
 const viewport=document.createElement('div');viewport.className='room-viewport';world.before(viewport);viewport.append(world);
 const controls=room.querySelector('.room-tip');if(controls)for(const el of world.querySelectorAll('.mobile-joystick,.mobile-select-button'))controls.append(el);
 const css=document.createElement('style');css.textContent=`
 .room-wrap .room-viewport{position:relative;isolation:isolate;width:100%;aspect-ratio:852/578;overflow:hidden;flex:none;background:#dae2ce}
 .room-wrap .room-viewport>.canvas-wrap{position:absolute!important;left:-6.338028169%!important;top:-10.380622837%!important;width:112.676056338%!important;max-width:none!important;height:auto!important;aspect-ratio:960/650!important;margin:0!important;flex:none!important}
 .room-wrap .room-viewport>.canvas-wrap canvas{width:100%!important;height:100%!important;max-width:none!important;border-radius:0!important}
 .room-wrap .room-tip{position:relative}
 .room-tip .mobile-joystick{top:4px;bottom:auto}.room-tip .mobile-select-button{top:14px;bottom:auto}
 @media(min-width:761px) and (pointer:fine){
  body.room-page>main{padding:4px!important}
  body.room-page>main>section{width:min(calc(100vw - 8px),calc(max(180px,100dvh - var(--room-chrome,76px)) * 1.474048443))!important;max-width:none!important}
  .room-page .room-wrap{padding:0!important}.room-page .room-tip{display:none!important}
 }
 @media(max-width:900px) and (orientation:landscape) and (pointer:coarse){
  .room-page .room-wrap{width:min(100vw,calc(100dvh * 1.474048443))!important;aspect-ratio:852/578!important}
 }
 .cover-screen-mode .room-wrap .room-viewport{width:100%!important;aspect-ratio:852/578!important;flex:none!important}
 `;document.head.append(css);
 let frame=0;function fit(){frame=0;const main=room.closest('main');if(!main||main.hidden||!main.getClientRects().length)return;let chrome=10;for(const el of room.children){if(el===viewport)continue;const style=getComputedStyle(el);if(style.display==='none'||style.position==='absolute'||style.position==='fixed')continue;chrome+=el.getBoundingClientRect().height+(parseFloat(style.marginTop)||0)+(parseFloat(style.marginBottom)||0);}const value=Math.ceil(chrome)+'px';if(main.style.getPropertyValue('--room-chrome')!==value)main.style.setProperty('--room-chrome',value);}
 function schedule(){if(!frame)frame=requestAnimationFrame(fit);}
 const observer=new ResizeObserver(schedule);observer.observe(room);
 new MutationObserver(schedule).observe(room,{childList:true});
 window.addEventListener('resize',schedule,{passive:true});window.visualViewport?.addEventListener('resize',schedule,{passive:true});window.addEventListener('life-ui-ready',schedule);schedule();
})();

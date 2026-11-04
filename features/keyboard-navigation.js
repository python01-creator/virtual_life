/* Share pointer actions with keyboard interaction; leave text editing and placement keys native. */
(async()=>{
 'use strict';
 if(window.lifeCloud){try{await window.lifeCloud.ready;await window.lifeAppReady;}catch{return;}}
 await window.placeRoomsReady;
 const wrap=document.querySelector('.canvas-wrap');if(!wrap)return;
 const visible=el=>!!el&&!el.disabled&&!el.closest('[hidden],[inert]')&&el.getClientRects().length>0&&getComputedStyle(el).visibility!=='hidden'&&getComputedStyle(el).display!=='none';
 const controls='button,a[href],input:not([type=hidden]),select,textarea,summary,[role=switch],[tabindex="0"]';
 const editable=el=>el?.matches('textarea,select,input:not([type=button]):not([type=submit]):not([type=checkbox]):not([type=radio]):not([type=file]),[contenteditable]:not([contenteditable=false])');
 function scope(){const dialogs=[...document.querySelectorAll('dialog[open]')],dialog=dialogs.at(-1);if(dialog){const inner=dialog.querySelector('.memory-inner-panel');if(inner)return inner;const note=dialog.querySelector('.memory-room-note:not([hidden])');if(note)return note;if(dialog.querySelector('.memory-room-scene')&&document.activeElement?.matches('.memory-room-scene'))return null;return dialog;}const radial=document.querySelector('.avatar-radial:not([hidden])');return radial||null;}
 function choices(root){return [...root.querySelectorAll(controls)].filter(visible).filter(el=>!el.matches('.memory-room-scene'));}
 function focus(el){if(!el)return;el.focus({preventScroll:true});el.scrollIntoView({block:'nearest',inline:'nearest'});}
 let lastScope=null;
 function initial(){const root=scope(),entering=root!==lastScope;lastScope=root;if(!root)return;const current=document.activeElement;if(root.contains(current)&&visible(current)&&(!entering||!current.matches('.close,.memory-room-note-close')))return;const list=choices(root);focus(list.find(el=>el.matches('.memory-scene-furniture'))||list.find(el=>!el.matches('.close,.memory-room-note-close,.memory-inner-close,#memory-return,.object-back'))||list[0]);}
 function step(root,key){const list=choices(root);if(!list.length)return;const active=document.activeElement,index=list.indexOf(active);if(index<0){focus(list[0]);return;}const backwards=['ArrowLeft','ArrowUp'].includes(key),vertical=['ArrowUp','ArrowDown'].includes(key),a=active.getBoundingClientRect(),ax=a.x+a.width/2,ay=a.y+a.height/2;
  const ranked=list.filter(el=>el!==active).map(el=>{const r=el.getBoundingClientRect(),dx=r.x+r.width/2-ax,dy=r.y+r.height/2-ay,along=vertical?dy:dx,across=vertical?dx:dy;return{el,along:backwards?-along:along,score:Math.abs(along)+Math.abs(across)*2};}).filter(item=>item.along>3).sort((a,b)=>a.score-b.score);
  focus(ranked[0]?.el||list[(index+(backwards?-1:1)+list.length)%list.length]);
 }
 function nearestFurniture(){const r=canvas.getBoundingClientRect();if(!r.width||!r.height)return null;let best=null,distance=165;
  for(const el of wrap.querySelectorAll('button,[role=switch]')){if(!visible(el)||el.matches('.avatar-interaction,.mobile-select-button,.all-layout-handle,.all-layout-remove,.interior-remove,.switch-place-done,.layout-finish-visible,.furniture-catalog *'))continue;const b=el.getBoundingClientRect(),x=(b.left-r.left)*960/r.width,y=(b.top-r.top)*650/r.height,w=b.width*960/r.width,h=b.height*650/r.height,d=Math.hypot(Math.max(x-player.x,0,player.x-x-w),Math.max(y-player.y,0,player.y-y-h));if(d<distance){distance=d;best=el;}}
  if((!window.lifeInterior||window.lifeInterior.scene()==='study')&&!best){const object=getNearest();if(object)return()=>openPanel(object.id);}
  return best?()=>best.click():null;
 }
 window.lifeKeyboardNavigation={nearestFurniture};
 window.addEventListener('keydown',e=>{
  if(e.isComposing||e.ctrlKey||e.metaKey||e.altKey||roomEditing)return;
  const select=e.key==='Enter'||e.key.toLowerCase()==='e',root=scope(),target=e.target;
  if(editable(target))return;
  if(root){if(e.key.startsWith('Arrow')){e.preventDefault();e.stopImmediatePropagation();keys.clear();step(root,e.key);return;}if(select){e.preventDefault();e.stopImmediatePropagation();keys.clear();if(e.repeat)return;let current=document.activeElement;if(!root.contains(current)||!visible(current)){initial();current=document.activeElement;}if(current?.matches(controls)&&visible(current))current.click();return;}return;}
  if(document.querySelector('dialog[open]')){if(select&&target.matches('button,[role=switch],summary')){e.preventDefault();e.stopImmediatePropagation();if(!e.repeat)target.click();}return;}
  if((e.key.startsWith('Arrow')||['w','a','s','d'].includes(e.key.toLowerCase()))&&(target===document.body||target===document.documentElement)&&lifePage==='room'){e.preventDefault();e.stopImmediatePropagation();canvas.focus({preventScroll:true});canvas.dispatchEvent(new KeyboardEvent('keydown',{key:e.key,bubbles:true,cancelable:true}));return;}
  if(e.key.startsWith('Arrow')&&target!==canvas&&wrap.contains(target)&&lifePage==='room'){e.preventDefault();e.stopImmediatePropagation();canvas.focus({preventScroll:true});canvas.dispatchEvent(new KeyboardEvent('keydown',{key:e.key,bubbles:true,cancelable:true}));return;}
  if(select&&target===canvas&&lifePage==='room'){e.preventDefault();e.stopImmediatePropagation();if(e.repeat)return;keys.clear();window.lifeRoomInteraction?.cancel();nearestFurniture()?.();return;}
  if(select&&target.matches('button,[role=switch],summary')){e.preventDefault();e.stopImmediatePropagation();if(!e.repeat)target.click();}
 },true);
 let queued=false;const refresh=()=>{if(queued)return;queued=true;queueMicrotask(()=>{queued=false;initial();});};
 for(const root of document.querySelectorAll('dialog,.avatar-radial')){new MutationObserver(refresh).observe(root,{subtree:true,childList:true,attributes:true,attributeFilter:['open','hidden']});if(root.matches('dialog'))root.addEventListener('close',()=>{requestAnimationFrame(()=>{if(!document.querySelector('dialog[open]')&&lifePage==='room'&&!roomEditing)canvas.focus({preventScroll:true});});});}
 const css=document.createElement('style');css.textContent='dialog :is(button,a,input,select,textarea,summary):focus-visible,.avatar-radial button:focus-visible{outline:2px solid #7b9270!important;outline-offset:3px!important}';document.head.append(css);
})();

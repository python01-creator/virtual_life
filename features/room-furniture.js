/* STORY_ROOM_FURNITURE_V1 */
(async()=>{
 if(window.lifeCloud){try{await window.lifeCloud.ready;await window.lifeAppReady;}catch{return;}}
 const wrap=document.querySelector('.canvas-wrap');
 function item(cls,label,svg,action){const b=document.createElement('button');b.className='story-room-item '+cls;b.setAttribute('aria-label',label);b.title=label;b.innerHTML=svg;b.onclick=action;wrap.append(b);return b;}
 const door=item('story-family-door','내 방으로 가는 문','<svg viewBox="0 0 65 120" aria-hidden="true"><path d="M4 116V4h57v112" fill="#a18b70" stroke="#78634e" stroke-width="4"/><path d="M11 115V12h43v103" fill="#cfb592"/><path d="M17 22h31v41H17z" fill="#bdcbb1" stroke="#9c896c" stroke-width="2"/><circle cx="45" cy="78" r="3" fill="#80694c"/></svg>',()=>lifeGo('family'));
 const award=item('story-award-frame','벽의 상장 · 해낸 일 업적장','<svg viewBox="0 0 90 72" aria-hidden="true"><path d="M32 8L45 1 58 8" fill="none" stroke="#aa9471" stroke-width="2"/><rect x="3" y="8" width="84" height="60" rx="2" fill="#a68a60" stroke="#7f694c" stroke-width="2"/><rect x="10" y="15" width="70" height="46" fill="#fff3d7"/><path d="M24 26h42M29 33h32M32 40h26" stroke="#b4aa88" stroke-width="3"/><path d="M39 53l-3 13 9-5 9 5-3-13" fill="#b98d78"/><circle cx="45" cy="50" r="8" fill="#d9b85d"/></svg>',()=>{const b=Array.from(document.querySelectorAll('.header-right button')).find(b=>b.textContent.includes('해낸 일'));if(b)b.click();else lifeGo('achievement');});
 const draw=drawRoom;drawRoom=function(t){const hidden=roomEditing||roomPrefs.activeSpace==='family';door.hidden=award.hidden=hidden;return draw(t);};
 const s=document.createElement('style');s.textContent='.story-room-item{position:absolute;padding:0;border:0;background:transparent;cursor:pointer;z-index:2;line-height:0}.story-room-item svg{width:100%;height:100%;filter:drop-shadow(1px 2px 1px #65543b26)}.story-room-item:hover,.story-room-item:focus-visible{outline:2px solid #f6df97;outline-offset:3px;border-radius:3px}.story-room-item[hidden]{display:none}.story-family-door{left:60%;top:12%;width:6.8%;height:18.5%}.story-award-frame{left:48%;top:15%;width:9.4%;height:11.1%}';document.head.append(s);
})();


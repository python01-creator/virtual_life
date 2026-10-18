/* BACKDROP_DISMISS_V2 */
(()=>{
 let start=null,swallow=null;
 const top=()=>Array.from(document.querySelectorAll('dialog[open]')).at(-1);
 function outside(d,e){const r=d.getBoundingClientRect();return e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom;}
 function dismiss(d){const button=d.querySelector('button.close,button[aria-label$="닫기"]');if(button){button.click();return;}const event=new Event('cancel',{cancelable:true});if(d.dispatchEvent(event))d.close();}
 window.addEventListener('pointerdown',e=>{const d=top();start=d?{dialog:d,inside:!outside(d,e)}:null;},true);
 window.addEventListener('pointerup',e=>{const d=top();if(!d||!outside(d,e)||start?.dialog===d&&start.inside)return;swallow={x:e.clientX,y:e.clientY,at:Date.now()};e.preventDefault();e.stopImmediatePropagation();start=null;dismiss(d);},true);
 window.addEventListener('click',e=>{if(!e.isTrusted)return;if(swallow&&Date.now()-swallow.at<500&&Math.hypot(e.clientX-swallow.x,e.clientY-swallow.y)<8){swallow=null;e.preventDefault();e.stopImmediatePropagation();return;}const d=top();if(!d||e.detail===0||!outside(d,e)||start?.dialog===d&&start.inside)return;e.preventDefault();e.stopImmediatePropagation();start=null;dismiss(d);},true);
 window.addEventListener('pointercancel',()=>{start=null;swallow=null;},true);
})();

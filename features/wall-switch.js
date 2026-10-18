/* WALL_SWITCH_V1 */
(async()=>{
 if(window.lifeCloud){try{await window.lifeCloud.ready;await window.lifeAppReady;}catch{return;}}
 const controls=document.querySelector('.room-extra-actions');if(controls)controls.hidden=true;
 const button=document.createElement('button');button.type='button';button.className='wall-light-switch';button.setAttribute('role','switch');button.setAttribute('aria-label','벽 조명');
 function sync(){button.setAttribute('aria-checked',String(!night));button.title=night?'조명 켜기':'조명 끄기';button.innerHTML='<span class="switch-rocker"></span><small>'+(night?'OFF':'ON')+'</small>';}
 button.onclick=()=>{document.querySelector('#light').click();sync();};
 document.querySelector('.canvas-wrap').append(button);sync();
 const css=document.createElement('style');css.textContent='.wall-light-switch{position:absolute;left:69%;top:20%;width:clamp(20px,3.3%,34px);height:clamp(32px,7%,47px);padding:3px 2px;border:2px solid #ad9d82;border-radius:4px;background:#f5ecda;box-shadow:1px 2px 0 #6e604544;display:flex;flex-direction:column;align-items:center;justify-content:center;cursor:pointer;color:#52654c}.wall-light-switch .switch-rocker{display:block;width:65%;height:60%;background:linear-gradient(#fffdf4 50%,#d3cbb8 50%);border:1px solid #b2a58d;border-radius:2px}.wall-light-switch[aria-checked=false] .switch-rocker{background:linear-gradient(#c4bba8 50%,#fffdf4 50%)}.wall-light-switch small{font-family:Pretendard,sans-serif;font-size:clamp(6px,.75vw,9px);line-height:1.2;margin-top:2px}.wall-light-switch:focus-visible{outline:3px solid #638d54;outline-offset:3px}.room-extra-actions[hidden]{display:none!important}';document.head.append(css);
})();

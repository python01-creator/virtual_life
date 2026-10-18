/* POPUP_LAYOUT_V1 */
(()=>{
  document.addEventListener('click',e=>{if(e.target.closest('#layout-edit')){window.lifeSwitchPlacement?.begin();const finish=document.querySelector('#layout-toggle');if(finish){document.querySelector('.room-wrap').append(finish);finish.classList.add('layout-finish-visible');finish.hidden=false;}}if(e.target.closest('#layout-toggle'))window.lifeSwitchPlacement?.finish();},false);
 const css=document.createElement('style');css.textContent='.layout-finish-visible{position:absolute;right:20px;bottom:55px;z-index:8;background:#faf8ec!important;box-shadow:0 3px 12px #33442222}.layout-finish-visible[hidden]{display:none!important}';document.head.append(css);
})();

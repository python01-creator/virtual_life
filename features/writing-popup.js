/* WRITING_POPUP_V1 */
(async()=>{
 if(window.lifeCloud){try{await window.lifeCloud.ready;await window.lifeAppReady;}catch{return;}}
 const parent=lifeShell.parentNode;let opened=false;
 function mount(){opened=true;document.querySelector('main').hidden=false;lifeShell.querySelector('.object-back')?.remove();lifeShell.hidden=false;lifeShow('');document.querySelector('#life-content').append(lifeShell);lifeShell.classList.add('writing-in-dialog');}
 const render=lifeRender;lifeRender=function(){if(lifePage==='writing'&&!lifeShell.isConnected)parent.append(lifeShell);const result=render();if(lifePage==='writing')mount();return result;};
 const go=lifeGo;lifeGo=async function(k){if(k==='writing'||k==='inspiration'){await lifeRefresh();lifeFilter='';lifePage='writing';lifeRender();keys.clear();return;}return go(k);};
 lifeDialog.addEventListener('close',()=>{if(lifeDialog.open||!opened)return;opened=false;lifeShell.classList.remove('writing-in-dialog');lifeShell.hidden=true;if(lifeShell.parentNode!==parent)parent.append(lifeShell);if(lifePage==='writing'){lifePage='room';document.querySelector('main').hidden=false;}});
 const css=document.createElement('style');css.textContent='.writing-in-dialog{padding:0!important;margin:0;max-width:100%}.writing-in-dialog .life-heading h1{font-size:24px}.writing-in-dialog .life-grid{grid-template-columns:repeat(2,minmax(0,1fr))}@media(max-width:560px){.writing-in-dialog .life-grid{grid-template-columns:1fr}}';document.head.append(css);
})();

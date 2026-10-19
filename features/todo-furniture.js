/* TODO_FURNITURE_V2 */
(()=>{
 const css=document.createElement('style');css.textContent='aside .card:has(#side-tasks){display:none}.todo-furniture-hit{position:absolute;z-index:4;background:transparent;border:2px solid transparent;border-radius:7px;cursor:pointer}.todo-furniture-hit:hover,.todo-furniture-hit:focus-visible{border-color:#f9e5ac;outline:none}.todo-furniture-hit[hidden]{display:none}.todo-only-note{margin-top:18px;padding:18px;background:#fff4b8;border:1px solid #e1cf79;border-radius:3px 3px 14px 3px;box-shadow:4px 5px 0 #d8bf6530}.todo-only-note .task{margin:13px 0}.todo-only-note .task-count{margin-top:16px}';document.head.append(css);
 function openTodo(){const panel=document.querySelector('#panel'),content=document.querySelector('#panel-content');content.innerHTML='<div class="eyebrow">TODAY STICKY NOTE</div><h2>오늘 할 일</h2><p>오늘 해낼 세 가지만 가볍게 적어 두어요.</p><div class="todo-only-note"><div data-simple-tasks></div><p class="task-count" data-simple-count></p></div>';window.lifeSimpleToday?.render?.();keys.clear();if(!panel.open)panel.showModal();}
 window.lifeTodoOnly=openTodo;
 const b=document.createElement('button');b.className='todo-furniture-hit';b.setAttribute('aria-label','스티키노트 · 오늘 할 일');b.title='스티키노트 · 오늘 할 일';b.onclick=openTodo;document.querySelector('.canvas-wrap').append(b);
 canvas.addEventListener('keydown',e=>{if(['e','Enter'].includes(e.key)&&getNearest()?.id==='today'){e.preventDefault();e.stopImmediatePropagation();openTodo();}},true);
 const draw=drawRoom;drawRoom=function(t){const o=objects.find(o=>o.id==='today'),home=!['dream','office','family'].includes(roomPrefs.activeSpace);b.hidden=!home||roomEditing;b.style.left=o.x/9.6+'%';b.style.top=o.y/6.5+'%';b.style.width=o.w/9.6+'%';b.style.height=o.h/6.5+'%';return draw(t);};
})();

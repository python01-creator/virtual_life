/* SLOW_LIGHT_ACTIVITY_GROWTH_V1 */
(()=>{
 let queue=Promise.resolve();
 const labels={task:'할 일',study:'공부 기록',diary:'일기',writing:'글쓰기'};
 const blank=()=>({version:1,earned:{},counts:{task:0,study:0,diary:0,writing:0},recent:[]});
 async function reward(type,key,label){
  if(!['task','study','diary','writing'].includes(type)||!key)return false;
  const token=type+':'+String(key);
  return queue=queue.catch(()=>{}).then(async()=>{
   const progress={...blank(),...((await window.lifeCloud.getSetting('garden-activity'))||{})};
   progress.earned=progress.earned||{};progress.counts={...blank().counts,...(progress.counts||{})};progress.recent=Array.isArray(progress.recent)?progress.recent:[];
   if(progress.earned[token])return false;
   const garden={plant:'나의 첫 화분',xp:0,water:70,sun:70,lastWater:0,lastSun:0,lastVisit:Date.now(),dew:0,...((await window.lifeCloud.getSetting('garden'))||{})};
   progress.earned[token]=new Date().toISOString();progress.counts[type]=(progress.counts[type]||0)+1;
   progress.recent.unshift({type,label:label||labels[type],at:new Date().toISOString()});progress.recent=progress.recent.slice(0,12);
   garden.dew=(Number(garden.dew)||0)+1;garden.xp=Math.min(14,(Number(garden.xp)||0)+1);garden.lastActivity={type,label:label||labels[type],at:new Date().toISOString()};
   await Promise.all([window.lifeCloud.setSetting('garden-activity',progress),window.lifeCloud.setSetting('garden',garden)]);window.lifeGardenActivity=progress;
   window.dispatchEvent(new CustomEvent('life-growth-earned',{detail:{type,label:label||labels[type],garden,progress}}));
   toast((label||labels[type])+' · 느린빛 식물이 한 뼘 자랐어요.');return true;
  });
 }
 window.lifeGrowthReward=reward;
 window.addEventListener('life-study-saved',event=>{const date=event.detail?.date,text=window.lifeStudy?.get?.(date)?.trim();if(text)reward('study',date,'오늘의 공부');});
 const put=lifePut;lifePut=async function(record){const result=await put(record);if(!record?.deleted&&record?.body?.trim()&&['writing','diary'].includes(record.kind))await reward(record.kind,record.id,record.kind==='diary'?'일기 한 편':'글 한 편');return result;};
 function activityPanel(){const a=window.lifeGardenActivity||{counts:{},recent:[]},c=a.counts||{},total=['task','study','diary','writing'].reduce((n,k)=>n+(Number(c[k])||0),0),recent=(a.recent||[]).slice(0,4);return '<section class="plant-activity"><div><strong>마음빛 '+total+'개</strong><span>할 일 '+(c.task||0)+' · 공부 '+(c.study||0)+' · 일기 '+(c.diary||0)+' · 글 '+(c.writing||0)+'</span></div><div class="plant-recent"><b>최근 성장</b>'+(recent.length?recent.map(r=>'<span>✦ '+lifeText(r.label||labels[r.type]||'기록')+'</span>').join(''):'<span>첫 기록을 남기면 여기에서 빛나요.</span>')+'</div></section>';}
 const show=lifeShow;lifeShow=function(html){if(typeof html==='string'){html=html.replace('글을 3편 쓰면 한 걸음 더 자라요.','일기·공부 기록·글 중 하나만 저장해도 한 걸음 자라요.');if(html.includes('SLOW LIGHT · MY LITTLE GREENHOUSE'))html=html.replace('<div class="plant-stage-story"',activityPanel()+'<div class="plant-stage-story"');}return show(html);};
})();

/* STUDY_DIARY_CORE_V1 */
(()=>{
 const day=now=>new Intl.DateTimeFormat('sv-SE',{timeZone:'Asia/Seoul',year:'numeric',month:'2-digit',day:'2-digit'}).format(new Date(now===undefined?Date.now():now));
 function merge(record,note){const suffix=record.studyNote?'\n\n## 오늘의 학습\n'+record.studyNote:'';let body=String(record.body||'');if(suffix&&body.endsWith(suffix))body=body.slice(0,-suffix.length);if(record.diary){body=[['오늘 있었던 일',record.diary.events],['내 마음과 생각',record.diary.thoughts],['고마웠던 것',record.diary.gratitude],['내일의 나에게',record.diary.tomorrow]].filter(([,v])=>String(v||'').trim()).map(([k,v])=>'## '+k+'\n'+v.trim()).join('\n\n');}return {...record,studyNote:note||'',body:body+(note?'\n\n## 오늘의 학습\n'+note:'')};}
 const api={day,merge};if(typeof module!=='undefined'&&module.exports)module.exports=api;else window.StudyDiaryCore=api;
})();

(() => {
 const scope='https://www.googleapis.com/auth/drive.file';
 const clientId=window.LIFE_HQ_CONFIG?.googleDriveClientId||window.LIFE_HQ_CONFIG?.googleCalendarClientId;
 let loader;
 function prepare(){
  if(window.google?.accounts?.oauth2)return Promise.resolve();
  return loader??=new Promise((resolve,reject)=>{
   const script=document.createElement('script');
   script.src='https://accounts.google.com/gsi/client';
   script.onload=resolve;
   script.onerror=()=>{loader=null;reject(new Error('Google 연결을 불러오지 못했어요.'));};
   document.head.append(script);
  });
 }
 function authorize(){
  if(!clientId)throw new Error('Google Drive 연결 설정이 필요해요.');
  if(!window.google?.accounts?.oauth2)throw new Error('Google 연결을 준비 중이에요. 다시 눌러 주세요.');
  return new Promise((resolve,reject)=>{
   const unavailable=()=>reject(new Error('Google Drive 연결이 완료되지 않았어요.'));
   google.accounts.oauth2.initTokenClient({
    client_id:clientId,scope,include_granted_scopes:false,
    callback:response=>response.access_token&&!response.error?resolve(response.access_token):unavailable(),
    error_callback:unavailable
   }).requestAccessToken({prompt:'select_account'});
  });
 }
 async function upload(file,token){
  const boundary='hq-'+crypto.randomUUID();
  const body=new Blob([
   '--'+boundary+'\r\nContent-Type: application/json; charset=UTF-8\r\n\r\n',
   JSON.stringify({name:file.name}),
   '\r\n--'+boundary+'\r\nContent-Type: '+file.type+'\r\n\r\n',
   file,
   '\r\n--'+boundary+'--\r\n'
  ]);
  const response=await fetch('https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart&fields=id',{
   method:'POST',headers:{Authorization:'Bearer '+token,'Content-Type':'multipart/related; boundary='+boundary},body
  });
  if(!response.ok)throw new Error('Google Drive에 사진을 올리지 못했어요. Drive 권한과 저장 공간을 확인해 주세요.');
  const {id}=await response.json();
  if(!/^[\w-]+$/.test(id||''))throw new Error('Drive 사진 주소를 받지 못했어요.');
  return id;
 }
 window.lifePhotoDrive={prepare,authorize,upload};
})();

/* LOGIN_MAIL_ERROR_V1 */
(function(root){
 function explain(error){const code=String(error?.code||''),msg=String(error?.message||''),seconds=msg.match(/after\s+(\d+)\s+seconds?/i);if(seconds)return {text:'로그인 메일을 이미 요청했어요. '+seconds[1]+'초 뒤에 다시 요청할 수 있어요. 받은편지함과 스팸함을 먼저 확인해 주세요.',wait:Math.min(3600,Math.max(1,Number(seconds[1])))};if(error?.status===429||code.startsWith('over_'))return {text:'로그인 메일 요청 한도에 걸렸어요. 이미 받은 메일을 먼저 확인하고 잠시 뒤 다시 시도해 주세요.',wait:60};if(code==='email_address_not_authorized')return {text:'현재 메일 발송 설정으로는 이 주소에 로그인 메일을 보낼 수 없어요. 관리자에게 메일 발송 설정 확인을 요청해 주세요.',wait:0};if(['email_address_invalid','validation_failed'].includes(code))return {text:'이메일 주소의 철자와 형식을 확인해 주세요.',wait:0};if(code==='captcha_failed')return {text:'보안 확인이 완료되지 않았어요. 화면을 새로 열고 다시 시도해 주세요.',wait:0};if(error?.status>=500)return {text:'인증 서버가 메일을 보내지 못했어요. 잠시 뒤 다시 시도해 주세요.',wait:0};return {text:'로그인 메일을 요청하지 못했어요. 인터넷 연결과 이메일 주소를 확인하고 다시 시도해 주세요.',wait:0};}
 if(typeof module!=='undefined'&&module.exports)module.exports={explain};else root.LifeLoginMail={explain};
})(typeof window!=='undefined'?window:globalThis);

(function () {
  'use strict';

  const config = window.LIFE_HQ_CONFIG || {};
  const configured = !!window.supabase && /^https:\/\/.+\.supabase\.co$/.test(config.supabaseUrl || '') &&
    typeof config.supabaseAnonKey === 'string' && config.supabaseAnonKey.length > 20;
  const client = configured && window.supabase
    ? window.supabase.createClient(config.supabaseUrl, config.supabaseAnonKey, {
        auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: true }
      })
    : null;

  let releaseReady;
  let rejectReady;
  let currentUser = null;
  const ready = new Promise((resolve, reject) => { releaseReady = resolve; rejectReady = reject; });

  function el(id) { return document.getElementById(id); }
  function message(text, bad) {
    const node = el('auth-message');
    if (!node) return;
    node.textContent = text;
    node.classList.toggle('error', !!bad);
  }
  function show(mode) {
    const gate = el('auth-gate');
    if (!gate) return;
    gate.hidden = mode === 'app';
    gate.setAttribute('aria-busy', mode === 'loading' ? 'true' : 'false');
    document.documentElement.classList.toggle('auth-locked', mode !== 'app');
    el('auth-setup').hidden = mode !== 'setup';
    el('auth-login').hidden = mode !== 'login';
  }
  function installAccountButton() {
    if (document.getElementById('account-signout')) return;
    const button = document.createElement('button');
    button.id = 'account-signout';
    button.className = 'ghost';
    button.textContent = '로그아웃';
    button.onclick = async () => { button.disabled = true; const { error } = await client.auth.signOut(); if (error) { button.disabled = false; message('로그아웃하지 못했어요. 다시 시도해 주세요.', true); return; } lockSession(); };
    document.querySelector('.header-right')?.append(button);
  }

  // SESSION_PRIVACY_V1: lock immediately on logout, expiry, or account change.
  let resetting = false;
  function lockSession() {
    if (resetting) return;
    resetting = true;
    currentUser = null;
    show('login');
    document.dispatchEvent(new Event('life-session-ended'));
    document.querySelectorAll('dialog').forEach(d => { if (d.open) d.close(); d.replaceChildren(); });
    document.querySelectorAll('textarea,input:not([type=email])').forEach(n => { n.value = ''; });
    try { for (const key of Object.keys(sessionStorage)) if (/^life-.*diary-code/.test(key)) sessionStorage.removeItem(key); } catch {}
    location.reload();
  }
  async function requireUser() {
    await ready;
    if (!currentUser) throw new Error('로그인이 필요해요.');
    return currentUser;
  }
  async function listRecords() {
    const user = await requireUser();
    const records = [];
    const batch = 400;
    for (let from = 0; ; from += batch) {
      const { data, error } = await client.from('life_records')
        .select('payload').eq('user_id', user.id).order('id', { ascending: true }).range(from, from + batch - 1);
      if (error) throw error;
      records.push(...(data || []).map(row => row.payload));
      if (!data || data.length < batch) break;
    }
    return records;
  }

  async function putRecord(record) {
    const user = await requireUser();
    const clean = JSON.parse(JSON.stringify(record));
    const { error } = await client.from('life_records').upsert({
      user_id: user.id,
      id: String(clean.id),
      home_id: String(clean.home || 'original'),
      payload: clean,
      updated_at: new Date().toISOString()
    }, { onConflict: 'user_id,id' });
    if (error) throw error;
  }
  // DIARY_CAS_V1: never overwrite a newer revision from another device.
  async function saveDiary(record, base) {
    const user = await requireUser();
    if (record.kind !== 'diary' || record.share !== false) throw new Error('비공개 일기만 저장할 수 있어요.');
    const clean = JSON.parse(JSON.stringify(record));
    const row = {user_id:user.id,id:String(clean.id),home_id:String(clean.home||'original'),payload:clean,updated_at:new Date().toISOString()};
    let request;
    if (!base) request = client.from('life_records').insert(row).select('payload').maybeSingle();
    else {
      let query = client.from('life_records').update(row).eq('user_id',user.id).eq('id',row.id);
      query = base.updated ? query.eq('payload->>updated',base.updated) : query.is('payload->>updated',null);
      if (base._diaryRevision) query = query.eq('payload->>_diaryRevision',base._diaryRevision);
      request = query.select('payload').maybeSingle();
    }
    const {data,error} = await request;
    if (error && error.code !== '23505') throw error;
    if (error || !data) {const conflict = new Error('다른 기록이 먼저 저장됐어요.');conflict.code='DIARY_CONFLICT';throw conflict;}
    return data.payload;
  }
  async function deleteRecord(id) {
    const user = await requireUser();
    const { error } = await client.from('life_records').delete().eq('user_id', user.id).eq('id', String(id));
    if (error) throw error;
  }
  async function getSetting(key) {
    const user = await requireUser();
    const { data, error } = await client.from('life_settings').select('value').eq('user_id', user.id).eq('key', key).maybeSingle();
    if (error) throw error;
    return data ? data.value : null;
  }
  async function setSetting(key, value) {
    const user = await requireUser();
    const { error } = await client.from('life_settings').upsert({
      user_id: user.id, key, value: JSON.parse(JSON.stringify(value)), updated_at: new Date().toISOString()
    }, { onConflict: 'user_id,key' });
    if (error) throw error;
  }
  async function countRecords() {
    const user = await requireUser();
    const { count, error } = await client.from('life_records').select('*', { count: 'exact', head: true }).eq('user_id', user.id);
    if (error) throw error;
    return count || 0;
  }

  window.lifeCloud = { configured, ready, saveDiary, get userId() { return currentUser?.id || null; }, listRecords, putRecord, deleteRecord, getSetting, setSetting, countRecords };

/* PRIVATE_ALBUM_API_V1 */
const albumResult=async request=>{const {data,error}=await request;if(error)throw error;return data;};
window.lifeCloud.albums={
 list:async()=>{await requireUser();return albumResult(client.from('life_albums').select('*').order('created_at'));},
 create:async(title,home,isFamily=false)=>{await requireUser();return albumResult(client.from('life_albums').insert({title,home_id:home,is_family:isFamily}).select().single());},
 entries:async id=>{await requireUser();return albumResult(client.from('life_album_entries').select('*').eq('album_id',id).order('created_at'));},
 addEntry:async row=>{await requireUser();return albumResult(client.from('life_album_entries').insert(row).select().single());},
 members:async id=>{await requireUser();return albumResult(client.from('life_album_members').select('email,user_id,accepted_at').eq('album_id',id));},
 invite:async(id,email)=>{await requireUser();return albumResult(client.rpc('life_invite_album',{a:id,invited_email:email}));},
 revoke:async(id,email)=>{await requireUser();return albumResult(client.rpc('life_revoke_album',{a:id,invited_email:email}));},
 invitations:async()=>{await requireUser();return albumResult(client.rpc('life_album_invitations'));},
 accept:async id=>{await requireUser();return albumResult(client.rpc('life_accept_album',{a:id}));},
 comments:async id=>{await requireUser();return albumResult(client.from('life_album_comments').select('id,body,created_at,user_id').eq('entry_id',id).order('created_at'));},
 comment:async(id,body)=>{const user=await requireUser();return albumResult(client.from('life_album_comments').insert({entry_id:id,body,user_id:user.id}));}
};

  document.addEventListener('DOMContentLoaded', async () => {
    if (!configured) {
      show('setup');
      message('Supabase 프로젝트 정보를 config.js에 연결하면 로그인을 시작할 수 있어요.');
      return;
    }
    show('loading');
    const authParams = new URLSearchParams(location.search), oauthError = authParams.get('error_code') || authParams.get('error');
    if (oauthError) {for (const name of ['error','error_code','error_description']) authParams.delete(name);history.replaceState(null,'',location.pathname+(authParams.size?'?'+authParams.toString():''));}
    message('안전하게 내 공간을 여는 중…');
    const form = el('auth-form');
    const googleButton=el('auth-google'),googleEnabled=config.googleAuthEnabled===true;
    if(googleEnabled){googleButton.hidden=false;el('auth-divider').hidden=false;googleButton.onclick=async()=>{googleButton.disabled=true;message('Google 로그인 화면을 여는 중…');try{const {error}=await client.auth.signInWithOAuth({provider:'google',options:{redirectTo:location.origin+location.pathname,queryParams:{prompt:'select_account'}}});if(error)throw error;}catch(error){googleButton.disabled=false;message('Google 로그인을 시작하지 못했어요. 연결 설정을 확인해 주세요.',true);}};}

    /* AUTH_MAIL_COOLDOWN_V1 */
    const sendButton=form.querySelector('button'),cooldownKey='life-auth-mail-cooldown-v1';let until=0,timer,sending=false;
    try{until=Number(localStorage.getItem(cooldownKey))||0;if(until>Date.now()+3600000)until=0;}catch{}
    function tick(){const seconds=Math.max(0,Math.ceil((until-Date.now())/1000));sendButton.disabled=sending||seconds>0;sendButton.textContent=sending?'보내는 중…':seconds?seconds+'초 후 다시 요청':'로그인 링크 받기';if(!seconds){clearInterval(timer);try{localStorage.removeItem(cooldownKey);}catch{}}}
    function cool(seconds){until=Date.now()+seconds*1000;try{localStorage.setItem(cooldownKey,String(until));}catch{}clearInterval(timer);timer=setInterval(tick,1000);tick();}
    if(until>Date.now()){message('메일 재요청 대기 중이에요. 이미 받은 로그인 메일이 있는지 먼저 확인해 주세요.');timer=setInterval(tick,1000);}tick();
    form.onsubmit = async event => {
      event.preventDefault();if(sending||until>Date.now()){tick();return;}
      const email = new FormData(form).get('email').trim();
      sending=true;tick();message('로그인 링크를 보내는 중…');
      try{const {error}=await client.auth.signInWithOtp({email,options:{emailRedirectTo:location.origin+location.pathname}});
        if(error){const detail=window.LifeLoginMail.explain(error);message(detail.text,true);if(detail.wait)cool(detail.wait);}
        else{message('로그인 메일을 보냈어요. 가장 최근에 받은 메일의 링크를 열어 주세요. 스팸함도 확인해 주세요.');cool(60);}
      }catch(error){message(window.LifeLoginMail.explain(error).text,true);}
      finally{sending=false;tick();}
    };

    try {
      const { data, error } = await client.auth.getSession();
      if (error) throw error;
      currentUser = data.session?.user || null;
      if (currentUser) {
        show('app');
        installAccountButton();
        releaseReady(currentUser);
      } else {
        show('login');
        message(oauthError ? '로그인 링크가 만료됐거나 인증을 마치지 못했어요. Google로 계속하기를 다시 눌러 주세요. 기존 서버 기록은 그대로 있어요.' : '', !!oauthError);
      }
    } catch (error) {
      show('login');
      message('로그인 상태를 확인하지 못했어요. 잠시 후 다시 시도해 주세요.', true);
      rejectReady(error);
    }
    client.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_OUT' || (currentUser && (!session?.user || session.user.id !== currentUser.id))) { lockSession(); return; }
      if (!currentUser && session?.user) {
        currentUser = session.user;
        show('app');
        installAccountButton();
        releaseReady(currentUser);
      }
    });
  });
})();






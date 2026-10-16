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
    button.onclick = async () => { await client.auth.signOut(); location.reload(); };
    document.querySelector('.header-right')?.append(button);
  }

  async function requireUser() {
    await ready;
    if (!currentUser) throw new Error('로그인이 필요해요.');
    return currentUser;
  }
  async function listRecords() {
    await requireUser();
    const records = [];
    const batch = 400;
    for (let from = 0; ; from += batch) {
      const { data, error } = await client.from('life_records')
        .select('payload').order('id', { ascending: true }).range(from, from + batch - 1);
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
  async function deleteRecord(id) {
    await requireUser();
    const { error } = await client.from('life_records').delete().eq('id', String(id));
    if (error) throw error;
  }
  async function getSetting(key) {
    await requireUser();
    const { data, error } = await client.from('life_settings').select('value').eq('key', key).maybeSingle();
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
    await requireUser();
    const { count, error } = await client.from('life_records').select('*', { count: 'exact', head: true });
    if (error) throw error;
    return count || 0;
  }

  window.lifeCloud = { configured, ready, listRecords, putRecord, deleteRecord, getSetting, setSetting, countRecords };

  document.addEventListener('DOMContentLoaded', async () => {
    if (!configured) {
      show('setup');
      message('Supabase 프로젝트 정보를 config.js에 연결하면 로그인을 시작할 수 있어요.');
      return;
    }
    show('login');
    const form = el('auth-form');
    form.onsubmit = async event => {
      event.preventDefault();
      const email = new FormData(form).get('email').trim();
      const button = form.querySelector('button');
      button.disabled = true;
      message('로그인 링크를 보내는 중…');
      const { error } = await client.auth.signInWithOtp({
        email,
        options: { emailRedirectTo: location.origin + location.pathname }
      });
      button.disabled = false;
      message(error ? '링크를 보내지 못했어요. 이메일과 Supabase 설정을 확인해 주세요.' : '이메일로 보낸 로그인 링크를 열어 주세요.', !!error);
    };
    try {
      const { data, error } = await client.auth.getSession();
      if (error) throw error;
      currentUser = data.session?.user || null;
      if (currentUser) {
        show('app');
        installAccountButton();
        releaseReady(currentUser);
      }
    } catch (error) {
      message('로그인 상태를 확인하지 못했어요. 잠시 후 다시 시도해 주세요.', true);
      rejectReady(error);
    }
    client.auth.onAuthStateChange((_event, session) => {
      if (!currentUser && session?.user) {
        currentUser = session.user;
        show('app');
        installAccountButton();
        releaseReady(currentUser);
      }
    });
  });
})();


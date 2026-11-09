(() => {
  const key = 'player-profile-v1';
  const genders = ['여성', '남성'];
  let profile;
  let saving = false;

  function open(firstVisit = false) {
    lifeShow(`
      <h2>${firstVisit ? '내 HQ에 오신 걸 환영해요' : '내 프로필'}</h2>
      <p>캐릭터를 고르고, 원하는 경우 이름·나이·성별도 입력할 수 있어요. 내 계정에만 저장돼요.</p>
      <form id="hq-player-profile">
        <fieldset class="hq-avatar-picker">
          <legend>캐릭터 선택</legend>
          <div class="hq-avatar-options">
            <label><input type="radio" name="avatar" value="male">
              <img src="./assets/avatar-boy-stand.webp" alt=""><span>남자 캐릭터</span>
            </label>
            <label><input type="radio" name="avatar" value="female">
              <img src="./assets/avatar-cute-stand.webp" alt=""><span>여자 캐릭터</span>
            </label>
          </div>
        </fieldset>
        <label>이름 또는 닉네임 <input name="nickname" maxlength="40"></label>
        <label>나이 <input name="age" type="number" inputmode="numeric" min="0" max="130" step="1"></label>
        <label>성별 <select name="gender"><option value="">선택 안 함</option>
          ${genders.map(value => `<option>${value}</option>`).join('')}
        </select></label>
        <div class="actions">
          <button class="primary">프로필 저장</button>
          ${firstVisit ? '<button type="button" class="ghost" id="hq-profile-skip">건너뛰기</button>' : ''}
        </div>
        <p role="status"></p>
      </form>`);
    const form = document.querySelector('#hq-player-profile');
    const fields = form.elements;
    fields.nickname.value = profile?.nickname ?? '';
    fields.age.value = profile?.age ?? '';
    fields.gender.value = genders.includes(profile?.gender) ? profile.gender : '';
    fields.avatar.value = profile?.avatar === 'male' ? 'male' : 'female';

    async function save(value) {
      if (saving) return;
      saving = true;
      const buttons = [...form.querySelectorAll('button')];
      buttons.forEach(button => { button.disabled = true; });
      try {
        await window.lifeCloud.setSetting(key, value);
        profile = value;
        if (form.isConnected && lifeDialog.open) lifeDialog.close();
      } catch {
        form.querySelector('[role="status"]').textContent = '저장하지 못했어요. 연결을 확인하고 다시 시도해 주세요.';
      } finally {
        saving = false;
        buttons.forEach(button => { button.disabled = false; });
      }
    }

    form.onsubmit = event => {
      event.preventDefault();
      save({
        version: 1,
        nickname: fields.nickname.value.trim(),
        age: fields.age.value === '' ? null : fields.age.valueAsNumber,
        gender: fields.gender.value,
        avatar: fields.avatar.value
      });
    };
    form.querySelector('#hq-profile-skip')?.addEventListener('click', () => save({ version: 1, avatar: 'female' }));
  }

  async function load(edit = false) {
    try {
      if (!window.lifeCloud) return;
      await window.lifeCloud.ready;
      await window.lifeAppReady;
      profile = await window.lifeCloud.getSetting(key);
      if (edit || profile === null) open(!edit);
    } catch {
      if (edit) toast('프로필을 불러오지 못했어요. 잠시 후 다시 시도해 주세요.');
    }
  }
  const style = document.createElement('style');
  style.textContent = `
    #hq-player-profile .hq-avatar-picker { border:0; padding:0; margin:0 0 1rem; }
    #hq-player-profile .hq-avatar-options { display:grid; grid-template-columns:repeat(2,minmax(0,1fr)); gap:.65rem; }
    #hq-player-profile .hq-avatar-options label {
      display:grid; grid-template-columns:auto 1fr; align-items:center; justify-items:center;
      gap:.3rem; margin:0; padding:.55rem; border:1px solid #d3d9c8;
      border-radius:.8rem; background:#f7f7ef; cursor:pointer; text-align:center;
    }
    #hq-player-profile .hq-avatar-options label:has(input:checked) { background:#e6eddf; border-color:#718364; }
    #hq-player-profile .hq-avatar-options input { width:auto; margin:0; accent-color:#657958; }
    #hq-player-profile .hq-avatar-options img { width:60px; height:64px; object-fit:contain; }
    #hq-player-profile .hq-avatar-options span { grid-column:1 / -1; }
  `;
  document.head.append(style);
  window.lifePlayerProfile = {
    open: () => load(true),
    get avatar() { return profile?.avatar === 'male' ? 'male' : 'female'; }
  };
  load();
})();

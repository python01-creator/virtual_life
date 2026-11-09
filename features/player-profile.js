(() => {
  const key = 'player-profile-v1';
  const genders = ['여성', '남성', '논바이너리', '직접 입력', '응답하지 않음'];
  let profile;
  let saving = false;

  function open(firstVisit = false) {
    lifeShow(`
      <h2>${firstVisit ? '내 HQ에 오신 걸 환영해요' : '내 프로필'}</h2>
      <p>이름이나 닉네임, 나이, 성별을 선택해서 입력할 수 있어요. 내 계정에만 저장돼요.</p>
      <form id="hq-player-profile">
        <label>이름 또는 닉네임 <input name="nickname" maxlength="40"></label>
        <label>나이 <input name="age" type="number" inputmode="numeric" min="0" max="130" step="1"></label>
        <label>성별 <select name="gender"><option value="">선택 안 함</option>
          ${genders.map(value => `<option>${value}</option>`).join('')}
        </select></label>
        <label id="hq-gender-detail" hidden>성별 직접 입력 <input name="genderDetail" maxlength="40"></label>
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
    fields.gender.value = profile?.gender ?? '';
    fields.genderDetail.value = profile?.genderDetail ?? '';
    const updateGender = () => {
      document.querySelector('#hq-gender-detail').hidden = fields.gender.value !== '직접 입력';
    };
    fields.gender.onchange = updateGender;
    updateGender();

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
        genderDetail: fields.gender.value === '직접 입력' ? fields.genderDetail.value.trim() : ''
      });
    };
    form.querySelector('#hq-profile-skip')?.addEventListener('click', () => save({ version: 1 }));
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
  window.lifePlayerProfile = { open: () => load(true) };
  load();
})();

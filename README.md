# MY LIFE HQ

개인용 디지털 운영실입니다. 정적 화면은 GitHub Pages에서 제공하고, 로그인과 데이터는 Supabase에 저장합니다.

## 처음 한 번 설정하기

1. Supabase에서 새 프로젝트를 만듭니다.
2. SQL Editor에서 `supabase.sql` 전체를 실행합니다.
3. Authentication → URL Configuration에서 Site URL을 `https://python01-creator.github.io/virtual_life/`로 설정하고 같은 주소를 Redirect URLs에도 추가합니다.
4. Project Settings → API에서 Project URL과 Publishable key(구 프로젝트는 anon key)를 확인합니다.
5. `config.js`에 두 값을 넣습니다. `service_role` 키는 넣지 않습니다.
6. 변경을 `main` 브랜치에 올리면 기존 GitHub Pages 배포가 갱신됩니다.

Project URL과 publishable/anon key는 브라우저 앱에 공개되는 값입니다. 보안은 `supabase.sql`의 Row Level Security가 담당하며, 각 행의 `user_id`가 로그인 사용자와 같은 경우에만 읽기·쓰기가 허용됩니다.

## 저장되는 데이터

- `life_records`: 일기, 글, 사진, 여행·성장·가족 기록 등 사용자가 만든 콘텐츠
- `life_settings`: Today Board, 링크 허브, 방 꾸미기, 집 목록 같은 개인 설정
- `auth.users`: Supabase Auth가 관리하는 로그인 이메일과 세션

브라우저 저장소는 기존 사용자의 데이터를 서버로 한 번 옮기기 위한 마이그레이션 원본과 작성 중 임시 초안에만 사용합니다. 정식 저장과 다른 기기 동기화는 Supabase를 기준으로 합니다.

## 코드 구조

- `index.html`: 화면의 기본 마크업과 공통 스타일
- `features/room-core.js`: 방 캔버스와 캐릭터의 핵심 동작
- `features/today-room.js`: Today 보드와 방 안 이동
- `features/calendar.js`: Google 캘린더 읽기 화면
- `features/plant.js`, `features/growth.js`: 느린빛 식물과 활동별 성장
- `features/study.js`, `features/writing-*.js`: 공부 기록과 글쓰기
- `features/navigation.js`, `features/room-*.js`: 화면·방 이동과 배치
- `assets/`: 캐릭터와 반려동물 이미지

기능 스크립트는 `index.html`에 적힌 순서대로 불러옵니다. 전역 상태를 단계적으로 확장하는 구조이므로 파일 순서를 바꿀 때는 전체 화면 동작을 함께 확인해야 합니다.

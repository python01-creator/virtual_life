

### 가입 승인 설정

1. 공개 가입을 닫아둔 상태에서 운영 DB의 `life_*` 테이블, 앨범 RPC와 Storage 정책을 확인합니다. `supabase-approval.sql`은 기존 가입자를 승인 상태로 보존합니다.
2. SQL Editor에서 마이그레이션을 적용한 뒤, Authentication → Users에서 확인한 관리자 계정의 UUID만 `hq_private.admins`에 추가합니다. 관리자 권한은 브라우저 설정에 저장하지 않습니다.
3. `config.js`에 `approvalRequired: true`를 설정해 배포하고 관리자 계정의 가입 신청 버튼과 기존 계정의 기록 접근을 확인합니다.
4. 공개 가입을 켠 뒤 별도 Google 테스트 계정으로 승인 대기, 승인, 거절을 확인합니다. 승인 전에는 앱 화면과 기존 데이터 API가 차단되어야 합니다. 이메일 로그인 링크는 기존 계정에만 발송합니다.

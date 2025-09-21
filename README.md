# StockRounge - 코인 커뮤니티 플랫폼

코인 종목토론 게시판 커뮤니티형 핀테크 반응형 웹사이트
도메인 : https://stocklounge.store


## 팀원

<table>
  <tbody>
    <tr>
      <td align="center"><a href="https://github.com/KimTyun"><img src="https://avatars.githubusercontent.com/u/106860407?v=4" width="100px;" alt=""/><br /><sub><b>팀장 : 김택윤</b></sub></a><br /></td>
      <td align="center"><a href="https://github.com/K-cook517"><img src="https://avatars.githubusercontent.com/u/211454084?v=4" width="100px;" alt=""/><br /><sub><b>팀원 : 김동빈</b></sub></a><br />
</td>
      <td align="center"><a href="https://github.com/silvergraylap"><img src="https://avatars.githubusercontent.com/u/214441739?s=400&v=4" width="100px;" alt=""/><br /><sub><b>팀원 : 박인덕</b></sub></a><br />
</td>
      <td align="center"><a href="https://github.com/taemin2336"><img src="https://avatars.githubusercontent.com/u/165637767?v=4" width="100px;" alt=""/><br /><sub><b>팀원 : 박태민</b></sub></a><br /></td>
    </tr>
  </tbody>
</table>
<br />

## 📌 Git 협업 규칙

팀 프로젝트에서 원활한 협업을 위해 다음과 같은 Git 규칙을 따릅니다.

---

### 🔹 Commit 규칙

1. **작업 단위별로 Commit**

   -  기능/버그 수정 단위로 Commit (너무 자주/너무 드물게 ❌)
   -  한 가지 작업이 끝나면 Commit

   ✅ 올바른 예시

   -  `[feat]: 로그인 페이지 구현`  
      ❌ 잘못된 예시
   -  `[feat]: 로그인, 회원가입, 내정보수정`
   -  `[feat]: handleLogin 함수 생성`

2. **Commit 메세지 작성 규칙**

   -  형식: **`[type]: message`**
   -  type은 아래 중 선택:
      -  `[feat]` : 기능 추가
      -  `[fix]` : 버그 수정
      -  `[refactor]` : 코드 리팩토링
      -  `[test]` : 테스트 코드 추가 (로직 변경 없음)
      -  `[build]` : 빌드 관련 수정
      -  `[chore]` : 기타 변경
      -  `[ing]` : 작업 중 중간 저장 (`ing: [type], message`)

   📍 예시

   -  `[feat] 회원 가입 기능 추가`
   -  `[fix] swiper 기능 오류 개선`
   -  `[ing] feat, 로그인 로직 구현중`

---

### 🔹 PR 규칙

1. 충돌 발생 시 → **무조건 반려** (작성자가 직접 해결 후 다시 PR)
2. **main 브랜치 직접 merge 금지**
3. PR은 **최소 1명 이상의 Reviewer** 승인 필요
   -  리뷰 시 이해 안 되는 부분 질문하기
   -  로직 및 코드 품질 확인하기

---

### 🔹 Branch 네이밍 규칙

-  형식: **`[이니셜]/작업내용`**
   -  이니셜: 동빈(DB), 택윤(TY), 인덕(ID), 태민(TM)
   -  작업내용: 간단하게, WBS 기준 작성

📍 예시

-  `TY/login-page`
-  `DB/chart-api`

> 완료된 브랜치는 제거 후, 새로운 작업 시 새 브랜치 생성.

---

### 🔹 기타 협업 규칙

1. **AI 코드 사용**

   -  AI 코드 그대로 복붙 ❌
   -  필요한 부분만 이해 후 적용 ✔
   -  코드 통일성 유지, AI 오류(Hallucination) 주의

2. **팀원 코드 수정 금지**

   -  다른 팀원 함수 활용 ✔
   -  공용 파일(`api.js`, `app.js` 등)에 코드 추가 ⚠
   -  타인의 코드 임의 수정/삭제 ❌ (수정 필요 시 작성자에게 알리고 협의 후 진행)

3. **문제 공유하기**
   -  반나절 이상 해결 안 되는 문제는 팀원과 공유
   -  함께 논의하여 해결책 모색

---

## 🚀 주요 기능

### 메인 페이지

-  **GNB (고정 상단바)**: 로그인/내정보, 주요 메뉴 [메인/게시판/차트/뉴스/내정보]
-  **Hero Section** : keyframes로 구현된 간단한 애니메이션, CTA 버튼

### 인증 시스템

-  **소셜 로그인**: 구글, 카카오 인증
-  **포인트 시스템**: 게시글/댓글 작성, 추천 시 포인트 지급
-  **포인트 교환**: 1000포인트 = 1코인, 코인을 원치 않는 사용자는 실제 상품으로 교환 가능

### 게시판

-  **코인별 게시판**: 선택한 코인의 차트와 관련 게시글
-  **React-Quill 에디터**: 텍스트 편집 기능
-  **댓글 시스템**: 추천/신고 기능 포함

### 차트

-  **실시간 차트**: Upbit API 연동
-  **TOP 코인**: 상위 20개 코인 리스트
-  **유저 맞춤 게시글**: implicit를 활용한 유저 맞춤 게시글 리스트

### 관리자

-  **대시보드**: 통합 관리 화면
-  **유저관리**: 사용자 목록, 제재 관리
-  **게시판관리**: 게시글 관리, 삭제 기능
-  **통계**: 방문자수, 가입자수, 포인트 발행 추이

## 🛠 기술 스택

-  **Backend**: Node.js, Express
-  **ORM/DB**: Sequelize, MySQL2
-  **인증/보안**: Passport (Google, Kakao), JWT, bcrypt, helmet, cors, express-session, cookie-parser
-  **API 문서화**: Swagger-jsdoc, Swagger-UI-Express
-  **파일 업로드**: Multer
-  **유틸리티**: dotenv, dayjs, morgan
-  **개발환경**: Nodemon

## 📂 폴더 구조

```
stockLounge-api/
├── config/               # 환경설정 및 DB 설정 파일
├── swagger/              # Swagger API 문서
├── middlewares/          # 커스텀 미들웨어 (인증, 에러처리 등)
├── models/               # Sequelize 모델 정의
├── routes/               # API 라우터 정의
├── passport/             # 로그인 관리
├── uploads/              # 업로드 파일 저장소
└── app.js                # 앱 진입점(Express 초기화)
```

## 🚀 시작하기

### 설치

```bash
npm install
```

### 개발 서버 실행

```bash
npm start
```

개발 서버가 http://localhost:8000 에서 실행됩니다.

## 🔧 환경 변수

`.env` 파일을 생성하고 다음 환경 변수들을 설정하세요:

```#stocklounge-api .env 파일
# 포트번호
PORT=8000
# 개발환경(development/test/production)
NODE_ENV=development
# 쿠키와 세션을 만들때 필요한 암호화 키(키 값은 자유롭게 작성가능)
COOKIE_SECRET= test
# 토근을 발급받을 때 필요한 암호화 키
JWT_SECRET= test
# DB정보
# 개발용 DB
DB_DEV_HOST=127.0.0.1
DB_DEV_USERNAME=
DB_DEV_PASSWORD=
DB_DEV_DATABASE=stocklounge
DB_DEV_DIALECT=mysql
# 배포용 DB
DB_PROD_HOST=
DB_PROD_USER=
DB_PROD_PASSWORD=
DB_PROD_DATABASE=stocklounge
DB_PROD_DIALECT=mysql
# 테스트용 DB
DB_TEST_HOST=
DB_TEST_USERNAME=
DB_TEST_PASSWORD=
DB_TEST_NAME=
DB_TEST_DIALECT=mysql
# 프론트엔드 주소
FRONTEND_APP_URL=http://localhost:5173
# 백엔드 주소
APP_API_URL=http://localhost:8000
# 구글 로그인 api용
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
GOOGLE_CALLBACK_URL=/api/auth/google/callback
#카카오 로그인
KAKAO_REST_API_KEY=
KAKAO_REDIRECT_URI=http://localhost:8000/auth/kakao/callback
KAKAO_CLIENT_ID=
KAKAO_CALLBACK_URL=/api/auth/kakao/callback
# 네이버 뉴스 api
NAVER_CLIENT_ID=
NAVER_CLIENT_SECRET=
```

## 🔗 API 연동

-  **Upbit API**: 실시간 코인 데이터
-  **네이버 뉴스 API**: 경제/코인 뉴스
-  **자체 백엔드 API**: 사용자, 게시판, 포인트 관리



## 역할 분배 (features)
<table>
  <tbody>
    <tr>
        <td align="center"><strong>기능분류</strong></td>
        <td align="center"><strong>주요기능</strong></td>
        <td align="center"><strong>담당자</strong></td>
    </tr>
    <tr>
        <td align="center"><strong>게시판</strong></td>
        <td align="center"><p>게시판 디자인, 글쓰기/수정/삭제, 댓글기능, 신고, 리워드 지급 등</p></td>
        <td align="center"><p>박태민</p></td>
    </tr>
    <tr>
        <td align="center"><strong>운영자 웹 관리</strong></td>
        <td align="center"><p>운영자 대시보드, 통계, 유저관리, 게시판관리, 사이트 설정 변경 등</p></td>
        <td align="center"><p>김동빈</p></td>
    </tr>
      <tr>
        <td align="center"><strong>디자인, 소셜 로그인</strong></td>
        <td align="center"><p>랜딩페이지, 메인 디자인, 소셜 로그인 기능</p></td>
        <td align="center"><p>박인덕</p></td>
    </tr>
    <tr>
        <td align="center"><strong>기타 api기능, 회원 관리</strong></td>
        <td align="center"><p>내정보 페이지, 암호화폐 차트, 뉴스 페이지, 리워드 교환 등</p></td>
        <td align="center"><p>박태민</p></td>
    </tr>
  </tbody>
</table>

<br/>


## 4. 시스템 아키텍처 / ERD (Architecture & DB), 산출물
<br />

### [ERD](https://www.erdcloud.com/d/sDG9yZHxNvYYbMa48)
### [화면설계](https://www.figma.com/design/lIGw8rfO0DfGPhIUJi2gjC/%ED%95%80%ED%85%8C%ED%81%AC-stitch-%EC%B4%88%EC%95%88?t=Hbr4TBLltxqahRL7-0)
### [요구사항 정의서](https://docs.google.com/spreadsheets/d/1e_F76oiL1_Tdma-PvRcwCAWJWitBQBNvcZhi82afE0s/edit?gid=0#gid=0)
### [WBS](https://docs.google.com/spreadsheets/d/1KV-lESuDaVaKC-IZv6Gfa_RTRahPvCvf/edit?gid=543982498#gid=543982498)


### ERD
<img width="792" height="529" alt="erd" src="https://github.com/user-attachments/assets/f1d9b4f4-0e02-4903-975f-cc6c3f97f184" />

### 프로젝트 아키텍쳐
<img width="1990" height="1100" alt="image" 
src="https://github.com/user-attachments/assets/55b03951-472b-4124-b3ee-108e4bac4e1d" />


----

### 프로젝트 협업용 git
<br />
<a href="https://github.com/KimTyun/stockLounge-api">API git 링크</a>
<br />
<br />
<a href="https://github.com/KimTyun/stockLounge-frontend">Frontend git 링크</a>
<br />
<br />
<a href="https://github.com/KimTyun/stockLounge-recommend">recommend git 링크</a>

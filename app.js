const express = require('express')
const cors = require('cors')
const cookieParser = require('cookie-parser')
const { sequelize } = require('./models')
const fs = require('fs')
const dotenv = require('dotenv')

// 임시로 만든 거니 나중에 싹 다 갈아엎어도 됩니다.

// DB 연결 모듈 불러오기 (연결 상태 확인 목적)
const db = require('./config/db')

// 환경 변수 설정
dotenv.config()

const app = express()
const PORT = process.env.PORT || 4000

// 테이블 재생성 코드(테이블 변경사항이 없을 경우 주석처리)
sequelize
   .sync({ force: false, alter: false })
   .then(() => {
      console.log('DB 연결 및 모델 동기화 완료')
   })
   .catch((error) => {
      console.error('DB 연결 실패:', error)
   })

// uploads 폴더가 없을 경우 새로 생성
try {
   fs.readdirSync('uploads') //해당 폴더가 있는지 확인
} catch (error) {
   console.log('uploads 폴더가 없어 uploads 폴더를 생성합니다.')
   fs.mkdirSync('uploads') //폴더 생성
}

// 미들웨어 설정
app.use(express.json()) // JSON 형식의 요청 본문 파싱
app.use(express.urlencoded({ extended: false })) // URL-encoded 형식 파싱
app.use(cookieParser()) // 쿠키 파싱
app.use(
   cors({
      origin: 'http://localhost:5173', // 프론트엔드 URL
      credentials: true, // 쿠키를 포함한 요청 허용
   })
)

// 라우팅 설정
// Oauth 인증 관련 라우터
const authRoutes = require('./routes/auth.routes')
app.use('/api/auth', authRoutes)

// 관리자 관련 라우터
// const adminRoutes = require('./routes/admin.routes');
// app.use('/api/admin', adminRoutes);

// 서버 실행
app.listen(PORT, () => {
   console.log(`http://localhost:${PORT} 실행 중`)
})

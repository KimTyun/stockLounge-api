const express = require('express')
const cors = require('cors')
const cookieParser = require('cookie-parser')
const { sequelize } = require('./models')
const fs = require('fs')
const dotenv = require('dotenv')
dotenv.config()

// DB 연결 모듈 불러오기 (연결 상태 확인 목적)
// const db = require('./config/db')

const app = express()
const PORT = process.env.PORT || 3000

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
// 라우터 가져오기
const naverNewsRouter = require('./routes/news.js')

// 라우터 연결
app.use('/news', naverNewsRouter)

app.get('/', (req, res) => {
   res.send('서버실행중')
})

// 에러 미들웨어
app.use((err, req, res, next) => {
   const statusCode = err.status || 500
   const errorMessage = err.message || '서버 내부 오류'
   if (process.env.NODE_ENV === 'development') {
      return res.status(statusCode).json({
         success: false,
         message: errorMessage,
         stack: err.stack, // 스택 트레이스 추가
         error: err,
      })
   }
   if (process.env.NODE_ENV === 'development') {
      console.log(err)
   }

   res.status(statusCode).json({
      success: false,
      message: errorMessage,
      error: err,
   })
})

// 서버 실행
app.listen(PORT, () => {
   console.log(`http://localhost:${PORT} 실행 중`)
})

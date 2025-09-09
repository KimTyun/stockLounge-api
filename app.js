const express = require('express')
const cors = require('cors')
const cookieParser = require('cookie-parser')
const dotenv = require('dotenv')
dotenv.config()

// DB 연결 모듈 불러오기 (연결 상태 확인 목적)
// const db = require('./config/db')

const app = express()
const PORT = process.env.PORT || 3000

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

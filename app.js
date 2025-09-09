const express = require('express')
const cors = require('cors')
const cookieParser = require('cookie-parser')
const { sequelize } = require('./models')
const fs = require('fs')
const dotenv = require('dotenv')

dotenv.config()

// DB 연결 모듈 불러오기 (연결 상태 확인 목적)
// const db = require('./config/db') // 사용하지 않으면 주석 처리

const app = express()
const PORT = process.env.PORT || 8000

// 테이블 재생성 코드(테이블 변경사항이 없을 경우 주석처리)
sequelize
   .sync({ force: false, alter: false })
   .then(() => {
      console.log('DB 연결 및 모델 동기화 완료')
   })
   .catch((error) => {
      console.error('DB 연결 실패:', error)
      process.exit(1) // DB 연결 실패 시 서버 종료
   })

// uploads 폴더가 없을 경우 새로 생성
try {
   fs.readdirSync('uploads') // 해당 폴더가 있는지 확인
} catch (error) {
   console.log('uploads 폴더가 없어 uploads 폴더를 생성합니다.')
   fs.mkdirSync('uploads') // 폴더 생성
}

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

// 404 에러 핸들링 (라우트를 찾을 수 없을 때)
app.use((req, res, next) => {
   res.status(404).json({
      success: false,
      message: `경로를 찾을 수 없습니다: ${req.originalUrl}`,
   })
})

// 서버 실행
app.listen(PORT, () => {
   console.log(`서버가 http://localhost:${PORT} 에서 실행 중입니다.`)
   console.log(`환경: ${process.env.NODE_ENV || 'development'}`)
   console.log(`CORS 허용 주소: ${process.env.FRONTEND_URL || 'http://localhost:5173'}`)
})

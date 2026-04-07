const express = require('express')
const cors = require('cors')
const cookieParser = require('cookie-parser')
const { sequelize } = require('./models')
const session = require('express-session')
const fs = require('fs')
const dotenv = require('dotenv')
const path = require('path')
const morgan = require('morgan')
dotenv.config()
const passport = require('passport')
const passportConfig = require('./passport')
const swaggerDocument = require('./swagger')
const swaggerUi = require('swagger-ui-express')

const normalizeOrigin = (value) => {
   if (!value) return null
   try {
      return new URL(value).origin
   } catch {
      return String(value).replace(/\/+$/, '')
   }
}

const parseOriginList = (value) =>
   String(value || '')
      .split(',')
      .map((v) => normalizeOrigin(v.trim()))
      .filter(Boolean)

const allowedOrigins = new Set([...parseOriginList(process.env.FRONTEND_URL), ...parseOriginList(process.env.FRONTEND_APP_URL), ...parseOriginList(process.env.CORS_ORIGINS)])

// Vercel preview 도메인(배포마다 suffix가 붙는 형태)까지 허용
// 예: https://stock-lounge-frontend-xxxx.vercel.app
const vercelPreviewRegex = /^https:\/\/stock-lounge-frontend(?:-[a-z0-9-]+)?\.vercel\.app$/i

// DB 연결 모듈 불러오기 (연결 상태 확인 목적)
// const db = require('./config/db') // 사용하지 않으면 주석 처리

const app = express()
const PORT = process.env.PORT || 8000

//공용 미들웨어
app.use(
   cors({
      origin: (origin, callback) => {
         // same-origin / server-to-server / curl 등 Origin이 없는 케이스 허용
         if (!origin) return callback(null, true)

         const normalized = normalizeOrigin(origin)
         if (allowedOrigins.has(normalized)) return callback(null, true)
         if (vercelPreviewRegex.test(normalized)) return callback(null, true)

         return callback(new Error(`CORS blocked origin: ${origin}`))
      },
      credentials: true, // 쿠키, 세션 등 인증 정보 허용
      optionsSuccessStatus: 204,
   }),
   express.json(),
   express.urlencoded({ extended: false }),
   cookieParser(process.env.COOKIE_SECRET),
   morgan('dev'),
   session({
      resave: false,
      saveUninitialized: false,
      secret: process.env.COOKIE_SECRET,
      cookie: {
         httpOnly: true,
         signed: true,
         secure: process.env.NODE_ENV === 'production',
      },
   }),
   passport.initialize(),
   passport.session(),
)
passportConfig()

sequelize
   .sync({ force: false, alter: true })
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
try {
   fs.readdirSync('uploads/products')
} catch (error) {
   console.log('uploads에 products 폴더가 없어 uploads/products 폴더를 생성합니다.')
   fs.mkdirSync('uploads/products')
}
app.use('/uploads', express.static(path.join(__dirname, 'uploads')))

// 라우터 가져오기
const naverNewsRouter = require('./routes/news.js')
const boardRouter = require('./routes/board.js')
const adminRouter = require('./routes/admin.js')
const userRouter = require('./routes/users.js')
const authRouter = require('./routes/auth.js')
const rewardRouter = require('./routes/reward.js')
const reportRouter = require('./routes/report.js')
const upbitRouter = require('./routes/upbit.js')

// 라우터 연결
app.use('/news', naverNewsRouter)
app.use('/board', boardRouter)
app.use('/admin', adminRouter)
app.use('/users', userRouter)
app.use('/auth', authRouter)
app.use('/reward', rewardRouter)
app.use('/report', reportRouter)
app.use('/upbit', upbitRouter)
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument))

app.get('/', (req, res) => {
   res.send('서버실행중')
})

// 404 에러 핸들링 (라우트를 찾을 수 없을 때)
app.use((req, res, next) => {
   const error = new Error(`경로를 찾을 수 없습니다: ${req.originalUrl}`)
   error.status = 404
   next(error)
})

// 에러 미들웨어
app.use((err, req, res, next) => {
   const statusCode = err.status || 500
   const errorMessage = err.message || '서버 내부 오류'

   if (process.env.NODE_ENV === 'development') {
      console.log(err)
   }

   return res.status(statusCode).json({
      success: false,
      message: errorMessage,
      stack: process.env.NODE_ENV === 'development' ? err.stack : null, // 스택 트레이스 추가
      error: err,
   })
})

// 서버 실행
app.listen(PORT, () => {
   console.log(`서버가 http://localhost:${PORT} 에서 실행 중입니다.`)
   console.log(`환경: ${process.env.NODE_ENV || 'development'}`)
   console.log(`CORS 허용 주소: ${process.env.FRONTEND_URL || 'http://localhost:5173'}`)
})

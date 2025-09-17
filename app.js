const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const { sequelize } = require("./models");
const session = require("express-session");
const fs = require("fs");
const dotenv = require("dotenv");
const path = require("path");
const morgan = require("morgan");
dotenv.config();
const passport = require("passport");
const passportConfig = require("./passport");

// DB 연결 모듈 불러오기 (연결 상태 확인 목적)
const db = require("./config/db"); // 사용하지 않으면 주석 처리

const app = express();
const PORT = process.env.PORT || 8000;

//공용 미들웨어
app.use(
  cors({
    origin: process.env.FRONTEND_APP_URL, // 특정 주소만 request 허용
    credentials: true, // 쿠키, 세션 등 인증 정보 허용
  }),
  express.json(),
  express.urlencoded({ extended: false }),
  cookieParser(process.env.COOKIE_SECRET),
  morgan("dev"),
  session({
    resave: false,
    saveUninitialized: false,
    secret: process.env.COOKIE_SECRET,
    cookie: {
      httpOnly: true,
      signed: true,
      secure: process.env.NODE_ENV === "production",
    },
  }),
  passport.initialize(),
  passport.session()
);
passportConfig();

// 테이블 재생성 코드(테이블 변경사항이 없을 경우 주석처리)
sequelize
  .sync({ force: false, alter: false }) // 모델 변경시 테이블 강제 변경
  .then(() => {
    console.log("DB 연결 및 모델 동기화 완료");
  })
  .catch((error) => {
    console.error("DB 연결 실패:", error);
    process.exit(1); // DB 연결 실패 시 서버 종료
  });

// uploads 폴더가 없을 경우 새로 생성
try {
  fs.readdirSync("uploads"); // 해당 폴더가 있는지 확인
} catch (error) {
  console.log("uploads 폴더가 없어 uploads 폴더를 생성합니다.");
  fs.mkdirSync("uploads"); // 폴더 생성
}
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// 라우터 가져오기
const naverNewsRouter = require("./routes/news.js");
const boardRouter = require("./routes/board.js");
const adminRouter = require("./routes/admin.js");
const userRouter = require("./routes/users.js");
const authRouter = require("./routes/auth.js");

// 라우터 연결
app.use("/news", naverNewsRouter);
app.use("/board", boardRouter);
app.use("/admin", adminRouter);
app.use("/users", userRouter);
app.use("/auth", authRouter);

app.get("/", (req, res) => {
  res.send("서버실행중");
});

// 404 에러 핸들링 (라우트를 찾을 수 없을 때)
app.use((req, res, next) => {
  const error = new Error(`경로를 찾을 수 없습니다: ${req.originalUrl}`);
  error.status = 404;
  next(error);
});

// 에러 미들웨어
app.use((err, req, res, next) => {
  const statusCode = err.status || 500;
  const errorMessage = err.message || "서버 내부 오류";

  if (process.env.NODE_ENV === "development") {
    console.log(err);
  }

  return res.status(statusCode).json({
    success: false,
    message: errorMessage,
    stack: process.env.NODE_ENV === "development" ? err.stack : null, // 스택 트레이스 추가
    error: err,
  });
});

// 서버 실행
app.listen(PORT, () => {
  console.log(`서버가 http://localhost:${PORT} 에서 실행 중입니다.`);
  console.log(`환경: ${process.env.NODE_ENV || "development"}`);
  console.log(
    `CORS 허용 주소: ${process.env.FRONTEND_URL || "http://localhost:5173"}`
  );
});

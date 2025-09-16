const express = require('express')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
const { User } = require('../models')
const router = express.Router()

// 회원가입
router.post('/register', async (req, res, next) => {
   try {
      const { email, password, nickname } = req.body

      // 이메일 중복 확인
      const existingUser = await User.findOne({ where: { email } })
      if (existingUser) {
         return res.status(400).json({
            success: false,
            message: '이미 존재하는 이메일입니다.',
         })
      }

      // 비밀번호 해시화
      const hashedPassword = await bcrypt.hash(password, 10)

      // 사용자 생성
      const user = await User.create({
         email,
         password: hashedPassword,
         nickname: nickname || email.split('@')[0],
      })

      res.status(201).json({
         success: true,
         message: '회원가입이 완료되었습니다.',
         data: {
            id: user.id,
            email: user.email,
            nickname: user.nickname,
         },
      })
   } catch (error) {
      next(error)
   }
})

// 로그인
router.post('/login', async (req, res, next) => {
   try {
      const { email, password } = req.body

      // 사용자 찾기
      const user = await User.findOne({ where: { email } })
      if (!user) {
         return res.status(401).json({
            success: false,
            message: '이메일 또는 비밀번호가 올바르지 않습니다.',
         })
      }

      // 비밀번호 확인
      const isPasswordValid = await bcrypt.compare(password, user.password)
      if (!isPasswordValid) {
         return res.status(401).json({
            success: false,
            message: '이메일 또는 비밀번호가 올바르지 않습니다.',
         })
      }

      // JWT 토큰 생성
      const token = jwt.sign(
         {
            id: user.id,
            email: user.email,
            nickname: user.nickname,
         },
         process.env.JWT_SECRET || 'fallback_secret',
         { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
      )

      // 쿠키에 토큰 설정
      res.cookie('token', token, {
         httpOnly: true,
         secure: process.env.NODE_ENV === 'production',
         sameSite: 'lax',
         maxAge: 7 * 24 * 60 * 60 * 1000, // 7일
      })

      res.json({
         success: true,
         message: '로그인 성공',
         data: {
            id: user.id,
            email: user.email,
            nickname: user.nickname,
         },
      })
   } catch (error) {
      next(error)
   }
})

// 로그아웃
router.get('/logout', (req, res) => {
   res.clearCookie('token')
   res.json({
      success: true,
      message: '로그아웃 성공',
   })
})

// 인증 상태 확인
router.get('/status', async (req, res, next) => {
   try {
      const token = req.cookies.token

      if (!token) {
         return res.json({
            isAuthenticated: false,
            user: null,
         })
      }

      // 토큰 검증
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback_secret')

      // 사용자 정보 조회
      const user = await User.findByPk(decoded.id, {
         attributes: ['id', 'email', 'nickname', 'created_at'],
      })

      if (!user) {
         res.clearCookie('token')
         return res.json({
            isAuthenticated: false,
            user: null,
         })
      }

      res.json({
         isAuthenticated: true,
         user: {
            id: user.id,
            email: user.email,
            nickname: user.nickname,
            created_at: user.created_at,
         },
      })
   } catch (error) {
      res.clearCookie('token')
      res.json({
         isAuthenticated: false,
         user: null,
      })
   }
})

module.exports = router


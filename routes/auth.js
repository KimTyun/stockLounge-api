const express = require('express')
const router = express.Router()
require('dotenv').config()
const passport = require('passport')
const { isLoggedIn } = require('../middleware/middleware')

//로그인 상태확인
router.get('/status', async (req, res, next) => {
   try {
      if (req.isAuthenticated()) {
         res.json({
            success: true,
            isLoggedIn: true,
            data: {
               email: req.user.email,
               name: req.user.name,
               is_ban: req.user.is_ban,
            },
         })
      } else {
         res.json({
            success: true,
            isLoggedIn: false,
         })
      }
   } catch (error) {
      next(error)
   }
})

//로그아웃
router.post('/logout', isLoggedIn, (req, res, next) => {
   try {
      req.logout((err) => {
         if (err) return next(err)

         req.session.destroy((destroyErr) => {
            if (destroyErr) return next(destroyErr)

            res.clearCookie('connect.sid')
            res.json({ success: true })
         })
      })
   } catch (error) {
      next(error)
   }
})

// --- 구글 라우트 ---
router.get('/google', passport.authenticate('google', { scope: ['profile', 'email'] }))

router.get('/google/callback', passport.authenticate('google', { failureRedirect: '/login' }), (req, res) => {
   // 인증 성공 시 프론트엔드 도메인으로 리다이렉트
   res.redirect(process.env.FRONTEND_APP_URL)
})

// --- 카카오 라우트 ---
router.get('/kakao', passport.authenticate('kakao'))

router.get('/kakao/callback', passport.authenticate('kakao', { failureRedirect: '/login' }), (req, res) => {
   // 카카오도 팝업 대신 프론트엔드로 바로 리다이렉트
   res.redirect(process.env.FRONTEND_APP_URL)
})

module.exports = router

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

//구글 로그인(GET /api/auth/google)
router.get(
   '/google',
   passport.authenticate('google', {
      scope: ['profile', 'email'],
      prompt: 'select_account',
   })
)

//구글 로그인 콜백
router.get('/google/callback', passport.authenticate('google', { failureRedirect: `${process.env.FRONTEND_APP_URL}?error=google_login_failed` }), (req, res) => {
   res.redirect(`${process.env.FRONTEND_APP_URL}/`)
})

//카카오 로그인(GET /api/auth/kakao)
router.get('/kakao', passport.authenticate('kakao'))

//카카오 로그인 콜백 (GET /api/auth/kakao/callback)
router.get('/kakao/callback', passport.authenticate('kakao', { failureRedirect: `${process.env.FRONTEND_APP_URL}/login` }), (req, res) => {
   res.send('<script>window.close();</script>')
})

module.exports = router

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
   res.send(`
      <script>
         window.opener.postMessage(
            { success: true, provider: 'google', redirectUrl: '/' }, 
            'http://localhost:5173'
         );
         window.close();
      </script>
   `)
})

router.get('/kakao', passport.authenticate('kakao'))

// --- 카카오 콜백 ---
router.get('/kakao/callback', passport.authenticate('kakao', { failureRedirect: '/login' }), (req, res) => {
   res.send(`
      <script>
         window.opener.postMessage(
            { success: true, provider: 'kakao', redirectUrl: '/' }, 
            'http://localhost:5173'
         );
         window.close();
      </script>
   `)
})

module.exports = router

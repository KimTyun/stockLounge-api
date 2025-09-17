const express = require('express')
const router = express.Router()
require('dotenv').config()
const passport = require('passport')

router.get('/status', (req, res, next) => {
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

//구글 로그인
router.get(
   '/google/login',
   passport.authenticate('google', {
      scope: ['profile', 'email'],
      prompt: 'select_account',
   })
)

//구글 로그인 콜백
router.get('/google/callback', passport.authenticate('google', { failureRedirect: `${process.env.FRONTEND_APP_URL}?error=google_login_failed` }), (req, res) => {
   console.log('[passport] 구글 로그인 성공, 사용자:', req.user)
   res.redirect(`${process.env.FRONTEND_APP_URL}/login/success/google`)
})

module.exports = router

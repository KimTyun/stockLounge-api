const express = require('express')
const router = express.Router()
require('dotenv').config()
const passport = require('passport')

router.get(
   '/google/login',
   passport.authenticate('google', {
      scope: ['profile', 'email'],
      prompt: 'select_account',
   })
)

router.get('/google/callback', passport.authenticate('google', { failureRedirect: `${process.env.FRONTEND_APP_URL}?error=google_login_failed` }), (req, res) => {
   console.log('[passport] 구글 로그인 성공, 사용자:', req.user)
   res.redirect(`${process.env.FRONTEND_APP_URL}/login/success/google`)
})

module.exports = router

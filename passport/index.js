const passport = require('passport')
const google = require('./googleStrategy')
const kakao = require('./kakaoStrategy')
const User = require('../models/user')

module.exports = () => {
   passport.serializeUser((user, done) => {
      done(null, user.id)
   })

   passport.deserializeUser(async (id, done) => {
      try {
         const user = await User.findByPk(id)
         done(null, user) // 조회된 정보는 req.user에서 사용할 수 있게 됨
      } catch (error) {
         done(error)
      }
   })

   google()
   kakao()
}

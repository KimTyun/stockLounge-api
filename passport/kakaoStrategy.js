require('dotenv').config()
const KakaoStrategy = require('passport-kakao').Strategy
const User = require('../models/user')
const passport = require('passport')

module.exports = () => {
   passport.use(
      new KakaoStrategy(
         {
            // 카카오에서 발급받은 REST API 키
            clientID: process.env.KAKAO_CLIENT_ID,
            // 카카오 로그인 후 리디렉션될 URL
            callbackURL: process.env.KAKAO_CALLBACK_URL,
         },
         // 카카오로부터 인증 결과를 받은 후 실행될 콜백 함수
         async (accessToken, refreshToken, profile, done) => {
            try {
               // 카카오 프로필에서 받은 이메일로 우리 DB에 사용자가 있는지 조회
               const existingUser = await User.findOne({
                  where: {
                     provider: 'KAKAO',
                     email: profile._json?.kakao_account?.email,
                  },
               })

               // 이미 가입된 사용자인 경우, 해당 사용자 정보를 반환
               if (existingUser) {
                  return done(null, existingUser)
               }

               // 가입되지 않은 사용자인 경우, 새로 생성(회원가입)
               const newUser = await User.create({
                  email: profile._json?.kakao_account?.email,
                  name: profile.displayName,
                  profile_img: profile._json?.properties?.profile_image,
                  provider: 'KAKAO',
                  roles: 'USER',
               })

               // 새로 생성된 사용자 정보를 반환
               return done(null, newUser)
            } catch (error) {
               console.error('Kakao Strategy Error:', error)
               return done(error)
            }
         }
      )
   )
}

require('dotenv').config()
const KakaoStrategy = require('passport-kakao').Strategy
const { sequelize, Reward, RewardRecord } = require('../models')
const User = require('../models/user')
const passport = require('passport')

module.exports = () => {
   passport.use(
      new KakaoStrategy(
         {
            // 카카오에서 발급받은 REST API 키
            clientID: process.env.KAKAO_CLIENT_ID,
            clientSecret: process.env.KAKAO_CLIENT_SECRET,
            // 카카오 로그인 후 리디렉션될 URL
            callbackURL: process.env.KAKAO_CALLBACK_URL,
         },
         // 카카오로부터 인증 결과를 받은 후 실행될 콜백 함수
         async (accessToken, refreshToken, profile, done) => {
            const transaction = await sequelize.transaction()
            try {
               // 카카오 프로필에서 받은 이메일로 우리 DB에 사용자가 있는지 조회
               const existingUser = await User.findOne({
                  where: {
                     provider: 'KAKAO',
                     provide_Id: profile.id,
                  },
                  transaction,
               })

               // 이미 가입된 사용자인 경우, 해당 사용자 정보를 반환
               if (existingUser) {
                  await transaction.commit()
                  return done(null, existingUser)
               }

               // 가입되지 않은 사용자인 경우, 새로 생성(회원가입)
               const newUser = await User.create(
                  {
                     email: profile._json?.kakao_account?.email || 'null',
                     provide_Id: profile.id,
                     name: profile.displayName,
                     profile_img: profile._json?.properties?.profile_image,
                     provider: 'KAKAO',
                     roles: 'USER',
                     wallet: '4doURxzK113dN99acdcaLtejiD166dRess72', //가상 가상화폐지갑
                  },
                  { transaction }
               )

               await Reward.create(
                  {
                     id: newUser.id,
                     accumulated_point: 100,
                     point: 100,
                     coin: 0,
                  },
                  { transaction }
               )

               await RewardRecord.create(
                  {
                     user_id: newUser.id,
                     change: 100,
                     reason: '첫 가입 보너스',
                  },
                  { transaction }
               )

               // 새로 생성된 사용자 정보를 반환
               await transaction.commit()
               return done(null, newUser)
            } catch (error) {
               await transaction.rollback()
               console.error('Kakao Strategy Error:', error)
               return done(error)
            }
         }
      )
   )
}

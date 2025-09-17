require('dotenv').config()
const GoogleStrategy = require('passport-google-oauth20').Strategy
const { sequelize, Reward, User, RewardRecord } = require('../models')
const passport = require('passport')

module.exports = () => {
   passport.use(
      new GoogleStrategy(
         {
            clientID: process.env.GOOGLE_CLIENT_ID,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET,
            callbackURL: process.env.GOOGLE_CALLBACK_URL,
            passReqToCallback: true,
         },
         async (req, accessToken, refreshToken, profile, done) => {
            // 사용자 DB 조회/등록 로직
            const transaction = await sequelize.transaction()
            try {
               const existingUser = await User.findOne({
                  where: {
                     provider: 'GOOGLE',
                     email: profile?.emails[0]?.value,
                  },
                  transaction,
               })

               if (existingUser) {
                  return done(null, existingUser)
               }
               const newUser = await User.create(
                  {
                     email: profile?.emails[0]?.value,
                     name: profile.displayName,
                     profile_img: profile?.photos[0]?.value,
                     provider: 'GOOGLE',
                     roles: 'USER',
                     wallet: '1YoURbKATcoiN99acWaLtejiDVDdRess72', //가상 가상화폐지갑
                  },
                  { transaction }
               )

               const newUserReward = await Reward.create(
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

               await transaction.commit()
               return done(null, newUser)
            } catch (error) {
               await transaction.rollback()
               return done(error)
            }
         }
      )
   )
}

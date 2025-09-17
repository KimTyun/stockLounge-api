const express = require('express')
const { RewardItem, User, Reward, sequelize, RewardRecord } = require('../models')
const { isLoggedIn } = require('../middleware/middleware')
const router = express.Router()

//리워드 리스트 가져오기
router.get('/', async (req, res, next) => {
   try {
      const rewards = await RewardItem.findAll()

      res.json({
         success: true,
         data: rewards,
      })
   } catch (error) {
      next(error)
   }
})

//코인 교환하기
router.put('/coin', isLoggedIn, async (req, res, next) => {
   const transaction = await sequelize.transaction()
   try {
      const userPoint = await Reward.findOne({ where: { id: req.user.id }, transaction })
      const count = req.body.count
      if (userPoint.point < count * 1000) {
         const error = new Error('포인트가 부족합니다.')
         error.status = 400
         throw error
      }
      await userPoint.update(
         {
            coin: userPoint.coin + count,
            point: userPoint.point - count * 1000,
         },
         { transaction }
      )
      await RewardRecord.create(
         {
            change: -(count * 1000),
            reason: 'SLC 교환',
            user_id: req.user.id,
         },
         { transaction }
      )

      await transaction.commit()
      res.json({
         success: true,
      })
   } catch (error) {
      await transaction.rollback()
      next(error)
   }
})

//리워드 교환하기
router.put('/reward', isLoggedIn, async (req, res, next) => {
   const transaction = await sequelize.transaction()
   try {
      const userPoint = await Reward.findOne({ where: { id: req.user.id }, transaction })
      const rewardId = req.body.rewardId
      const reward = await RewardItem.findByPk(rewardId, { transaction })
      if (!reward) {
         const error = new Error('해당 리워드를 찾을 수 없습니다.')
         error.status = 404
         throw error
      }

      if (userPoint.point < reward.point) {
         const error = new Error('포인트가 부족합니다.')
         error.status = 400
         throw error
      }

      await userPoint.update(
         {
            point: userPoint.point - reward.point,
         },
         { transaction }
      )

      await RewardRecord.create(
         {
            change: -reward.point,
            reason: '상품 교환',
            reward_item_id: rewardId,
            user_id: req.user.id,
         },
         { transaction }
      )
      await transaction.commit()
      res.json({
         success: true,
      })
   } catch (error) {
      await transaction.rollback()
      next(error)
   }
})

module.exports = router

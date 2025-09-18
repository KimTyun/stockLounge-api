const express = require('express')
const { RewardItem, User, Reward, sequelize, RewardRecord } = require('../models')
const { isLoggedIn } = require('../middleware/middleware')
const router = express.Router()
const dayjs = require('dayjs')
const { Op } = require('sequelize')

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
      const rewardId = req.body.rewardId
      const reward = await RewardItem.findByPk(rewardId, { transaction, lock: transaction.LOCK.UPDATE })
      if (!reward) {
         const error = new Error('해당 리워드를 찾을 수 없습니다.')
         error.status = 404
         throw error
      }

      if (reward.stock < 1) {
         const error = new Error('상품 재고가 소진되었습니다.')
         error.status = 400
         throw error
      }

      await reward.update(
         {
            stock: reward.stock - 1,
         },
         { transaction }
      )

      const userPoint = await Reward.findOne({ where: { id: req.user.id }, transaction, lock: transaction.LOCK.UPDATE })

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

//포인트 받기
router.put('/get', isLoggedIn, async (req, res, next) => {
   const transaction = await sequelize.transaction()
   try {
      const { type } = req.body
      let point
      //site_settings 설계가 구현되면 setting값에 따라 포인트 지급, 지금은 고정값 지급
      const dailyLimitPoint = 1000
      switch (type) {
         case 'board':
            point = 100
            break
         case 'comment':
            point = 20
            break

         default:
            const error = new Error('잘못된 type입니다.')
            error.status = 400
            throw error
      }

      const startOfDay = dayjs().startOf('day').toDate()
      const endOfDay = dayjs().endOf('day').toDate()

      const todayTotal =
         (await RewardRecord.sum('change', {
            where: {
               user_id: req.user.id,
               createdAt: { [Op.between]: [startOfDay, endOfDay] },
               change: { [Op.gt]: 0 },
            },
            transaction,
         })) || 0

      if (todayTotal + point > dailyLimitPoint) {
         const error = new Error(`하루 최대 ${dailyLimitPoint}포인트까지만 받을 수 있습니다.`)
         error.status = 403
         throw error
      }

      const reward = await Reward.findByPk(req.user.id, { transaction, lock: transaction.LOCK.UPDATE })
      await reward.update(
         {
            point: reward.point + point,
            accumulated_point: reward.accumulated_point + point,
         },
         { transaction }
      )

      await RewardRecord.create(
         {
            change: point,
            reason: `${type === 'board' ? '게시글' : '댓글'} 작성`,
            user_id: req.user.id,
         },
         { transaction }
      )

      res.json({
         success: true,
      })
   } catch (error) {
      next(error)
   }
})

module.exports = router

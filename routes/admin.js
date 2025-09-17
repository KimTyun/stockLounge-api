const express = require('express')
const router = express.Router()
const { BanWord, Reward, Report, Sanction } = require('../models')
const { User, Board, Ban } = require('../models')
const { sequelize } = require('../models/index.js')
const { isAdmin } = require('../middleware/middleware.js')
const { Op } = require('sequelize')
const moment = require('moment')

router.use(isAdmin)

// 대시보드
router.get('/dashboard-data', async (req, res) => {
   try {
      //총 회원수, 게시글, 오늘의 활동 등 집계
      const totalUsers = await User.count()
      const totalPosts = await Board.count()

      const dashboardData = {
         totalUsers,
         totalPosts,
         recentActivities: [],
         adminAlerts: [],
      }
      res.status(200).json({ dashboardData })
   } catch (error) {
      next(error)
   }
})

// 특정 이용자 정보 조회
router.get('/user/:id', async (req, res) => {
   try {
      const user = await User.findByPk(req.params.id, {
         attributes: ['id', 'email', 'name', 'age', 'roles', 'is_ban', 'provider', 'createdAt'],
      })
      if (!user) {
         return res.status(404).json({ error: '사용자를 찾을 수 없습니다.' })
      }
      res.status(200).json({ user })
   } catch (error) {
      next(error)
   }
})

// 이용자 제재
router.put('/user/:id/ban', async (req, res, next) => {
   const transaction = await sequelize.transaction()
   try {
      const { is_ban, reason = '관리자 권한에 의한 계정 정지' } = req.body
      const user = await User.findByPk(req.params.id, { transaction })

      if (!user) {
         await transaction.rollback()
         return res.status(404).json({ error: '사용자를 찾을 수 없습니다.' })
      }

      await user.update({ is_ban }, { transaction })

      // 유저 밴 기록
      if (is_ban) {
         await Sanction.create(
            {
               type: 'ban',
               reason: reason,
               sanctionedUserId: user.id,
               adminId: req.user.id,
            },
            { transaction }
         )
      }

      await transaction.commit()
      res.status(200).json({ message: '사용자의 제재 상태가 성공적으로 변경됐습니다.' })
   } catch (error) {
      await transaction.rollback()
      next(error)
   }
})

// 게시글 삭제
router.delete('/boards/:id', async (req, res) => {
   const transaction = await sequelize.transaction()
   try {
      const board = await Board.findByPk(req.params.id, { transaction })
      if (!board) {
         await transaction.rollback()
         return res.status(404).json({ error: '게시글을 찾을 수 없습니다.' })
      }
      await board.destroy({ transaction })
      await transaction.commit()
      res.status(200).json({ message: '게시글이 성공적으로 삭제되었습니다.' })
   } catch (error) {
      await transaction.rollback()
      next(error)
   }
})

// 금칙어 규칙 목록
router.get('/ban-words', async (req, res, next) => {
   try {
      const banWords = await Ban.findAll({
         include: [
            {
               model: User,
               attributes: ['email', 'name'],
            },
         ],
      })
      res.status(200).json({ banWords })
   } catch (error) {
      next(error)
   }
})

// 금칙어 추가
router.post('/ban-words', async (req, res, next) => {
   try {
      const { word } = req.body
      const adminId = req.user.id
      if (!pattern) {
         return res.status(400).json({ error: '등록할 금칙어를 입력해주세요.' })
      }

      const newBanWord = await Ban.create({ pattern, description, admin_id: adminId })
      res.status(201).json({ message: '금칙어가 성공적으로 추가되었습니다.', banWord: newBanWord })
   } catch (error) {
      next(error)
   }
})

// 금칙어 삭제
router.delete('/ban-words/:id', async (req, res, next) => {
   try {
      const banWord = await BanWord.findByPk(req.params.id)
      if (!banWord) {
         return res.status(404).json({ error: '금칙어를 찾을 수 없습니다.' })
      }
      await banWord.destroy()
      res.status(200).json({ message: '금칙어를 삭제했습니다.' })
   } catch (error) {
      next(error)
   }
})

// 사이트 관리
router.get('/settings', async (req, res, next) => {
   try {
      const settings = await SiteSettings.findOne()
      if (!settings) {
         return res.status(404).json({ error: '사이트 설정을 찾을 수 없습니다.' })
      }
      res.status(200).json({ settings })
   } catch (error) {
      next(error)
   }
})

// 사이트 설정 업뎃
router.put('/settings', async (req, res, next) => {
   try {
      // DB에 생성데이터 있나 확인, 없으면 생성 있으면 업뎃
      const [settings, created] = await SiteSettings.findOrCreate({
         where: { id: 1 },
         defaults: req.body,
      })

      if (!created) {
         await settings.update(req.body)
      }
      res.status(200).json({ message: '사이트 설정이 성공적으로 저장됐습니다.', settings })
   } catch (error) {
      next(error)
   }
})

// 교환품 생성
router.post('/rewards', async (req, res, next) => {
   try {
      const { name, points, stock } = req.body
      const pointsNum = Number(points)
      const stockNum = Number(stock)
      if (!name || !Number.isFinite(pointsNum) || pointsNum < 0 || !Number.isFinite(stockNum) || stockNum < 0) {
         return res.status(400).json({ error: '필수 정보를 올바르게 입력해주세요.' })
      }
      const newReward = await Reward.create({ name, points: pointsNum, stock: stockNum })
      res.status(201).json({ message: '교환품이 추가되었습니다.', reward: newReward })
   } catch (error) {
      next(error)
   }
})

// 교환품 수정
router.put('/rewards/:id', async (req, res, next) => {
   try {
      const reward = await Reward.findByPk(req.params.id)
      if (!reward) {
         return res.status(404).json({ error: '교환품을 찾을 수 없습니다.' })
      }
      await reward.update(req.body)
      res.status(200).json({ message: '교환품이 성공적으로 업데이트되었습니다.', reward })
   } catch (error) {
      next(error)
   }
})

// 교환품 삭제
router.delete('/rewards/:id', async (req, res, next) => {
   try {
      const reward = await Reward.findByPk(req.params.id)
      if (!reward) {
         return res.status(404).json({ error: '교환품을 찾을 수 없습니다.' })
      }
      await reward.destroy()
      res.status(200).json({ message: '교환품을 삭제했습니다.' })
   } catch (error) {
      next(error)
   }
})

// 통계
router.get('/statistics', async (req, res, next) => {
   try {
      const { period = 'week' } = req.query
      const now = new Date()
      let startDate

      if (period === 'month') {
         startDate = new Date(now.getFullYear(), now.getMonth() - 1, now.getDate())
      } else if (period === 'year') {
         startDate = new Date(now.getFullYear() - 1, now.getMonth(), now.getDate())
      } else {
         startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 7)
      }

      // 주요 통계
      const newUsers = await User.count({
         where: {
            createdAt: { [Op.gte]: startDAte },
         },
      })
      const newPosts = await Post.count({
         where: {
            createdAt: { [Op.gte]: startDAte },
         },
      })
      const newComments = await Comment.count({
         where: {
            createdAt: { [Op.gte]: startDAte },
         },
      })
      const newReports = await Report.count({
         where: {
            createdAt: { [Op.gte]: startDAte },
         },
      })

      // 인기 게시글 5개
      const popularPosts = await Board.findAll({
         limit: 5,
         order: [
            ['view_count', 'DESC'],
            ['like_count', 'DESC'],
         ],
         attributes: ['title', 'view_count', 'like_count'],
         include: [
            {
               model: Comment,
               attributes: [[sequelize.fn('COUNT', sequelize.col('Comments.id')), 'comment_count']],
            },
         ],
         group: ['Board.id'],
         raw: true,
         subQuery: false,
      })
      // 이용량 많은 사용자 5명
      const activeUsers = await User.findAll({
         attributes: [
            ['name', 'nickname'], // 닉네임 필드명 수정
            [sequelize.fn('COUNT', sequelize.col('Boards.id')), 'posts'], // 게시글 수
            [sequelize.literal('(SELECT COUNT(*) FROM comments WHERE comments.user_id = `User`.id)'), 'comments'], // 댓글 수
            [sequelize.literal('0'), 'points'], // 포인트 데이터가 없으므로 0으로 임시 설정
         ],
         include: [
            {
               model: Board,
               attributes: [],
            },
         ],
         group: ['User.id'],
         order: [
            [sequelize.literal('posts + comments'), 'DESC'], // 게시글 + 댓글 합산으로 정렬
         ],
         limit: 5,
         raw: true,
         subQuery: false,
      })
      // 카테고리별 게시글 분포
      const categoryDistribution = await Board.findAll({
         attributes: [
            [sequelize.col('Category.category'), 'category_name'],
            [sequelize.fn('COUNT', sequelize.col('Board.id')), 'post_count'],
         ],
         include: [
            {
               model: Category,
               attributes: [],
            },
         ],
         group: ['category_name'],
         raw: true,
         subQuery: false,
      })
      // 시간대별 활동 분포
      const hourlyActivity = await Board.findAll({
         attributes: [
            [sequelize.fn('HOUR', sequelize.col('createdAt')), 'hour'],
            [sequelize.fn('COUNT', sequelize.col('id')), 'post_count'],
         ],
         group: [sequelize.fn('HOUR', sequelize.col('createdAt'))],
         raw: true,
         subQuery: false,
      })

      res.status(200).json({
         mainStats: {
            newUsers,
            newPosts,
            newComments,
            newReports,
         },
         popularPosts,
         activeUsers,
         categoryDistribution,
         hourlyActivity,
      })
   } catch (error) {
      next(error)
   }
})

module.exports = router

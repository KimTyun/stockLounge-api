const express = require('express')
const router = express.Router()
const { User, Board, Ban, Product, Report, Sanction, Comment, Category, SiteSettings } = require('../models')
const { sequelize } = require('../models/index.js')
const db = require('../models')
const { isAdmin } = require('../middleware/middleware.js')
const { Op } = require('sequelize')
const dayjs = require('dayjs')
const multer = require('multer')

const upload = multer({
   dest: 'uploads/products', // 이미지를 저장할 폴더
})

router.use(isAdmin)

// 대시보드
router.get('/dashboard-data', async (req, res, next) => {
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

// 금지어 목록
router.get('/ban-words', async (req, res, next) => {
   try {
      const banWords = await Ban.findAll({
         include: [
            {
               model: User,
               as: 'Admin', // Ban 모델에 설정된 'as' 값 사용
               attributes: ['email', 'name'],
            },
         ],
      })
      res.status(200).json({ banWords })
   } catch (error) {
      next(error)
   }
})

// 금지어 추가
router.post('/ban-words', async (req, res, next) => {
   try {
      const { word } = req.body
      const adminId = req.user.id

      const newBanEntry = await Ban.create({
         pattern: word,
         admin_id: adminId,
      })

      res.status(201).json(newBanEntry)
   } catch (error) {
      if (error.name === 'SequelizeUniqueConstraintError') {
         return res.status(409).json({ message: '이미 등록된 금지어입니다.' })
      }
      console.error(error)
      next(error)
   }
})

// 금지어 삭제
router.delete('/ban-words/:id', async (req, res, next) => {
   try {
      const { id } = req.params

      if (!id) {
         return res.status(400).json({ message: 'ID가 누락되었습니다.' })
      }

      const result = await Ban.destroy({ where: { id: id } })

      if (result === 0) {
         return res.status(404).json({ message: '금지어를 찾을 수 없습니다.' })
      }

      res.status(204).end()
   } catch (error) {
      next(error)
   }
})

// 사이트 관리
router.get('/settings', async (req, res, next) => {
   try {
      const settingsList = await SiteSettings.findAll()
      if (settingsList.length === 0) {
         const defaults = [
            { key: 'siteName', value: 'StockLounge' },
            { key: 'siteDescription', value: '모두가 즐기는 코인 커뮤니티 플랫폼' },
            { key: 'maintenanceMode', value: 'false' },
            { key: 'allowRegistration', value: 'true' },
            { key: 'pointsPerPost', value: '10' },
            { key: 'pointsPerComment', value: '5' },
            { key: 'pointsPerLike', value: '1' },
            { key: 'coinExchangeRate', value: '100' },
            { key: 'maxPostsPerDay', value: '10' },
            { key: 'maxCommentsPerDay', value: '20' },
            { key: 'requireEmailVerification', value: 'false' },
            { key: 'enableSocialLogin', value: 'true' },
         ]
         await SiteSettings.bulkCreate(defaults)
         const newSettings = await SiteSettings.findAll()
         return res.status(200).json({ settings: newSettings })
      }
      res.status(200).json({ settings: settingsList })
   } catch (error) {
      console.error('Error in /settings:', error.message)
      next(error)
   }
})

// 사이트 설정 업뎃
router.put('/settings', async (req, res, next) => {
   const transaction = await sequelize.transaction()
   try {
      const updates = req.body

      for (const key in updates) {
         if (Object.prototype.hasOwnProperty.call(updates, key)) {
            await SiteSettings.update(
               { value: String(updates[key]) },
               {
                  where: { key: key },
                  transaction,
               }
            )
         }
      }
      await transaction.commit()
      res.status(200).json({ message: '사이트 설정이 성공적으로 저장됐습니다.' })
   } catch (error) {
      await transaction.rollback()
      next(error)
   }
})

// 교환품 목록 불러오기
router.get('/products', async (req, res, next) => {
   try {
      const products = await Product.findAll({ raw: true })
      res.status(200).json({ products })
   } catch (error) {
      next(error)
   }
})

// 교환품 생성
router.post('/products', upload.single('product_img'), async (req, res, next) => {
   try {
      const { name, points, stock } = req.body
      const product_img = req.file ? `/uploads/products/${req.file.filename}` : null

      const adminId = req.user.id

      const pointsNum = Number(points)
      const stockNum = Number(stock)

      if (!name || !Number.isFinite(pointsNum) || pointsNum < 0 || !Number.isFinite(stockNum) || stockNum < 0) {
         return res.status(400).json({ error: '필수 정보를 올바르게 입력해주세요.' })
      }

      const newProduct = await Product.create({
         name,
         price: pointsNum,
         stock: stockNum,
         user_id: adminId,
         product_img,
      })

      res.status(201).json({ message: '교환품이 추가되었습니다.', product: newProduct })
   } catch (error) {
      next(error)
   }
})

// 교환품 수정
router.put('/products/:id', async (req, res, next) => {
   try {
      const product = await Product.findByPk(req.params.id)
      if (!product) {
         return res.status(404).json({ error: '교환품을 찾을 수 없습니다.' })
      }
      await product.update(req.body)
      res.status(200).json({ message: '교환품이 성공적으로 업데이트되었습니다.', product })
   } catch (error) {
      next(error)
   }
})

// 교환품 삭제
router.delete('/products/:id', async (req, res, next) => {
   try {
      const product = await Product.findByPk(req.params.id)
      if (!product) {
         return res.status(404).json({ error: '교환품을 찾을 수 없습니다.' })
      }
      await product.destroy()
      res.status(200).json({ message: '교환품을 삭제했습니다.' })
   } catch (error) {
      next(error)
   }
})

// 통계
router.get('/statistics', async (req, res, next) => {
   try {
      const { period = 'week' } = req.query
      const now = dayjs()
      let startDate

      if (period === 'month') {
         startDate = now.subtract(1, 'month').toDate()
      } else if (period === 'year') {
         startDate = now.subtract(1, 'year').toDate()
      } else {
         startDate = now.subtract(7, 'day').toDate()
      }

      // 주요 통계
      const newUsers = await User.count({ where: { createdAt: { [Op.gte]: startDate } } })
      const newPosts = await Board.count({ where: { createdAt: { [Op.gte]: startDate } } })
      const newComments = await Comment.count({ where: { createdAt: { [Op.gte]: startDate } } })
      const newReports = await Report.count({ where: { createdAt: { [Op.gte]: startDate } } })

      // 인기 게시글 5개
      const popularPosts = await Board.findAll({
         attributes: ['title', 'view_count', 'like_count'],
         order: [
            ['view_count', 'DESC'],
            ['like_count', 'DESC'],
         ],
         limit: 5,
      })
      // 이용량 많은 사용자 5명
      const activeUsers = await User.findAll({
         attributes: [
            ['name', 'nickname'],
            [sequelize.fn('COUNT', sequelize.col('Boards.id')), 'postCount'],
            [sequelize.literal('(SELECT COUNT(*) FROM comments WHERE comments.user_id = `User`.id)'), 'commentCount'],
         ],
         include: [{ model: Board, attributes: [] }],
         group: ['User.id'],
         order: [[sequelize.literal('postCount + commentCount'), 'DESC']],
         limit: 5,
         raw: true,
         subQuery: false,
      })

      // 카테고리별
      const categoryBest = await Board.findAll({
         attributes: [
            [sequelize.col('Category.category'), 'category_name'],
            [sequelize.fn('COUNT', sequelize.col('Board.id')), 'post_count'],
         ],
         include: [{ model: Category, attributes: [] }],
         group: ['Category.category'],
         raw: true,
         subQuery: false,
      })

      // 시간대별
      const hourAct = await Board.findAll({
         attributes: [
            [sequelize.fn('HOUR', sequelize.col('createdAt')), 'hour'],
            [sequelize.fn('COUNT', sequelize.col('id')), 'post_count'],
         ],
         where: {
            createdAt: { [Op.gte]: dayjs().startOf('day').toDate() }, // dayjs 사용
         },
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
         categoryBest,
         hourAct,
      })
   } catch (error) {
      next(error)
   }
})

module.exports = router

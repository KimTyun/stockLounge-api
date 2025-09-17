const express = require('express')
const router = express.Router()
const { User, Board, Ban, Product, Reward, Report, Sanction, SiteSettings, Comment, Category } = require('../models')
const { sequelize } = require('../models/index.js')
const { isAdmin, isLoggedIn } = require('../middleware/middleware.js')
const { Op } = require('sequelize')
const multer = require('multer') // multer 불러오기

router.use(isAdmin)

const storage = multer.diskStorage({
   destination: (req, file, cb) => {
      cb(null, 'uploads/products') // 파일이 저장될 경로 설정
   },
   filename: (req, file, cb) => {
      cb(null, `${Date.now()}-${file.originalname}`) // 저장될 파일명 설정
   },
})

const upload = multer({ storage: storage })

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

// 사이트 관리
router.get('/settings', async (req, res, next) => {
   try {
      console.log('SiteSettings model:', SiteSettings) // 디버깅용

      if (!SiteSettings) {
         throw new Error('SiteSettings 모델이 정의되지 않았습니다.')
      }

      const settingsRows = await SiteSettings.findAll()

      const settings = {}
      settingsRows.forEach((row) => {
         settings[row.key] = row.value
      })

      // 기본 설정이 없으면 기본값 제공
      const defaultSettings = {
         siteName: 'StockLounge',
         siteDescription: '코인차트 커뮤니티 플랫폼',
         maintenanceMode: 'false',
         allowRegistration: 'true',
         requireEmailVerification: 'true',
         pointsPerPost: '10',
         pointsPerComment: '5',
         pointsPerLike: '1',
         coinExchangeRate: '1000',
         maxPostsPerDay: '20',
         maxCommentsPerDay: '50',
         enableSocialLogin: 'true',
         enableNotifications: 'true',
      }

      const finalSettings = { ...defaultSettings, ...settings }

      res.status(200).json({ data: finalSettings })
   } catch (error) {
      next(error)
   }
})

// 사이트 설정 업뎃
router.put('/settings', async (req, res, next) => {
   const transaction = await sequelize.transaction()
   try {
      const settingsData = req.body

      // 각 설정을 key-value로 저장
      for (const [key, value] of Object.entries(settingsData)) {
         await SiteSettings.upsert(
            {
               key: key,
               value: String(value),
            },
            { transaction }
         )
      }

      await transaction.commit()
      res.status(200).json({ message: '사이트 설정이 성공적으로 저장됐습니다.' })
   } catch (error) {
      await transaction.rollback()
      next(error)
   }
})

// 금지어 목록
router.get('/ban-words', async (req, res, next) => {
   try {
      const banWords = await Ban.findAll({
         attributes: ['id', 'pattern'],
         order: [['id', 'DESC']],
      })

      res.status(200).json({ data: banWords })
   } catch (error) {
      next(error)
   }
})

// 금지어 추가
router.post('/ban-words', async (req, res, next) => {
   const { pattern } = req.body

   if (!pattern || pattern.trim() === '') {
      return res.status(400).json({ message: '금지어를 입력해주세요.' })
   }

   try {
      console.log('req.user:', req.user) // 디버깅용

      // req.user가 없으면 기본값 사용
      const adminId = req.user?.id || 1 // 임시로 1 사용

      const existingWord = await Ban.findOne({ where: { pattern: pattern.trim() } })
      if (existingWord) {
         return res.status(409).json({ message: '이미 등록된 금지어입니다.' })
      }

      const newBanWord = await Ban.create({
         pattern: pattern.trim(),
         admin_id: adminId,
      })

      res.status(201).json({ data: newBanWord })
   } catch (error) {
      next(error)
   }
})

// 금지어 삭제
router.delete('/ban-words/:id', async (req, res, next) => {
   try {
      const { id } = req.params

      const wordToDelete = await Ban.findOne({ where: { id } })

      if (!wordToDelete) {
         return res.status(404).json({ message: '해당 금지어를 찾을 수 없습니다.' })
      }

      await wordToDelete.destroy()

      res.status(200).json({ message: '금지어가 성공적으로 삭제되었습니다.' })
   } catch (error) {
      next(error)
   }
})

// 교환품 조회(관리자용)
router.get('/products', async (req, res, next) => {
   try {
      const products = await Product.findAll({
         attributes: ['id', 'name', 'price', 'stock'],
         include: [
            {
               model: User,
               attributes: ['name'],
            },
         ],
         order: [['id', 'DESC']],
      })

      res.status(200).json({ data: products })
   } catch (error) {
      next(error)
   }
})

// 교환품 생성
router.post('/products', upload.single('product_img'), async (req, res, next) => {
   try {
      const { name, price, stock } = req.body

      const product_img = req.file ? `/uploads/products/${req.file.filename}` : null

      if (!name || !price || !stock) {
         return res.status(400).json({ message: '모든 필수 필드를 입력해야 합니다.' })
      }

      // const userId = req.user.id
      const userId = 1

      const newProduct = await Product.create({
         name,
         user_id: userId,
         price,
         stock,
         product_img,
      })

      res.status(201).json({ message: '교환품이 성공적으로 추가되었습니다.', product: newProduct })
   } catch (error) {
      next(error)
   }
})

// 교환품 수정
router.post('/products', upload.none(), async (req, res, next) => {
   try {
      const { name, price, stock } = req.body

      // 필수 필드 유효성 검사
      if (!name || !price || !stock) {
         return res.status(400).json({ message: '필수 필드를 전부 입력해야 합니다.' })
      }

      const newProduct = await Product.create({
         name,
         price,
         stock,
      })

      res.status(201).json({ message: '교환품이 성공적으로 추가되었습니다.', product: newProduct })
   } catch (error) {
      next(error)
   }
})

// 교환품 삭제
router.delete('/products/:id', async (req, res, next) => {
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
            createdAt: { [Op.gte]: startDate },
         },
      })
      const newPosts = await Board.count({
         where: {
            createdAt: { [Op.gte]: startDate },
         },
      })
      const newComments = await Comment.count({
         where: {
            createdAt: { [Op.gte]: startDate },
         },
      })
      const newReports = await Report.count({
         where: {
            createdAt: { [Op.gte]: startDate },
         },
      })

      // 인기 게시글 5개
      const popularPosts = await Board.findAll({
         limit: 5,
         order: [
            ['view_count', 'DESC'],
            ['like_count', 'DESC'],
         ],
         attributes: ['title', 'view_count', 'like_count', [sequelize.fn('COUNT', sequelize.col('Comments.id')), 'comment_count']],
         include: [
            {
               model: Comment,
               attributes: [],
            },
         ],
         group: ['Board.id'],
         raw: true,
         subQuery: false,
      })

      // 이용량 많은 사용자 5명
      const activeUsers = await User.findAll({
         attributes: [
            ['name', 'nickname'],
            [sequelize.fn('COUNT', sequelize.col('Boards.id')), 'posts'],
            [sequelize.fn('COUNT', sequelize.col('Comments.id')), 'comments'],
            [sequelize.literal('0'), 'price'],
         ],
         include: [
            {
               model: Board,
               attributes: [],
            },
            {
               model: Comment,
               attributes: [],
            },
         ],
         group: ['User.id'],
         order: [[sequelize.literal('posts + comments'), 'DESC']],
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
         group: ['Category.id'], // Category.id를 기준으로 그룹화
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

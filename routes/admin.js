const express = require('express')
const router = express.Router()
const { User, Board, Ban, Product, Report, Sanction, Comment, Category, SiteSettings, Reward } = require('../models')
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

// 사용자 목록 조회
router.get('/users', async (req, res, next) => {
   try {
      res.set('Cache-Control', 'no-store, no-cache, must-revalidate, private')

      res.set('Pragma', 'no-cache')

      res.set('Expires', '0')
      const users = await User.findAll({
         attributes: ['id', 'email', ['name', 'nickname'], 'is_ban', ['createdAt', 'joinDate'], [sequelize.col('updatedAt'), 'lastLogin']],
         include: [
            {
               model: Reward,
               attributes: ['point'],
               as: 'Reward',
               required: false,
            },
         ],
         order: [['createdAt', 'DESC']],
      })
      res.status(200).json({ data: users })
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

// 이용자 삭제
router.delete('/user/:id', async (req, res, next) => {
   const transaction = await sequelize.transaction()
   try {
      const user = await User.findByPk(req.params.id, { transaction })

      if (!user) {
         await transaction.rollback()
         return res.status(404).json({ message: '사용자를 찾을 수 없습니다.' })
      }

      await user.destroy({ transaction })
      await transaction.commit()
      res.status(200).json({ message: '사용자가 성공적으로 삭제되었습니다.' })
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
         attributes: ['id', 'pattern'],
         order: [['id', 'DESC']],
      })

      res.status(200).json({ data: banWords })
   } catch (error) {
      console.error('Ban words fetch error:', error)
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
      const existingWord = await Ban.findOne({ where: { pattern: pattern.trim() } })
      if (existingWord) {
         return res.status(409).json({ message: '이미 등록된 금지어입니다.' })
      }

      const newBanWord = await Ban.create({
         pattern: pattern.trim(),
         admin_id: req.user.id,
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
            { key: 'pricePerPost', value: '10' },
            { key: 'pricePerComment', value: '5' },
            { key: 'pricePerLike', value: '1' },
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

// 교환품 조회
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

      const userId = 1
      const priceNum = Number(price)
      const stockNum = Number(stock)
      const newProduct = await Product.create({
         name,
         price: priceNum,
         stock,
         product_img,
         user_id: userId,
      })
      if (!name || !Number.isFinite(priceNum) || priceNum < 0 || !Number.isFinite(stockNum) || stockNum < 0) {
         return res.status(400).json({ message: '모든 필수 필드를 입력해야 합니다.' })
      }

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
      let startDate, previousStartDate

      if (period === 'month') {
         startDate = now.subtract(1, 'month').toDate()
         previousStartDate = now.subtract(2, 'month').toDate()
      } else if (period === 'year') {
         startDate = now.subtract(1, 'year').toDate()
         previousStartDate = now.subtract(2, 'year').toDate()
      } else {
         // week
         startDate = now.subtract(7, 'day').toDate()
         previousStartDate = now.subtract(14, 'day').toDate()
      }

      // 현재 기간과 이전 기간 통계를 위한 끝 날짜
      const previousEndDate = startDate

      // 현재 기간 주요 통계
      const [newUsers, newPosts, newComments, newReports] = await Promise.all([
         User.count({ where: { createdAt: { [Op.gte]: startDate } } }),
         Board.count({ where: { createdAt: { [Op.gte]: startDate } } }),
         Comment.count({ where: { createdAt: { [Op.gte]: startDate } } }),
         BanUser.count({ where: { createdAt: { [Op.gte]: startDate } } }),
      ])

      // 이전 기간 주요 통계 (변화율 계산용)
      const [prevNewUsers, prevNewPosts, prevNewComments, prevNewReports] = await Promise.all([
         User.count({
            where: {
               createdAt: {
                  [Op.gte]: previousStartDate,
                  [Op.lt]: previousEndDate,
               },
            },
         }),
         Board.count({
            where: {
               createdAt: {
                  [Op.gte]: previousStartDate,
                  [Op.lt]: previousEndDate,
               },
            },
         }),
         Comment.count({
            where: {
               createdAt: {
                  [Op.gte]: previousStartDate,
                  [Op.lt]: previousEndDate,
               },
            },
         }),
         BanUser.count({
            where: {
               createdAt: {
                  [Op.gte]: previousStartDate,
                  [Op.lt]: previousEndDate,
               },
            },
         }),
      ])

      // 변화율 계산 함수
      const calculateChange = (current, previous) => {
         if (previous === 0) return current > 0 ? 100 : 0
         return ((current - previous) / previous) * 100
      }

      // 인기 게시글 5개 (댓글 수 포함)
      const popularPosts = await Board.findAll({
         attributes: ['id', 'title', 'view_count', 'like_count', [sequelize.fn('COUNT', sequelize.col('Comments.id')), 'comment_count']],
         include: [
            {
               model: Comment,
               attributes: [],
               required: false,
            },
         ],
         where: {
            createdAt: { [Op.gte]: startDate },
         },
         group: ['Board.id', 'Board.title', 'Board.view_count', 'Board.like_count'],
         order: [
            ['view_count', 'DESC'],
            ['like_count', 'DESC'],
         ],
         limit: 5,
         subQuery: false,
      })

      // 활성 사용자 5명 (포인트 포함)
      const activeUsers = await User.findAll({
         attributes: ['id', 'name', [sequelize.fn('COUNT', sequelize.col('Boards.id')), 'postCount'], [sequelize.literal('(SELECT COUNT(*) FROM comments WHERE comments.user_id = User.id AND comments.createdAt >= ?)'), 'commentCount']],
         include: [
            {
               model: Board,
               attributes: [],
               where: {
                  createdAt: { [Op.gte]: startDate },
               },
               required: false,
            },
            {
               model: Reward,
               attributes: ['point', 'accumulated_point'],
               required: false,
            },
         ],
         group: ['User.id', 'User.name', 'Reward.id'],
         order: [[sequelize.literal('postCount + commentCount'), 'DESC']],
         limit: 5,
         replacements: [startDate],
         subQuery: false,
      })

      // 카테고리별 게시글 분포
      const categoryStats = await Board.findAll({
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
         where: {
            createdAt: { [Op.gte]: startDate },
         },
         group: ['Category.category'],
         raw: true,
         subQuery: false,
      })

      // 시간대별 활동 분포
      const hourlyActivity = await Board.findAll({
         attributes: [
            [sequelize.fn('HOUR', sequelize.col('Board.createdAt')), 'hour'],
            [sequelize.fn('COUNT', sequelize.col('Board.id')), 'post_count'],
         ],
         where: {
            createdAt: { [Op.gte]: startDate },
         },
         group: [sequelize.fn('HOUR', sequelize.col('Board.createdAt'))],
         raw: true,
         subQuery: false,
      })

      // 임시 방문자/페이지뷰 데이터 (실제로는 Analytics 테이블이나 외부 서비스에서 가져와야 함)
      const mockVisitorData = {
         current: Math.floor(Math.random() * 10000) + 5000,
         previous: Math.floor(Math.random() * 9000) + 4000,
      }
      const mockPageViewData = {
         current: Math.floor(Math.random() * 50000) + 20000,
         previous: Math.floor(Math.random() * 40000) + 15000,
      }

      // 응답 데이터 구성
      const responseData = {
         mainStats: {
            // 방문자 통계 (임시)
            visitors: {
               current: mockVisitorData.current,
               previous: mockVisitorData.previous,
               change: calculateChange(mockVisitorData.current, mockVisitorData.previous),
            },
            // 페이지뷰 통계 (임시)
            pageViews: {
               current: mockPageViewData.current,
               previous: mockPageViewData.previous,
               change: calculateChange(mockPageViewData.current, mockPageViewData.previous),
            },
            // 실제 데이터
            newUsers: {
               current: newUsers,
               previous: prevNewUsers,
               change: calculateChange(newUsers, prevNewUsers),
            },
            posts: {
               current: newPosts,
               previous: prevNewPosts,
               change: calculateChange(newPosts, prevNewPosts),
            },
            comments: {
               current: newComments,
               previous: prevNewComments,
               change: calculateChange(newComments, prevNewComments),
            },
            reports: {
               current: newReports,
               previous: prevNewReports,
               change: calculateChange(newReports, prevNewReports),
            },
         },
         popularPosts: popularPosts.map((post) => ({
            id: post.id,
            title: post.title,
            view_count: post.view_count || 0,
            like_count: post.like_count || 0,
            comment_count: parseInt(post.getDataValue('comment_count')) || 0,
         })),
         activeUsers: activeUsers.map((user) => ({
            id: user.id,
            name: user.name,
            post_count: parseInt(user.getDataValue('postCount')) || 0,
            comment_count: parseInt(user.getDataValue('commentCount')) || 0,
            points: user.Reward ? user.Reward.point || 0 : 0,
            accumulated_points: user.Reward ? user.Reward.accumulated_point || 0 : 0,
         })),
         categoryStats: categoryStats.map((category) => ({
            name: category.category_name || '기타',
            count: parseInt(category.post_count) || 0,
         })),
         hourlyActivity: hourlyActivity.map((hour) => ({
            hour: parseInt(hour.hour),
            count: parseInt(hour.post_count) || 0,
         })),
      }

      res.status(200).json(responseData)
   } catch (error) {
      console.error('Statistics API Error:', error)
      next(error)
   }
})

module.exports = router

const express = require('express')
const router = express.Router()
const { User, Board, Ban, Product, Report, Sanction, Comment, Category, SiteSettings, Reward, ProductList } = require('../models')
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

      // 각 사용자의 신고 횟수 조회 및 is_ban 설정
      for (let user of users) {
         // 정지받은 놈은 is_ban 3 우선
         if (user.is_ban === true || user.is_ban === 3) {
            user.dataValues.is_ban = 3
         } else {
            // Report 테이블에서 reported_user_id를 기준으로 신고 횟수 카운트
            const reportCount = await Report.count({
               where: {
                  reported_user_id: user.id,
                  status: 'pending', // 처리되지 않은 신고만 카운트
               },
            })

            // 신고 횟수에 따라 is_ban 값을 숫자(0, 1, 2)로 결정
            if (reportCount >= 5) {
               user.dataValues.is_ban = 2 // 경고
            } else if (reportCount >= 3) {
               user.dataValues.is_ban = 1 // 주의
            } else {
               user.dataValues.is_ban = 0 // 양호
            }
         }
      }

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
         const error = new Error('사용자를 찾을 수 없습니다.')
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
         const error = new Error('사용자를 찾을 수 없습니다.')
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
         const error = new Error({ message: '사용자를 찾을 수 없습니다.' })
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
         const error = new Error('게시글을 찾을 수 없습니다.')
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
         const error = new Error({ message: '해당 금지어를 찾을 수 없습니다.' })
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

// 상품 조회
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

// 상품 생성
router.post('/products', upload.single('product_img'), async (req, res, next) => {
   try {
      const { name, price, stock, product_list_id } = req.body
      const product_img = req.file ? `/uploads/products/${req.file.filename}` : null

      const priceNum = Number(price)
      const stockNum = Number(stock)

      if (!name || !Number.isFinite(priceNum) || priceNum < 0 || !Number.isFinite(stockNum) || stockNum < 0) {
         return res.status(400).json({ message: '모든 필수 필드를 입력해야 합니다.' })
      }

      const userId = 1
      const newProduct = await Product.create({
         name,
         price: priceNum,
         stock: stockNum,
         product_img,
         user_id: userId,
         product_list_id: product_list_id,
      })

      res.status(201).json({ message: '교환품이 추가되었습니다.', product: newProduct })
   } catch (error) {
      next(error)
   }
})

// 상품 수정
router.put('/products/:id', async (req, res, next) => {
   try {
      const product = await Product.findByPk(req.params.id)
      if (!product) {
         const error = new Error('교환품을 찾을 수 없습니다.')
      }
      await product.update(req.body)
      res.status(200).json({ message: '교환품이 성공적으로 업데이트되었습니다.', product })
   } catch (error) {
      next(error)
   }
})

// 상품 삭제
router.delete('/products/:id', async (req, res, next) => {
   try {
      const product = await Product.findByPk(req.params.id)
      if (!product) {
         const error = new Error('교환품을 찾을 수 없습니다.')
      }
      await product.destroy()
      res.status(200).json({ message: '교환품을 삭제했습니다.' })
   } catch (error) {
      next(error)
   }
})

// 상품 유형 관리
router.get('/product-lists', async (req, res, next) => {
   try {
      const productLists = await ProductList.findAll()
      res.status(200).json(productLists)
   } catch (error) {
      next(error)
   }
})

// 상품 유형 생성
router.post('/product-lists', async (req, res, next) => {
   try {
      const { name, description } = req.body
      const newProductList = await ProductList.create({ name, description, user_id: 1 })
      res.status(201).json(newProductList)
   } catch (error) {
      next(error)
   }
})

// 상품 유형 수정
router.put('/product-lists/:id', async (req, res, next) => {
   try {
      const productList = await ProductList.findByPk(req.params.id)
      if (!productList) {
         return res.status(404).json({ message: '상품 유형을 찾을 수 없습니다.' })
      }
      await productList.update(req.body)
      res.status(200).json(productList)
   } catch (error) {
      next(error)
   }
})

// 상품 유형 삭제
router.delete('/product-lists/:id', async (req, res, next) => {
   try {
      const result = await ProductList.destroy({ where: { id: req.params.id } })
      if (result === 0) {
         return res.status(404).json({ message: '상품 유형을 찾을 수 없습니다.' })
      }
      res.status(200).json({ message: '상품 유형이 삭제되었습니다.' })
   } catch (error) {
      next(error)
   }
})

// 게시판 목록 조회
router.get('/boards', async (req, res, next) => {
   try {
      const { page = 1, limit = 10, search = '' } = req.query
      const offset = (page - 1) * limit

      const whereCondition = { deleted_at: null }
      if (search) {
         whereCondition[Op.or] = [{ title: { [Op.like]: `%${search}%` } }, { content: { [Op.like]: `%${search}%` } }]
      }

      const { rows, count } = await Board.findAndCountAll({
         where: whereCondition,
         attributes: ['id', 'title', 'user_id', 'view_count', 'like_count', 'created_at', 'deleted_at'],
         include: [{ model: User, attributes: ['name'], as: 'User' }],
         order: [['created_at', 'DESC']],
         limit: parseInt(limit, 10),
         offset: parseInt(offset, 10),
      })

      res.status(200).json({
         data: rows,
         total: count,
         page: parseInt(page, 10),
         limit: parseInt(limit, 10),
      })
   } catch (error) {
      next(error)
   }
})

// 특정 게시글 삭제
router.delete('/board/:id', async (req, res, next) => {
   try {
      const { id } = req.params
      const board = await Board.findByPk(id)

      if (!board) {
         const error = new Error('게시글을 찾을 수 없습니다.')
         return next(error)
      }

      await board.destroy()
      res.status(200).json({ message: '게시글이 성공적으로 삭제되었습니다.' })
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

      const [newUsers, newPosts, newComments, newReports] = await Promise.all([
         User.count({ where: { createdAt: { [Op.gte]: startDate } } }),
         Board.count({ where: { deleted_at: null, created_at: { [Op.gte]: startDate } } }),
         Comment.count({ where: { createdAt: { [Op.gte]: startDate } } }),
         Report.count({ where: { createdAt: { [Op.gte]: startDate } } }),
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
               deleted_at: null,
               created_at: {
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
         Report.count({
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

      // Mock 데이터를 실제 데이터로 대체
      const visitors = { current: newPosts + newComments, previous: prevNewPosts + prevNewComments, change: calculateChange(newPosts + newComments, prevNewPosts + prevNewComments) }
      const pageViews = { current: 0, previous: 0, change: 0 } // 페이지뷰 데이터는 백엔드에서 추적하지 않으므로 임시로 0으로 설정

      // 인기 게시글 5개 (댓글 수 포함) - 에러 처리 개선
      let popularPosts = []
      try {
         popularPosts = await Board.findAll({
            attributes: ['id', 'title', 'view_count', 'like_count', [sequelize.fn('COUNT', sequelize.col('Comments.id')), 'comment_count']],
            include: [
               {
                  model: Comment,
                  attributes: [],
                  required: false,
               },
            ],
            where: {
               deleted_at: null,
               created_at: { [Op.gte]: startDate },
            },
            group: ['Board.id', 'Board.title', 'Board.view_count', 'Board.like_count'],
            order: [
               ['view_count', 'DESC'],
               ['like_count', 'DESC'],
            ],
            limit: 5,
            subQuery: false,
         })
      } catch (error) {
         console.error('Popular posts query error:', error)
         // 에러 발생 시 빈 배열로 설정
         popularPosts = []
      }

      // 활성 사용자 5명 (포인트 포함) - 에러 처리 개선
      let activeUsers = []
      try {
         activeUsers = await User.findAll({
            attributes: ['id', 'name', [sequelize.fn('COUNT', sequelize.col('Boards.id')), 'postCount'], [sequelize.literal('(SELECT COUNT(*) FROM comments WHERE comments.user_id = User.id AND comments.created_at >= ?)'), 'commentCount']],
            include: [
               {
                  model: Board,
                  attributes: [],
                  where: {
                     created_at: { [Op.gte]: startDate },
                     deleted_at: null,
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
      } catch (error) {
         console.error('Active users query error:', error)
         activeUsers = []
      }

      // 카테고리별 게시글 분포 - 에러 처리 개선
      let categoryStats = []
      try {
         categoryStats = await Board.findAll({
            attributes: [
               [sequelize.col('Category.category'), 'category_name'],
               [sequelize.fn('COUNT', sequelize.col('Board.id')), 'post_count'],
            ],
            include: [
               {
                  model: Category,
                  attributes: [],
                  required: true, // 카테고리가 없는 게시글은 제외
               },
            ],
            where: {
               deleted_at: null,
               created_at: { [Op.gte]: startDate },
            },
            group: ['Category.category'],
            raw: true,
            subQuery: false,
         })
      } catch (error) {
         console.error('Category stats query error:', error)
         // 에러 발생 시 빈 배열로 설정
         categoryStats = []
      }

      // 시간대별 활동 분포 - 에러 처리 개선
      let hourlyActivity = []
      try {
         hourlyActivity = await Board.findAll({
            attributes: [
               [sequelize.fn('HOUR', sequelize.col('created_at')), 'hour'],
               [sequelize.fn('COUNT', sequelize.col('id')), 'post_count'],
            ],
            where: {
               deleted_at: null,
               created_at: { [Op.gte]: startDate },
            },
            group: [sequelize.fn('HOUR', sequelize.col('created_at'))],
            raw: true,
            subQuery: false,
         })
      } catch (error) {
         console.error('Hourly activity query error:', error)
         hourlyActivity = []
      }

      // 응답 데이터 구성
      const responseData = {
         mainStats: {
            // 방문자 통계 (임시)
            visitors: visitors,
            // 페이지뷰 통계 (임시)
            pageViews: pageViews,
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
            comment_count: post.getDataValue ? parseInt(post.getDataValue('comment_count')) || 0 : 0,
         })),
         activeUsers: activeUsers.map((user) => ({
            id: user.id,
            name: user.name,
            post_count: user.getDataValue ? parseInt(user.getDataValue('postCount')) || 0 : 0,
            comment_count: user.getDataValue ? parseInt(user.getDataValue('commentCount')) || 0 : 0,
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
      console.error('Error stack:', error.stack)

      // 에러 발생 시 기본 응답 반환
      res.status(200).json({
         mainStats: {
            visitors: { current: 0, previous: 0, change: 0 },
            pageViews: { current: 0, previous: 0, change: 0 },
            newUsers: { current: 0, previous: 0, change: 0 },
            posts: { current: 0, previous: 0, change: 0 },
            comments: { current: 0, previous: 0, change: 0 },
            reports: { current: 0, previous: 0, change: 0 },
         },
         popularPosts: [],
         activeUsers: [],
         categoryStats: [],
         hourlyActivity: [],
      })
   }
})

module.exports = router

const express = require('express')
const { User, Board, Comment, Reward, RewardRecord } = require('../models')
const router = express.Router()
const fs = require('fs')
const path = require('path')
const multer = require('multer')
const bcrypt = require('bcrypt')
const { isLoggedIn, isAdmin } = require('../middleware/middleware')

try {
   fs.readdirSync('uploads/user')
} catch (error) {
   console.log('uploads/user 폴더가 없어 uploads 폴더를 생성합니다.')
   fs.mkdirSync('uploads/user')
}

// 이미지 업로드를 위한 multer 설정
const upload = multer({
   // 저장할 위치와 파일명 지정
   storage: multer.diskStorage({
      destination(req, file, cb) {
         cb(null, 'uploads/user/')
      },
      filename(req, file, cb) {
         const decodedFileName = decodeURIComponent(file.originalname) //파일명 디코딩(한글 파일명 깨짐 방지)
         const ext = path.extname(decodedFileName) //확장자 추출
         const basename = path.basename(decodedFileName, ext) //확장자 제거한 파일명 추출

         cb(null, basename + Date.now() + ext)
      },
   }),
   limits: { fileSize: 5 * 1024 * 1024 }, // 5MB로 제한
})

/* mypage 관련 api */

//내정보 가져오기
router.get('/me', isLoggedIn, async (req, res, next) => {
   try {
      const id = req.user.id
      const data = await User.findByPk(id)
      if (!data) {
         const error = new Error('회원을 찾을 수 없습니다.')
         error.status = 404
         throw error
      }
      res.json({
         success: true,
         data,
      })
   } catch (error) {
      next(error)
   }
})

//내정보 수정하기
router.put('/me', isLoggedIn, async (req, res, next) => {
   try {
      const { name, pw, age } = req.body

      const hash = await bcrypt.hash(pw, 10)
      const user = await User.findByPk(req.user.id)

      await user.update({
         name,
         pw: hash,
         age,
      })

      res.json({
         success: true,
      })
   } catch (error) {
      next(error)
   }
})

//프로필 사진 수정하기
router.put('/me/profile-img', isLoggedIn, upload.single('file'), async (req, res, next) => {
   try {
      //isLogin에서 유저 존재는 이미 확인함 (isLogin구현중)
      const user = await User.findByPk(req.user.id)

      if (!req.file) {
         const error = new Error('이미지 파일이 없습니다.')
         error.status = 400
         throw error
      }
      const oldProfileImg = user.profile_img

      //유저 프로필사진 업데이트
      await user.update({
         profile_img: `/uploads/user/${req.file.filename}`,
      })

      //프로필 변경 완료 후 기존 프로필 사진이 있을 경우 삭제(구글 프로필 사진은 파일 존재 x)
      if (oldProfileImg) {
         const filePath = path.join(__dirname, '..', oldProfileImg)
         if (fs.existsSync(filePath)) {
            fs.unlinkSync(filePath)
         }
      }

      res.json({
         success: true,
      })
   } catch (error) {
      next(error)
   }
})

//작성글 목록 가져오기
router.get('/me/posts', isLoggedIn, async (req, res, next) => {
   try {
      const limit = parseInt(req.query.limit)
      const page = parseInt(req.query.page)

      if (!limit || !page) {
         const error = new Error('필수 query 누락 : limit, page')
         error.status = 400
         throw error
      }
      const offset = (page - 1) * limit

      const { count, rows: posts } = await Board.findAndCountAll({
         where: { user_id: req.user.id },
         order: [['createdAt', 'DESC']],
         limit,
         offset,
      })

      res.send({
         success: true,
         data: { posts, count },
      })
   } catch (error) {
      next(error)
   }
})

//작성 댓글 목록 가져오기
router.get('/me/comments', isLoggedIn, async (req, res, next) => {
   try {
      const limit = parseInt(req.query.limit)
      const page = parseInt(req.query.page)

      if (!limit || !page) {
         const error = new Error('필수 query 누락 : limit, page')
         error.status = 400
         throw error
      }
      const offset = (page - 1) * limit

      const { count, rows: comments } = await Comment.findAndCountAll({
         where: { user_id: req.user.id },
         order: [['createdAt', 'DESC']],
         limit,
         offset,
      })

      res.send({
         success: true,
         data: { comments, count },
      })
   } catch (error) {
      next(error)
   }
})

//포인트 획득,사용기록 가져오기
router.get('/me/reward', isLoggedIn, async (req, res, next) => {
   try {
      const limit = parseInt(req.query.limit)
      const page = parseInt(req.query.page)

      if (!limit || !page) {
         const error = new Error('필수 query 누락 : limit, page')
         error.status = 400
         throw error
      }
      const offset = (page - 1) * limit

      const reward = await Reward.findOne({ where: { id: req.user.id } })
      const { count, rows: data } = await RewardRecord.findAndCountAll({ where: { user_id: req.user.id }, limit, offset })

      res.json({
         success: true,
         data: {
            data,
            accumulated_point: reward.accumulated_point,
            point: reward.point,
            count,
            coin: reward.coin,
         },
      })
   } catch (error) {
      next(error)
   }
})

/* user 정보 관련 api */

//유저 리스트 가져오기
router.get('/', isAdmin, async (req, res, next) => {
   try {
      const limit = parseInt(req.query.limit)
      const page = parseInt(req.query.page)

      if (!limit || !page) {
         const error = new Error('필수 query 누락 : limit, page')
         error.status = 400
         throw error
      }
      const offset = (page - 1) * limit

      const data = await User.findAll({ limit, offset })

      res.json({
         success: true,
         data,
      })
   } catch (error) {
      next(error)
   }
})

//유저 정보 가져오기`
router.get('/:id', isAdmin, async (req, res, next) => {
   try {
      const id = req.params.id
      const data = await User.findByPk(id)
      if (!data) {
         const error = new Error('회원을 찾을 수 없습니다.')
         error.status = 404
         throw error
      }
      res.json({
         success: true,
         data,
      })
   } catch (error) {
      next(error)
   }
})

module.exports = router

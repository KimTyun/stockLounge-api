const express = require('express')
const { User, Board, Comment } = require('../models')
const router = express.Router()
const fs = require('fs')
const path = require('path')
const multer = require('multer')

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

// //서비스테스트
// router.get('/', (req, res, next) => {
//    res.send('작동확인')
// })

//내정보 가져오기
router.get('/me', async (req, res, next) => {
   try {
      const id = req.params.id
      const data = User.findByPk(id)
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
router.put('/me', async (req, res, next) => {
   try {
      const { name, email, phone, address, addresDetail } = req.body
      const user = await User.findByPk(req.user.id)

      await user.update({
         name,
         email,
         phone,
         address,
         addresDetail,
      })

      res.json({
         success: true,
      })
   } catch (error) {
      next(error)
   }
})

//프로필 사진 수정하기
router.put('/me/profile-img', upload.single('file'), async (req, res, next) => {
   try {
      //isLogin에서 유저 존재는 이미 확인함 (isLogin구현중)
      const user = await User.findByPk(req.user.id)

      if (!req.file) {
         const error = new Error('이미지 파일이 없습니다.')
         error.status = 400
         throw error
      }

      //유저 프로필사진 업데이트(user models가 완전하지 않아서 임시 주석처리)
      await user.update({
         //profileImg : `/uploads/user/${req.file.filename}`
      })

      //프로필 변경 완료 후 기존 프로필 사진 삭제
      if (user.profileImg) {
         const filePath = path.join(__dirname, '..', user.profileImg)
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
router.get('/me/posts', async (req, res, next) => {
   try {
      const { limit, page } = req.query
      if (!limit || !page) {
         const error = new Error('필수 qeury 누락 : limit, page')
         error.status = 400
         throw error
      }
      const offset = (Number(page) - 1) * Number(limit)

      const posts = await Board.findAll({
         where: { userId: req.user.id },
         order: [['createdAt', 'DESC']],
         limit,
         offset,
      })

      res.send({
         success: true,
         data: posts,
      })
   } catch (error) {
      next(error)
   }
})

//작성 댓글 목록 가져오기
router.get('/me/comments', async (req, res, next) => {
   try {
      const { limit, page } = req.query
      if (!limit || !page) {
         const error = new Error('필수 qeury 누락 : limit, page')
         error.status = 400
         throw error
      }
      const offset = (Number(page) - 1) * Number(limit)

      const comments = await Comment.findAll({
         where: { userId: req.user.id },
         order: [['createdAt', 'DESC']],
         limit,
         offset,
      })

      res.send({
         success: true,
         data: comments,
      })
   } catch (error) {
      next(error)
   }
})

//포인트 획득/사용기록 가져오기
router.get('/me/reward')

module.exports = router

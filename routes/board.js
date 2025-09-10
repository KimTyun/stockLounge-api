const express = require('express')
const { Board, Comment } = require('../models')
const router = express.Router()
require('dotenv').config()

// uploads 폴더가 없을 경우 새로 생성
try {
   fs.readdirSync('uploads') //해당 폴더가 있는지 확인
} catch (error) {
   console.log('uploads 폴더가 없어 uploads 폴더를 생성합니다.')
   fs.mkdirSync('uploads') //폴더 생성
}

// 이미지 업로드를 위한 multer 설정
const upload = multer({
   // 저장할 위치와 파일명 지정
   storage: multer.diskStorage({
      destination(req, file, cb) {
         cb(null, 'uploads/') // uploads폴더에 저장
      },
      filename(req, file, cb) {
         const decodedFileName = decodeURIComponent(file.originalname) //파일명 디코딩(한글 파일명 깨짐 방지)
         const ext = path.extname(decodedFileName) //확장자 추출
         const basename = path.basename(decodedFileName, ext) //확장자 제거한 파일명 추출

         // 파일명 설정: 기존이름 + 업로드 날짜시간 + 확장자
         // dog.jpg
         // ex) dog + 1231342432443 + .jpg
         cb(null, basename + Date.now() + ext)
      },
   }),
   // 파일의 크기 제한
   limits: { fileSize: 5 * 1024 * 1024 }, // 5MB로 제한
})

// 게시판 리스트 조회
router.get('/', async (req, res, next) => {
   try {
      const boards = await Board.findAll({
         include: [
            {
               model: Comment,
               attributes: [],
            },
         ],
         attributes: ['title', 'user_id', 'view_count', 'like_count', 'createdAt', [Board.sequelize.fn('COUNT', Board.sequelize.col('Comments.id')), 'comment_count']],
         group: ['Board.id'],
      })

      res.json(boards)
   } catch (error) {
      next(error)
   }
})

// 게시글 등록
router.post('/write', async (req, res, next) => {
   try {

      if (!req.files) {
         const error = new Error('파일 업로드에 실패했습니다.')
         error.status = 400
         return next(error)
       }

      const { title, content, board_img, category } = req.body

      const newBoards = await Board.create({
         title,
         content,
         board_img,
         category,
      })

      const images = req.files.map((file) => ({
         oriImgName: file.oriImgName, // 원본 이미지명
         imgUrl: `/${file.filename}`, // 이미지 경로
         repImgYn: 'N', // 기본적으로 N 설정
         itemId: item.id, // 생성된 상품 ID 연결
      }))

      res.status(201).json({
         success: true,
         message: '게시글 등록 성공!',
         newBoards,
         images,
      })
   } catch (error) {
      next(error)
   }
})

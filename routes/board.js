const express = require('express')
const multer = require('multer')
const path = require('path')
const { Board, Comment, Category } = require('../models')
const fs = require('fs')
require('dotenv').config()
const router = express.Router()

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
         order: [['created_at', 'DESC']],
      })

      res.json({
         success: true,
         data: boards,
      })
   } catch (error) {
      next(error)
   }
})

// 게시글 등록
router.post('/write', upload.single('file'), async (req, res, next) => {
   try {
      const { title, content, category } = req.body

      // category가 DB에 없으면 생성, 있으면 가져오기(findOrCreate 이용)
      const [findCategory, created] = await Category.findOrCreate({
         where: { category },
         defaults: { category },
      })

      const newBoard = await Board.create({
         title,
         content,
         category: findCategory.id,
         // 이미지 파일이 있으면 파일명 저장
         board_img: req.file ? req.file.filename : null,
      })

      res.status(201).json({
         success: true,
         message: '게시글 등록 성공!',
         data: newBoard,
         // 새로 생성되는지 여부 확인
         findCategory: created,
      })
   } catch (error) {
      next(error)
   }
})

// 특정 게시글 가져오기
router.get('/:id', async (req, res, next) => {
   try {
      const id = req.params.id

      const board = await Board.findOne({
         where: { id },
      })

      if (!board) {
         const error = new Error('해당 게시글을 찾을 수 없습니다.')
         error.status = 404
         return next(error)
      }

      res.json({
         success: true,
         message: '게시글 조회 성공',
         data: board,
      })
   } catch (error) {
      next(error)
   }
})

// 게시글 삭제
router.delete('/:id', async (req, res, next) => {
   try {
      const id = req.params.id

      // 게시글이 존재하는지 확인
      const board = await Board.findByPk(id)
      if (!board) {
         const error = new Error('게시글을 찾을 수 없습니다.')
         error.status = 404
         return next(error)
      }

      // 게시글 삭제
      await board.destroy()

      res.json({
         success: true,
         message: '게시글이 삭제되었습니다.',
      })
   } catch (error) {
      next(error)
   }
})

// 게시글 수정
router.put('/:id', async (req, res, next) => {
   try {
      const id = req.params.id
      const { content, board_img } = req.body

      // 게시글이 존재하는지 확인
      const board = await Board.findByPk(id)
      if (!board) {
         const error = new Error('게시글을 찾을 수 없습니다.')
         error.status = 404
         return next(error)
      }

      await board.update({
         content,
         board_img,
      })

      res.json({
         success: true,
         message: '게시글이 수정되었습니다.',
         data: board,
      })
   } catch (error) {
      next(error)
   }
})

module.exports = router

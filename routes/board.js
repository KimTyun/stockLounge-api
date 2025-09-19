const express = require('express')
const multer = require('multer')
const path = require('path')
const { Board, Comment, Category, BoardLike, CommentLike, User, Ban } = require('../models')
const fs = require('fs')
require('dotenv').config()
const { givePoints } = require('./reward')
const router = express.Router()
const { isLoggedIn } = require('../middleware/middleware')

// 댓글 등록
router.post('/:id/comment', async (req, res, next) => {
   try {
      const boardId = req.params.id
      const { content, user_id } = req.body

      // 게시글이 존재하는지 확인
      const board = await Board.findByPk(boardId)
      if (!board) {
         const error = new Error('게시글을 찾을 수 없습니다.')
         error.status = 404
         return next(error)
      }
      const ban = await Ban.findAll()
      const banWord = ban.some((word) => content.includes(word.pattern))

      // ban 단어가 있을시에 false 반환
      if (banWord) {
         return res.status(200).json({
            success: false,
            showModal: true,
            message: '부적절한 단어가 포함되어 있습니다.',
            modalType: 'warning',
         })
      }

      // 댓글 생성
      const comment = await Comment.create({
         content,
         user_id,
         board_id: boardId,
      })

      // 댓글 작성 포인트 지급 (1점)
      if (user_id) {
         await givePoints(user_id, 1, `댓글 작성 - ${comment.id}`)
      }

      res.status(201).json({
         success: true,
         message: '댓글이 등록되었습니다.',
         data: comment,
      })
   } catch (error) {
      next(error)
   }
})

// 댓글 목록 조회
router.get('/:id/comments', async (req, res, next) => {
   try {
      const boardId = req.params.id

      // 게시글이 존재하는지 확인
      const board = await Board.findByPk(boardId)
      if (!board) {
         const error = new Error('게시글을 찾을 수 없습니다.')
         error.status = 404
         return next(error)
      }

      // 댓글 목록 조회
      const comments = await Comment.findAll({
         where: { board_id: boardId },
         order: [['created_at', 'DESC']],
         include: [
            {
               model: User,
               attributes: ['name', 'profile_img'],
            },
         ],
      })

      res.json({
         success: true,
         data: comments,
      })
   } catch (error) {
      next(error)
   }
})

// 댓글 삭제
router.delete('/:boardId/comment/:commentId', async (req, res, next) => {
   try {
      const { boardId, commentId } = req.params

      // 댓글이 존재하는지 확인
      const comment = await Comment.findOne({
         where: {
            id: commentId,
            board_id: boardId,
         },
      })

      if (!comment) {
         const error = new Error('댓글을 찾을 수 없습니다.')
         error.status = 404
         return next(error)
      }

      // 댓글 삭제
      await comment.destroy()

      res.json({
         success: true,
         message: '댓글이 삭제되었습니다.',
      })
   } catch (error) {
      next(error)
   }
})

// uploads 폴더가 없을 경우 새로 생성
try {
   fs.readdirSync('uploads/board') //해당 폴더가 있는지 확인
} catch (error) {
   console.log('uploads 폴더가 없어 uploads 폴더를 생성합니다.')
   fs.mkdirSync('uploads/board') //폴더 생성
}

// 이미지 업로드를 위한 multer 설정
const upload = multer({
   // 저장할 위치와 파일명 지정
   storage: multer.diskStorage({
      destination(req, file, cb) {
         cb(null, 'uploads/board') // uploads폴더에 저장
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
   limits: {
      fileSize: 5 * 1024 * 1024, // 5MB로 제한
      fieldSize: 2 * 1024 * 1024, // 2MB text field 제한
   },
})

// 초기 카테고리 생성 (서버 시작 시 한 번만 실행) 없을시 카테고리 구분X
const initializeCategories = async () => {
   const defaultCategories = ['free', 'bitcoin', 'ethereum', 'ripple', 'nft', 'defi', 'news', 'analysis']

   for (const cat of defaultCategories) {
      await Category.findOrCreate({
         where: { category: cat },
         defaults: { category: cat },
      })
   }
}
// 서버 시작 시 카테고리 초기화
initializeCategories().catch(console.error)

// 게시판 리스트 조회
router.get('/', async (req, res, next) => {
   try {
      const { category } = req.query

      let whereCondition = {
         deleted_at: null,
      }

      // 카테고리가 지정된 경우 필터링
      if (category) {
         const categoryRecord = await Category.findOne({
            where: { category },
         })

         if (categoryRecord) {
            whereCondition.category = categoryRecord.id
         }
      }

      const boards = await Board.findAll({
         attributes: ['id', 'user_id', 'title', 'content', 'category', 'like_count', 'report_count', 'board_img', 'view_count', 'created_at', 'updated_at'],
         where: whereCondition,
         order: [['created_at', 'DESC']],
         include: [
            {
               model: User,
               attributes: ['name', 'profile_img'],
            },
         ],
      })

      // 각 게시글의 댓글 수를 별도로 조회
      const boardsWithComments = await Promise.all(
         boards.map(async (board) => {
            const commentCount = await Comment.count({
               where: { board_id: board.id },
            })
            const boardJson = board.toJSON()
            return {
               ...boardJson,
               comment_count: commentCount,
            }
         })
      )

      res.json({
         success: true,
         data: boardsWithComments,
      })
   } catch (error) {
      next(error)
   }
})

// 게시글 등록
router.post('/write', upload.single('file'), async (req, res, next) => {
   try {
      const { title, content, category, user_id } = req.body

      // 카테고리 가져오기 또는 생성
      const [categoryRecord, created] = await Category.findOrCreate({
         where: { category },
         defaults: { category },
      })

      const ban = await Ban.findAll()
      const banTitle = ban.some((word) => title.includes(word.pattern))
      const banContent = ban.some((word) => content.includes(word.pattern))

      // ban 단어가 있을시에 false 반환
      if (banTitle || banContent) {
         return res.status(200).json({
            success: false,
            showModal: true,
            message: '부적절한 단어가 포함되어 있습니다.',
            modalType: 'warning',
         })
      }

      const newBoard = await Board.create({
         title,
         content,
         category: categoryRecord.id,
         // 이미지 파일이 있으면 파일명 저장
         board_img: req.file ? req.file.filename : null,
         view_count: 0,
         user_id,
      })

      // 게시글 작성 포인트 지급 (5점)
      if (newBoard.user_id) {
         await givePoints(newBoard.user_id, 5, `게시글 작성 - ${newBoard.id}`)
      }

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
      const userId = req.user?.id

      const board = await Board.findOne({
         where: { id },
         include: [
            {
               model: Category,
               attributes: ['category'],
            },
            {
               model: User,
               attributes: ['name', 'profile_img'],
            },
         ],
      })

      if (!board) {
         const error = new Error('해당 게시글을 찾을 수 없습니다.')
         error.status = 404
         return next(error)
      }

      // 조회수 증가
      const newViewCount = (board.view_count || 0) + 1
      await board.update({ view_count: newViewCount })

      let isLiked = false
      if (userId) {
         const like = await BoardLike.findOne({
            where: { board_id: id, user_id: userId },
         })
         isLiked = !!like
      }
      res.json({
         success: true,
         message: '게시글 조회 성공',
         data: {
            ...board.toJSON(),
            view_count: newViewCount,
            isLiked,
         },
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
router.put('/:id', upload.single('file'), async (req, res, next) => {
   try {
      const id = req.params.id
      const { title, content, category } = req.body

      const board = await Board.findByPk(id)
      if (!board) {
         return res.status(404).json({ success: false, message: '게시글을 찾을 수 없습니다.' })
      }

      // 금칙어 체크
      const ban = await Ban.findAll()
      const banTitle = ban.some((word) => title.includes(word.pattern))
      const banContent = ban.some((word) => content.includes(word.pattern))

      if (banTitle || banContent) {
         return res.status(200).json({
            success: false,
            showModal: true,
            message: '부적절한 단어가 포함되어 있습니다.',
            modalType: 'warning',
         })
      }

      const updateData = { title, content, category }

      if (req.file) {
         if (board.board_img) {
            const oldPath = path.join(__dirname, '..', 'uploads', board.board_img)
            fs.unlink(oldPath, (err) => {
               if (err) console.error('기존 이미지 삭제 실패:', err)
            })
         }
         updateData.board_img = req.file.filename
      }

      await board.update(updateData)

      res.json({
         success: true,
         message: '게시글이 수정되었습니다.',
         data: board,
      })
   } catch (error) {
      next(error)
   }
})

// 게시글 좋아요
router.post('/:id/like', isLoggedIn, async (req, res, next) => {
   try {
      const boardId = req.params.id
      const { user_id } = req.body

      const board = await Board.findByPk(boardId)
      if (!board) {
         const error = new Error('게시글 찾을 수 없습니다.')
         error.status = 404
         return next(error)
      }

      // 이미 좋아요 눌렀는지 확인
      const existLike = await BoardLike.findOne({
         where: { board_id: boardId, user_id },
      })

      // 이미 좋아요가 있다면
      if (existLike) {
         // 좋아요 취소
         await existLike.destroy()
         const likeCount = await BoardLike.count({
            where: { board_id: boardId },
         })
         await board.update({ like_count: likeCount })

         return res.json({
            success: true,
            message: '게시글 좋아요 취소',
            data: {
               boardId: parseInt(boardId),
               like_count: likeCount,
               isLiked: false,
            },
         })
      } else {
         // 좋아요 기능
         await BoardLike.create({ board_id: boardId, user_id })
         const likeCount = await BoardLike.count({ where: { board_id: boardId } })
         await board.update({ like_count: likeCount })

         // 게시글 작성자에게 포인트 지급 (10점)
         if (board.user_id) {
            await givePoints(board.user_id, 10, `게시글 추천 받음 - ${board.id}`)
         }

         return res.json({
            success: true,
            message: '게시글 좋아요',
            data: {
               boardId: parseInt(boardId),
               like_count: likeCount,
               isLiked: true,
            },
         })
      }
   } catch (error) {
      next(error)
   }
})

// 댓글 좋아요
router.post('/comment/:commentId/like', isLoggedIn, async (req, res, next) => {
   try {
      const commentId = req.params.commentId
      const { user_id } = req.body

      // 댓글 존재 여부 확인
      const comment = await Comment.findByPk(commentId)
      if (!comment) {
         const error = new Error('댓글을 찾을 수 없습니다.')
         error.status = 404
         return next(error)
      }

      // 이미 좋아요 눌렀는지 확인
      const existLike = await CommentLike.findOne({
         where: { comment_id: commentId, user_id },
      })

      // 이미 좋아요가 있다면
      if (existLike) {
         // 좋아요 취소
         await existLike.destroy()
         const likeCount = await CommentLike.count({
            where: { comment_id: commentId },
         })
         await comment.update({ like_count: likeCount })

         return res.json({
            success: true,
            message: '댓글 좋아요 취소',
            data: {
               commentId: parseInt(commentId),
               like_count: likeCount,
               isLiked: false,
            },
         })
      } else {
         // 좋아요 기능
         await CommentLike.create({ comment_id: commentId, user_id })
         const likeCount = await CommentLike.count({
            where: { comment_id: commentId },
         })
         await comment.update({ like_count: likeCount })

         // 댓글 작성자에게 포인트 지급 (10점)
         if (comment.user_id) {
            await givePoints(comment.user_id, 10, `댓글 추천 받음 - ${comment.id}`)
         }

         return res.json({
            success: true,
            message: '댓글 좋아요',
            data: {
               commentId: parseInt(commentId),
               like_count: likeCount,
               isLiked: true,
            },
         })
      }
   } catch (error) {
      next(error)
   }
})

module.exports = router

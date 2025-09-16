const express = require('express')
const router = express.Router()
const Comment = require('../models/comment')

// 댓글 등록
router.post('/', async (req, res, next) => {
   try {
      const { user_id, board_id, content } = req.body

      // 댓글 생성
      const newComment = await Comment.create({
         user_id: user_id || null, // 로그인 전까지는 null 허용
         board_id,
         content,
         like_count: 0,
         report_count: 0,
      })

      res.status(201).json({
         success: true,
         message: '댓글이 등록되었습니다.',
         data: newComment,
      })
   } catch (error) {
      next(error)
   }
})

// 특정 게시글의 댓글 목록 조회
router.get('/:board_id', async (req, res, next) => {
   try {
      const { board_id } = req.params

      const comments = await Comment.findAll({
         where: { board_id },
         order: [['createdAt', 'DESC']], // 최신순 정렬
         // 나중에 User 모델과 조인할 때 사용
         // include: [{
         //    model: User,
         //    attributes: ['id', 'name']
         // }]
      })

      res.json({
         success: true,
         data: comments,
      })
   } catch (error) {
      next(error)
   }
})

router.delete('/:id', async (req, res, next) => {
   try {
      const id = req.params.id

      const comment = await Comment.findByPk(id)
      if(!comment){
         const error = new Error('댓글을 찾을 수 없습니다.')
         error.status = 404
         return next(error)
      }

      await comment.destroy()

      res.json({
         success: true,
         message: '댓글이 삭제되었습니다.'
      })
   } catch (error) {
      next(error)
   }
})

module.exports = router

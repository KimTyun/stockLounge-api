const express = require('express')
const { Report, Board, Comment } = require('../models')
const router = express.Router()

// 게시글 신고
router.post('/board/:id', async (req, res, next) => {
  try {
    const { user_id, reason } = req.body
    const boardId = req.params.id

    // 게시글 존재 확인
    const board = await Board.findByPk(boardId)
    if (!board) {
      return res.status(404).json({ success: false, message: '게시글을 찾을 수 없습니다.' })
    }

    // 신고 생성
    const report = await Report.create({
      user_id,
      target: 'BOARD',
      target_id: boardId,
      reason
    })

    // 게시글의 신고 횟수 증가
    await board.update({
      report_count: (board.report_count || 0) + 1
    })

    res.json({
      success: true,
      message: '게시글 신고가 접수되었습니다.',
      data: report
    })
  } catch (error) {
    next(error)
  }
})

// 댓글 신고
router.post('/comment/:id', async (req, res, next) => {
  try {
    const { user_id, reason } = req.body
    const commentId = req.params.id

    // 댓글 존재 확인
    const comment = await Comment.findByPk(commentId)
    if (!comment) {
      return res.status(404).json({ success: false, message: '댓글을 찾을 수 없습니다.' })
    }

    // 신고 생성
    const report = await Report.create({
      user_id,
      target: 'COMMENT',
      target_id: commentId,
      reason
    })

    // 댓글의 신고 횟수 증가
    await comment.update({
      report_count: (comment.report_count || 0) + 1
    })

    res.json({
      success: true,
      message: '댓글 신고가 접수되었습니다.',
      data: report
    })
  } catch (error) {
    next(error)
  }
})

module.exports = router
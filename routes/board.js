const express = require('express')
const { Board, Comment } = require('../models')
const router = express.Router()
require('dotenv').config()

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

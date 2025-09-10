const express = require('express')
const router = express.Router()
const { SiteSettings, BanWord, Reward, Report, Sanction, Transaction } = require('../models/admin.js')
const { User, Board } = require('../models')
const { sequelize } = require('../models/index.js')
const { isAdmin } = require('../middleware/middleware.js')

router.use(isAdmin)

// 모든 이용자 정보 조회
router.get('/users', async (req, res) => {
   try {
      const users = await User.findAll({
         attributes: ['id', 'email', 'name', 'age', 'roles', 'isban', 'provider', 'createdAt'],
      })
      res.status(200).json({ users })
   } catch (error) {
      console.error('에러 발생: ', error)
      res.status(500).json({ error: '서버 오류가 발생했습니다.' })
   }
})

// 특정 이용자 정보 조회
router.get('/user/:id', async (req, res) => {
   try {
      const user = await User.findByPk(req.params.id, {
         attributes: ['id', 'email', 'name', 'age', 'roles', 'isban', 'provider', 'createdAt'],
      })
      if (!user) {
         return res.status(404).json({ error: '사용자를 찾을 수 없습니다.' })
      }
      res.status(200).json({ user })
   } catch (error) {
      console.error('에러 발생: ', error)
      res.status(500).json({ error: '서버 오류가 발생했습니다.' })
   }
})

// 이용자 제재
router.put('/user/:id/ban', async (req, res) => {
   const transaction = await sequelize.transaction()
   try {
      const { isban } = req.body
      const user = await User.findByPk(req.params.id, { transaction })
      if (!user) {
         await transaction.rollback()
         return res.status(404).json({ error: '사용자를 찾을 수 없습니다.' })
      }

      await user.update({ isban }, { transaction })

      //유저 밴 기록
      if (isban) {
         await Sanction.create(
            {
               type: 'ban',
               reason: '관리자 권한에 의한 계정 정지',
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
      console.error('에러 발생: ', error)
      res.status(500).json({ error: '서버 오류가 발생했습니다.' })
   }
})

// 모든 게시글 조회
router.get('/boards', async (req, res) => {
   try {
      const boards = await Board.findAll({
         include: [{ model: User, attributes: ['name', 'email'] }],
      })
      res.status(200).json({ boards })
   } catch (error) {
      console.error('에러 발생: ', error)
      res.status(500).json({ error: '서버 오류가 발생했습니다.' })
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
      console.error('에러 발생: ', error)
      res.status(500).json({ error: '서버 오류가 발생했습니다.' })
   }
})

// 금칙어 규칙 목록
router.get('/ban-words', async (req, res) => {
   try {
      const banWords = await BanWord.findAll()
      res.status(200).json({ banWords })
   } catch (error) {
      console.error('에러 발생: ', error)
      res.status(500).json({ error: '서버 오류가 발생했습니다.' })
   }
})

// 금칙어 추가
router.post('/ban-words', async (req, res) => {
   try {
      const { word } = req.body
      if (!word) {
         return res.status(400).json({ error: '등록할 금칙어를 입력해주세요.' })
      }
      const newBanWord = await BanWord.create({ word })
      res.status(201).json({ message: '금칙어가 추가되었습니다.', banWord: newBanWord })
   } catch (error) {
      console.error('에러 발생: ', error)
      res.status(500).json({ error: '서버 오류가 발생했습니다.' })
   }
})

// 금칙어 삭제
router.delete('/ban-words/:id', async (req, res) => {
   try {
      const banWord = await BanWord.findByPk(req.params.id)
      if (!banWord) {
         return res.status(404).json({ message: '금칙어를 찾을 수 없습니다.' })
      }
      await banWord.destroy()
      res.status(200).json({ message: '금칙어를 삭제했습니다.' })
   } catch (error) {
      console.error('에러 발생: ', error)
      res.status(500).json({ error: '서버 오류가 발생했습니다.' })
   }
})

// 사이트 관리
router.get('/setting', async (req, res) => {
   //     try {
   //        const settings =
   //    } catch (error) {}
})

module.exports = router

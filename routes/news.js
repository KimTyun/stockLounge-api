const express = require('express')
const router = express.Router()
const axios = require('axios')
require('dotenv').config()

const naverUrl = `https://openapi.naver.com/v1/search/news.json`
const naverId = process.env.NAVER_CLIENT_ID
const naverPw = process.env.NAVER_CLIENT_SECRET

const naverApi = axios.create({
   baseURL: naverUrl,
   headers: {
      [`X-Naver-Client-Id`]: naverId,
      [`X-Naver-Client-Secret`]: naverPw,
   },
})

router.get('/', (req, res, next) => {
   res.send(`'뉴스 연결됨'`)
})

router.get('/crypto', async (req, res, next) => {
   try {
      const newsData = await naverApi.get('', { params: { query: '암호화폐', sort: 'date' } })
      res.json({
         success: true,
         data: newsData.data,
      })
   } catch (error) {
      next(error)
   }
})

router.get('/economy', async (req, res, next) => {
   try {
      const newsData = await naverApi.get('', { params: { query: '경제', sort: 'date' } })
      res.json({
         success: true,
         data: newsData.data,
      })
   } catch (error) {
      next(error)
   }
})

module.exports = router

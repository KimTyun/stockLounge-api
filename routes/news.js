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

router.get('/', async (req, res, next) => {
   try {
      const { length, query } = req.query
      const newsData = await naverApi.get('', { params: { query, sort: 'date', display: length } })
      res.json({
         success: true,
         data: newsData.data,
      })
   } catch (error) {
      next(error)
   }
})

module.exports = router

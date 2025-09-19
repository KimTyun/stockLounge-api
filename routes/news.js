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
      //length : 가져올 기사 개수, query : 검색어, start : 오프셋, lastLink : 마지막 데이터(originallink로 구분)
      const { length, query, start, lastLink } = req.query

      console.log('스타트', start)
      console.log('랭스', length)
      if (!query) {
         const error = new Error('필수값 누락 : query')
         error.status = 400
         throw error
      }

      //display 최댓값을 가져오고 이후 정제해서 프론트엔드로 전달
      const newsData = await naverApi.get('', { params: { query, sort: 'date', display: 100, start } })

      let articles = newsData.data.items

      if (lastLink) {
         const index = articles.findIndex((e) => e.originallink === lastLink)
         if (index !== -1) {
            articles = articles.slice(index + 1)
         }
      }

      articles = articles.slice(0, length)

      res.json({
         success: true,
         data: { ...newsData.data, items: articles },
         query,
         start,
         lastLink: articles[articles.length - 1].originallink,
      })
   } catch (error) {
      next(error)
   }
})

module.exports = router

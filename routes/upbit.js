const express = require('express')
const axios = require('axios')
const router = express.Router()

// Upbit API 기본 URL
const UPBIT_API_URL = 'https://api.upbit.com/v1'

// 모든 코인 목록 조회
router.get('/coins', async (req, res, next) => {
   try {
      const response = await axios.get(`${UPBIT_API_URL}/market/all`)
      const coins = response.data
         .filter((coin) => coin.market.startsWith('KRW-'))
         .map((coin) => ({
            market: coin.market,
            korean_name: coin.korean_name,
            english_name: coin.english_name,
            market_warning: coin.market_warning,
         }))

      res.json({
         success: true,
         data: coins,
      })
   } catch (error) {
      next(error)
   }
})

// 특정 코인의 현재가 정보 조회
router.get('/coins/:market', async (req, res, next) => {
   try {
      const { market } = req.params
      const response = await axios.get(`${UPBIT_API_URL}/ticker`, {
         params: { markets: market },
      })

      if (response.data.length === 0) {
         return res.status(404).json({
            success: false,
            message: '해당 코인을 찾을 수 없습니다.',
         })
      }

      res.json({
         success: true,
         data: response.data[0],
      })
   } catch (error) {
      next(error)
   }
})

// 캔들 데이터 조회
router.get('/coins/:market/candles/:timeframe', async (req, res, next) => {
   try {
      const { market, timeframe } = req.params
      const { count = 200 } = req.query

      let url
      switch (timeframe) {
         case 'minutes/1':
         case 'minutes/3':
         case 'minutes/5':
         case 'minutes/15':
         case 'minutes/30':
         case 'minutes/60':
         case 'minutes/240':
            url = `${UPBIT_API_URL}/candles/${timeframe}`
            break
         case 'days':
         case 'weeks':
         case 'months':
            url = `${UPBIT_API_URL}/candles/${timeframe}`
            break
         default:
            return res.status(400).json({
               success: false,
               message: '지원하지 않는 시간 단위입니다.',
            })
      }

      const response = await axios.get(url, {
         params: {
            market,
            count: Math.min(parseInt(count), 200),
         },
      })

      res.json({
         success: true,
         data: response.data,
      })
   } catch (error) {
      next(error)
   }
})

// 실시간 시세 조회 (WebSocket 대신 REST API로)
router.get('/coins/:market/ticker', async (req, res, next) => {
   try {
      const { market } = req.params
      const response = await axios.get(`${UPBIT_API_URL}/ticker`, {
         params: { markets: market },
      })

      res.json({
         success: true,
         data: response.data[0],
      })
   } catch (error) {
      next(error)
   }
})

// 여러 코인의 시세 조회
router.get('/tickers', async (req, res, next) => {
   try {
      const { markets } = req.query
      const marketList = markets ? markets.split(',') : ['KRW-BTC', 'KRW-ETH', 'KRW-XRP']

      const response = await axios.get(`${UPBIT_API_URL}/ticker`, {
         params: { markets: marketList.join(',') },
      })

      res.json({
         success: true,
         data: response.data,
      })
   } catch (error) {
      next(error)
   }
})

module.exports = router


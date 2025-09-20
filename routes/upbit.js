const express = require('express')
const router = express.Router()
const axios = require('axios')
require('dotenv').config()

const upbitURL = `https://api.upbit.com/v1/`

const upbitApi = axios.create({
   baseURL: upbitURL,
   headers: {
      accept: 'application/json',
   },
})

router.get('/list', async (req, res, next) => {
   try {
      const n = req.query.n || 15
      const response = await upbitApi.get('ticker/all', {
         params: {
            quote_currencies: 'KRW',
         },
      })

      res.json({
         success: true,
         data: response.data.sort((a, b) => Number(b.trade_price) - Number(a.trade_price)).slice(0, n),
      })
   } catch (error) {
      next(error)
   }
})

router.get('/markets', async (req, res, next) => {
   try {
      const response = await upbitApi.get('market/all', {
         params: {
            is_details: false,
         },
      })

      res.json(response.data)
   } catch (error) {
      next(error)
   }
})

router.get('/candles', async (req, res, next) => {
   try {
      const { time = 'days', market, count } = req.query
      const response = await upbitApi.get(`candles/${time}`, {
         params: {
            market,
            count,
            converting_price_unit: 'KRW',
         },
      })

      res.json(response.data)
   } catch (error) {
      next(error)
   }
})

module.exports = router

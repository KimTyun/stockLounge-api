const express = require('express')
const router = express.Router()
const authMiddleware = require('../middleware/middleware')
const adminCtrl = require('../ctrl/adminCtrl')

// 이 라우터에 속한 모든 엔드포인트에 authMiddleware 적용
router.use(authMiddleware)

//대시보드 데이터 API
router.get('/', adminCtrl.getDashData)

module.exports = router

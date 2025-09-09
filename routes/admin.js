const express = require('express')
const router = express.Router()

// 이 라우터에 속한 모든 엔드포인트에 authMiddleware 적용

//대시보드 데이터 API
router.get('/', adminCtrl.getDashData)

module.exports = router

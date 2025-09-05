const jwt = require('jsonwebtoken')

// 관리자 페이지 백엔드 보려고 만든 임시 미들웨어입니다 필요하시면 얼마든 수정하세요

const authMiddleware = (req, res, next) => {
   try {
      const token = req.cookies.token
      if (!token) {
         return res.status(401).json({ message: '인증에 실패했습니다. 다시 로그인해주세요.' })
      }

      const decoded = jwt.verify(token, process.env.JWT_SECRET)

      if (decoded.role !== 'admin') {
         return res.status(403).json({ message: '관리자 권한이 없습니다.' })
      }

      req.user = decoded
      next()
   } catch (error) {
      //인증값이 어떤 이유든 안 유효하면
      return res.status(401).json({ message: '인증이 유효하지 않습니다.', error: error.message })
   }
}

module.exports = authMiddleware

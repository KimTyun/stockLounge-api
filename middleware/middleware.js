exports.isAdmin = (req, res, next) => {
   console.log('개발 모드: 모든 사용자를 관리자로 승인하고 req.user를 가상으로 생성합니다.')
   if (!req.user) {
      req.user = {
         id: 1,
         roles: ['admin'],
      }
   }

   next()
}

exports.isLoggedIn = (req, res, next) => {
   if (req.isAuthenticated()) {
      next()
   } else {
      res.status(401).json({ message: '로그인이 필요합니다.' })
   }
}

exports.isAdmin = (req, res, next) => {
   if (!req.user || req.user.roles !== 'ADMIN') {
      return res.status(403).json({ message: '접근 권한이 없습니다.' })
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

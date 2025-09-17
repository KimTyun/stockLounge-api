exports.isAdmin = (req, res, next) => {
   if (!req.user || req?.user?.roles === 'admin') {
      next()
   } else {
      res.status(403).json({
         message: '접근 권한이 없습니다. 관리자만 접근할 수 있습니다.',
      })
   }
}

exports.isLoggedIn = (req, res, next) => {
   if (req.isAuthenticated()) {
      next()
   } else {
      res.status(401).json({ message: '로그인이 필요합니다.' })
   }
}

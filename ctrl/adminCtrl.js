exports.getDashData = async (req, res) => {
   const adminDB = require('../models/admin')

   exports.getDashData = async (req, res) => {
      try {
         const dashStats = await adminDB.getDashSum()
         const recentUsers = await adminDB.getRecentUsers()
         const recentPosts = await adminDB.getRecentPosts()

         const dashboardData = {
            dashStats,
            recentUsers,
            recentPosts,
            adminAlerts: {
               reportedPosts: 5,
               pendingSantions: 3,
               systemStatus: '정상 작동 중',
            },
         }

         res.status(200).json(dashboardData)
      } catch (error) {
         console.error('대시보드 데이터 조회 실패: ', error)
         res.status(500).json({ message: '서버 오류 발생' })
      }
   }
}

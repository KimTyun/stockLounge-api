// 백엔드 기능 확인을 위한 임시 파일입니다. 수정하시게 될 경우 미리 알려주시기만 해주세요

const db = require('../config/db')

//관리자페이지 통계
exports.getDashSum = async () => {
   try {
      const [stats] = await db.query(`
    SELECT
        (SELECT COUNT(*) FROM users) AS totalUsers,
        (SELECT COUNT(*) FROM posts) AS totalPosts,
        (SELECT COUNT(*) FROM comments) AS totalComments,
        (SELECT COUNT(*) FROM access_logs WHERE DATE(access_date) = CURDATE()) AS todayVisitors,
        (SELECT COUNT(*) FROM posts WHERE DATE(created_at) = CURDATE()) AS todayPosts,
        (SELECT COUNT(*) FROM users WHERE DATE(created_at) = CURDATE()) AS todaySignups
    `)
      const grownStats = {
         userGrowth: 12.5,
         postGrowth: -2.3,
         commentGrowth: 15.7,
         visitorGrowth: 8.2,
         postGrowthToday: 23.4,
      }
      return {
         ...stats[0],
         ...grownStats,
      }
   } catch (error) {
      throw new Error(`대시보드 통계 조회 실패: ${error.message}`)
   }
}

// 최근 가입 회원 조회
exports.getRecentUsers = async (limit = 5) => {
   try {
      const [users] = await db.query(`SELECT id, nickname, email, status, created_at AS joinDate FROM users ORDER BY created_at DESC LIMIT ?`, [limit])
      return users
   } catch (error) {
      throw new Error(`최근 가입 회원 목록 조회 실패: ${error.message}`)
   }
}

//최근 게시글 조회
exports.getRecentPosts = async (limit = 5) => {
   try {
      const [posts] = await db.query(
         `
        SELECT p.id, p.title, p.views, p.created_at AS created, u.nickname AS author,
        (SELECT COUNT(*) FROM comments WHERE post_id = p.id) AS comments
        FROM posts p
        JOIN users u ON p.author_id = u.id
        ORDER BY p.created_at DESC LIMIT ?`,
         [limit]
      )
      return posts
   } catch (error) {
      throw new Error(`최근 등록 게시물 조회 실패: ${error.message}`)
   }
}

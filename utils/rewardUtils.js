const { Reward, RewardRecord } = require('../models')

// 포인트 지급 함수
const givePoints = async (userId, points, reason) => {
   try {
      // 사용자 리워드 정보 가져오기 또는 생성
      let reward = await Reward.findOne({ where: { id: userId } })

      if (!reward) {
         reward = await Reward.create({
            id: userId,
            point: points,
            accumulated_point: points,
         })
      } else {
         await reward.update({
            point: reward.point + points,
            accumulated_point: reward.accumulated_point + points,
         })
      }

      // 포인트 지급 기록 저장
      await RewardRecord.create({
         user_id: userId,
         change: points,
         reason: reason,
      })

      return reward
   } catch (error) {
      console.error('포인트 지급 실패:', error)
      throw error
   }
}

module.exports = { givePoints }

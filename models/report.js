const { Sequelize, DataTypes } = require('sequelize')
// 해당 테이블은 유저가 신고를 당한 이유가 기록됩니다.
// BanUser가 식당 출입금지 목록이면, Report는 그 사람을 출입금지 올리게 만든 불만 접수함입니다.
// 관리자 및 관리자 통계의 신고 접수 집계에 필요합니다.
module.exports = class Report extends Sequelize.Model {
   static init(sequelize) {
      return super.init(
         {
            reporter_id: {
               type: DataTypes.INTEGER,
               allowNull: false,
            },
            reported_user_id: {
               type: DataTypes.INTEGER,
               allowNull: true,
            },
            reported_board_id: {
               type: DataTypes.INTEGER,
               allowNull: true,
            },
            reported_comment_id: {
               type: DataTypes.INTEGER,
               allowNull: true,
            },
            reason: {
               type: DataTypes.STRING(255),
               allowNull: false,
            },
            status: {
               type: DataTypes.ENUM('pending', 'resolved', 'dismissed'),
               defaultValue: 'pending',
               allowNull: false,
            },
         },
         {
            sequelize,
            timestamps: true,
            underscored: true,
            modelName: 'Report',
            tableName: 'report',
            charset: 'utf8mb4',
            collate: 'utf8mb4_general_ci',
         }
      )
   }

   static associate(db) {
      db.Report.belongsTo(db.User, {
         foreignKey: 'reporter_id',
         targetKey: 'id',
         as: 'Reporter',
      })
      db.Report.belongsTo(db.User, {
         foreignKey: 'reported_user_id',
         targetKey: 'id',
         as: 'ReportedUser',
      })
      db.Report.belongsTo(db.Board, {
         foreignKey: 'reported_board_id',
         targetKey: 'id',
      })
      db.Report.belongsTo(db.Comment, {
         foreignKey: 'reported_comment_id',
         targetKey: 'id',
      })
   }
}

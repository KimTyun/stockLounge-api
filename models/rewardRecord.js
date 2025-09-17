const { Sequelize, DataTypes } = require('sequelize')

module.exports = class RewardRecord extends Sequelize.Model {
   static init(sequelize) {
      return super.init(
         {
            change: {
               type: DataTypes.INTEGER,
               allowNull: false,
            },
            reason: {
               type: DataTypes.STRING(255),
               allowNull: false,
            },
         },
         {
            sequelize,
            timestamps: true,
            underscored: true,
            modelName: 'RewardRecord',
            tableName: 'reward_records',
            paranoid: true,
            charset: 'utf8mb4',
            collate: 'utf8mb4_general_ci',
         }
      )
   }

   static associate(db) {
      db.RewardRecord.belongsTo(db.Reward, {
         foreignKey: 'user_id',
         targetKey: 'id',
      })
   }
}

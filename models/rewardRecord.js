const { Sequelize, DataTypes } = require('sequelize')

module.exports = class RewardRecord extends Sequelize.Model {
   static init(sequelize) {
      return super.init(
         {
            user_id: {
               type: DataTypes.INTEGER,
               allowNull: false,
               references: {
                  model: 'users',
                  key: 'id',
               },
            },
            change: {
               type: DataTypes.INTEGER,
               allowNull: false,
            },
            reason: {
               type: DataTypes.STRING(255),
               allowNull: false,
            },
            reward_item_id: {
               type: DataTypes.INTEGER,
               allowNull: true,
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
      db.RewardRecord.belongsTo(db.RewardItem, {
         foreignKey: 'reward_item_id',
         targetKey: 'id',
      })
   }
}

const { Sequelize, DataTypes } = require('sequelize')

module.exports = class Reward extends Sequelize.Model {
   static init(sequelize) {
      return super.init(
         {
            id: {
               type: DataTypes.INTEGER,
               primaryKey: true,
               references: {
                  model: 'users',
                  key: 'id',
               },
               onUpdate: 'CASCADE',
               onDelete: 'CASCADE',
            },
            accumulated_point: {
               type: DataTypes.INTEGER,
               allowNull: false,
               defaultValue: 0,
            },
            point: {
               type: DataTypes.INTEGER,
               allowNull: false,
               defaultValue: 0,
            },
            coin: {
               type: DataTypes.INTEGER,
               allowNull: false,
               defaultValue: 0.0,
            },
         },
         {
            sequelize,
            timestamps: true,
            underscored: true,
            modelName: 'Reward',
            tableName: 'rewards',
            paranoid: true,
            charset: 'utf8mb4',
            collate: 'utf8mb4_general_ci',
         }
      )
   }

   static associate(db) {
      db.Reward.belongsTo(db.User, {
         foreignKey: 'id',
         targetKey: 'id',
      })
      db.Reward.hasMany(db.RewardRecord, {
         foreignKey: 'user_id',
         sourceKey: 'id',
      })
   }
}

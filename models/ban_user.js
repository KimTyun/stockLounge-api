const { Sequelize, DataTypes } = require('sequelize')

module.exports = class BanUser extends Sequelize.Model {
   static init(sequelize) {
      return super.init(
         {
            user_id: {
               type: DataTypes.INTEGER,
               allowNull: false,
            },
            reason: {
               type: DataTypes.STRING(255),
               allowNull: true,
            },
            start_date: {
               type: DataTypes.DATE,
               defaultValue: Sequelize.NOW,
               allowNull: true,
            },
            end_date: {
               type: DataTypes.DATE,
               allowNull: true,
            },
         },
         {
            sequelize,
            timestamps: false,
            underscored: true,
            modelName: 'BanUser',
            tableName: 'ban_user',
            charset: 'utf8mb4',
            collate: 'utf8mb4_general_ci',
         }
      )
   }
   static associate(db) {
      db.BanUser.belongsTo(db.User, { foreignKey: 'user_id', targetKey: 'id' })
   }
}

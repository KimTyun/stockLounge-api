const { Sequelize, DataTypes } = require('sequelize')

module.exports = class Ban extends Sequelize.Model {
   static init(sequelize) {
      return super.init(
         {
            pattern: {
               type: DataTypes.STRING(255),
               allowNull: true,
            },
            description: {
               type: DataTypes.STRING(255),
               allowNull: true,
            },
            admin_id: {
               type: DataTypes.INTEGER,
               allowNull: false,
            },
         },
         {
            sequelize,
            timestamps: false,
            underscored: true,
            modelName: 'Ban',
            tableName: 'ban',
            charset: 'utf8mb4',
            collate: 'utf8mb4_general_ci',
         }
      )
   }
   static associate(db) {
      db.Ban.belongsTo(db.User, { foreignKey: 'admin_id', targetKey: 'id', as: 'Admin' })
   }
}

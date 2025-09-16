const { Sequelize, DataTypes } = require('sequelize')

module.exports = class SiteSettings extends Sequelize.Model {
   static init(sequelize) {
      return super.init(
         {
            key: {
               type: DataTypes.STRING(100),
               allowNull: false,
               unique: true,
            },
            value: {
               type: DataTypes.TEXT,
               allowNull: false,
            },
         },
         {
            sequelize,
            timestamps: true,
            underscored: true,
            modelName: 'SiteSettings',
            tableName: 'site_settings',
            charset: 'utf8mb4',
            collate: 'utf8mb4_general_ci',
         }
      )
   }
}

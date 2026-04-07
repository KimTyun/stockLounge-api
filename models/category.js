const { Sequelize, DataTypes } = require('sequelize')

module.exports = class Category extends Sequelize.Model {
   static init(sequelize) {
      return super.init(
         {
            category: {
               type: DataTypes.STRING(100),
               allowNull: false,
               defaultValue: 'free',
            },
         },
         {
            sequelize,
            timestamps: false,
            underscored: false,
            modelName: 'Category',
            tableName: 'categories',
            paranoid: false,
         },
      )
   }

   static associate(db) {
      db.Category.hasMany(db.Board, {
         foreignKey: 'category',
         sourceKey: 'id',
      })
   }
}

const { Sequelize, DataTypes } = require('sequelize')

module.exports = class Product extends Sequelize.Model {
   static init(sequelize) {
      return super.init(
         {
            user_id: {
               type: DataTypes.INTEGER,
               allowNull: false,
            },
            name: {
               type: DataTypes.STRING(100),
               allowNull: true,
            },
            price: {
               type: DataTypes.INTEGER,
               allowNull: true,
            },
            serial_no: {
               type: DataTypes.STRING(255),
               allowNull: true,
               unique: true,
            },
            stock: {
               type: DataTypes.INTEGER,
               defaultValue: 0,
               allowNull: true,
            },
            product_img: {
               type: DataTypes.STRING(255),
               allowNull: true,
            },
            product_list_id: {
               type: DataTypes.INTEGER,
               allowNull: false,
            },
         },
         {
            sequelize,
            timestamps: true,
            underscored: true,
            modelName: 'Product',
            tableName: 'product',
            charset: 'utf8mb4',
            collate: 'utf8mb4_general_ci',
         }
      )
   }
   static associate(db) {
      db.Product.belongsTo(db.User, { foreignKey: 'user_id', targetKey: 'id' })

      db.Product.belongsTo(db.ProductList, {
         foreignKey: 'product_list_id',
         targetKey: 'id',
      })
   }
}

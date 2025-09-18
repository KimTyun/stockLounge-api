const { Sequelize, DataTypes } = require('sequelize')
// 이 테이블은 관리자가 관리하는 상품 목록에 대한 테이블로, product가 값을 참조해갑니다.
module.exports = class ProductList extends Sequelize.Model {
   static init(sequelize) {
      return super.init(
         {
            id: {
               type: DataTypes.UUID,
               defaultValue: DataTypes.UUIDV4,
               primaryKey: true,
               allowNull: false,
            },
            name: {
               type: DataTypes.STRING(100),
               allowNull: false,
            },
            points: {
               type: DataTypes.INTEGER,
               allowNull: false,
               defaultValue: 0,
            },
            stock: {
               type: DataTypes.INTEGER,
               allowNull: false,
               defaultValue: 0,
            },
         },
         {
            sequelize,
            timestamps: true,
            underscored: true,
            modelName: 'ProductList',
            tableName: 'product_list',
            charset: 'utf8mb4',
            collate: 'utf8mb4_general_ci',
         }
      )
   }

   static associate(db) {
      db.ProductList.hasMany(db.Product, {
         foreignKey: 'product_list_id',
         sourceKey: 'id',
      })
   }
}

const { Sequelize, DataTypes } = require('sequelize')

module.exports = class Board extends Sequelize.Model {
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
               // 사용자 삭제시 게시글도 삭제됨
               onDelete: 'CASCADE',
               onUpdate: 'CASCADE',
            },
            title: {
               type: DataTypes.STRING(200),
               allowNull: false,
            },
            content: {
               type: DataTypes.TEXT,
               allowNull: true,
            },
            like_count: {
               type: DataTypes.INTEGER,
               allowNull: false,
               defaultValue: 0,
            },
            report_count: {
               type: DataTypes.INTEGER,
               allowNull: false,
               defaultValue: 0,
            },
            board_img: {
               type: DataTypes.STRING(255),
               allowNull: true,
            },
         },
         {
            sequelize,
            timestamps: true,
            underscored: false,
            modelName: 'Board',
            tableName: 'boards',
            paranoid: false,
            charset: 'utf8mb4',
            collate: 'utf8mb4_general_ci',
         }
      )
   }

   static associate(db) {
      db.Board.belongsTo(db.User, {
         foreignKey: 'user_id',
         targetKey: 'id',
      })

      db.Board.belongsTo(db.Category, {
         foreignKey: 'category',
         targetKey: 'id',
      })
   }
}

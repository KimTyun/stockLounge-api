const { Sequelize, DataTypes } = require('sequelize')

// 로그인 생기기 전까지는 allownull 모두 true 할게요

module.exports = class Board extends Sequelize.Model {
   static init(sequelize) {
      return super.init(
         {
            user_id: {
               type: DataTypes.INTEGER,
               allowNull: true,
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
               allowNull: true,
            },
            content: {
               type: DataTypes.TEXT,
               allowNull: true,
            },
            category: {
               type: DataTypes.INTEGER,
               allowNull: true,
               references: {
                  model: 'categories',
                  key: 'id',
               },
            },
            like_count: {
               type: DataTypes.INTEGER,
               allowNull: true,
               defaultValue: 0,
            },
            report_count: {
               type: DataTypes.INTEGER,
               allowNull: true,
               defaultValue: 0,
            },
            board_img: {
               type: DataTypes.STRING(255),
               allowNull: true,
            },
            view_count: {
               type: DataTypes.INTEGER,
               allowNull: true,
            },
         },
         {
            sequelize,
            timestamps: true,
            underscored: true,
            modelName: 'Board',
            tableName: 'boards',
            paranoid: true,
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

      db.Board.hasMany(db.Comment, {
         foreignKey: 'board_id',
         sourceKey: 'id',
      })
   }
}

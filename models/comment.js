const { Sequelize, DataTypes } = require('sequelize')

module.exports = class Comment extends Sequelize.Model {
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
               // 사용자 삭제시 댓글도 삭제됨
               onDelete: 'CASCADE',
               onUpdate: 'CASCADE',
            },
            board_id: {
               type: DataTypes.INTEGER,
               allowNull: true,
               references: {
                  model: 'boards',
                  key: 'id',
               },
               // 게시글 삭제시 댓글도 삭제됨
               onDelete: 'CASCADE',
               onUpdate: 'CASCADE',
            },
            content: {
               type: DataTypes.TEXT,
               allowNull: false,
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
         },
         {
            sequelize,
            timestamps: true,
            underscored: false,
            modelName: 'Comment',
            tableName: 'comments',
            paranoid: false,
            charset: 'utf8mb4',
            collate: 'utf8mb4_general_ci',
         }
      )
   }

   static associate(db) {
      db.Comment.belongsTo(db.User, {
         foreignKey: 'user_id',
         targetKey: 'id',
      })

      db.Comment.belongsTo(db.Board, {
         foreignKey: 'board_id',
         targetKey: 'id',
      })
   }
}

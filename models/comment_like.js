const { Sequelize, DataTypes } = require('sequelize')

module.exports = class CommentLike extends Sequelize.Model {
   static init(sequelize) {
      return super.init(
         {
            comment_id: {
               type: DataTypes.INTEGER,
               allowNull: false,
               references: {
                  model: 'comments',
                  key: 'id',
               },
               onDelete: 'CASCADE',
            },
            user_id: {
               type: DataTypes.INTEGER,
               // ★ 로그인 기능 만들면 false로 변경해야함
               allowNull: true,
               references: {
                  model: 'users',
                  key: 'id',
               },
               onDelete: 'CASCADE',
            },
         },
         {
            sequelize,
            timestamps: true,
            underscored: true,
            modelName: 'CommentLike',
            tableName: 'comment_likes',
            charset: 'utf8mb4',
            collate: 'utf8mb4_general_ci',
            indexes: [
               {
                  unique: true,
                  fields: ['comment_id', 'user_id'], // 중복 좋아요 방지
               },
            ],
         }
      )
   }

   static associate(db) {
      db.CommentLike.belongsTo(db.Comment, { foreignKey: 'comment_id', targetKey: 'id' })
      db.CommentLike.belongsTo(db.User, { foreignKey: 'user_id', targetKey: 'id' })
   }
}

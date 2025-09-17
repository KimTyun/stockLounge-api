const { Sequelize, DataTypes } = require('sequelize')

module.exports = class BoardLike extends Sequelize.Model {
   static init(sequelize) {
      return super.init(
         {
            board_id: {
               type: DataTypes.INTEGER,
               allowNull: false,
               references: {
                  model: 'boards',
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
            modelName: 'BoardLike',
            tableName: 'board_likes',
            charset: 'utf8mb4',
            collate: 'utf8mb4_general_ci',
            indexes: [
               {
                  unique: true,
                  fields: ['board_id', 'user_id'], // 중복 좋아요 방지
               },
            ],
         }
      )
   }

   static associate(db) {
      db.BoardLike.belongsTo(db.Board, { foreignKey: 'board_id', targetKey: 'id' })
      db.BoardLike.belongsTo(db.User, { foreignKey: 'user_id', targetKey: 'id' })
   }
}

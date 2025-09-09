module.exports = class Category extends Sequelize.Model {
   static init(sequelize) {
      return super.init(
         {
            category: {
               type: DataTypes.String(100),
               allowNull: false,
               defaultValue: 'free',
            },
         },
         {
            sequelize,
            timestamps: false,
            underscored: false,
            modelName: 'Category',
            tableName: 'categorys',
            paranoid: false,
            charset: 'utf8mb4',
            collate: 'utf8mb4_general_ci',
         }
      )
   }

   static associate(db) {
      db.Category.belongsTo(db.Board, {
         foreignKey: 'board_id',
         targetKey: 'id',
      })
   }
}

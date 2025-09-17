const { Sequelize, DataTypes } = require('sequelize')

module.exports = class User extends Sequelize.Model {
   static init(sequelize) {
      return super.init(
         {
            email: {
               type: DataTypes.STRING(255),
               allowNull: false,
               unique: true,
            },
            pw: {
               type: DataTypes.STRING(255),
               allowNull: true,
            },
            name: {
               type: DataTypes.STRING(100),
               allowNull: false,
            },
            age: {
               type: DataTypes.INTEGER,
               allowNull: true,
            },
            roles: {
               type: DataTypes.ENUM('USER', 'ADMIN'),
               allowNull: false,
               defaultValue: 'USER',
            },
            is_ban: {
               type: DataTypes.BOOLEAN,
               allowNull: false,
               defaultValue: false,
            },
            provider: {
               type: DataTypes.ENUM('KAKAO', 'GOOGLE'),
               allowNull: false,
            },
            profile_img: {
               type: DataTypes.TEXT,
               allowNull: true,
            },
            wallet: {
               type: DataTypes.TEXT,
               allowNull: true,
            },
         },
         {
            sequelize,
            timestamps: true,
            underscored: false,
            modelName: 'User',
            tableName: 'users',
            paranoid: false,
            charset: 'utf8mb4',
            collate: 'utf8mb4_general_ci',
         }
      )
   }

   static associate(db) {
      db.User.hasMany(db.Board, {
         foreignKey: 'user_id',
         sourceKey: 'id',
      })
      db.User.hasMany(db.BanUser, {
         foreignKey: 'user_id',
         sourceKey: 'id',
      })
      db.User.hasMany(db.Product, {
         foreignKey: 'user_id',
         sourceKey: 'id',
      })
      db.User.hasMany(db.Ban, {
         foreignKey: 'admin_id',
         sourceKey: 'id',
         as: 'AdminBans',
      })
      db.User.hasOne(db.Reward, {
         foreignKey: 'id',
         sourceKey: 'id',
      })
      db.User.hasMany(db.RewardRecord, {
         foreignKey: 'user_id',
         sourceKey: 'id',
      })
   }
}

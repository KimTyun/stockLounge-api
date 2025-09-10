const { Sequelize, DataTypes } = require('sequelize')

// 이 파일은 관리자 페이지의 고유 기능에 사용되는 모델들을 정의합니다.
// User 모델은 별도의 파일(User.js)에 존재한다고 가정합니다.

// ----------------------------------------------------
// 1. 사이트 설정 모델 (SiteSettings)
// ----------------------------------------------------
class SiteSettings extends Sequelize.Model {
   static init(sequelize) {
      return super.init(
         {
            siteName: { type: DataTypes.STRING, allowNull: false },
            siteDescription: { type: DataTypes.TEXT, allowNull: false },
            maintenanceMode: { type: DataTypes.BOOLEAN, defaultValue: false },
            allowRegistration: { type: DataTypes.BOOLEAN, defaultValue: true },
            requireEmailVerification: { type: DataTypes.BOOLEAN, defaultValue: false },
            pointsPerPost: { type: DataTypes.INTEGER, defaultValue: 10 },
            pointsPerComment: { type: DataTypes.INTEGER, defaultValue: 5 },
            pointsPerLike: { type: DataTypes.INTEGER, defaultValue: 1 },
            coinExchangeRate: { type: DataTypes.FLOAT, defaultValue: 100 },
            maxPostsPerDay: { type: DataTypes.INTEGER, defaultValue: 5 },
            maxCommentsPerDay: { type: DataTypes.INTEGER, defaultValue: 20 },
            enableSocialLogin: { type: DataTypes.BOOLEAN, defaultValue: true },
            enableNotifications: { type: DataTypes.BOOLEAN, defaultValue: true },
         },
         {
            sequelize,
            timestamps: false,
            underscored: true,
            modelName: 'SiteSettings',
            tableName: 'site_settings',
            charset: 'utf8mb4',
            collate: 'utf8mb4_general_ci',
         }
      )
   }
}

// ----------------------------------------------------
// 2. 금지어 모델 (BanWords)
// ----------------------------------------------------
class BanWord extends Sequelize.Model {
   static init(sequelize) {
      return super.init(
         {
            word: {
               type: DataTypes.STRING(255),
               allowNull: false,
               unique: true,
            },
         },
         {
            sequelize,
            timestamps: true,
            underscored: true,
            modelName: 'BanWord',
            tableName: 'ban_words',
            charset: 'utf8mb4',
            collate: 'utf8mb4_general_ci',
         }
      )
   }
}

// ----------------------------------------------------
// 3. 리워드 모델 (Rewards)
// ----------------------------------------------------
class Reward extends Sequelize.Model {
   static init(sequelize) {
      return super.init(
         {
            name: {
               type: DataTypes.STRING(255),
               allowNull: false,
            },
            points: {
               type: DataTypes.INTEGER,
               allowNull: false,
            },
            stock: {
               type: DataTypes.INTEGER,
               defaultValue: 0,
            },
         },
         {
            sequelize,
            timestamps: true,
            underscored: true,
            modelName: 'Reward',
            tableName: 'rewards',
            charset: 'utf8mb4',
            collate: 'utf8mb4_general_ci',
         }
      )
   }
}

// ----------------------------------------------------
// 4. 신고 모델 (Reports)
// ----------------------------------------------------
class Report extends Sequelize.Model {
   static init(sequelize) {
      return super.init(
         {
            contentId: {
               type: DataTypes.INTEGER,
               allowNull: false,
            },
            contentType: {
               type: DataTypes.ENUM('post', 'comment'),
               allowNull: false,
            },
            reason: {
               type: DataTypes.TEXT,
               allowNull: false,
            },
            status: {
               type: DataTypes.ENUM('pending', 'reviewed', 'resolved'),
               defaultValue: 'pending',
            },
            reportDate: {
               type: DataTypes.DATE,
               defaultValue: Sequelize.NOW,
            },
            // 신고자 ID는 User 모델과 연결됩니다.
            reporterId: {
               type: DataTypes.INTEGER,
               allowNull: false,
            },
         },
         {
            sequelize,
            timestamps: true,
            underscored: true,
            modelName: 'Report',
            tableName: 'reports',
            charset: 'utf8mb4',
            collate: 'utf8mb4_general_ci',
         }
      )
   }

   static associate(db) {
      // User.js 파일에 User.hasMany(db.Report, { foreignKey: 'reporterId' })를 추가해야 합니다.
      db.Report.belongsTo(db.User, { foreignKey: 'reporterId', targetKey: 'id' })
   }
}

// ----------------------------------------------------
// 5. 제재 모델 (Sanctions)
// ----------------------------------------------------
class Sanction extends Sequelize.Model {
   static init(sequelize) {
      return super.init(
         {
            type: {
               type: DataTypes.ENUM('suspension', 'ban'),
               allowNull: false,
            },
            reason: {
               type: DataTypes.TEXT,
               allowNull: false,
            },
            startDate: {
               type: DataTypes.DATE,
               defaultValue: Sequelize.NOW,
            },
            endDate: {
               type: DataTypes.DATE,
               allowNull: true,
            },
            // 제재 대상 및 관리자 ID는 User 모델과 연결됩니다.
            sanctionedUserId: {
               type: DataTypes.INTEGER,
               allowNull: false,
            },
            adminId: {
               type: DataTypes.INTEGER,
               allowNull: false,
            },
         },
         {
            sequelize,
            timestamps: true,
            underscored: true,
            modelName: 'Sanction',
            tableName: 'sanctions',
            charset: 'utf8mb4',
            collate: 'utf8mb4_general_ci',
         }
      )
   }

   static associate(db) {
      // User.js 파일에 User.hasMany(db.Sanction, { foreignKey: 'sanctionedUserId' })를 추가해야 합니다.
      // User.js 파일에 User.hasMany(db.Sanction, { foreignKey: 'adminId', as: 'AdminSanctions' })를 추가해야 합니다.
      db.Sanction.belongsTo(db.User, { foreignKey: 'sanctionedUserId', targetKey: 'id' })
      db.Sanction.belongsTo(db.User, { foreignKey: 'adminId', targetKey: 'id', as: 'Admin' })
   }
}

// ----------------------------------------------------
// 6. 거래 기록 모델 (Transactions)
// ----------------------------------------------------
class Transaction extends Sequelize.Model {
   static init(sequelize) {
      return super.init(
         {
            type: {
               type: DataTypes.STRING(255),
               allowNull: false,
            },
            pointsChange: {
               type: DataTypes.INTEGER,
               allowNull: false,
            },
            timestamp: {
               type: DataTypes.DATE,
               defaultValue: Sequelize.NOW,
            },
            description: {
               type: DataTypes.TEXT,
               allowNull: true,
            },
            // 거래 사용자 ID는 User 모델과 연결됩니다.
            userId: {
               type: DataTypes.INTEGER,
               allowNull: false,
            },
         },
         {
            sequelize,
            timestamps: false,
            underscored: true,
            modelName: 'Transaction',
            tableName: 'transactions',
            charset: 'utf8mb4',
            collate: 'utf8mb4_general_ci',
         }
      )
   }

   static associate(db) {
      // User.js 파일에 User.hasMany(db.Transaction, { foreignKey: 'userId' })를 추가해야 합니다.
      db.Transaction.belongsTo(db.User, { foreignKey: 'userId', targetKey: 'id' })
   }
}

module.exports = {
   SiteSettings,
   BanWord,
   Reward,
   Report,
   Sanction,
   Transaction,
}

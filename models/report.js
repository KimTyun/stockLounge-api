const { Sequelize, DataTypes } = require("sequelize")

module.exports = class Report extends Sequelize.Model {
  static init(sequelize) {
    return super.init(
      {
        id: {
          type: DataTypes.INTEGER,
          autoIncrement: true,
          primaryKey: true,
        },
        user_id: {
          type: DataTypes.INTEGER,
          allowNull: false,
          references: {
            model: "users",
            key: "id",
          },
        },
        target: {
          type: DataTypes.ENUM("BOARD", "COMMENT"),
          allowNull: false,
        },
        target_id: {
          type: DataTypes.INTEGER,
          allowNull: false,
        },
        reason: {
          type: DataTypes.STRING(255),
          allowNull: true,
        },
      },
      {
        sequelize,
        timestamps: true,
        underscored: true,
        modelName: "Report",
        tableName: "reports",
        paranoid: true,
        charset: "utf8mb4",
        collate: "utf8mb4_general_ci",
      }
    )
  }

  static associate(db) {
    db.Report.belongsTo(db.User, {
      foreignKey: "user_id",
      targetKey: "id",
    })
  }
}

const Sequelize = require('sequelize')
require('dotenv').config()

const env = process.env.NODE_ENV || 'development'
const config = require('../config/config')[env]

const db = {}

const sequelize = new Sequelize(config.database, config.username, config.password, config)

const User = require('./user')
const Board = require('./board')
const Category = require('./category')
const Comment = require('./comment')
const Reward = require('./reward')
const RewardRecord = require('./rewardRecode')

db.sequelize = sequelize
db.User = User
db.Board = Board
db.Category = Category
db.Comment = Comment
db.Reward = Reward
db.RewardRecord = RewardRecord

User.init(sequelize)
Board.init(sequelize)
Category.init(sequelize)
Comment.init(sequelize)
Reward.init(sequelize)
RewardRecord.init(sequelize)

User.associate && User.associate(db)
Board.associate && Board.associate(db)
Category.associate && Category.associate(db)
Comment.associate && Comment.associate(db)
Reward.associate && Reward.associate(db)
RewardRecord.associate && RewardRecord.associate(db)

module.exports = db

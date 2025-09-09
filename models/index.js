const Sequelize = require('sequelize')
require('dotenv').config()
const env = process.env.NODE_ENV
const config = require('../config/db')[env]

const db = {}

const sequelize = new Sequelize(config.database, config.username, config.password, config)

const User = require('./user')
const Board = require('./board')
const Category = require('./category')

db.sequelize = sequelize
db.User = User
db.Board = Board
db.Category = require('./category')

User.init(sequelize)
Board.init(sequelize)
Category.init(sequelize)

User.associate(db)
Board.init(db)
Category.init(db)

module.exports = db

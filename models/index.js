const Sequelize = require("sequelize")
require("dotenv").config()

const env = process.env.NODE_ENV || "development"
const config = require("../config/config")[env]

const db = {}

const sequelize = new Sequelize(
  config.database,
  config.username,
  config.password,
  config
)

const User = require("./user")
const Board = require("./board")
const Category = require("./category")
const Comment = require("./comment")
const Reward = require("./reward")
const RewardRecord = require("./rewardRecord")
const BoardLike = require("./board_like")
const CommentLike = require("./comment_like")
const BanUser = require("./ban_user")
const Product = require("./products")
const Ban = require("./ban")
const RewardItem = require("./rewardItem")
const Report = require("./report")
const User = require("./user")
const Board = require("./board")
const Category = require("./category")
const Comment = require("./comment")
const Reward = require("./reward")
const RewardRecord = require("./rewardRecord")
const BanUser = require("./ban_user")
const Product = require("./products")
const Ban = require("./ban")
const RewardItem = require("./rewardItem")
const SiteSettings = require("./site_settings")

db.sequelize = sequelize
db.User = User
db.Board = Board
db.Category = Category
db.Comment = Comment
db.Reward = Reward
db.RewardRecord = RewardRecord
db.BoardLike = BoardLike
db.CommentLike = CommentLike
db.BanUser = BanUser
db.Product = Product
db.Ban = Ban
db.RewardItem = RewardItem
db.Report = Report
db.SiteSettings = SiteSettings

User.init(sequelize)
Board.init(sequelize)
Category.init(sequelize)
Comment.init(sequelize)
Reward.init(sequelize)
RewardRecord.init(sequelize)
BoardLike.init(sequelize)
CommentLike.init(sequelize)
BanUser.init(sequelize)
Product.init(sequelize)
Ban.init(sequelize)
RewardItem.init(sequelize)
Report.init(sequelize)
SiteSettings.init(sequelize)

User.associate && User.associate(db)
Board.associate && Board.associate(db)
Category.associate && Category.associate(db)
Comment.associate && Comment.associate(db)
Reward.associate && Reward.associate(db)
RewardRecord.associate && RewardRecord.associate(db)
BoardLike.associate && BoardLike.associate(db)
CommentLike.associate && CommentLike.associate(db)
BanUser.associate && BanUser.associate(db)
Product.associate && Product.associate(db)
Ban.associate && Ban.associate(db)
RewardItem.associate && RewardItem.associate(db)
Report.associate && Report.associate(db)
SiteSettings.associate && SiteSettings.associate(db)

module.exports = db

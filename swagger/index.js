const newsPath = require('./path/news')
const userPath = require('./path/user')
const upbitPath = require('./path/upbit')
const rewardPath = require('./path/reward')
const reportPath = require('./path/report')
const boardPath = require('./path/board')
const authPath = require('./path/auth')

const swaggerDocument = {
   openapi: '3.0.0',
   info: {
      title: 'stockLounge 문서',
      version: '1.0.0',
      description: 'stockLounge api 문서입니다.',
   },
   servers: [
      {
         url: process.env.APP_API_URL,
      },
   ],
   paths: {
      ...newsPath,
      ...userPath,
      ...upbitPath,
      ...rewardPath,
      ...reportPath,
      ...boardPath,
      ...authPath,
   },
}

module.exports = swaggerDocument

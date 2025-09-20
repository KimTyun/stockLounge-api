const newsPath = require('./path/news')
const userPath = require('./path/user')

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
   },
}

module.exports = swaggerDocument

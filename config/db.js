const { Pool } = require('pg')
const dotenv = require('dotenv')

dotenv.config()

const pool = new Pool({
   host: process.env.DB_PROD_HOST,
   user: process.env.DB_PROD_USER,
   password: process.env.DB_PROD_PASSWORD,
   database: process.env.DB_PROD_DATABASE,
   port: process.env.DB_PROD_PORT || 5432,
   ssl: {
      require: true,
      rejectUnauthorized: false,
   },
})

// 연결 확인
pool
   .connect()
   .then((client) => {
      console.log('StockLounge: PostgreSQL 연결 성공')
      client.release()
   })
   .catch((err) => {
      console.error('StockLounge: PostgreSQL 연결 실패', err.message)
      process.exit(1)
   })

module.exports = pool

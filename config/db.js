const mysql = require(`mysql2`)
const dotenv = require('dotenv')

dotenv.config()

const tempdb = mysql.createPool({
   host: process.env.DB_HOST,
   user: process.env.DB_USER,
   password: process.env.DB_PASSWORD,
   database: process.env.DB_DATABASE,
   port: process.env.DB_PORT,
   waitForConnections: true,
   connectionLimit: 10,
   queueLimit: 0,
})

// 프로미스 기반으로 쿼리 실행 함수를 래핑
const promisePool = tempdb.promise()

// 연결확인
promisePool
   .getConnection()
   .then((connection) => {
      console.log('StockLounge: MySQL 데이터베이스 연결에 성공했습니다.')
      connection.release()
   })
   .catch((err) => {
      console.error('StockLounge: MySQL 연결 실패', err.message)
      process.exit(1)
   })

module.exports = promisePool

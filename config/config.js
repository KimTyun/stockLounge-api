require('dotenv').config()

module.exports = {
   development: {
      username: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_DATABASE,
      host: process.env.DB_HOST,
      port: process.env.DB_PORT,
      dialect: process.env.DB_DIALECT || 'mysql',
      timezone: '+09:00',
   },
   production: {
      username: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_DATABASE,
      host: process.env.DB_HOST,
      port: process.env.DB_PORT,
      dialect: process.env.DB_DIALECT || 'mysql',
      timezone: '+09:00',
   },
}

// module.exports = {
//    development: {
//       username: process.env.DB_DEV_USERNAME,
//       password: process.env.DB_DEV_PASSWORD,
//       database: process.env.DB_DEV_DATABASE,
//       host: process.env.DB_DEV_HOST,
//       port: process.env.DB_DEV_PORT,
//       dialect: process.env.DB_DEV_DIALECT || 'mysql',
//       timezone: '+09:00',
//    },
//    production: {
//       username: process.env.DB_PROD_USER,
//       password: process.env.DB_PROD_PASSWORD,
//       database: process.env.DB_PROD_DATABASE,
//       host: process.env.DB_PROD_HOST,
//       port: process.env.DB_PROD_PORT,
//       dialect: process.env.DB_PROD_DIALECT || 'mysql',
//       timezone: '+09:00',
//    },
// }

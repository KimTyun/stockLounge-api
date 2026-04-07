require('dotenv').config()

const asBool = (value) => String(value).toLowerCase() === 'true'

const buildPostgresSslOptions = (enabled) => {
   if (!enabled) return {}
   return {
      dialectOptions: {
         ssl: {
            require: true,
            rejectUnauthorized: false,
         },
      },
   }
}

module.exports = {
   development: {
      username: process.env.DB_DEV_USER || process.env.DB_DEV_USERNAME,
      password: process.env.DB_DEV_PASSWORD,
      database: process.env.DB_DEV_DATABASE,
      host: process.env.DB_DEV_HOST,
      port: process.env.DB_DEV_PORT || 5432,
      dialect: process.env.DB_DEV_DIALECT || 'postgres',
      timezone: '+09:00',
      ...buildPostgresSslOptions(asBool(process.env.DB_DEV_SSL || process.env.DB_SSL)),
   },
   production: {
      username: process.env.DB_PROD_USER || process.env.DB_PROD_USERNAME,
      password: process.env.DB_PROD_PASSWORD,
      database: process.env.DB_PROD_DATABASE,
      host: process.env.DB_PROD_HOST,
      port: process.env.DB_PROD_PORT || 5432,
      dialect: process.env.DB_PROD_DIALECT || 'postgres',
      timezone: '+09:00',
      ...buildPostgresSslOptions(asBool(process.env.DB_PROD_SSL || process.env.DB_SSL)),
   },
   test: {
      username: process.env.DB_TEST_USER || process.env.DB_TEST_USERNAME,
      password: process.env.DB_TEST_PASSWORD,
      database: process.env.DB_TEST_DATABASE || process.env.DB_TEST_NAME,
      host: process.env.DB_TEST_HOST,
      port: process.env.DB_TEST_PORT || 5432,
      dialect: process.env.DB_TEST_DIALECT || 'postgres',
      timezone: '+09:00',
      ...buildPostgresSslOptions(asBool(process.env.DB_TEST_SSL || process.env.DB_SSL)),
   },
}

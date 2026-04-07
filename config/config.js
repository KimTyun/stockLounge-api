require('dotenv').config()

const asBool = (value) => String(value).toLowerCase() === 'true'

const buildPostgresDialectOptions = ({ sslEnabled, forceIpv4 }) => {
   const dialectOptions = {}

   if (sslEnabled) {
      dialectOptions.ssl = {
         require: true,
         rejectUnauthorized: false,
      }
   }

   // Render/일부 호스팅 환경에서 IPv6 outbound가 막혀 ENETUNREACH가 날 수 있어,
   // 필요 시 IPv4(A record)로만 DNS resolve 하도록 강제할 수 있게 합니다.
   if (forceIpv4) {
      dialectOptions.family = 4
   }

   return Object.keys(dialectOptions).length ? { dialectOptions } : {}
}

module.exports = {
   development: {
      url: process.env.DB_DEV_URL,
      username: process.env.DB_DEV_USER || process.env.DB_DEV_USERNAME,
      password: process.env.DB_DEV_PASSWORD,
      database: process.env.DB_DEV_DATABASE,
      host: process.env.DB_DEV_HOST,
      port: process.env.DB_DEV_PORT || 5432,
      dialect: process.env.DB_DEV_DIALECT || 'postgres',
      timezone: '+09:00',
      ...buildPostgresDialectOptions({
         sslEnabled: asBool(process.env.DB_DEV_SSL || process.env.DB_SSL),
         forceIpv4: asBool(process.env.DB_DEV_FORCE_IPV4 || process.env.DB_FORCE_IPV4),
      }),
   },
   production: {
      url: process.env.DB_PROD_URL || process.env.DATABASE_URL,
      username: process.env.DB_PROD_USER || process.env.DB_PROD_USERNAME,
      password: process.env.DB_PROD_PASSWORD,
      database: process.env.DB_PROD_DATABASE,
      host: process.env.DB_PROD_HOST,
      port: process.env.DB_PROD_PORT || 5432,
      dialect: process.env.DB_PROD_DIALECT || 'postgres',
      timezone: '+09:00',
      ...buildPostgresDialectOptions({
         sslEnabled: asBool(process.env.DB_PROD_SSL || process.env.DB_SSL),
         forceIpv4: asBool(process.env.DB_PROD_FORCE_IPV4 || process.env.DB_FORCE_IPV4),
      }),
   },
   test: {
      url: process.env.DB_TEST_URL,
      username: process.env.DB_TEST_USER || process.env.DB_TEST_USERNAME,
      password: process.env.DB_TEST_PASSWORD,
      database: process.env.DB_TEST_DATABASE || process.env.DB_TEST_NAME,
      host: process.env.DB_TEST_HOST,
      port: process.env.DB_TEST_PORT || 5432,
      dialect: process.env.DB_TEST_DIALECT || 'postgres',
      timezone: '+09:00',
      ...buildPostgresDialectOptions({
         sslEnabled: asBool(process.env.DB_TEST_SSL || process.env.DB_SSL),
         forceIpv4: asBool(process.env.DB_TEST_FORCE_IPV4 || process.env.DB_FORCE_IPV4),
      }),
   },
}

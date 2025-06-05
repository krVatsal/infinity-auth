require('dotenv').config();

module.exports = {
    DATABASE: process.env.MONGO_URI,
    PORT: process.env.PORT || 3000,
    REDIS_HOST: process.env.REDIS_HOST || 'localhost',
    REDIS_PASSWORD: process.env.REDIS_PASSWORD,
    REDIS_TLS_KEY: process.env.REDIS_TLS_KEY,
    REDIS_TLS_CA: process.env.REDIS_TLS_CA,
    REDIS_TLS_CERT: process.env.REDIS_TLS_CERT,
    ENVIRONMENT: process.env.ENVIRONMENT || 'dev',
    ENCRYPTION_KEY: process.env.ENCRYPTION_KEY,
    REDIS_OTP_EXPIRY: process.env.REDIS_OTP_EXPIRY || 120,
    REDIS_TOKEN_EXPIRY: process.env.REDIS_TOKEN_EXPIRY || 1800,
    DOMAIN: process.env.DOMAIN || 'localhost'
}; 

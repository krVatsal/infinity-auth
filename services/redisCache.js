const redis = require('redis');
const fs = require('fs');
const { REDIS_HOST, REDIS_TLS_KEY,REDIS_TLS_CA,REDIS_TLS_CERT,ENVIRONMENT,REDIS_PASSWORD } = require('../config/main');
let redisClient;
  
async function initializeRedisClient() {
    try{
        console.log("redis client initializing.. on: "+ENVIRONMENT);
        // Redis connection with TLS options
         var client;
         if(ENVIRONMENT=='prod'){

            console.log("CONNECTING TO HOST: "+REDIS_HOST);
            client = redis.createClient({
                password: REDIS_PASSWORD,
                socket: {
                    host: REDIS_HOST,
                    port: 10446
                }
            });
        //     client= redis.createClient({
        //         socket:{
        //             host:REDIS_HOST,
        //             port:6379, 
        //             tls: true,
        //             rejectUnauthorized:false,
        //             cert: fs.readFileSync(REDIS_TLS_CERT,'ascii'),
        //         }
        //    });
        }else{
            client=redis.createClient();
        } 
         await client.connect();
         console.log("redis client initialized successfully...");
         redisClient=client;
         return client;
    }catch(err){
        console.log("error while initializing redis cache...."+err);
    }
}  


// Function to set a key-value pair in the Redis cache with an optional TTL (in seconds)
async function setCache(key, value, ttlInSeconds = null) {
    if (ttlInSeconds) {
        await redisClient.set(key, value, {'EX': ttlInSeconds});
    } else {
        await redisClient.set(key, value);
    }
}

// Function to get the value of a key from the Redis cache
async function getFromCache(key) {
    return await redisClient.get(key);
}

module.exports = {
    setCache,
    getFromCache,
    initializeRedisClient
};

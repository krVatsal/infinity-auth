const redis = require("redis");
const { REDIS_HOST, REDIS_PASSWORD, ENVIRONMENT } = require("../config/main");

let redisClient = null;

async function initializeRedisClient() {
    try {
        if (redisClient) {
            return redisClient;
        }        console.log("Redis client initializing on:", ENVIRONMENT);
        console.log("Redis Host:", REDIS_HOST);
        console.log("Redis Password:", REDIS_PASSWORD ? "***provided***" : "NOT PROVIDED");

        // Parse host and port from REDIS_HOST if it contains port
        let host, port;
        if (REDIS_HOST.includes(':')) {
            [host, port] = REDIS_HOST.split(':');
            port = parseInt(port);
        } else {
            host = REDIS_HOST;
            port = 6379; // default Redis port
        }

        const options = {
            password: REDIS_PASSWORD,
            socket: {
                host: host,
                port: port,
                reconnectStrategy: (retries) => {
                    if (retries > 10) {
                        console.log('Max Redis reconnection attempts reached');
                        return new Error('Max reconnection attempts reached');
                    }
                    console.log(`Redis reconnection attempt ${retries}`);
                    return Math.min(retries * 50, 500);
                }
            }
        };

        // Create Redis client
        redisClient = redis.createClient(options);

        // Error handling
        redisClient.on('error', (err) => {
            console.error('Redis Client Error:', err);
        });

        redisClient.on('connect', () => {
            console.log('Redis Client Connected');
        });        // Connect to Redis with timeout
        console.log("Attempting to connect to Redis...");
        const connectTimeout = setTimeout(() => {
            console.log("Redis connection timeout, giving up");
            redisClient.disconnect();
            redisClient = null;
        }, 5000); // 5 second timeout

        await redisClient.connect();
        clearTimeout(connectTimeout);
        
        console.log("Redis client initialized successfully");
        return redisClient;
    } catch (err) {
        console.error("Redis initialization error:", err);
        console.log("Continuing without Redis - using fallback authentication");
        redisClient = null;
        return null;
    }
}

async function setCache(key, value, ttlInSeconds = 60*2) {
    try {
        const client = await initializeRedisClient();
        if (!client) {
            console.log('Redis client not available');
            return false;
        }

        if (ttlInSeconds) {
            await client.set(key, value, { EX: ttlInSeconds });
        } else {
            await client.set(key, value);
        }
        return true;
    } catch (error) {
        console.error('Error setting cache:', error);
        return false;
    }
}

async function getFromCache(key) {
    try {
        const client = await initializeRedisClient();
        if (!client) {
            console.log('Redis client not available');
            return null;
        }

        return await client.get(key);
    } catch (error) {
        console.error('Error getting from cache:', error);
        return null;
    }
}

module.exports = {
    setCache,
    getFromCache,
    initializeRedisClient,
};
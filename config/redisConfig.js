const redis = require('redis');

const REDIS_URL = `redis://${process.env.REDIS_USERNAME || 'default'}:${process.env.REDIS_PASSWORD}@${process.env.REDIS_HOST}:${process.env.REDIS_PORT}`

const client = redis.createClient({
    url: REDIS_URL,
});

client.on('connect', () => {
    console.log('Connected to Redis 💿');
});

client.on('error', (err) => {
    console.error('Redis error', err);
});

const connect = async () => {
    try {
        await client.connect();
        console.log('Redis client connected 💿');
    } catch (err) {
        console.error('Could not connect to Redis', err);
    }
};

module.exports = {
    client,
    connect,
};

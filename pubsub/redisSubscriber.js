const { client: redisClient } = require('../config/redisConfig');

module.exports = (io) => {
    const subscriber = redisClient.duplicate();

    subscriber.connect();

    subscriber.subscribe('messages', (message) => {
        const parsedMessage = JSON.parse(message);
        io.to(parsedMessage.recipient).emit('receiveMessage', parsedMessage);
    });
};

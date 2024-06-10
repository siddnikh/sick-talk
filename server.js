const http = require('http');
const app = require('./app');
const redisConfig = require('./config/redisConfig');
const connectDB = require('./config/dbConfig');
const socketIo = require('socket.io');
const redisSubscriber = require('./pubsub/redisSubscriber');
const jwt = require('jsonwebtoken');
const Message = require('./models/messageModel'); // Import the message model

const PORT = process.env.PORT || 3000;
const server = http.createServer(app);
const io = socketIo(server);

const { client: redisClient } = redisConfig;

// Middleware to authenticate socket connections
io.use((socket, next) => {
    const token = socket.handshake.auth.token;
    if (!token) {
        return next(new Error('Authentication error'));
    }
    // Add your JWT verification logic here
    jwt.verify(token, 'secretKey', (err, decoded) => {
        if (err) {
            return next(new Error('Authentication error'));
        }
        socket.user = decoded;
        next();
    });
});

io.on('connection', (socket) => {
    console.log('New client connected');

    socket.on('sendMessage', async (data) => {
        const { recipient, message } = data;
        const newMessage = {
            sender: socket.user.id,
            recipient,
            message,
            timestamp: new Date(),
        };

        // Save the message to the database
        try {
            const savedMessage = await Message.create(newMessage);
            redisClient.publish('messages', JSON.stringify(savedMessage));
        } catch (error) {
            console.error('Error saving message to database:', error);
        }
    });

    socket.on('disconnect', () => {
        console.log('Client disconnected');
    });
});

redisSubscriber(io);

server.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
    redisConfig.connect();
    connectDB();
});

const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const logger = require('./config/logger');
const bodyParser = require('body-parser');
const authRoutes = require('./routes/authRoutes');
const taskRoutes = require('./routes/taskRoutes');
const userRoutes = require('./routes/userRoutes');
const chatRoutes = require('./routes/chatRoutes');
const errorHandler = require('./middlewares/errorHandler');

const app = express();

app.use(cors());

app.use(morgan('combined', {
    stream: {
        write: (message) => logger.info(message.trim())
    }
}));

// Custom logging for all requests
app.use((req, res, next) => {
    logger.info(`Received ${req.method} request for ${req.url}`);
    next();
});

app.use(bodyParser.json());
app.use('/chat', chatRoutes);
app.use('/users', userRoutes);
app.use('/auth', authRoutes);
app.use(errorHandler);

module.exports = app;

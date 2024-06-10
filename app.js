const express = require('express');
const bodyParser = require('body-parser');
const authRoutes = require('./routes/authRoutes');
const taskRoutes = require('./routes/taskRoutes');
const errorHandler = require('./middlewares/errorHandler');

const app = express();

app.use(bodyParser.json());
app.use('/auth', authRoutes);
app.use('/tasks', taskRoutes);
app.use(errorHandler);

module.exports = app;

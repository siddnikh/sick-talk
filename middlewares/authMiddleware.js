const jwt = require('jsonwebtoken');
const User = require('../models/userModel');
const logger = require('../config/logger');

module.exports = async (req, res, next) => {
    const authHeader = req.headers['authorization'];
    if (!authHeader) return res.status(403).send({ message: 'No token provided' });

    const token = authHeader.split(' ')[1];
    if (!token) return res.status(403).send({ message: 'No token provided' });

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secretKey');
        const user = await User.findById(decoded.id).select('-password');
        if (!user) {
            return res.status(404).send({ message: 'User not found' });
        }

        req.user = user;
        next();
    } catch (err) {
        logger.error("Error while verifying jwt: ", err);
        return res.status(500).send({ message: 'Failed to authenticate token' });
    }
};

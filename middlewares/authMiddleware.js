const jwt = require('jsonwebtoken');
const logger = require('../config/logger');

module.exports = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    if (!authHeader) return res.status(403).send({ message: 'No token provided' });

    const token = authHeader.split(' ')[1];
    if (!token) return res.status(403).send({ message: 'No token provided' });

    jwt.verify(token, process.env.JWT_SECRET || 'secretKey', (err, decoded) => {
        if (err) {
            logger.error("Error while verifying jwt: ", err);
            return res.status(500).send({ message: 'Failed to authenticate token' });
        }
        
        req.user = decoded;
        next();
    });
};

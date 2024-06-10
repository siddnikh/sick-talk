const jwt = require('jsonwebtoken');

module.exports = (req, res, next) => {
    const token = req.headers['authorization'];
    if (!token) return res.status(403).send({ message: 'No token provided' });

    jwt.verify(token, 'secretKey', (err, decoded) => {
        if (err) return res.status(500).send({ message: 'Failed to authenticate token' });

        req.user = decoded;
        next();
    });
};

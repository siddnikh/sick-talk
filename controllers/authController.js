const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const User = require('../models/userModel');
const logger = require('../config/logger');
const rateLimit = require('express-rate-limit');
const validator = require('validator');

// Rate limiter middleware to prevent brute force attacks
const registerLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 10, // Limit each IP to 10 requests per windowMs
    message: { message: 'Too many registration attempts, please try again later.' }
});

const isPasswordStrong = (password) => {
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    return passwordRegex.test(password);
};

exports.register = [registerLimiter, async (req, res, next) => {
    try {
        const { username, password, email, role } = req.body;

        if (!validator.isEmail(email)) {
            return res.status(400).send({ message: 'Invalid email address' });
        }

        if (!isPasswordStrong(password)) {
            return res.status(400).send({ message: 'Password must be at least 8 characters long and include at least one uppercase letter, one lowercase letter, one number, and one special character' });
        }

        const existingUser = await User.findOne({ username });
        if (existingUser) {
            return res.status(409).send({ message: 'Username is already in use' });
        }

        const existingEmail = await User.findOne({ email });
        if (existingEmail) {
            return res.status(409).send({ message: 'Email is already in use' });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const user = new User({ username, password: hashedPassword, email, role });
        await user.save();

        res.status(201).send({ message: 'User registered successfully' });
    } catch (error) {
        logger.error("Error while registering: ", error);
        next(error);
    }
}];

exports.login = async (req, res, next) => {
    try {
        const { username, password } = req.body;
        const user = await User.findOne({ username });
        if (!user) return res.status(400).send({ message: 'User not found' });

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return res.status(400).send({ message: 'Invalid password' });

        const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET || 'secretKey', { expiresIn: '24h' });
        res.status(200).send({ token: token, _id: user._id });
    } catch (error) {
        logger.error("Error while logging in: ", error);
        next(error);
    }
};

exports.me = async (req, res, next) => {
    try {
        res.status(200).send(req.user);
    } catch (error) {
        logger.error("Error fetching user details: ", error);
        next(error);
    }
};

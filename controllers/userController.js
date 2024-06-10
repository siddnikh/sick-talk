const User = require('../models/userModel');

exports.getUsers = async (req, res, next) => {
    try {
        const users = await User.find({}, 'username role balance');
        res.status(200).send(users);
    } catch (error) {
        next(error);
    }
};

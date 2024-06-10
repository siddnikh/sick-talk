const Message = require('../models/messageModel');
const redisClient = require('../config/redisConfig');

exports.sendMessage = async (req, res, next) => {
    try {
        const { recipient, message } = req.body;
        const newMessage = new Message({
            sender: req.user.id,
            recipient,
            message,
        });
        await newMessage.save();
        redisClient.publish('messages', JSON.stringify(newMessage));
        res.status(201).send(newMessage);
    } catch (error) {
        next(error);
    }
};

exports.getMessages = async (req, res, next) => {
    try {
        const messages = await Message.find({
            $or: [{ sender: req.user.id }, { recipient: req.user.id }],
        }).populate('sender recipient', 'username');
        res.status(200).send(messages);
    } catch (error) {
        next(error);
    }
};

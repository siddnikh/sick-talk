const Message = require('../models/messageModel');
const path = require('path');

exports.sendMessage = async (req, res, next) => {
  try {
    const { recipient, message } = req.body;
    const newMessage = new Message({
      sender: req.user.id,
      recipient,
      message,
    });
    await newMessage.save();
    res.status(201).send(newMessage);
  } catch (error) {
    next(error);
  }
};

exports.getMessagesWithUser = async (req, res, next) => {
  try {
    const { userId } = req.params;
    const { id: currentUserId } = req.user;

    const messages = await Message.find({
      $or: [
        { sender: currentUserId, recipient: userId },
        { sender: userId, recipient: currentUserId },
      ],
    }).populate('sender recipient', 'username');

    res.status(200).send(messages);
  } catch (error) {
    next(error);
  }
};

exports.uploadFile = async (req, res, next) => {
  try {
    const fileUrl = path.join('uploads', req.file.filename);
    res.status(200).send({ url: fileUrl });
  } catch (error) {
    next(error);
  }
};

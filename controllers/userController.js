const User = require("../models/userModel");
const Message = require("../models/messageModel");

const checkUserAdmin = async (userId) => {
  const user = await User.findById(userId);
  return user.role === "admin";
};

exports.checkUserExists = async (req, res, next) => {
  const { username } = req.params;

  try {
    const user = await User.findOne({ username });
    if (user) {
      res.status(200).send({ username: user.username, id: user._id });
    } else {
      res.status(404).send({ message: "User not found" });
    }
  } catch (error) {
    next(error);
  }
};

exports.getUsers = async (req, res, next) => {
  const userId = req.user.id;
  const isAdmin = await checkUserAdmin(userId);

  if (isAdmin) {
    try {
      const users = await User.find({}, "username role balance");
      res.status(200).send(users);
    } catch (error) {
      next(error);
    }
  } else {
    try {
      const messages = await Message.find({
        $or: [{ sender: userId }, { recipient: userId }],
      })
      .populate('sender recipient', 'username')
      .sort({ createdAt: -1 });

      const users = new Map();

      for (const message of messages) {
        if (message.sender._id.toString() !== userId && !users.has(message.sender._id.toString())) {
          users.set(message.sender._id.toString(), {
            username: message.sender.username,
            _id: message.sender._id
          });
        }
        if (message.recipient._id.toString() !== userId && !users.has(message.recipient._id.toString())) {
          users.set(message.recipient._id.toString(), {
            username: message.recipient.username,
            _id: message.recipient._id
          });
        }
      }

      const userArray = Array.from(users.values()); // Convert Map values to array

      res.status(200).send(userArray);
    } catch (error) {
      next(error);
    }
  }
};

const User = require('../models/userModel');

const transformNewMessage = async (newMessage) => {
    const sender = await User.findById(newMessage.sender);
    return {
        ...newMessage,
        sender: {
            username: sender.username,
            _id: sender._id,
        },
    };
}

module.exports = { transformNewMessage };
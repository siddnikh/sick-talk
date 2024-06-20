const mongoose = require('mongoose');

const textMessageSchema = new mongoose.Schema({
  type: { type: String, enum: ['text'], required: true },
  content: { type: String, required: true },
}, { _id: false });

const mediaMessageSchema = new mongoose.Schema({
  type: { type: String, enum: ['media'], required: true },
  url: { type: String, required: true },
}, { _id: false });

const messageSchema = new mongoose.Schema({
  sender: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  recipient: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  message: {
    type: mongoose.Schema.Types.Mixed,
    required: true,
    validate: {
      validator: function (v) {
        if (v.type === 'text') {
          return typeof v.content === 'string' && v.content.trim() !== '';
        } else if (v.type === 'media') {
          return typeof v.url === 'string' && v.url.trim() !== '';
        }
        return false;
      },
      message: props => `${props.value.toString()} is not a valid message format!`
    }
  },
  timestamp: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Message', messageSchema);

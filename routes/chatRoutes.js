const express = require('express');
const chatController = require('../controllers/chatController');
const authMiddleware = require('../middlewares/authMiddleware');
const router = express.Router();

router.post('/send', authMiddleware, chatController.sendMessage);
router.get('/messages', authMiddleware, chatController.getMessages);

module.exports = router;

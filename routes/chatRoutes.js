const express = require('express');
const chatController = require('../controllers/chatController');
const authMiddleware = require('../middlewares/authMiddleware');
const multer = require('multer');

// Configure multer for file upload
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + '-' + file.originalname);
  },
});

const upload = multer({ storage });

const router = express.Router();

router.post('/send', authMiddleware, chatController.sendMessage);
router.get('/messages/:userId', authMiddleware, chatController.getMessagesWithUser);
router.post('/upload', authMiddleware, upload.single('file'), chatController.uploadFile);

module.exports = router;

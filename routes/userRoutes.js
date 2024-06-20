const express = require('express');
const userController = require('../controllers/userController');
const authMiddleware = require('../middlewares/authMiddleware');
const adminMiddleware = require('../middlewares/adminMiddleware');
const router = express.Router();

router.get('/', [authMiddleware], userController.getUsers);
router.get('/exists/:username', [authMiddleware], userController.checkUserExists);

module.exports = router;

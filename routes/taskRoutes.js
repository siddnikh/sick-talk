const express = require('express');
const taskController = require('../controllers/taskController');
const authMiddleware = require('../middlewares/authMiddleware');
const adminMiddleware = require('../middlewares/adminMiddleware');
const router = express.Router();

router.post('/create', [authMiddleware, adminMiddleware], taskController.createTask);
router.post('/complete', [authMiddleware, adminMiddleware], taskController.completeTask);
router.get('/', authMiddleware, taskController.getTasks);

module.exports = router;

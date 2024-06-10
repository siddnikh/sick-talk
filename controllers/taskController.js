const Task = require('../models/taskModel');
const User = require('../models/userModel');

exports.createTask = async (req, res, next) => {
    try {
        const { assignedTo, description, reward } = req.body;

        // Check if the assignedTo user exists
        const assignedUser = await User.findById(assignedTo);
        if (!assignedUser) return res.status(404).send({ message: 'Assigned user not found' });

        const newTask = new Task({
            assignedBy: req.user.id,
            assignedTo,
            description,
            reward,
        });
        await newTask.save();
        res.status(201).send(newTask);
    } catch (error) {
        next(error);
    }
};

exports.completeTask = async (req, res, next) => {
    try {
        const { taskId } = req.body;

        // Check if the task exists
        const task = await Task.findById(taskId);
        if (!task) return res.status(404).send({ message: 'Task not found' });

        task.status = 'completed';
        await task.save();

        const user = await User.findById(task.assignedTo);
        user.balance += task.reward;
        await user.save();

        res.status(200).send(task);
    } catch (error) {
        next(error);
    }
};

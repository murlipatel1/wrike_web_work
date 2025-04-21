const express = require('express');
const taskController = require('../controllers/taskController');

const router = express.Router();

// Task routes
router.get('/all', taskController.getAllTasks);
router.delete('/:webworkTaskId', taskController.deleteTask);

module.exports = router;
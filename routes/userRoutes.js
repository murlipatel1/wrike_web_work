const express = require('express');
const userController = require('../controllers/userController');

const router = express.Router();

// User routes
router.get('/', userController.getAllUsers);
router.post('/', userController.addUser);
router.delete('/:id', userController.deleteUser);
router.put('/:id', userController.updateUser);

module.exports = router;
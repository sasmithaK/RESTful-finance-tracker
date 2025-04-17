const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const goalController = require('../controllers/goalController');

// All routes are protected - require authentication
router.post('/create', protect, goalController.createGoal);
router.get('/getall', protect, goalController.getAllGoals);
router.get('/getone/:id', protect, goalController.getGoal);
router.put('/update/:id', protect, goalController.updateGoal);
router.delete('/delete/:id', protect, goalController.deleteGoal);

// Goal contribution routes
router.post('/contribute/:id', protect, goalController.addContribution);
router.post('/auto-allocate', protect, goalController.processAutoAllocations);

module.exports = router;

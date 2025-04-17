const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const budgetController = require('../controllers/budgetController');

// All routes are protected - require authentication
router.post('/create', protect, budgetController.createBudget);
router.get('/getall', protect, budgetController.getAllBudgets);
router.get('/getone/:id', protect, budgetController.getBudget);
router.put('/update/:id', protect, budgetController.updateBudget);
router.delete('/delete/:id', protect, budgetController.deleteBudget);

// Budget status routes
router.get('/status/:id', protect, budgetController.getBudgetStatus);
router.get('/statuses', protect, budgetController.getAllBudgetStatuses);

module.exports = router;

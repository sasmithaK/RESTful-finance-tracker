const express = require('express');
const { createBudget, getBudgets } = require('../controllers/budgetController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

router.route('/')
  .post(protect, createBudget)
  .get(protect, getBudgets);

module.exports = router;

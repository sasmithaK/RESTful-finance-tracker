const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const dashboardController = require('../controllers/dashboardController');

// Get dashboard data based on user role
router.get('/', protect, dashboardController.getDashboard);

module.exports = router;

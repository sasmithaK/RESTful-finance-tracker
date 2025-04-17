const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const transactionController = require('../controllers/transactionController');

// 🔒 Protect all routes (Authenticated users only)
router.post("/create", protect, transactionController.addTransaction);
router.get("/getall", protect, transactionController.getTransactions);
router.get("/getone/:id", protect, transactionController.getTransaction);
router.put("/update/:id", protect, transactionController.updateTransaction);
router.delete("/delete/:id", protect, transactionController.deleteTransaction);

// Additional filtered routes
router.get("/category/:category", protect, transactionController.getTransactionsByCategory);
router.get("/type/:type", protect, transactionController.getTransactionsByType);

module.exports = router;

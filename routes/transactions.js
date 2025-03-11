const express = require('express');
const router = express.Router();
const { 
    getTransactions, 
    addTransactions, 
    updateTransaction, 
    deleteTransactions, 
    generateFinancialReport, 
    generateChartData 
} = require('../controllers/transactionController');

router
    .route('/')
    .get(getTransactions)
    .post(addTransactions);

router
    .route('/:id')
    .put(updateTransaction)
    .delete(deleteTransactions);

router
    .route('/report')
    .get(generateFinancialReport);

router
    .route('/chart')
    .get(generateChartData);

module.exports = router;

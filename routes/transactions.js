const express = require('express');
const router = express.Router();
const { getTransactions, addTransactions, updateTransaction, deleteTransactions } = require('../controllers/transactionController');

router
    .route('/')
    .get(getTransactions)
    .post(addTransactions);

router
    .route('/:id')
    .put(updateTransaction)
    .delete(deleteTransactions);

module.exports = router;

const express = require('express');
const router = express.Router();
const { getTransactions, addTransactions, deleteTransactions } = require('../controllers/transactionController')

router
    .route('/')
    .get(getTransactions)
    .post(addTransactions);

module.exports = router;
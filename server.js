const express = require('express');
const dotenv = require('dotenv'); // Global enviroment veriables
const morgan = require('morgan'); // Logger
const colors = require('colors'); // Colours for console.log
const connectDB = require('./config/db')
const app = express();

const transactions = require('./routes/transactions');

dotenv.config({ path: '.env' });

connectDB();

app.use('/api/transactions', transactions);


const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`.yellow.bold);
});


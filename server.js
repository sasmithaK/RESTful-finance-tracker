const express = require('express');
const dotenv = require('dotenv'); // Global enviroment veriables
const morgan = require('morgan'); // Logger
const colors = require('colors'); // Colour styling for console
const connectDB = require('./config/db')

// Load env variables
dotenv.config({ path: '.env' });

const app = express();

// Import routes
const transactions = require('./routes/transactions');

// Connect to MongoDB
connectDB();

// Routes
app.use('/api/transactions', transactions);

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`.yellow.bold);
});

module.exports = app;
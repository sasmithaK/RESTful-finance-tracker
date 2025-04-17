const express = require('express');
const dotenv = require('dotenv'); // Global enviroment veriables
const morgan = require('morgan'); // Logger
const colors = require('colors'); // Colour styling for console
const connectDB = require('./config/db')

// Load env variables
dotenv.config({ path: '.env' });

const app = express();

// Import routes
const transactions = require('./routes/transaction.routes');
const authentication = require('./routes/authentication.routes');
const budget = require('./routes/budget.routes');
const goal = require('./routes/goal.routes');
const dashboard = require('./routes/dashboard.routes');

// Connect to MongoDB
connectDB();

// Middleware
app.use(express.json());
app.use(morgan('server'));

// Routes
app.use('/api/transactions', transactions);
app.use('/api/auth', authentication);
app.use('/api/budgets', budget);
app.use('/api/goals', goal);
app.use('/api/dashboard', dashboard);

const PORT = process.env.PORT || 3000;

// Error handling middleware
const { errorHandler } = require('./middleware/errorMiddleware');
app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`.yellow.bold);
});

module.exports = app;
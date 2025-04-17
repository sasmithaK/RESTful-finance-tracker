const mongoose = require('mongoose');

const BudgetSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  name: {
    type: String,
    required: [true, 'Please provide a budget name']
  },
  amount: {
    type: Number,
    required: [true, 'Please provide a budget amount']
  },
  spent: {
    type: Number,
    default: 0
  },
  period: {
    type: String,
    enum: ['monthly', 'yearly', 'custom'],
    default: 'monthly'
  },
  category: {
    type: String,
    required: [true, 'Please provide a category']
  },
  startDate: {
    type: Date,
    default: Date.now
  },
  endDate: {
    type: Date
  },
  notificationThreshold: {
    type: Number,
    default: 80, // Percentage (80% of budget)
    min: 1,
    max: 100
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, { timestamps: true });

module.exports = mongoose.model('Budget', BudgetSchema);

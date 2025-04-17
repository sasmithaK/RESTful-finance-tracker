const mongoose = require('mongoose');

const GoalSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  name: {
    type: String,
    required: [true, 'Please provide a goal name']
  },
  targetAmount: {
    type: Number,
    required: [true, 'Please provide a target amount']
  },
  currentAmount: {
    type: Number,
    default: 0
  },
  targetDate: {
    type: Date
  },
  category: {
    type: String,
    required: [true, 'Please provide a category']
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high'],
    default: 'medium'
  },
  autoAllocate: {
    isEnabled: {
      type: Boolean,
      default: false
    },
    percentage: {
      type: Number,
      min: 0,
      max: 100,
      default: 0
    },
    fixedAmount: {
      type: Number,
      default: 0
    }
  },
  isCompleted: {
    type: Boolean,
    default: false
  },
  startDate: {
    type: Date,
    default: Date.now
  }
}, { timestamps: true });

module.exports = mongoose.model('Goal', GoalSchema);

const { text } = require('express');
const mongoose = require('mongoose');

const TransactionSchema = new mongoose.Schema({
  user: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', required: true 
  },
  type: { 
    type: String, enum: ['income', 'expense'], 
    required: true 
  },
  amount: { 
    type: Number, 
    required: true 
  },
  category: { 
    type: String, 
    required: true 
  },
  tags: [{ type: String }],
  date: { 
    type: Date, 
    default: Date.now 
  },
  recurring: { 
    isRecurring: { type: Boolean, default: false },
    recurrencePattern: { type: String, enum: ['daily', 'weekly', 'monthly'] },
    endDate: { type: Date }
  }
});

module.exports = mongoose.model('Transaction', TransactionSchema);

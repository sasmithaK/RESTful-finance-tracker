const mongoose = require('mongoose');

const BudgetSchema = new mongoose.Schema({
  user: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', required: true },
  category: { 
    type: String, 
    required: true },
  monthlyBudget: { 
    type: Number, 
    required: true },
  spent: { 
    type: Number, 
    default: 0 }
});

module.exports = mongoose.model('Budget', BudgetSchema);

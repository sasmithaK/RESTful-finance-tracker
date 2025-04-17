const Budget = require('../models/Budget');
const Transaction = require('../models/Transaction');

// Create a new budget
exports.createBudget = async (req, res) => {
  try {
    const { name, amount, period, category, startDate, endDate, notificationThreshold } = req.body;

    // Create new budget
    const budget = await Budget.create({
      user: req.user._id,
      name,
      amount,
      period,
      category,
      startDate,
      endDate,
      notificationThreshold
    });

    res.status(201).json({
      success: true,
      data: budget,
      message: 'Budget created successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to create budget',
      error: error.message
    });
  }
};

// Get all budgets for a user
exports.getAllBudgets = async (req, res) => {
  try {
    const budgets = await Budget.find({ user: req.user._id });

    res.status(200).json({
      success: true,
      count: budgets.length,
      data: budgets
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch budgets',
      error: error.message
    });
  }
};

// Get a single budget
exports.getBudget = async (req, res) => {
  try {
    const budget = await Budget.findById(req.params.id);

    if (!budget) {
      return res.status(404).json({
        success: false,
        message: 'Budget not found'
      });
    }

    // Check if budget belongs to user
    if (budget.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to access this budget'
      });
    }

    res.status(200).json({
      success: true,
      data: budget
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch budget',
      error: error.message
    });
  }
};

// Update a budget
exports.updateBudget = async (req, res) => {
  try {
    let budget = await Budget.findById(req.params.id);

    if (!budget) {
      return res.status(404).json({
        success: false,
        message: 'Budget not found'
      });
    }

    // Check if budget belongs to user
    if (budget.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this budget'
      });
    }

    budget = await Budget.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    res.status(200).json({
      success: true,
      data: budget,
      message: 'Budget updated successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to update budget',
      error: error.message
    });
  }
};

// Delete a budget
exports.deleteBudget = async (req, res) => {
  try {
    const budget = await Budget.findById(req.params.id);

    if (!budget) {
      return res.status(404).json({
        success: false,
        message: 'Budget not found'
      });
    }

    // Check if budget belongs to user
    if (budget.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this budget'
      });
    }

    await budget.deleteOne();

    res.status(200).json({
      success: true,
      message: 'Budget deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to delete budget',
      error: error.message
    });
  }
};

// Get budget status with spending information
exports.getBudgetStatus = async (req, res) => {
  try {
    const budget = await Budget.findById(req.params.id);

    if (!budget) {
      return res.status(404).json({
        success: false,
        message: 'Budget not found'
      });
    }

    // Check if budget belongs to user
    if (budget.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to access this budget'
      });
    }

    // Get transactions for this budget category
    let query = {
      user: req.user._id,
      category: budget.category,
      type: 'expense'
    };

    // Add date range if it's a monthly budget
    if (budget.period === 'monthly') {
      const now = new Date();
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);
      
      query.date = {
        $gte: startOfMonth,
        $lte: endOfMonth
      };
    } else if (budget.startDate && budget.endDate) {
      query.date = {
        $gte: budget.startDate,
        $lte: budget.endDate
      };
    }

    const transactions = await Transaction.find(query);
    
    // Calculate total spent
    const totalSpent = transactions.reduce((sum, transaction) => sum + transaction.amount, 0);
    
    // Calculate percentage of budget used
    const percentageUsed = (totalSpent / budget.amount) * 100;
    
    // Update the spent amount in the budget
    budget.spent = totalSpent;
    await budget.save();
    
    // Determine status and notifications
    let status = 'normal';
    let notification = null;
    
    if (percentageUsed >= 100) {
      status = 'exceeded';
      notification = `You have exceeded your ${budget.name} budget by ${(totalSpent - budget.amount).toFixed(2)}`;
    } else if (percentageUsed >= budget.notificationThreshold) {
      status = 'warning';
      notification = `You have used ${percentageUsed.toFixed(2)}% of your ${budget.name} budget`;
    }
    
    // Generate recommendations if budget is in warning or exceeded state
    let recommendations = [];
    if (status !== 'normal') {
      recommendations = [
        'Consider reducing non-essential expenses in this category',
        'Review your recent transactions to identify potential savings',
        'Adjust your budget if your spending needs have changed'
      ];
    }

    res.status(200).json({
      success: true,
      data: {
        budget,
        spent: totalSpent,
        remaining: budget.amount - totalSpent,
        percentageUsed,
        status,
        notification,
        recommendations
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch budget status',
      error: error.message
    });
  }
};

// Get all active budgets with status
exports.getAllBudgetStatuses = async (req, res) => {
  try {
    const budgets = await Budget.find({ 
      user: req.user._id,
      isActive: true 
    });

    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);

    // Process each budget to add status information
    const budgetStatuses = await Promise.all(budgets.map(async (budget) => {
      // Set date range based on budget period
      let dateRange = {};
      if (budget.period === 'monthly') {
        dateRange = {
          $gte: startOfMonth,
          $lte: endOfMonth
        };
      } else if (budget.startDate && budget.endDate) {
        dateRange = {
          $gte: budget.startDate,
          $lte: budget.endDate
        };
      }

      // Get transactions for this budget
      const transactions = await Transaction.find({
        user: req.user._id,
        category: budget.category,
        type: 'expense',
        date: dateRange
      });

      // Calculate total spent
      const totalSpent = transactions.reduce((sum, transaction) => sum + transaction.amount, 0);
      
      // Calculate percentage of budget used
      const percentageUsed = (totalSpent / budget.amount) * 100;
      
      // Update the spent amount in the budget
      budget.spent = totalSpent;
      await budget.save();
      
      // Determine status and notifications
      let status = 'normal';
      let notification = null;
      
      if (percentageUsed >= 100) {
        status = 'exceeded';
        notification = `You have exceeded your ${budget.name} budget by ${(totalSpent - budget.amount).toFixed(2)}`;
      } else if (percentageUsed >= budget.notificationThreshold) {
        status = 'warning';
        notification = `You have used ${percentageUsed.toFixed(2)}% of your ${budget.name} budget`;
      }

      return {
        budget,
        spent: totalSpent,
        remaining: budget.amount - totalSpent,
        percentageUsed,
        status,
        notification
      };
    }));

    res.status(200).json({
      success: true,
      count: budgetStatuses.length,
      data: budgetStatuses
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch budget statuses',
      error: error.message
    });
  }
};

const Goal = require('../models/Goal');
const Transaction = require('../models/Transaction');

// Create a new goal
exports.createGoal = async (req, res) => {
  try {
    const { name, targetAmount, targetDate, category, priority, autoAllocate } = req.body;

    const goal = await Goal.create({
      user: req.user._id,
      name,
      targetAmount,
      targetDate,
      category,
      priority,
      autoAllocate
    });

    res.status(201).json({
      success: true,
      data: goal,
      message: 'Goal created successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to create goal',
      error: error.message
    });
  }
};

// Get all goals for a user
exports.getAllGoals = async (req, res) => {
  try {
    const goals = await Goal.find({ user: req.user._id });

    // Calculate progress percentage for each goal
    const goalsWithProgress = goals.map(goal => {
      const progressPercentage = (goal.currentAmount / goal.targetAmount) * 100;
      
      // Calculate monthly savings needed to reach goal on time
      let monthlySavingsNeeded = null;
      if (goal.targetDate) {
        const today = new Date();
        const targetDate = new Date(goal.targetDate);
        const monthsRemaining = (targetDate.getFullYear() - today.getFullYear()) * 12 + 
                               (targetDate.getMonth() - today.getMonth());
        
        if (monthsRemaining > 0) {
          monthlySavingsNeeded = (goal.targetAmount - goal.currentAmount) / monthsRemaining;
        }
      }

      return {
        ...goal._doc,
        progressPercentage: parseFloat(progressPercentage.toFixed(2)),
        monthlySavingsNeeded: monthlySavingsNeeded ? parseFloat(monthlySavingsNeeded.toFixed(2)) : null
      };
    });

    res.status(200).json({
      success: true,
      count: goals.length,
      data: goalsWithProgress
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch goals',
      error: error.message
    });
  }
};

// Get a single goal
exports.getGoal = async (req, res) => {
  try {
    const goal = await Goal.findById(req.params.id);

    if (!goal) {
      return res.status(404).json({
        success: false,
        message: 'Goal not found'
      });
    }

    // Check if goal belongs to user
    if (goal.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to access this goal'
      });
    }

    // Calculate progress percentage
    const progressPercentage = (goal.currentAmount / goal.targetAmount) * 100;
    
    // Calculate monthly savings needed
    let monthlySavingsNeeded = null;
    if (goal.targetDate) {
      const today = new Date();
      const targetDate = new Date(goal.targetDate);
      const monthsRemaining = (targetDate.getFullYear() - today.getFullYear()) * 12 + 
                             (targetDate.getMonth() - today.getMonth());
      
      if (monthsRemaining > 0) {
        monthlySavingsNeeded = (goal.targetAmount - goal.currentAmount) / monthsRemaining;
      }
    }

    // Get recent contributions
    const contributions = await Transaction.find({
      user: req.user._id,
      category: 'goal-contribution',
      tags: goal._id.toString()
    }).sort({ date: -1 }).limit(5);

    res.status(200).json({
      success: true,
      data: {
        ...goal._doc,
        progressPercentage: parseFloat(progressPercentage.toFixed(2)),
        monthlySavingsNeeded: monthlySavingsNeeded ? parseFloat(monthlySavingsNeeded.toFixed(2)) : null,
        recentContributions: contributions
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch goal',
      error: error.message
    });
  }
};

// Update a goal
exports.updateGoal = async (req, res) => {
  try {
    let goal = await Goal.findById(req.params.id);

    if (!goal) {
      return res.status(404).json({
        success: false,
        message: 'Goal not found'
      });
    }

    // Check if goal belongs to user
    if (goal.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this goal'
      });
    }

    goal = await Goal.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    // Check if goal is completed after update
    if (goal.currentAmount >= goal.targetAmount && !goal.isCompleted) {
      goal.isCompleted = true;
      await goal.save();
    }

    res.status(200).json({
      success: true,
      data: goal,
      message: 'Goal updated successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to update goal',
      error: error.message
    });
  }
};

// Delete a goal
exports.deleteGoal = async (req, res) => {
  try {
    const goal = await Goal.findById(req.params.id);

    if (!goal) {
      return res.status(404).json({
        success: false,
        message: 'Goal not found'
      });
    }

    // Check if goal belongs to user
    if (goal.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this goal'
      });
    }

    await goal.deleteOne();

    res.status(200).json({
      success: true,
      message: 'Goal deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to delete goal',
      error: error.message
    });
  }
};

// Add money to a goal
exports.addContribution = async (req, res) => {
  try {
    const { amount, date, source } = req.body;
    const goal = await Goal.findById(req.params.id);

    if (!goal) {
      return res.status(404).json({
        success: false,
        message: 'Goal not found'
      });
    }

    // Check if goal belongs to user
    if (goal.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to contribute to this goal'
      });
    }

    // Update goal amount
    goal.currentAmount += parseFloat(amount);
    
    // Check if goal is completed
    if (goal.currentAmount >= goal.targetAmount) {
      goal.isCompleted = true;
    }
    
    await goal.save();

    // Create a transaction record for this contribution
    const transaction = await Transaction.create({
      user: req.user._id,
      type: 'expense',
      amount: parseFloat(amount),
      category: 'goal-contribution',
      tags: [goal._id.toString()],
      date: date || Date.now(),
      description: `Contribution to ${goal.name}`
    });

    res.status(200).json({
      success: true,
      data: {
        goal,
        transaction,
        progressPercentage: parseFloat(((goal.currentAmount / goal.targetAmount) * 100).toFixed(2))
      },
      message: 'Contribution added successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to add contribution',
      error: error.message
    });
  }
};

// Process automatic allocations for all goals
exports.processAutoAllocations = async (req, res) => {
  try {
    const { incomeAmount, incomeId } = req.body;
    
    if (!incomeAmount) {
      return res.status(400).json({
        success: false,
        message: 'Income amount is required'
      });
    }

    // Find all active goals with auto-allocation enabled
    const goals = await Goal.find({
      user: req.user._id,
      isCompleted: false,
      'autoAllocate.isEnabled': true
    });

    const allocations = [];
    let totalAllocated = 0;

    // Process each goal
    for (const goal of goals) {
      let allocationAmount = 0;
      
      // Calculate allocation based on percentage or fixed amount
      if (goal.autoAllocate.percentage > 0) {
        allocationAmount = (incomeAmount * goal.autoAllocate.percentage) / 100;
      } else if (goal.autoAllocate.fixedAmount > 0) {
        allocationAmount = goal.autoAllocate.fixedAmount;
      }

      // Skip if no allocation
      if (allocationAmount <= 0) continue;
      
      // Update goal amount
      goal.currentAmount += allocationAmount;
      totalAllocated += allocationAmount;
      
      // Check if goal is completed
      if (goal.currentAmount >= goal.targetAmount) {
        goal.isCompleted = true;
      }
      
      await goal.save();

      // Create a transaction record for this allocation
      const transaction = await Transaction.create({
        user: req.user._id,
        type: 'expense',
        amount: allocationAmount,
        category: 'goal-contribution',
        tags: [goal._id.toString()],
        date: Date.now(),
        description: `Auto-allocation to ${goal.name}`
      });

      allocations.push({
        goal: {
          id: goal._id,
          name: goal.name
        },
        amount: allocationAmount,
        transaction: transaction._id,
        progressPercentage: parseFloat(((goal.currentAmount / goal.targetAmount) * 100).toFixed(2))
      });
    }

    res.status(200).json({
      success: true,
      data: {
        totalAllocated,
        allocations,
        remainingAmount: incomeAmount - totalAllocated
      },
      message: 'Auto-allocations processed successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to process auto-allocations',
      error: error.message
    });
  }
};

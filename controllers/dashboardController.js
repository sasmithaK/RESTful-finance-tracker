const User = require('../models/User');
const Transaction = require('../models/Transaction');
const Budget = require('../models/Budget');
const Goal = require('../models/Goal');

// Get dashboard data based on user role
exports.getDashboard = async (req, res) => {
  try {
    const user = req.user;
    
    // Check user role and return appropriate dashboard data
    if (user.role === 'admin') {
      const adminDashboard = await getAdminDashboard();
      return res.status(200).json({
        success: true,
        data: adminDashboard
      });
    } else {
      const userDashboard = await getUserDashboard(user._id);
      return res.status(200).json({
        success: true,
        data: userDashboard
      });
    }
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Error fetching dashboard data',
      error: error.message
    });
  }
};

// Get admin dashboard data
const getAdminDashboard = async () => {
  // Get total users count
  const totalUsers = await User.countDocuments();
  
  // Get new users in the last 30 days
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  const newUsers = await User.countDocuments({
    createdAt: { $gte: thirtyDaysAgo }
  });
  
  // Get active users (logged in within the last 7 days)
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
  const activeUsers = await User.countDocuments({
    lastLogin: { $gte: sevenDaysAgo }
  });
  
  // Get total transactions
  const totalTransactions = await Transaction.countDocuments();
  
  // Get transactions in the last 30 days
  const recentTransactions = await Transaction.countDocuments({
    date: { $gte: thirtyDaysAgo }
  });
  
  // Get total income and expenses
  const incomeSum = await Transaction.aggregate([
    { $match: { type: 'income' } },
    { $group: { _id: null, total: { $sum: '$amount' } } }
  ]);
  
  const expenseSum = await Transaction.aggregate([
    { $match: { type: 'expense' } },
    { $group: { _id: null, total: { $sum: '$amount' } } }
  ]);
  
  // Get transactions by category
  const transactionsByCategory = await Transaction.aggregate([
    { $group: { _id: '$category', count: { $sum: 1 }, total: { $sum: '$amount' } } },
    { $sort: { total: -1 } },
    { $limit: 5 }
  ]);
  
  // Get total budgets and goals
  const totalBudgets = await Budget.countDocuments();
  const totalGoals = await Goal.countDocuments();
  
  // Get recent user activity
  const recentActivity = await User.find()
    .sort({ lastLogin: -1 })
    .limit(10)
    .select('username email lastLogin role');
  
  return {
    userStats: {
      totalUsers,
      newUsers,
      activeUsers
    },
    transactionStats: {
      totalTransactions,
      recentTransactions,
      totalIncome: incomeSum.length > 0 ? incomeSum[0].total : 0,
      totalExpenses: expenseSum.length > 0 ? expenseSum[0].total : 0,
      topCategories: transactionsByCategory
    },
    featureStats: {
      totalBudgets,
      totalGoals
    },
    recentActivity
  };
};

// Get user dashboard data
const getUserDashboard = async (userId) => {
  // Get user's recent transactions
  const recentTransactions = await Transaction.find({ user: userId })
    .sort({ date: -1 })
    .limit(5);
  
  // Get user's transaction summary
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  
  const monthlyIncome = await Transaction.aggregate([
    { 
      $match: { 
        user: userId, 
        type: 'income',
        date: { $gte: thirtyDaysAgo }
      } 
    },
    { $group: { _id: null, total: { $sum: '$amount' } } }
  ]);
  
  const monthlyExpense = await Transaction.aggregate([
    { 
      $match: { 
        user: userId, 
        type: 'expense',
        date: { $gte: thirtyDaysAgo }
      } 
    },
    { $group: { _id: null, total: { $sum: '$amount' } } }
  ]);
  
  // Get expense breakdown by category
  const expensesByCategory = await Transaction.aggregate([
    { 
      $match: { 
        user: userId, 
        type: 'expense',
        date: { $gte: thirtyDaysAgo }
      } 
    },
    { $group: { _id: '$category', total: { $sum: '$amount' } } },
    { $sort: { total: -1 } },
    { $limit: 5 }
  ]);
  
  // Get active budgets with status
  const budgets = await Budget.find({ user: userId, isActive: true });
  
  // Calculate budget progress
  const budgetsWithProgress = await Promise.all(budgets.map(async (budget) => {
    const expenses = await Transaction.aggregate([
      { 
        $match: { 
          user: userId, 
          category: budget.category,
          type: 'expense',
          date: { $gte: thirtyDaysAgo }
        } 
      },
      { $group: { _id: null, total: { $sum: '$amount' } } }
    ]);
    
    const spent = expenses.length > 0 ? expenses[0].total : 0;
    const percentage = (spent / budget.amount) * 100;
    
    return {
      _id: budget._id,
      name: budget.name,
      category: budget.category,
      amount: budget.amount,
      spent,
      remaining: budget.amount - spent,
      percentage
    };
  }));
  
  // Get active goals with progress
  const goals = await Goal.find({ user: userId, isCompleted: false });
  
  const goalsWithProgress = goals.map(goal => {
    const percentage = (goal.currentAmount / goal.targetAmount) * 100;
    return {
      _id: goal._id,
      name: goal.name,
      targetAmount: goal.targetAmount,
      currentAmount: goal.currentAmount,
      remaining: goal.targetAmount - goal.currentAmount,
      percentage,
      targetDate: goal.targetDate
    };
  });
  
  return {
    summary: {
      monthlyIncome: monthlyIncome.length > 0 ? monthlyIncome[0].total : 0,
      monthlyExpense: monthlyExpense.length > 0 ? monthlyExpense[0].total : 0,
      balance: (monthlyIncome.length > 0 ? monthlyIncome[0].total : 0) - 
               (monthlyExpense.length > 0 ? monthlyExpense[0].total : 0)
    },
    recentTransactions,
    expensesByCategory,
    budgets: budgetsWithProgress,
    goals: goalsWithProgress
  };
};

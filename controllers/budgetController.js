const Budget = require('../models/Budget');

// @desc    Create a new budget
// @route   POST /api/budgets
// @access  Private
exports.createBudget = async (req, res, next) => {
    try {
        const budget = await Budget.create({ ...req.body, user: req.user._id });
        res.status(201).json({ success: true, data: budget });
    } catch (error) {
        res.status(500).json({ success: false, error: 'Server Error' });
    }
};

// @desc    Get all budgets for a user
// @route   GET /api/budgets
// @access  Private
exports.getBudgets = async (req, res, next) => {
    try {
        const budgets = await Budget.find({ user: req.user._id });
        res.status(200).json({ success: true, count: budgets.length, data: budgets });
    } catch (error) {
        res.status(500).json({ success: false, error: 'Server Error' });
    }
};

// @desc    Update a budget
// @route   PUT /api/budgets/:id
// @access  Private
exports.updateBudget = async (req, res, next) => {
    try {
        const { id } = req.params;
        const budget = await Budget.findByIdAndUpdate(id, req.body, { new: true, runValidators: true });
        
        if (!budget) {
            return res.status(404).json({ success: false, error: 'Budget not found' });
        }

        res.status(200).json({ success: true, data: budget });
    } catch (error) {
        res.status(500).json({ success: false, error: 'Server Error' });
    }
};

// @desc    Delete a budget
// @route   DELETE /api/budgets/:id
// @access  Private
exports.deleteBudget = async (req, res, next) => {
    try {
        const { id } = req.params;
        const budget = await Budget.findByIdAndDelete(id);
        
        if (!budget) {
            return res.status(404).json({ success: false, error: 'Budget not found' });
        }

        res.status(200).json({ success: true, message: 'Budget deleted' });
    } catch (error) {
        res.status(500).json({ success: false, error: 'Server Error' });
    }
};
const dashboardService = require('../services/dashboard.service');
const responseHandler = require('../utils/responseHeader');

// @desc    Get dashboard data
// @route   GET /api/dashboard
// @access  Private
exports.getDashboard = async (req, res, next) => {
    try {
        const dashboardData = req.user.role === 'Admin'
            ? await dashboardService.getAdminDashboard()
            : await dashboardService.getUserDashboard(req.user.id);

        responseHandler.success(res, 'Dashboard data retrieved successfully', dashboardData);
    } catch (error) {
        res.status(500).json({ success: false, error: 'Server Error' });
    }
};
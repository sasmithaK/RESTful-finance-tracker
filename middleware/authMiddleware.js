const jwt = require('jsonwebtoken');
const User = require('../models/User');

// @desc    Protect routes
// @access  Private
exports.protect = async (req, res, next) => {
    try {
        let token = req.headers.authorization?.split(' ')[1];
        
        if (!token) {
            return res.status(401).json({ success: false, error: 'Not authorized, no token' });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = await User.findById(decoded.id).select('-password');
        next();
    } catch (error) {
        res.status(401).json({ success: false, error: 'Token is not valid' });
    }
};

// @desc    Restrict access to admins only
// @access  Private (Admin)
exports.adminOnly = (req, res, next) => {
    if (req.user?.role === 'admin') {
        return next();
    }
    res.status(403).json({ success: false, error: 'Access denied: Admins only' });
};
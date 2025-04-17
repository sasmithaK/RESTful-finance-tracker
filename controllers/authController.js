const User = require('../models/User');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

// Generate JWT token
const generateToken = (user) => {
    return jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '1d' });
};

// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public
exports.register = async (req, res, next) => {
    try {
        const { username, password, role, fullName, email, phone, imageurl } = req.body;
        
        // Validate required fields before proceeding
        if (!username || !password || !role || !fullName || !email) {
            return res.status(400).json({ message: 'All fields are required', success: false });
        }

        // Check if user already exists
        const existingUser = await User.findOne({ username });
        if (existingUser) {
            return res.status(400).json({ message: 'User already exists', success: false });
        }

        // Hash password safely
        const hashedPassword = await bcrypt.hash(password, 10);

        // Create new user
        const user = new User({
            username,
            password: hashedPassword,
            role: role || 'user',
            fullName,
            email,
            phone,
            imageurl
        });

        await user.save();

        res.status(201).json({ message: 'User registered successfully.', success: true });

    } catch (error) {
        next(error);
    }
};


// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
exports.login = async (req, res, next) => {
    try {
        const { username, email, password } = req.body;
        
        // Allow login with either username or email
        const query = username ? { username } : { email };
        const user = await User.findOne(query);
        
        if (!user) {
            return res.status(404).json({ message: 'User not found.', success: false });
        }
        
        const validPassword = await bcrypt.compare(password, user.password);
        if (!validPassword) {
            return res.status(401).json({ message: 'Invalid credentials.', success: false });
        }
        
        const token = generateToken(user);
        
        // Remove password from user object before sending response
        const userResponse = user.toObject();
        delete userResponse.password;
        
        res.json({ 
            message: 'Login successful.', 
            success: true,
            user: userResponse,
            token 
        });
    } catch (error) {
        next(error);
    }
};

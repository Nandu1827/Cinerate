const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { JWT_SECRET } = require('../config/jwt');
const tokenFromRequest = require('./tokenFromRequest');

exports.isAdmin = async (req, res, next) => {
  try {
    const token = tokenFromRequest(req);

    if (!token) {
      console.log('No token provided');
      return res.status(401).json({ message: 'No token, authorization denied' });
    }

    const decoded = jwt.verify(token, JWT_SECRET);
    console.log('Decoded token:', decoded);
    
    // Get user from database
    const user = await User.findById(decoded.id);
    
    if (!user) {
      console.log('User not found for ID:', decoded.id);
      return res.status(401).json({ message: 'User not found' });
    }

    // Check if user is admin
    if (user.role !== 'admin') {
      console.log('User is not admin:', user.email);
      return res.status(403).json({ message: 'Access denied. Admin only.' });
    }

    console.log('Admin access granted for:', user.email);
    // Add user to request object
    req.user = user;
    next();
  } catch (error) {
    console.error('Auth middleware error:', error);
    res.status(401).json({ message: 'Token is not valid' });
  }
}; 
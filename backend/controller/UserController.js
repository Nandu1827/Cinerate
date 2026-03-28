const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'your_jwt_secret_key_here';

// User Sign Up
exports.signUp = async (req, res) => {
  const { fullName, email, password } = req.body;
  try {
    // Check if fullName (username) or email already exists
    let user = await User.findOne({ $or: [{ fullName }, { email }] });
    if (user) {
      if (user.fullName === fullName) {
        return res.status(400).json({ message: 'Username already exists' });
      }
      if (user.email === email) {
        return res.status(400).json({ message: 'Email already exists' });
      }
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);
    user = new User({ fullName, email, password: hashedPassword, role: 'user' });
    await user.save();

    // Generate JWT token after signup
    const token = jwt.sign(
      {
        id: user._id,
        email: user.email,
        fullName: user.fullName,
        role: user.role
      },
      JWT_SECRET,
      { expiresIn: '1h' }
    );

    const userResponse = {
      id: user._id,
      email: user.email,
      fullName: user.fullName,
      role: user.role,
      createdAt: user.createdAt
    };

    res.status(201).json({
      message: 'Account created successfully',
      token,
      user: userResponse
    });
  } catch (error) {
    console.error('Sign up error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// User Sign In
exports.signIn = async (req, res) => {
  const { email, password } = req.body;
  try {
    console.log('Attempting user sign in for:', email);
    const user = await User.findOne({ email });
    
    if (!user) {
      console.log('User not found:', email);
      return res.status(400).json({ message: 'Invalid email or password' });
    }

    console.log('User found, comparing passwords');
    const isMatch = await bcrypt.compare(password, user.password);
    
    if (!isMatch) {
      console.log('Password mismatch for:', email);
      return res.status(400).json({ message: 'Invalid email or password' });
    }

    console.log('Password matched, generating token for:', email);
    const token = jwt.sign(
      { 
        id: user._id, 
        email: user.email, 
        fullName: user.fullName, 
        role: user.role 
      },
      JWT_SECRET,
      { expiresIn: '1h' }
    );

    const userResponse = {
      id: user._id,
      email: user.email,
      fullName: user.fullName,
      role: user.role,
      createdAt: user.createdAt
    };

    console.log('Sign in successful for:', email, 'Role:', user.role);
    res.status(200).json({
      token,
      user: userResponse
    });
  } catch (error) {
    console.error('Sign in error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Admin Sign In
exports.adminSignIn = async (req, res) => {
  const { email, password } = req.body;
  try {
    console.log('Attempting admin sign in for:', email);
    
    // First find any user with this email
    const user = await User.findOne({ email });
    console.log('User found:', user ? 'Yes' : 'No');
    
    if (!user) {
      console.log('No user found with email:', email);
      return res.status(400).json({ message: 'Invalid admin credentials' });
    }

    // Then check if they are an admin
    console.log('User role:', user.role);
    if (user.role !== 'admin') {
      console.log('User found but not an admin:', email);
      return res.status(400).json({ message: 'Invalid admin credentials' });
    }

    console.log('Admin found, comparing passwords');
    const isMatch = await bcrypt.compare(password, user.password);
    console.log('Password match:', isMatch ? 'Yes' : 'No');
    
    if (!isMatch) {
      console.log('Password mismatch for admin:', email);
      return res.status(400).json({ message: 'Invalid admin credentials' });
    }

    console.log('Password matched, generating token for admin:', email);
    const token = jwt.sign(
      { 
        id: user._id, 
        email: user.email, 
        fullName: user.fullName, 
        role: user.role 
      },
      JWT_SECRET,
      { expiresIn: '1h' }
    );

    const adminResponse = {
      id: user._id,
      email: user.email,
      fullName: user.fullName,
      role: user.role,
      createdAt: user.createdAt
    };

    console.log('Admin sign in successful for:', email);
    res.status(200).json({
      token,
      admin: adminResponse
    });
  } catch (error) {
    console.error('Admin sign in error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

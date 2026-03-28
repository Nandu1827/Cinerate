const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { JWT_SECRET } = require('../config/jwt');

// =========================
// User Sign Up
// =========================
exports.signUp = async (req, res) => {
  const { fullName, email, password, role } = req.body;

  try {
    // Check if user already exists
    let user = await User.findOne({ $or: [{ fullName }, { email }] });

    if (user) {
      if (user.fullName === fullName) {
        return res.status(400).json({ message: 'Username already exists' });
      }
      if (user.email === email) {
        return res.status(400).json({ message: 'Email already exists' });
      }
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user (🔥 FIX: allow role)
    user = new User({
      fullName,
      email,
      password: hashedPassword,
      role: role || 'user'   // ✅ supports admin creation
    });

    await user.save();

    // Generate token
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

    // Response
    res.status(201).json({
      message: 'Account created successfully',
      token,
      user: {
        id: user._id,
        email: user.email,
        fullName: user.fullName,
        role: user.role,
        createdAt: user.createdAt
      }
    });

  } catch (error) {
    console.error('❌ Sign up error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// =========================
// User Sign In
// =========================
exports.signIn = async (req, res) => {
  const { email, password } = req.body;

  try {
    console.log('🔐 User login attempt:', email);

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(400).json({ message: 'Invalid email or password' });
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid email or password' });
    }

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

    res.status(200).json({
      token,
      user: {
        id: user._id,
        email: user.email,
        fullName: user.fullName,
        role: user.role,
        createdAt: user.createdAt
      }
    });

  } catch (error) {
    console.error('❌ Sign in error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// =========================
// Admin Sign In
// =========================
exports.adminSignIn = async (req, res) => {
  const { email, password } = req.body;

  try {
    console.log('👑 Admin login attempt:', email);

    const user = await User.findOne({ email });

    if (!user || user.role !== 'admin') {
      return res.status(400).json({ message: 'Invalid admin credentials' });
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid admin credentials' });
    }

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

    res.status(200).json({
      token,
      admin: {
        id: user._id,
        email: user.email,
        fullName: user.fullName,
        role: user.role,
        createdAt: user.createdAt
      }
    });

  } catch (error) {
    console.error('❌ Admin sign in error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};
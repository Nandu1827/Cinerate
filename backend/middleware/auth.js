const jwt = require('jsonwebtoken');
const { JWT_SECRET } = require('../config/jwt');
const tokenFromRequest = require('./tokenFromRequest');

const authMiddleware = (req, res, next) => {
  const token = tokenFromRequest(req);
  if (!token) {
    return res.status(401).json({ message: 'No token, authorization denied' });
  }
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    res.status(401).json({ message: 'Token is not valid' });
  }
};
module.exports = authMiddleware;
const jwt = require('jsonwebtoken');

const JWT_SECRET = '3de6772668c1a6e252f7fa67d04c8c1ec769c0931ebacb686ffa79c99579cb27a07ab78aadf9d7789011a91e9d8d1c6318b38d46b67a62cf899e4fb5f4616dd7'; // In production, use environment variable

const authenticateToken = async (req, res, next) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    
    if (!token) {
      return res.status(401).json({ message: 'No token provided' });
    }

    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(403).json({ message: 'Invalid token' });
  }
};

// Role-based access middleware
const authorizeRoles = (...roles) => {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({ message: 'Access denied: insufficient permissions' });
    }
    next();
  };
};

module.exports = {
  authenticateToken,
  JWT_SECRET,
  authorizeRoles
}; 
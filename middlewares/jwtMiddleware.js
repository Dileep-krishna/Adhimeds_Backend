// middlewares/authMiddleware.js
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

// Middleware to verify JWT token from Authorization header
export const verifyStoreToken = (req, res, next) => {
  // Get token from header (Bearer token)
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ success: false, message: 'No token provided' });
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    // Attach store info to req.user
    req.user = {
      storeId: decoded.id,
      email: decoded.email,
      storeName: decoded.storeName
    };
    next();
  } catch (error) {
    console.error('JWT verification error:', error.message);
    return res.status(401).json({ success: false, message: 'Invalid or expired token' });
  }
};

// Optional: Middleware to check if user is a store (could be extended for admin)
export const requireStore = (req, res, next) => {
  if (!req.user || !req.user.storeId) {
    return res.status(403).json({ success: false, message: 'Access denied. Store only.' });
  }
  next();
};
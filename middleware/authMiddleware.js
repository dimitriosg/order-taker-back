// authMiddleware.js
// Desc: Middleware for authenticating user
import jwt from 'jsonwebtoken';

export const authMiddleware = (req, res, next) => {
  try {
    const authHeader = req.header('Authorization');
    if (!authHeader) {
        return res.status(401).json({ message: 'Authorization header missing' });
    }

    const token = authHeader.replace('Bearer ', '');
    console.log("Token:", token);

    if (!token) {
        return res.status(401).json({ message: 'Token missing' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (!decoded) {
        return res.status(401).json({ message: 'Token could not be decoded' });
    }

    req.user = decoded;  // Store the user ID and other payload info in req.user
    console.log('Decoded JWT:', decoded);
    next();

  } catch (error) {
    console.error('Error in authMiddleware:', error);
    res.status(401).json({ message: 'Please authenticate.' });
  }
};

// authMiddleware.js
// Desc: Middleware for authenticating user
import jwt from 'jsonwebtoken';

const { TokenExpiredError, JsonWebTokenError } = jwt;


const authMiddleware_OLD = (req, res, next) => {
  try {
    // Previously
    // const authHeader = req.header('Authorization');

    // Now
    const token = req.cookies.token;
    if (!authHeader) {
        return res.status(401).json({ message: 'Authorization header missing' });
    }

    //const token = authHeader.replace('Bearer ', '');
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
    if(err instanceof TokenExpiredError) {
      return res.status(401).send('Token expired');
    }

    if(err instanceof JsonWebTokenError) {
      return res.status(401).send('Invalid token'); 
    }

    console.error('Error in authMiddleware:', error);
    res.status(401).json({ message: 'Please authenticate.' });
  }
  next();
};

export const authMiddleware = (req, res, next) => {
  console.log("Cookies:", req.cookies);

  try {
    const rawCookies = req.header('Cookie'); // Get the raw Cookie header
    if (!rawCookies) {
        return res.status(401).json({ message: 'Cookies header missing' });
    }

    // Parse the cookies string to extract the JWT token
    const cookies = rawCookies.split('; ').reduce((acc, cookie) => {
      const [key, value] = cookie.split('=');
      acc[key] = value;
      return acc;
    }, {});

    const token = cookies.token; // Extract the JWT token
    if (!token) {
        return res.status(401).json({ message: 'Token missing in cookies' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (!decoded) {
        return res.status(401).json({ message: 'Token could not be decoded' });
    }

    req.user = decoded;  // Store the user ID and other payload info in req.user
    console.log('Decoded JWT:', decoded);
    next();

  } catch (error) {
    if(error instanceof jwt.TokenExpiredError) {
      return res.status(401).send('Token expired');
    }

    if(error instanceof jwt.JsonWebTokenError) {
      return res.status(401).send('Invalid token'); 
    }

    console.error('Error in authMiddleware:', error);
    res.status(401).json({ message: 'Please authenticate.' });
  }
};

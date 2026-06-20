import jwt from 'jsonwebtoken';
import Owner from '../models/Owner.js';

export default async function ownerAuth(req, res, next) {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ message: 'Not authorized, no token' });
    }

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // CRITICAL: Must use await here
    const owner = await Owner.findById(decoded.id).select('-password');
    
    if (!owner) {
      return res.status(401).json({ message: 'Not authorized, owner not found' });
    }

    if (owner.status !== 'approved') {
      return res.status(403).json({
        message: owner.status === 'pending'
          ? 'Account pending verification. Please wait for admin approval.'
          : 'Account rejected. Please contact support.'
      });
    }

    req.owner = owner;
    next();
  } catch (error) {
    res.status(401).json({ message: 'Not authorized, token failed' });
  }
}
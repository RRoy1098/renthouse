import jwt from 'jsonwebtoken';
import Tenant from '../models/Tenant.js';

export default async function tenantAuth(req, res, next) {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ message: 'Not authorized, no token' });
    }

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // CRITICAL: Must use await here
    const tenant = await Tenant.findById(decoded.id).select('-password');
    
    if (!tenant) {
      return res.status(401).json({ message: 'Not authorized, tenant not found' });
    }

    req.tenant = tenant;
    next();
  } catch (error) {
    res.status(401).json({ message: 'Not authorized, token failed' });
  }
}
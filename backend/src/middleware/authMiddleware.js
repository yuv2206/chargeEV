import jwt from 'jsonwebtoken';
import { query } from '../config/db.js';
import { AppError } from '../utils/appError.js';

export const protectUser = async (req, _res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader?.startsWith('Bearer ')) {
      return next(new AppError('Unauthorized access', 401));
    }

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    if (decoded.role !== 'user') {
      return next(new AppError('User access only', 403));
    }

    const result = await query(
      'SELECT user_id, full_name, email, phone FROM User_Account WHERE user_id = $1',
      [decoded.userId]
    );

    if (!result.rows.length) {
      return next(new AppError('User not found', 404));
    }

    req.user = result.rows[0];
    next();
  } catch (error) {
    next(new AppError('Invalid or expired token', 401));
  }
};

export const protectAdmin = (req, _res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader?.startsWith('Bearer ')) {
      return next(new AppError('Unauthorized access', 401));
    }

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    if (decoded.role !== 'admin') {
      return next(new AppError('Admin access only', 403));
    }

    req.admin = decoded;
    next();
  } catch (error) {
    next(new AppError('Invalid or expired token', 401));
  }
};

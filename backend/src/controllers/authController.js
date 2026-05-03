import bcrypt from 'bcryptjs';
import { query } from '../config/db.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { AppError } from '../utils/appError.js';
import { signToken } from '../utils/jwt.js';

export const register = asyncHandler(async (req, res) => {
  const { fullName, phone, email, password } = req.body;

  if (!fullName || !phone || !email || !password) {
    throw new AppError('All fields are required', 400);
  }

  const existing = await query('SELECT user_id FROM User_Account WHERE email = $1 OR phone = $2', [
    email,
    phone,
  ]);

  if (existing.rows.length) {
    throw new AppError('User already exists with this email or phone', 409);
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  const result = await query(
    `INSERT INTO User_Account (full_name, phone, email, password)
     VALUES ($1, $2, $3, $4)
     RETURNING user_id, full_name, phone, email`,
    [fullName, phone, email, hashedPassword]
  );

  const user = result.rows[0];
  const token = signToken({ role: 'user', userId: user.user_id });

  res.status(201).json({
    success: true,
    token,
    user,
  });
});

export const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  const result = await query('SELECT * FROM User_Account WHERE email = $1', [email]);

  if (!result.rows.length) {
    throw new AppError('Invalid credentials', 401);
  }

  const user = result.rows[0];
  const isMatch = await bcrypt.compare(password, user.password);

  if (!isMatch) {
    throw new AppError('Invalid credentials', 401);
  }

  const token = signToken({ role: 'user', userId: user.user_id });

  res.json({
    success: true,
    token,
    user: {
      user_id: user.user_id,
      full_name: user.full_name,
      phone: user.phone,
      email: user.email,
    },
  });
});

export const adminLogin = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  if (email !== process.env.ADMIN_EMAIL || password !== process.env.ADMIN_PASSWORD) {
    throw new AppError('Invalid admin credentials', 401);
  }

  const token = signToken({ role: 'admin', email });

  res.json({
    success: true,
    token,
    admin: {
      email,
      role: 'admin',
    },
  });
});

export const me = asyncHandler(async (req, res) => {
  res.json({
    success: true,
    user: req.user,
  });
});


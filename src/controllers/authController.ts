import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import prisma from '../db';
import { AuthRequest } from '../middlewares/auth';

export const login = async (req: Request, res: Response) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ error: 'Username or email and password are required' });
    }

    // Find admin by username or email
    const admin = await prisma.admin.findFirst({
      where: {
        OR: [
          { username: username },
          { email: username }
        ]
      }
    });

    if (!admin) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Compare passwords
    const isPasswordValid = await bcrypt.compare(password, admin.passwordHash);
    if (!isPasswordValid) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Generate JWT token
    const token = jwt.sign(
      { adminId: admin.id },
      process.env.JWT_SECRET || 'ktech_super_secret_jwt_key_2026',
      { expiresIn: '24h' }
    );

    // Exclude password hash from response
    const { passwordHash, ...adminData } = admin;

    return res.json({
      token,
      user: adminData
    });
  } catch (error: any) {
    console.error('Login error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};

export const me = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.adminId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const admin = await prisma.admin.findUnique({
      where: { id: req.adminId }
    });

    if (!admin) {
      return res.status(404).json({ error: 'Admin not found' });
    }

    const { passwordHash, ...adminData } = admin;
    return res.json(adminData);
  } catch (error: any) {
    console.error('Me query error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};

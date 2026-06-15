"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.me = exports.login = void 0;
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const db_1 = __importDefault(require("../db"));
const login = async (req, res) => {
    try {
        const { username, password } = req.body;
        if (!username || !password) {
            return res.status(400).json({ error: 'Username or email and password are required' });
        }
        // Find admin by username or email
        const admin = await db_1.default.admin.findFirst({
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
        const isPasswordValid = await bcryptjs_1.default.compare(password, admin.passwordHash);
        if (!isPasswordValid) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }
        // Generate JWT token
        const token = jsonwebtoken_1.default.sign({ adminId: admin.id }, process.env.JWT_SECRET || 'ktech_super_secret_jwt_key_2026', { expiresIn: '24h' });
        // Exclude password hash from response
        const { passwordHash, ...adminData } = admin;
        return res.json({
            token,
            user: adminData
        });
    }
    catch (error) {
        console.error('Login error:', error);
        return res.status(500).json({ error: 'Internal server error' });
    }
};
exports.login = login;
const me = async (req, res) => {
    try {
        if (!req.adminId) {
            return res.status(401).json({ error: 'Unauthorized' });
        }
        const admin = await db_1.default.admin.findUnique({
            where: { id: req.adminId }
        });
        if (!admin) {
            return res.status(404).json({ error: 'Admin not found' });
        }
        const { passwordHash, ...adminData } = admin;
        return res.json(adminData);
    }
    catch (error) {
        console.error('Me query error:', error);
        return res.status(500).json({ error: 'Internal server error' });
    }
};
exports.me = me;

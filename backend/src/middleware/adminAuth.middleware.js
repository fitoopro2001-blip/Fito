import jwt from 'jsonwebtoken';
import asyncHandler from '../utils/asyncHandler.js';
import Admin from '../models/Admin.model.js';
import { ROLES } from '../constants/roles.js';

// Protects admin-panel routes.
export const protectAdmin = asyncHandler(async (req, res, next) => {
    const header = req.headers.authorization;
    if (!header?.startsWith('Bearer ')) {
        res.status(401);
        throw new Error('Not authorized, no token');
    }

    try {
        const decoded = jwt.verify(header.split(' ')[1], process.env.JWT_SECRET);
        const admin = await Admin.findById(decoded.id);
        if (!admin) {
            res.status(401);
            throw new Error('Not authorized, admin not found');
        }
        req.admin = admin;
        next();
    } catch {
        res.status(401);
        throw new Error('Not authorized, token failed');
    }
});

// Gates routes to super admins only, e.g. creating new admin accounts.
export const requireSuperAdmin = (req, res, next) => {
    if (req.admin?.role !== ROLES.SUPER_ADMIN) {
        res.status(403);
        throw new Error('Super admin access required');
    }
    next();
};

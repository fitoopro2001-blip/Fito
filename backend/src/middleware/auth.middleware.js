import jwt from 'jsonwebtoken';
import asyncHandler from '../utils/asyncHandler.js';
import User from '../models/User.model.js';
import { USER_STATUS } from '../constants/userStatus.js';

// Protects app-side (customer) routes.
export const protect = asyncHandler(async (req, res, next) => {
    const header = req.headers.authorization;
    if (!header?.startsWith('Bearer ')) {
        res.status(401);
        throw new Error('Not authorized, no token');
    }

    let decoded;
    try {
        decoded = jwt.verify(header.split(' ')[1], process.env.JWT_SECRET);
    } catch {
        res.status(401);
        throw new Error('Not authorized, token failed');
    }

    const user = await User.findById(decoded.id);
    if (!user) {
        res.status(401);
        throw new Error('Not authorized, user not found');
    }

    // Re-checked here (not just at login) so a status change takes effect
    // immediately instead of waiting out an already-issued token.
    if (user.status !== USER_STATUS.ACTIVE) {
        res.status(403);
        throw new Error('Your account is not active. Please contact support.');
    }

    req.user = user;
    next();
});

// Like `protect`, but never rejects — used by routes that accept both guest
// and logged-in requests (e.g. checkout). Attaches req.user only if a valid
// token for an active user is present.
export const attachUserIfPresent = asyncHandler(async (req, res, next) => {
    const header = req.headers.authorization;
    if (!header?.startsWith('Bearer ')) return next();

    try {
        const decoded = jwt.verify(header.split(' ')[1], process.env.JWT_SECRET);
        const user = await User.findById(decoded.id);
        if (user && user.status === USER_STATUS.ACTIVE) {
            req.user = user;
        }
    } catch {
        // Invalid/expired token on an optional-auth route — proceed as guest.
    }
    next();
});

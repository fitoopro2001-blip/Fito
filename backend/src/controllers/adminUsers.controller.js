import asyncHandler from '../utils/asyncHandler.js';
import User from '../models/User.model.js';
import { toPublicUser } from '../utils/serializers.js';
import { USER_STATUS } from '../constants/userStatus.js';
import { parsePagination, buildSearchFilter } from '../utils/queryHelpers.js';

// GET /api/admin/users?page=&limit=&search=&status=&provider=
export const listUsers = asyncHandler(async (req, res) => {
    const { page, limit, skip } = parsePagination(req.query);
    const { search, status, provider } = req.query;

    const filter = buildSearchFilter(search, ['name', 'email', 'phone']);
    if (Object.values(USER_STATUS).includes(status)) filter.status = status;
    // `provider` is derived (googleId presence), not a stored enum field.
    if (provider === 'google') filter.googleId = { $exists: true, $ne: null };
    else if (provider === 'app') filter.googleId = { $exists: false };

    const [users, total] = await Promise.all([
        User.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit),
        User.countDocuments(filter),
    ]);
    res.json({ items: users.map(toPublicUser), total, page, limit });
});

// PATCH /api/admin/users/:id/status
// This is how a super admin moves a signup from inactive to active.
export const updateUserStatus = asyncHandler(async (req, res) => {
    const { status } = req.body;

    if (!Object.values(USER_STATUS).includes(status)) {
        res.status(400);
        throw new Error(`Status must be one of: ${Object.values(USER_STATUS).join(', ')}`);
    }

    const user = await User.findById(req.params.id);
    if (!user) {
        res.status(404);
        throw new Error('User not found');
    }

    user.status = status;
    await user.save();

    res.json({ user: toPublicUser(user) });
});

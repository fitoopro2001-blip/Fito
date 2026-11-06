// One-off script to create the first super admin, since there's no public
// admin signup route. Run with `npm run seed:admin`.
import 'dotenv/config';
import mongoose from 'mongoose';
import connectDB from '../config/db.js';
import Admin from '../models/Admin.model.js';
import { ROLES } from '../constants/roles.js';
import { ADMIN_STATUS } from '../constants/adminStatus.js';

const run = async () => {
    await connectDB();

    const email = process.env.SEED_SUPER_ADMIN_EMAIL || 'super@Fito.com';
    const existing = await Admin.findOne({ email });
    if (existing) {
        console.log(`Super admin already exists: ${email}`);
        await mongoose.disconnect();
        return;
    }

    await Admin.create({
        name: 'Super Admin',
        email,
        password: process.env.SEED_SUPER_ADMIN_PASSWORD || 'password',
        role: ROLES.SUPER_ADMIN,
        status: ADMIN_STATUS.ACTIVE,
    });

    console.log(`Super admin created: ${email}`);
    await mongoose.disconnect();
};

run().catch((err) => {
    console.error(err);
    process.exit(1);
});

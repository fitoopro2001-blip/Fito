import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import { ROLES } from '../constants/roles.js';
import { ADMIN_STATUS } from '../constants/adminStatus.js';
import { OTP_PURPOSE } from '../constants/otpPurpose.js';

const adminSchema = new mongoose.Schema(
    {
        name: { type: String, required: true, trim: true },
        email: { type: String, required: true, unique: true, lowercase: true, trim: true },
        password: { type: String, required: true, minlength: 8, select: false },
        role: {
            type: String,
            enum: Object.values(ROLES),
            default: ROLES.ADMIN,
        },
        // Self-serve signups start inactive and can't log in until a super
        // admin activates them (see requireSuperAdmin-gated status route).
        status: {
            type: String,
            enum: Object.values(ADMIN_STATUS),
            default: ADMIN_STATUS.INACTIVE,
        },
        // Defaults to true (not false) so admins that existed before this
        // field was added — and admins provisioned directly by a super admin
        // via createAdmin — aren't retroactively locked out of login.
        // signupAdmin explicitly sets this false to force the OTP step.
        isEmailVerified: { type: Boolean, default: true },
        // Hashed like the password — never store the raw code. select:false
        // keeps it out of normal queries/serialization by default.
        otp: {
            codeHash: { type: String, select: false },
            purpose: { type: String, enum: Object.values(OTP_PURPOSE), select: false },
            expiresAt: { type: Date, select: false },
            attempts: { type: Number, default: 0, select: false },
        },
    },
    { timestamps: true }
);

adminSchema.pre('save', async function hashPassword() {
    if (!this.isModified('password')) return;
    this.password = await bcrypt.hash(this.password, 10);
});

adminSchema.methods.comparePassword = function comparePassword(candidate) {
    return bcrypt.compare(candidate, this.password);
};

export default mongoose.model('Admin', adminSchema);

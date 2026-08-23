import 'dotenv/config';
import mongoose from 'mongoose';
import connectDB from '../config/db.js';
import User from '../models/User.model.js';
import Order from '../models/Order.model.js';
import Review from '../models/Review.model.js';
import Consultation from '../models/Consultation.model.js';
import ReferralCommission from '../models/ReferralCommission.model.js';

// Wipes app-side transactional data (customer accounts, orders, reviews,
// consultations, and the referral commissions that reference them).
// Deliberately leaves Product, Admin, and ConsultationPlan untouched.
const run = async () => {
    await connectDB();

    const models = [
        ['ReferralCommission', ReferralCommission],
        ['Consultation', Consultation],
        ['Review', Review],
        ['Order', Order],
        ['User', User],
    ];

    for (const [name, model] of models) {
        const { deletedCount } = await model.deleteMany({});
        console.log(`Cleared ${name}: ${deletedCount} document(s) removed`);
    }

    await mongoose.disconnect();
};

run().catch((err) => {
    console.error(err);
    process.exit(1);
});

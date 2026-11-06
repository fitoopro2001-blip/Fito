// Seeds a handful of referrers + referred users covering every combination
// of consultationBooked/productBought/commission-status so the admin
// Referrals table and the app profile page's referral stats have something
// to look at. Idempotent — reseeding first removes anything this script
// created previously (identified by the @fito-seed.local email domain).
import 'dotenv/config';
import mongoose from 'mongoose';
import connectDB from '../config/db.js';
import User from '../models/User.model.js';
import Consultation from '../models/Consultation.model.js';
import Order from '../models/Order.model.js';
import ReferralCommission from '../models/ReferralCommission.model.js';
import { createConsultation } from '../controllers/consultations.controller.js';
import { createOrder } from '../controllers/orders.controller.js';
import { COMMISSION_STATUS } from '../constants/commissionStatus.js';

const SEED_DOMAIN = 'fito-seed.local';
const email = (local) => `${local}@${SEED_DOMAIN}`;

// Runs an asyncHandler-wrapped controller with a fake req/res, resolving
// once res.json() fires (success) or next(err) is called (failure).
const invoke = (controller, req) =>
    new Promise((resolve, reject) => {
        const res = { statusCode: 200, body: undefined };
        res.status = (code) => { res.statusCode = code; return res; };
        res.json = (payload) => { res.body = payload; resolve(res); return res; };
        const timer = setTimeout(() => resolve(res), 8000);
        controller(req, res, (err) => { clearTimeout(timer); if (err) reject(err); });
    });

const bookConsultation = (user, goal) =>
    invoke(createConsultation, {
        user,
        body: {
            goal,
            transactionId: `SEED-${Date.now()}`,
            personalInfo: JSON.stringify({
                fullName: user.name,
                email: user.email,
                phone: '03001234567',
                dob: '1995-01-01',
                gender: 'male',
                activityLevel: 'moderate',
                height: 170,
                weight: 70,
            }),
            goalData: JSON.stringify({}),
        },
        files: { bodyPhotos: [{ path: 'https://placehold.co/400x600' }] },
    });

const buyProduct = (user, total) =>
    invoke(createOrder, {
        user,
        body: {
            items: [{ name: 'Fito Whey Protein', qty: 1, price: total }],
            total,
            paymentMethod: 'cod',
            shipping: { name: user.name, phone: '03001234567', address: '123 Seed Street', city: 'Lahore' },
        },
    });

const REFERRERS = [
    {
        name: 'Ahmed Raza',
        email: email('ahmed.raza'),
        referred: [
            { name: 'Bilal Khan', email: email('bilal.khan'), consultation: 'fat-loss', product: false, status: COMMISSION_STATUS.PENDING },
            { name: 'Sara Malik', email: email('sara.malik'), consultation: null, product: true, status: COMMISSION_STATUS.PENDING },
            { name: 'Usman Tariq', email: email('usman.tariq'), consultation: 'muscle-gain', product: true, status: COMMISSION_STATUS.SENT, amount: 1500 },
        ],
    },
    {
        name: 'Fatima Sheikh',
        email: email('fatima.sheikh'),
        referred: [
            { name: 'Hassan Ali', email: email('hassan.ali'), consultation: 'diabetes', product: false, status: COMMISSION_STATUS.SENT, amount: 1000 },
            { name: 'Ayesha Noor', email: email('ayesha.noor'), consultation: 'pcos', product: true, status: COMMISSION_STATUS.PENDING },
        ],
    },
    {
        name: 'Zainab Qureshi',
        email: email('zainab.qureshi'),
        referred: [
            { name: 'Omar Farooq', email: email('omar.farooq'), consultation: null, product: true, status: COMMISSION_STATUS.PENDING },
            // Signed up via referral but hasn't booked or bought anything yet —
            // shows up in totalReferred but has no commission row at all.
            { name: 'Hina Aslam', email: email('hina.aslam'), consultation: null, product: false, status: null },
        ],
    },
];

const wipeExisting = async () => {
    const seedUsers = await User.find({ email: new RegExp(`@${SEED_DOMAIN}$`) }).select('_id');
    const ids = seedUsers.map((u) => u._id);
    if (!ids.length) return;

    await ReferralCommission.deleteMany({ $or: [{ referrer: { $in: ids } }, { referredUser: { $in: ids } }] });
    await Consultation.deleteMany({ user: { $in: ids } });
    await Order.deleteMany({ user: { $in: ids } });
    await User.deleteMany({ _id: { $in: ids } });
    console.log(`Removed ${ids.length} previously-seeded user(s) and their data.`);
};

const run = async () => {
    await connectDB();
    await wipeExisting();

    for (const r of REFERRERS) {
        const referrer = await User.create({ name: r.name, email: r.email, password: 'password123' });
        console.log(`\nReferrer: ${r.name} <${r.email}>`);

        for (const ref of r.referred) {
            const referredUser = await User.create({
                name: ref.name,
                email: ref.email,
                password: 'password123',
                referredBy: referrer._id,
            });

            if (ref.consultation) {
                await bookConsultation(referredUser, ref.consultation);
            }
            if (ref.product) {
                await buyProduct(referredUser, 2500);
            }

            if (ref.status) {
                const update = { status: ref.status, updatedByAdmin: null };
                if (ref.amount != null) update.amount = ref.amount;
                if (ref.status === COMMISSION_STATUS.SENT) update.sentAt = new Date();
                await ReferralCommission.updateOne({ referredUser: referredUser._id }, { $set: update });
            }

            const flags = [ref.consultation && 'consultation', ref.product && 'product'].filter(Boolean).join(' + ') || 'signup only';
            console.log(`  - ${ref.name} <${ref.email}> — ${flags}${ref.status ? `, ${ref.status}` : ''}`);
        }
    }

    console.log('\nSeed complete.');
    await mongoose.disconnect();
};

run().catch((err) => {
    console.error(err);
    process.exit(1);
});

import mongoose from 'mongoose';
import asyncHandler from '../utils/asyncHandler.js';
import Consultation from '../models/Consultation.model.js';
import ConsultationPlan from '../models/ConsultationPlan.model.js';
import ReferralCommission from '../models/ReferralCommission.model.js';
import { CONSULTATION_GOALS } from '../constants/consultationGoals.js';
import { GENDERS, ACTIVITY_LEVELS, PHONE_REGEX, EMAIL_REGEX } from '../constants/personalInfo.js';
import { REPLY_AUTHOR } from '../constants/contentStatus.js';
import { toPublicConsultation, computeDiscountedPrice } from '../utils/serializers.js';
import { toImageUrl } from '../middleware/upload.middleware.js';
import { getCountryFromRequest, getCurrencyForCountry } from '../utils/geo.util.js';

// Picks the plan price for the visitor's detected currency. Client-submitted
// currency is never trusted (there isn't one) — currency is derived the same
// way availability is for products, from the request's own detected country
// (see getCountryFromRequest — an IP geolocation lookup, not a header read).
// Falls back to PKR when the resolved currency isn't PKR but an admin hasn't
// entered that currency's price yet (still 0) — never charges 0, and never
// mislabels an unset value as SAR/USD.
const resolveConsultationPrice = (planDoc, currency) => {
    if (currency === 'SAR' && planDoc.priceSAR > 0) return { price: planDoc.priceSAR, currency: 'SAR' };
    if (currency === 'USD' && planDoc.priceUSD > 0) return { price: planDoc.priceUSD, currency: 'USD' };
    return { price: planDoc.price, currency: 'PKR' };
};

// Multipart bodies arrive as strings, so JSON fields need parsing. Returns
// `fallback` (rather than throwing) on malformed JSON — the caller decides
// whether that's acceptable for the given field.
const parseJson = (value, fallback) => {
    if (value === undefined || value === '') return fallback;
    try {
        return JSON.parse(value);
    } catch {
        return fallback;
    }
};

// Loads a consultation owned by req.user or 404s — shared by every /:id route.
const findMyConsultationOr404 = async (id, userId) => {
    const consultation = await Consultation.findOne({ _id: id, user: userId });
    if (!consultation) {
        const err = new Error('Consultation not found');
        err.statusCode = 404;
        throw err;
    }
    return consultation;
};

// POST /api/consultations (multipart/form-data) — login required (see
// `protect` on the route). Fields: goal, plan (JSON), personalInfo (JSON —
// fullName/email/phone/dob/gender/activityLevel/height/weight all required,
// mirroring app/utils/consultationValidation.js's Yup schema), goalData
// (JSON), transactionId, plus file fields bodyPhotos (required, at least
// one)/reports/paymentScreenshot.
export const createConsultation = asyncHandler(async (req, res) => {
    const { goal, transactionId } = req.body;
    const submittedPlan = parseJson(req.body.plan, null);
    const personalInfo = parseJson(req.body.personalInfo, null);
    const goalData = parseJson(req.body.goalData, {});

    if (!CONSULTATION_GOALS.includes(goal)) {
        res.status(400);
        throw new Error(`Goal must be one of: ${CONSULTATION_GOALS.join(', ')}`);
    }
    if (!personalInfo?.fullName || !personalInfo?.email || !personalInfo?.phone) {
        res.status(400);
        throw new Error('Personal info must include fullName, email and phone');
    }
    if (!EMAIL_REGEX.test(personalInfo.email)) {
        res.status(400);
        throw new Error('Enter a valid email address');
    }
    if (!PHONE_REGEX.test(personalInfo.phone)) {
        res.status(400);
        throw new Error('Enter a valid phone number');
    }
    if (!personalInfo.dob || Number.isNaN(new Date(personalInfo.dob).getTime()) || new Date(personalInfo.dob) > new Date()) {
        res.status(400);
        throw new Error('A valid date of birth is required');
    }
    if (!GENDERS.includes(personalInfo.gender)) {
        res.status(400);
        throw new Error(`Gender must be one of: ${GENDERS.join(', ')}`);
    }
    if (!ACTIVITY_LEVELS.includes(personalInfo.activityLevel)) {
        res.status(400);
        throw new Error(`Activity level must be one of: ${ACTIVITY_LEVELS.join(', ')}`);
    }
    if (typeof personalInfo.height !== 'number' || personalInfo.height <= 0) {
        res.status(400);
        throw new Error('Height must be a positive number');
    }
    if (typeof personalInfo.weight !== 'number' || personalInfo.weight <= 0) {
        res.status(400);
        throw new Error('Weight must be a positive number');
    }

    // The price actually charged is looked up from the admin-managed
    // ConsultationPlan collection rather than trusted from the client, so a
    // tampered `plan.price` in the request can't change what gets billed.
    let plan = null;
    if (submittedPlan?.id) {
        if (!mongoose.isValidObjectId(submittedPlan.id)) {
            res.status(400);
            throw new Error('Invalid plan selected');
        }
        const planDoc = await ConsultationPlan.findOne({ _id: submittedPlan.id, goal });
        if (!planDoc || planDoc.isPaused) {
            res.status(400);
            throw new Error('Invalid plan selected');
        }
        const currency = getCurrencyForCountry(await getCountryFromRequest(req));
        const resolved = resolveConsultationPrice(planDoc, currency);
        const discountedPrice = computeDiscountedPrice(resolved.price, planDoc.discountPercent);
        plan = {
            id: planDoc._id,
            label: planDoc.label,
            durationMonths: planDoc.durationMonths,
            price: discountedPrice,
            originalPrice: planDoc.discountPercent > 0 ? resolved.price : undefined,
            currency: resolved.currency,
        };
    }

    const files = req.files ?? {};

    if (!(files.bodyPhotos ?? []).length) {
        res.status(400);
        throw new Error('Please upload at least one body photo');
    }

    const consultation = await Consultation.create({
        user: req.user._id,
        goal,
        plan,
        personalInfo,
        goalData,
        uploads: {
            bodyPhotos: (files.bodyPhotos ?? []).map(toImageUrl),
            reports: (files.reports ?? []).map(toImageUrl),
            paymentScreenshot: (files.paymentScreenshot ?? []).map(toImageUrl),
        },
        transactionId,
    });

    // First consultation from a referred user creates (or updates) their
    // (single) commission record for their referrer to be tracked/paid
    // against. The order-triggered path (see orders.controller.js) may have
    // created this same doc first, so triggeringConsultation is backfilled
    // separately (only if unset) rather than via $setOnInsert, which would
    // never fire once the doc already exists.
    if (req.user.referredBy) {
        await ReferralCommission.updateOne(
            { referredUser: req.user._id },
            {
                $set: { consultationBooked: true },
                $setOnInsert: { referrer: req.user.referredBy, referredUser: req.user._id },
            },
            { upsert: true }
        );
        await ReferralCommission.updateOne(
            { referredUser: req.user._id, triggeringConsultation: { $exists: false } },
            { $set: { triggeringConsultation: consultation._id } }
        );
    }

    res.status(201).json({ consultation: toPublicConsultation(consultation) });
});

// GET /api/consultations/my
export const getMyConsultations = asyncHandler(async (req, res) => {
    const consultations = await Consultation.find({ user: req.user._id }).sort({ createdAt: -1 });
    res.json({ consultations: consultations.map(toPublicConsultation) });
});

// GET /api/consultations/:id
export const getMyConsultationById = asyncHandler(async (req, res) => {
    const consultation = await findMyConsultationOr404(req.params.id, req.user._id).catch((err) => {
        res.status(err.statusCode || 404);
        throw err;
    });
    res.json({ consultation: toPublicConsultation(consultation) });
});

// POST /api/consultations/:id/messages — the customer continuing the thread.
export const addMyMessage = asyncHandler(async (req, res) => {
    const { message } = req.body;
    if (!message?.trim()) {
        res.status(400);
        throw new Error('Message is required');
    }

    const consultation = await findMyConsultationOr404(req.params.id, req.user._id).catch((err) => {
        res.status(err.statusCode || 404);
        throw err;
    });

    consultation.conversation.push({
        authorType: REPLY_AUTHOR.USER,
        user: req.user._id,
        authorName: req.user.name,
        message: message.trim(),
    });
    await consultation.save();

    res.status(201).json({ consultation: toPublicConsultation(consultation) });
});

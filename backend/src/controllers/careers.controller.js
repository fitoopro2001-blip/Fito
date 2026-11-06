import asyncHandler from '../utils/asyncHandler.js';
import Career from '../models/Career.model.js';
import CareerApplication from '../models/CareerApplication.model.js';
import { toPublicCareer, toPublicCareerApplication } from '../utils/serializers.js';
import { EMAIL_REGEX, PHONE_REGEX } from '../constants/personalInfo.js';

// Only open roles are ever exposed to the app.
const PUBLIC_FILTER = { isOpen: true };

// GET /api/careers
export const listCareers = asyncHandler(async (req, res) => {
    const careers = await Career.find(PUBLIC_FILTER).sort({ createdAt: -1 });
    res.json({ careers: careers.map(toPublicCareer) });
});

// POST /api/careers/:id/apply — public. The referral fields are optional,
// filled in only when the applicant was referred by someone.
export const applyToCareer = asyncHandler(async (req, res) => {
    const { name, email, phone, resumeLink, referralName, referralEmail, referralPhone } = req.body;

    const career = await Career.findOne({ _id: req.params.id, ...PUBLIC_FILTER });
    if (!career) {
        res.status(404);
        throw new Error('This job posting is not accepting applications');
    }

    if (!name?.trim() || !email?.trim() || !phone?.trim() || !resumeLink?.trim()) {
        res.status(400);
        throw new Error('Name, email, phone and resume link are required');
    }
    if (!EMAIL_REGEX.test(email.trim())) {
        res.status(400);
        throw new Error('Enter a valid email address');
    }
    if (!PHONE_REGEX.test(phone.trim())) {
        res.status(400);
        throw new Error('Enter a valid phone number');
    }
    if (referralEmail?.trim() && !EMAIL_REGEX.test(referralEmail.trim())) {
        res.status(400);
        throw new Error('Enter a valid referral email address');
    }
    if (referralPhone?.trim() && !PHONE_REGEX.test(referralPhone.trim())) {
        res.status(400);
        throw new Error('Enter a valid referral phone number');
    }

    const application = await CareerApplication.create({
        career: career._id,
        name: name.trim(),
        email: email.trim(),
        phone: phone.trim(),
        resumeLink: resumeLink.trim(),
        referralName: referralName?.trim() || undefined,
        referralEmail: referralEmail?.trim() || undefined,
        referralPhone: referralPhone?.trim() || undefined,
    });

    res.status(201).json({ application: toPublicCareerApplication(application) });
});

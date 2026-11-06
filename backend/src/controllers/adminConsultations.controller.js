import mongoose from 'mongoose';
import asyncHandler from '../utils/asyncHandler.js';
import Consultation from '../models/Consultation.model.js';
import { CONSULTATION_STATUS } from '../constants/consultationStatus.js';
import { CONSULTATION_GOALS } from '../constants/consultationGoals.js';
import { REPLY_AUTHOR } from '../constants/contentStatus.js';
import { toPublicConsultation } from '../utils/serializers.js';
import { parsePagination, searchRegex } from '../utils/queryHelpers.js';

const findConsultationOr404 = async (id) => {
    const consultation = await Consultation.findById(id);
    if (!consultation) {
        const err = new Error('Consultation not found');
        err.statusCode = 404;
        throw err;
    }
    return consultation;
};

// GET /api/admin/consultations?page=&limit=&search=&status=&goal=
export const listConsultations = asyncHandler(async (req, res) => {
    const { page, limit, skip } = parsePagination(req.query);
    const { search, status, goal } = req.query;

    const filter = {};
    if (Object.values(CONSULTATION_STATUS).includes(status)) filter.status = status;
    if (CONSULTATION_GOALS.includes(goal)) filter.goal = goal;
    if (search?.trim()) {
        const trimmed = search.trim();
        // The admin panel searches by "id" (the Mongo _id) and customer name.
        filter.$or = [
            { 'personalInfo.fullName': searchRegex(trimmed) },
            ...(mongoose.isValidObjectId(trimmed) ? [{ _id: trimmed }] : []),
        ];
    }

    const [consultations, total] = await Promise.all([
        Consultation.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit),
        Consultation.countDocuments(filter),
    ]);
    res.json({ items: consultations.map(toPublicConsultation), total, page, limit });
});

// GET /api/admin/consultations/:id
export const getConsultationById = asyncHandler(async (req, res) => {
    const consultation = await findConsultationOr404(req.params.id).catch((err) => {
        res.status(err.statusCode || 404);
        throw err;
    });
    res.json({ consultation: toPublicConsultation(consultation) });
});

// PATCH /api/admin/consultations/:id — status and/or assignedDate.
export const updateConsultation = asyncHandler(async (req, res) => {
    const { status, assignedDate } = req.body;

    if (status && !Object.values(CONSULTATION_STATUS).includes(status)) {
        res.status(400);
        throw new Error(`Status must be one of: ${Object.values(CONSULTATION_STATUS).join(', ')}`);
    }

    const consultation = await findConsultationOr404(req.params.id).catch((err) => {
        res.status(err.statusCode || 404);
        throw err;
    });

    if (status !== undefined) consultation.status = status;
    if (assignedDate !== undefined) consultation.assignedDate = assignedDate;
    await consultation.save();

    res.json({ consultation: toPublicConsultation(consultation) });
});

// POST /api/admin/consultations/:id/messages — an admin replying to the customer.
export const addAdminMessage = asyncHandler(async (req, res) => {
    const { message } = req.body;
    if (!message?.trim()) {
        res.status(400);
        throw new Error('Message is required');
    }

    const consultation = await findConsultationOr404(req.params.id).catch((err) => {
        res.status(err.statusCode || 404);
        throw err;
    });

    consultation.conversation.push({
        authorType: REPLY_AUTHOR.ADMIN,
        admin: req.admin._id,
        authorName: req.admin.name,
        message: message.trim(),
    });
    await consultation.save();

    res.status(201).json({ consultation: toPublicConsultation(consultation) });
});

// DELETE /api/admin/consultations/:id — super admin only (see route).
export const deleteConsultation = asyncHandler(async (req, res) => {
    const consultation = await findConsultationOr404(req.params.id).catch((err) => {
        res.status(err.statusCode || 404);
        throw err;
    });

    await consultation.deleteOne();

    res.json({ message: 'Consultation deleted' });
});

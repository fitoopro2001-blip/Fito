import asyncHandler from '../utils/asyncHandler.js';
import Career from '../models/Career.model.js';
import { toPublicCareer } from '../utils/serializers.js';
import { parsePagination, buildSearchFilter } from '../utils/queryHelpers.js';
import { EMAIL_REGEX } from '../constants/personalInfo.js';

// GET /api/admin/careers?page=&limit=&search= — includes closed roles.
export const listCareers = asyncHandler(async (req, res) => {
    const { page, limit, skip } = parsePagination(req.query);
    const { search } = req.query;

    const filter = buildSearchFilter(search, ['title', 'description']);

    const [careers, total] = await Promise.all([
        Career.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit),
        Career.countDocuments(filter),
    ]);
    res.json({ items: careers.map(toPublicCareer), total, page, limit });
});

// POST /api/admin/careers
export const createCareer = asyncHandler(async (req, res) => {
    const { title, description, link, email, isOpen } = req.body;

    if (!title?.trim() || !description?.trim() || !link?.trim() || !email?.trim()) {
        res.status(400);
        throw new Error('Title, description, link and email are required');
    }
    if (!EMAIL_REGEX.test(email.trim())) {
        res.status(400);
        throw new Error('Enter a valid contact email');
    }

    const career = await Career.create({
        title: title.trim(),
        description: description.trim(),
        link: link.trim(),
        email: email.trim(),
        isOpen: isOpen ?? true,
    });

    res.status(201).json({ career: toPublicCareer(career) });
});

// PATCH /api/admin/careers/:id
export const updateCareer = asyncHandler(async (req, res) => {
    const { title, description, link, email, isOpen } = req.body;

    const career = await Career.findById(req.params.id);
    if (!career) {
        res.status(404);
        throw new Error('Career not found');
    }

    if (title !== undefined) {
        if (!title.trim()) {
            res.status(400);
            throw new Error('Title is required');
        }
        career.title = title.trim();
    }
    if (description !== undefined) {
        if (!description.trim()) {
            res.status(400);
            throw new Error('Description is required');
        }
        career.description = description.trim();
    }
    if (link !== undefined) {
        if (!link.trim()) {
            res.status(400);
            throw new Error('Link is required');
        }
        career.link = link.trim();
    }
    if (email !== undefined) {
        if (!EMAIL_REGEX.test(email.trim())) {
            res.status(400);
            throw new Error('Enter a valid contact email');
        }
        career.email = email.trim();
    }
    if (isOpen !== undefined) career.isOpen = Boolean(isOpen);

    await career.save();
    res.json({ career: toPublicCareer(career) });
});

// DELETE /api/admin/careers/:id
export const deleteCareer = asyncHandler(async (req, res) => {
    const career = await Career.findById(req.params.id);
    if (!career) {
        res.status(404);
        throw new Error('Career not found');
    }

    await career.deleteOne();
    res.json({ message: 'Career deleted' });
});

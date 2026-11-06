import asyncHandler from '../utils/asyncHandler.js';
import CareerApplication from '../models/CareerApplication.model.js';
import { toPublicCareerApplication } from '../utils/serializers.js';
import { parsePagination, buildSearchFilter } from '../utils/queryHelpers.js';

// GET /api/admin/career-applications?page=&limit=&search=&careerId=
export const listCareerApplications = asyncHandler(async (req, res) => {
    const { page, limit, skip } = parsePagination(req.query);
    const { search, careerId } = req.query;

    const filter = buildSearchFilter(search, ['name', 'email', 'phone', 'referralName', 'referralEmail']);
    if (careerId) filter.career = careerId;

    const [applications, total] = await Promise.all([
        CareerApplication.find(filter).populate('career', 'title').sort({ createdAt: -1 }).skip(skip).limit(limit),
        CareerApplication.countDocuments(filter),
    ]);
    res.json({ items: applications.map(toPublicCareerApplication), total, page, limit });
});

// DELETE /api/admin/career-applications/:id
export const deleteCareerApplication = asyncHandler(async (req, res) => {
    const application = await CareerApplication.findById(req.params.id);
    if (!application) {
        res.status(404);
        throw new Error('Application not found');
    }

    await application.deleteOne();
    res.json({ message: 'Application deleted' });
});

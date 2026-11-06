import mongoose from 'mongoose';

const careerSchema = new mongoose.Schema(
    {
        title: { type: String, required: true, trim: true },
        description: { type: String, required: true, trim: true },
        // External application link (job board post, Google Form, etc.) — the
        // app's "Apply Now" button points straight here.
        link: { type: String, required: true, trim: true },
        // Contact email shown alongside the listing for candidates who'd
        // rather reach out directly.
        email: { type: String, required: true, trim: true },
        // Admin can close a role without deleting its listing.
        isOpen: { type: Boolean, default: true },
    },
    { timestamps: true }
);

careerSchema.index({ isOpen: 1, createdAt: -1 });

export default mongoose.model('Career', careerSchema);

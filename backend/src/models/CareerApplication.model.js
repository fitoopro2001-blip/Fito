import mongoose from 'mongoose';

// One submission from the app's in-app "Quick Apply" form on a job posting —
// separate from anyone who used the posting's external application link.
const careerApplicationSchema = new mongoose.Schema(
    {
        career: { type: mongoose.Schema.Types.ObjectId, ref: 'Career', required: true, index: true },
        name: { type: String, required: true, trim: true },
        email: { type: String, required: true, trim: true },
        phone: { type: String, required: true, trim: true },
        resumeLink: { type: String, required: true, trim: true },
        // Whoever referred the applicant to this role — optional, only filled
        // in when the applicant was referred by someone.
        referralName: { type: String, trim: true },
        referralEmail: { type: String, trim: true },
        referralPhone: { type: String, trim: true },
    },
    { timestamps: true }
);

export default mongoose.model('CareerApplication', careerApplicationSchema);

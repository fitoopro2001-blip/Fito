import { v2 as cloudinary } from 'cloudinary';
import { CloudinaryStorage } from 'multer-storage-cloudinary';
import multer from 'multer';

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

const storage = new CloudinaryStorage({
    cloudinary,
    params: (req, file) => {
        // 'auto' resolves PDFs to Cloudinary's "image" resource type, which
        // Cloudinary blocks from unauthenticated delivery by default (its
        // anti-XSS policy for PDF/SVG served as images) — that 401s every
        // report download. 'raw' serves the bytes as-is and isn't subject
        // to that restriction, so route PDFs there explicitly.
        const isPdf = file.mimetype === 'application/pdf';
        return {
            folder: 'fito',
            resource_type: isPdf ? 'raw' : 'image',
            allowed_formats: isPdf ? undefined : ['jpg', 'jpeg', 'png', 'webp', 'gif', 'avif'],
        };
    },
});

const ALLOWED_MIME = [
    'image/jpeg',
    'image/png',
    'image/webp',
    'image/gif',
    'image/avif',
    'application/pdf',
];

const fileFilter = (req, file, cb) => {
    if (!ALLOWED_MIME.includes(file.mimetype)) {
        cb(new Error('Only JPEG, PNG, WebP, GIF, AVIF images or PDF files are allowed'));
        return;
    }
    cb(null, true);
};

const upload = multer({
    storage,
    fileFilter,
    limits: { fileSize: 5 * 1024 * 1024, files: 12 },
});

// Blogs take a single cover image; products take a gallery.
export const uploadSingleImage = upload.single('image');
export const uploadProductImages = upload.array('images', 6);
// Consultation submissions carry three independent upload fields.
export const uploadConsultationFiles = upload.fields([
    { name: 'bodyPhotos', maxCount: 6 },
    { name: 'reports', maxCount: 4 },
    { name: 'paymentScreenshot', maxCount: 1 },
]);

// Course enrolments carry just the payment proof.
export const uploadPaymentScreenshot = upload.single('paymentScreenshot');

// Admin-uploaded proof of a commission payment.
export const uploadCommissionProof = upload.single('proofScreenshot');

// With CloudinaryStorage, multer puts the hosted URL on file.path.
export const toImageUrl = (file) => file?.path;

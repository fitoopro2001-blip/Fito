// Mirrors backend/src/middleware/upload.middleware.js's multer limits and
// ALLOWED_MIME — keep in sync. Catching an oversized/unsupported file here
// gives an inline error instead of the multipart request failing partway
// through (or bouncing off multer with a raw "File too large" message).
export const MAX_UPLOAD_SIZE_MB = 5;

export const ALLOWED_IMAGE_TYPES = [
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/gif',
  'image/avif',
];
export const ALLOWED_REPORT_TYPES = [...ALLOWED_IMAGE_TYPES, 'application/pdf'];

// Field-level maxCount from uploadConsultationFiles.
export const MAX_BODY_PHOTOS = 6;
export const MAX_REPORTS = 4;

import multer from 'multer';

export const notFound = (req, res, next) => {
    res.status(404);
    next(new Error(`Route not found - ${req.originalUrl}`));
};

// eslint-disable-next-line no-unused-vars
export const errorHandler = (err, req, res, next) => {
    // Upload rejections (size/count limits, bad mime type) are client errors,
    // not server faults — otherwise they'd fall through as a 500 below.
    if (err instanceof multer.MulterError || err.message?.startsWith('Only JPEG')) {
        res.status(400);
    }

    const statusCode = res.statusCode && res.statusCode !== 200 ? res.statusCode : 500;
    res.status(statusCode).json({
        message: err.message,
        stack: process.env.NODE_ENV === 'production' ? undefined : err.stack,
    });
};

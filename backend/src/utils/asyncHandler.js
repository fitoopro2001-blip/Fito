// Wraps an async route/controller so rejected promises reach Express's
// error middleware instead of crashing the process.
const asyncHandler = (fn) => (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
};

export default asyncHandler;

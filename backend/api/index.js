import app from '../src/app.js';
import connectDB from '../src/config/db.js';

// Vercel's Node.js runtime calls exported functions as plain (req, res)
// handlers — an Express app is already callable that way, so this just
// makes sure a DB connection exists (see config/db.js's caching) before
// handing the request off to Express's own routing.
export default async function handler(req, res) {
    await connectDB();
    return app(req, res);
}

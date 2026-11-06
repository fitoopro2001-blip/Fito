// One-off migration for the new drag-to-reorder product sorting. Assigns
// `sortOrder` to every existing product matching the order they currently
// display in (newest first), so turning on manual sorting doesn't reshuffle
// the shop/admin list until an admin actually drags something. Safe to
// re-run — it always recomputes from `createdAt` order.
//
// Run with `npm run migrate:product-sort-order`.
import 'dotenv/config';
import mongoose from 'mongoose';
import connectDB from '../config/db.js';
import Product from '../models/Product.model.js';

const run = async () => {
    await connectDB();

    const products = await Product.find().sort({ createdAt: -1 });
    await Product.bulkWrite(
        products.map((product, index) => ({
            updateOne: { filter: { _id: product._id }, update: { $set: { sortOrder: index } } },
        }))
    );

    console.log(`Migration complete — assigned sortOrder to ${products.length} products.`);
    await mongoose.disconnect();
};

run().catch((err) => {
    console.error(err);
    process.exit(1);
});

// One-off migration for the removal of the random id suffix from product
// slugs (e.g. "fitoo-whey-360-chocolate-flavor-eb2433" ->
// "fitoo-whey-360-chocolate-flavor"). New slugs now get a numeric suffix
// only on a genuine name collision (see utils/uniqueSlug.js); this rewrites
// existing products to match. Safe to re-run — products already on a clean
// slug are left untouched.
//
// Run with `npm run migrate:product-slugs`.
import 'dotenv/config';
import mongoose from 'mongoose';
import connectDB from '../config/db.js';
import Product from '../models/Product.model.js';
import { buildProductSlug } from '../utils/productSeo.js';
import ensureUniqueSlug from '../utils/uniqueSlug.js';

const run = async () => {
    await connectDB();

    // Oldest first, so when two products share a name the one that had the
    // clean slug historically keeps it and the newer one gets the suffix.
    const products = await Product.find().sort({ createdAt: 1 });
    let updated = 0;

    for (const product of products) {
        const next = await ensureUniqueSlug(Product, buildProductSlug(product), product._id);
        if (next !== product.slug) {
            product.slug = next;
            await product.save();
            updated += 1;
        }
    }

    console.log(`Migration complete — ${updated} of ${products.length} product slugs regenerated.`);
    await mongoose.disconnect();
};

run().catch((err) => {
    console.error(err);
    process.exit(1);
});

// One-off migration for the switch of product `description` from plain text
// to HTML (the panel now edits it with the same Tiptap editor as blog posts).
// Existing descriptions predate that switch and are stored as raw text, so
// rendering them through the new `dangerouslySetInnerHTML` storefront/admin
// views would collapse their line breaks into one run-on paragraph. This
// wraps each paragraph in `<p>` tags so they render the same as before.
// Skips anything that already looks like HTML. Safe to re-run.
//
// Run with `npm run migrate:product-description-html`.
import 'dotenv/config';
import mongoose from 'mongoose';
import connectDB from '../config/db.js';
import Product from '../models/Product.model.js';

const looksLikeHtml = (text) => /<\/?[a-z][\s\S]*>/i.test(text);

const escapeHtml = (text) => text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

const toHtml = (text) =>
    text
        .split(/\n{2,}/)
        .map((paragraph) => paragraph.trim())
        .filter(Boolean)
        .map((paragraph) => `<p>${escapeHtml(paragraph).replace(/\n/g, '<br>')}</p>`)
        .join('');

const run = async () => {
    await connectDB();

    const products = await Product.find();
    let updated = 0;

    for (const product of products) {
        const raw = product.description ?? '';
        if (looksLikeHtml(raw)) continue;
        const html = toHtml(raw);
        if (html) {
            product.description = html;
            await product.save();
            updated += 1;
        }
    }

    console.log(`Migration complete — converted ${updated} of ${products.length} product descriptions to HTML.`);
    await mongoose.disconnect();
};

run().catch((err) => {
    console.error(err);
    process.exit(1);
});

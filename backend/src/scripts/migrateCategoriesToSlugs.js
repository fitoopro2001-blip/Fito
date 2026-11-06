// One-off migration for the introduction of the Category module.
//
// Before this change, Product.category held a free-text display label (e.g.
// "Protein Powders"). It now holds a Category.slug (e.g. "protein-powders").
// This script:
//   1. Creates a Category document for every distinct label already present
//      on existing products (skipping any that already exist).
//   2. Rewrites each product's `category` field from the old label to the
//      new slug.
//   3. Reports any product whose category couldn't be confidently mapped
//      (there shouldn't be any on first run, but re-running after partial
//      failures should be safe/idempotent).
//
// Run with `npm run migrate:categories`. Safe to re-run — already-slugified
// values (which won't match any known label) are left untouched and just
// get reported.
import 'dotenv/config';
import mongoose from 'mongoose';
import connectDB from '../config/db.js';
import Product from '../models/Product.model.js';
import Category from '../models/Category.model.js';
import slugify from '../utils/slugify.js';
import { CATEGORY_STATUS } from '../constants/categoryStatus.js';

const run = async () => {
    await connectDB();

    const distinctLabels = await Product.distinct('category');

    let categoriesCreated = 0;
    const labelToSlug = {};
    for (const label of distinctLabels) {
        const slug = slugify(label);
        labelToSlug[label] = slug;

        const existing = await Category.findOne({ $or: [{ slug }, { name: label }] });
        if (existing) continue;

        await Category.create({ name: label, slug, status: CATEGORY_STATUS.ACTIVE });
        categoriesCreated += 1;
    }

    let productsUpdated = 0;
    const unmapped = [];
    for (const label of distinctLabels) {
        const slug = labelToSlug[label];
        if (slug === label) continue; // already a slug, nothing to change

        const result = await Product.updateMany({ category: label }, { $set: { category: slug } });
        productsUpdated += result.modifiedCount;
        if (result.modifiedCount === 0) unmapped.push(label);
    }

    console.log(
        `Migration complete — ${categoriesCreated} categories created, ${productsUpdated} products updated.`
    );
    if (unmapped.length) {
        console.log('Labels that matched no product (already migrated or unused):', unmapped);
    }

    await mongoose.disconnect();
};

run().catch((err) => {
    console.error(err);
    process.exit(1);
});

// One-off dev/test data helper: fills in placeholder SAR/USD prices for
// ConsultationPlan docs that don't have one yet (still 0, the schema
// default), so the multi-currency UI has something to show besides the PKR
// fallback. Values are randomized within a plausible band per plan — they
// are NOT derived from an exchange rate and are not meant to be the real
// business prices; an admin should replace them with actual figures via the
// admin panel's consultation pricing page.
//
// Only touches plans where priceSAR/priceUSD is still 0, so it won't
// clobber anything an admin has already entered. Safe to re-run.
//
// Run with `npm run seed:consultation-currency-prices`.
import 'dotenv/config';
import mongoose from 'mongoose';
import connectDB from '../config/db.js';
import ConsultationPlan from '../models/ConsultationPlan.model.js';

const randomInRange = (min, max) => Math.round(min + Math.random() * (max - min));

// Rough, deliberately loose bands (not a real conversion) so numbers land in
// a believable range regardless of the plan's PKR price.
const randomSAR = () => randomInRange(150, 1200);
const randomUSD = () => randomInRange(40, 320);

const run = async () => {
    await connectDB();

    // Existing docs predate priceSAR/priceUSD, so the fields are simply
    // absent in storage — Mongoose only fills the schema default in memory
    // once a document is loaded via the model, which is why this fetches
    // everything and decides per-doc below rather than filtering in the
    // query (a stored-data filter like `{ priceSAR: { $lte: 0 } }` wouldn't
    // match a field that isn't stored at all).
    const plans = await ConsultationPlan.find({});
    const needsUpdate = plans.filter((plan) => !(plan.priceSAR > 0) || !(plan.priceUSD > 0));

    if (needsUpdate.length) {
        await ConsultationPlan.bulkWrite(
            needsUpdate.map((plan) => ({
                updateOne: {
                    filter: { _id: plan._id },
                    update: {
                        $set: {
                            priceSAR: plan.priceSAR > 0 ? plan.priceSAR : randomSAR(),
                            priceUSD: plan.priceUSD > 0 ? plan.priceUSD : randomUSD(),
                        },
                    },
                },
            }))
        );
    }

    console.log(`Injected placeholder SAR/USD prices for ${needsUpdate.length} of ${plans.length} consultation plan(s).`);
    await mongoose.disconnect();
};

run().catch((err) => {
    console.error(err);
    process.exit(1);
});

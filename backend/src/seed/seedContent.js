// Seeds products and blog posts from the dummy data the frontends shipped
// with, so the API returns something real right away. Run with
// `npm run seed:content`. Skips anything already present, so it's safe to
// re-run. Images stay as the original remote URLs — new uploads through the
// admin panel will be local /uploads paths.
import 'dotenv/config';
import mongoose from 'mongoose';
import connectDB from '../config/db.js';
import Product from '../models/Product.model.js';
import Blog from '../models/Blog.model.js';
import Category from '../models/Category.model.js';
import slugify from '../utils/slugify.js';
import { PRODUCT_STATUS, BLOG_STATUS } from '../constants/contentStatus.js';
import { CATEGORY_STATUS } from '../constants/categoryStatus.js';

const PLACEHOLDER_IMAGE =
    'https://img.magnific.com/free-photo/protein-gym_23-2151980040.jpg?semt=ais_hybrid&w=740&q=80';

// `category` below is a Category.slug (see Category.model.js), not a display name.
const categories = [
    { name: 'Protein Powders', slug: 'protein-powders' },
    { name: 'Protein Bars', slug: 'protein-bars' },
    { name: 'Protein Shakes', slug: 'protein-shakes' },
    { name: 'Creatine', slug: 'creatine' },
];

const products = [
    { name: 'Whey Protein Isolate', category: 'protein-powders', price: 49.99, stock: 120, description: 'Pure whey isolate with 25g protein per serving, zero sugar.', status: PRODUCT_STATUS.PUBLISHED },
    { name: 'Casein Protein', category: 'protein-powders', price: 44.99, stock: 80, description: 'Slow-release casein for overnight muscle recovery.', status: PRODUCT_STATUS.PUBLISHED },
    { name: 'Protein Crunch Bar', category: 'protein-bars', price: 29.99, stock: 200, description: 'Crispy protein bar with 20g protein, low sugar, great taste.', status: PRODUCT_STATUS.PUBLISHED },
    { name: 'Collagen Protein Bar', category: 'protein-bars', price: 32.99, stock: 0, description: 'Protein bar with collagen peptides for joint and skin health.', status: PRODUCT_STATUS.OUT_OF_STOCK },
    { name: 'Whey Protein Shake', category: 'protein-shakes', price: 39.99, stock: 150, description: 'Ready-to-drink whey protein shake, delicious and convenient.', status: PRODUCT_STATUS.PUBLISHED },
    { name: 'Vegan Protein Shake', category: 'protein-shakes', price: 42.99, stock: 60, description: 'Plant-based protein shake with pea and rice protein blend.', status: PRODUCT_STATUS.PUBLISHED },
    { name: 'Creatine Monohydrate', category: 'creatine', price: 27.99, stock: 300, description: 'Pure micronized creatine monohydrate for strength and power.', status: PRODUCT_STATUS.PUBLISHED },
    { name: 'Creatine + HMB', category: 'creatine', price: 34.99, stock: 45, description: 'Advanced creatine formula with HMB for muscle preservation.', status: PRODUCT_STATUS.PUBLISHED },
];

const blogs = [
    {
        title: 'Whey vs Casein: Which Protein Is Right For You?',
        category: 'Nutrition',
        author: 'Dr. Amina Farooq',
        date: '2026-06-18',
        readTime: '5 min read',
        excerpt: "Both are complete proteins, but they digest very differently. Here's how to pick the right one for your schedule and goals.",
        content: [
            'Whey and casein both come from milk, but the way your body absorbs them couldn\'t be more different. Whey is digested quickly, flooding your bloodstream with amino acids within 30-60 minutes, making it ideal right after a workout when your muscles are primed for recovery.',
            'Casein, on the other hand, forms a gel in the stomach and releases amino acids slowly over several hours. That slow release is exactly why it\'s popular as a bedtime shake — it keeps muscles fed with protein through the overnight fasting window.',
            'If you can only pick one, whey is the more versatile everyday option. But if you\'re training seriously and want to cover both the post-workout window and the overnight window, using both at different times of day is a common and effective strategy.',
            "Neither is inherently 'better' — it comes down to timing. Match the protein to the moment: whey around training, casein before sleep.",
        ],
    },
    {
        title: '5 Creatine Myths Debunked by Science',
        category: 'Supplements',
        author: 'Bilal Hassan',
        date: '2026-06-05',
        readTime: '6 min read',
        excerpt: "Creatine is one of the most researched supplements on the planet, yet the myths still won't die. Let's set the record straight.",
        content: [
            'Myth 1: Creatine damages your kidneys. In healthy individuals, decades of research show no evidence of kidney harm at standard doses (3-5g/day).',
            'Myth 2: Creatine causes bloating and water retention that ruins your physique. Some water is pulled into muscle cells — that\'s part of how it works — but this is intracellular hydration, not the puffy, subcutaneous bloating people fear.',
            "Myth 3: You need to 'cycle' creatine on and off. There's no research-backed reason to cycle; consistent daily use maintains saturated muscle stores and consistent benefits.",
            'Myth 4: Creatine is just for bodybuilders. Evidence also supports benefits for cognitive function, recovery from injury, and general power output in almost any sport.',
            'Myth 5: A loading phase is required. It speeds up saturation by about a week, but 3-5g daily gets you to the same place — just a little slower.',
        ],
    },
    {
        title: 'How Much Protein Do You Actually Need Per Day?',
        category: 'Nutrition',
        author: 'Dr. Amina Farooq',
        date: '2026-05-22',
        readTime: '4 min read',
        excerpt: "The old '1g per pound of bodyweight' rule gets thrown around a lot. Here's what the research actually supports.",
        content: [
            'For general health, the RDA sits around 0.8g of protein per kilogram of bodyweight. But if you\'re training regularly and trying to build or preserve muscle, that number is too low.',
            'Most research on resistance-trained individuals points to a range of 1.6-2.2g per kilogram of bodyweight per day for optimal muscle protein synthesis — roughly 0.7-1g per pound.',
            'Spreading intake across 3-4 meals with 25-40g of protein each tends to be more effective than trying to hit your total in one or two large meals, since muscle protein synthesis responds best to repeated stimulation throughout the day.',
            'If you\'re cutting calories, protein needs actually go up slightly to help preserve lean mass — aim for the higher end of that range.',
        ],
    },
    {
        title: "Pre-Workout Powder vs Caffeine Pills: What's the Difference?",
        category: 'Supplements',
        author: 'Zeeshan Ali',
        date: '2026-05-10',
        readTime: '5 min read',
        excerpt: "A plain caffeine pill and a scoop of pre-workout aren't the same thing. Here's what you're actually paying for.",
        content: [
            'A caffeine pill gives you exactly one thing: caffeine, usually 100-200mg, with nothing else. It\'s cheap, precise, and easy to dose.',
            "Pre-workout powders bundle caffeine with other ingredients — citrulline for blood flow, beta-alanine for muscular endurance, and sometimes creatine or B vitamins. The 'tingle' people associate with pre-workout comes from beta-alanine, not the caffeine itself.",
            'If budget and simplicity matter most, a caffeine pill covers the energy component. If you want the pump, endurance, and focus stack that many lifters chase, a formulated pre-workout is doing more work for you.',
            'Either way, cycle off caffeine periodically to avoid building up too much tolerance — the point is to feel the effect, not just to feel normal.',
        ],
    },
    {
        title: 'Building a Cutting Diet You Can Actually Stick To',
        category: 'Diet & Lifestyle',
        author: 'Hina Malik',
        date: '2026-04-28',
        readTime: '7 min read',
        excerpt: "Most cuts fail not because of bad macros, but because they're impossible to sustain. Here's how to design one that lasts.",
        content: [
            "The biggest predictor of cutting success isn't the perfect macro split — it's whether you can actually follow the plan for more than two weeks. A moderate deficit of 300-500 calories below maintenance is usually enough, and far easier to sustain than an aggressive cut.",
            'Keep protein high (around 1.8-2.2g/kg) to protect muscle mass, and don\'t be afraid to leave some flexibility in carbs and fats based on what keeps you satisfied and consistent.',
            "Build the diet around foods you actually like eating. A 'perfect' plan full of food you dread is worse than a slightly-less-optimal plan you can follow for three months straight.",
            'Expect the scale to fluctuate day to day — track weekly averages instead of individual days, and adjust your calories only when the weekly trend stalls for two weeks or more.',
        ],
    },
    {
        title: 'Why Your Recovery Days Matter More Than Your Training Days',
        category: 'Training',
        author: 'Omar Farooq',
        date: '2026-04-09',
        readTime: '5 min read',
        excerpt: "Muscle isn't built in the gym — it's built during recovery. Here's what to prioritize on your off days.",
        content: [
            'Training creates the stimulus, but the actual adaptation — muscle repair, strength gains, glycogen replenishment — happens during recovery. Skimping on rest days undercuts the very training you worked so hard for.',
            'Sleep is the single biggest recovery lever most people ignore. Aim for 7-9 hours; poor sleep measurably reduces strength output and increases perceived soreness the next day.',
            'Active recovery — a walk, light mobility work, easy cycling — can support blood flow and reduce stiffness without adding training stress.',
            "Don't neglect protein and hydration on rest days just because you're not 'training.' Your body is still doing repair work that needs the same raw materials.",
        ],
    },
];

const run = async () => {
    await connectDB();

    let categoriesCreated = 0;
    for (const category of categories) {
        if (await Category.exists({ slug: category.slug })) continue;
        await Category.create({ ...category, status: CATEGORY_STATUS.ACTIVE });
        categoriesCreated += 1;
    }

    let productsCreated = 0;
    for (const product of products) {
        if (await Product.exists({ name: product.name })) continue;
        await Product.create({
            ...product,
            images: [PLACEHOLDER_IMAGE, PLACEHOLDER_IMAGE, PLACEHOLDER_IMAGE, PLACEHOLDER_IMAGE],
        });
        productsCreated += 1;
    }

    let blogsCreated = 0;
    for (const { date, content, ...blog } of blogs) {
        const slug = slugify(blog.title);
        if (await Blog.exists({ slug })) continue;
        await Blog.create({
            ...blog,
            slug,
            // Seed data is written as paragraph arrays for readability; the
            // model stores content as HTML (see Blog.model.js).
            content: content.map((paragraph) => `<p>${paragraph}</p>`).join(''),
            publishedAt: new Date(date),
            image: PLACEHOLDER_IMAGE,
            status: BLOG_STATUS.PUBLISHED,
        });
        blogsCreated += 1;
    }

    console.log(
        `Seed complete — ${categoriesCreated} categories, ${productsCreated} products, ${blogsCreated} blog posts created.`
    );
    await mongoose.disconnect();
};

run().catch((err) => {
    console.error(err);
    process.exit(1);
});

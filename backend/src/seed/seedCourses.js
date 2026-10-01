import 'dotenv/config';
import mongoose from 'mongoose';
import connectDB from '../config/db.js';
import Course from '../models/Course.model.js';
import { COURSE_STATUS } from '../constants/course.js';

// Course data from the FITOO Academy Course Catalogue developer handoff
// (29 September 2026). The fees in that document are the discounted launch
// fees; the actual (struck-through) price is 20% more — see toCourseDoc.
const ACTUAL_PRICE_MARKUP = 1.2;

const VENUE = 'FITOO Office, Moon Market, Allama Iqbal Town, Lahore';
const STANDARD_BATCH = 'Recommended 12 to 15 learners; maximum 20, subject to classroom capacity.';

const COURSES = [
    {
        code: 'C01',
        slug: 'dietitian-sales-consultation-mastery',
        title: 'Dietitian Sales and Consultation Mastery',
        summary: 'Learn to turn suitable enquiries into structured, ethical consultations.',
        category: 'Business and Practice',
        price: 14999,
        durationWeeks: 4,
        hours: 18,
        schedule: '12 onsite classes, 1.5 hours each',
        batchGuidance: STANDARD_BATCH,
        overview:
            'A practical course for nutrition students and dietitians who want to improve client communication, run discovery consultations, explain suitable services, and follow up professionally. Sales practice is grounded in honest claims and a client centred recommendation.',
        audience: 'Nutrition students, recent graduates, and practising dietitians.',
        outcomes: [
            'Respond to an enquiry and qualify the client without pressure.',
            'Use a structured consultation and document goals, barriers, and readiness.',
            'Present packages, handle common objections, and ask for a decision ethically.',
            'Create a follow up process with clear consent and privacy boundaries.',
        ],
        curriculum: [
            ['Sales fundamentals, client psychology, first contact and enquiry triage', 'Draft an initial response and qualification script.'],
            ['Discovery questions, consultation structure and personalised recommendations', 'Conduct a recorded or observed mock consultation.'],
            ['Package presentation, pricing, ethical closing and WhatsApp communication', 'Produce an offer card and follow up sequence.'],
            ['Objections, follow ups, retention and final mock consultation', 'Complete a scored sales simulation and reflection.'],
        ],
        inclusions:
            'Sales scripts, discovery question bank, consultation notes sheet, needs to benefits worksheet, offer card, role plays and instructor feedback.',
        assessment: 'Observed mock consultation plus completion of key worksheets.',
        disclaimer:
            'This course teaches professional communication and consultation skills; it does not confer clinical registration or guarantee sales.',
    },
    {
        code: 'C02',
        slug: 'dietitian-practice-launch-program',
        title: 'Dietitian Practice Launch Program',
        summary: 'Design the systems needed to start an independent nutrition practice.',
        category: 'Business and Practice',
        price: 29999,
        durationWeeks: 8,
        hours: 32,
        schedule: '16 onsite classes, 2 hours each',
        batchGuidance: STANDARD_BATCH,
        overview:
            'An implementation focused program for graduates who want to define their niche, develop services and pricing, build a professional presence, manage enquiries, and organise client delivery. Students leave with a practice plan and working templates.',
        audience: 'Graduating nutrition students, new dietitians, and professionals preparing for independent practice.',
        outcomes: [
            'Define a niche and a credible service offer.',
            'Set prices using a simple financial model and describe package scope.',
            'Build a lead, consultation, onboarding, and retention workflow.',
            'Prepare a 90 day implementation plan.',
        ],
        curriculum: [
            ['Niche and ideal client', 'Draft a positioning statement.'],
            ['Service design and boundaries', 'Define packages and deliverables.'],
            ['Pricing and business finances', 'Complete cost and revenue worksheet.'],
            ['Personal brand and social media', 'Build a professional profile plan.'],
            ['Lead generation and partnerships', 'Create an outreach plan.'],
            ['Sales funnel and consultations', 'Test an enquiry to booking process.'],
            ['Onboarding and retention', 'Assemble forms and check in workflow.'],
            ['Launch roadmap', 'Present a practice portfolio and 90 day plan.'],
        ],
        inclusions:
            'Editable planning worksheets, service and pricing templates, intake and onboarding documents, implementation assignments, and instructor feedback.',
        assessment: 'Final practice portfolio and presentation.',
        disclaimer:
            'This course helps students plan and organise a practice; actual commercial launch and any paid tools are separate. Zero to Online Fitness Consultation Business provides a longer supervised build and launch process.',
    },
    {
        code: 'C03',
        slug: 'applied-sports-nutrition',
        title: 'Applied Sports Nutrition',
        summary: 'Apply nutrition principles to training, performance and recovery.',
        category: 'Clinical and Sports Nutrition',
        price: 19999,
        durationWeeks: 4,
        hours: 16,
        schedule: '8 onsite classes, 2 hours each',
        batchGuidance: STANDARD_BATCH,
        overview:
            'A practical introduction to sports nutrition for nutrition and fitness professionals. Students assess a training scenario, estimate energy and nutrient needs, plan food and hydration, and evaluate supplement claims using current evidence.',
        audience:
            'Dietitians, nutrition students, certified fitness trainers, and sports professionals working within their scope.',
        outcomes: [
            'Collect a useful athlete training and nutrition history.',
            'Estimate energy needs and plan macronutrients and hydration.',
            'Adapt food timing to training demands and recovery.',
            'Assess common sports supplements and communicate uncertainty.',
        ],
        curriculum: [
            ['Foundations of sports nutrition and athlete assessment', 'Complete a sport and training demand profile.'],
            ['Energy requirements, macronutrients, timing and hydration', 'Work through energy, protein and hydration calculations.'],
            ['Body composition, recovery and evidence based supplementation', 'Critique a supplement marketing claim.'],
            ['Individualised nutrition planning and athlete cases', 'Present a case based nutrition plan.'],
        ],
        inclusions: 'Calculation worksheets, case studies, four practical assignments and final case presentation.',
        assessment: 'Case plan and short presentation assessed with an approved rubric.',
        disclaimer:
            'The course is continuing education delivered by FITOO. It does not replace a university qualification or specialist clinical supervision.',
    },
    {
        code: 'C04',
        slug: 'applied-diabetes-nutrition-management',
        title: 'Applied Diabetes Nutrition Management',
        summary: 'Practise nutrition assessment, carbohydrate counting and case planning.',
        category: 'Clinical and Sports Nutrition',
        price: 24999,
        durationWeeks: 6,
        hours: 24,
        schedule: '12 onsite classes, 2 hours each',
        batchGuidance: STANDARD_BATCH,
        overview:
            'A case based education program on nutrition care for people living with type 1 and type 2 diabetes. It covers glucose data interpretation in context, meal planning, carbohydrate counting, weight management, exercise considerations, and appropriate escalation to the treating clinical team.',
        audience: 'Nutrition students, dietitians, and relevant healthcare professionals; professional scope applies.',
        outcomes: [
            'Explain type 1 and type 2 diabetes and relevant nutrition goals.',
            'Gather dietary, medication, activity and glucose context for assessment.',
            'Practise carbohydrate counting and individualised meal planning.',
            'Recognise situations that require medical review or referral.',
        ],
        curriculum: [
            ['Diabetes physiology and classification', 'Explain the nutrition implications of a fictional case.'],
            ['Nutrition assessment, HbA1c and glucose monitoring', 'Document a structured assessment.'],
            ['Medical nutrition therapy and carbohydrate counting', 'Complete carb counting exercises.'],
            ['Type 1 and type 2 meal planning', 'Develop a case based meal plan.'],
            ['Weight management, activity, supplements and clinical considerations', 'Discuss scope and referral decisions.'],
            ['Case studies, referrals and assessment', 'Present a care plan for a fictional client.'],
        ],
        inclusions: 'Assessment sheets, carbohydrate counting practice, fictional cases and instructor feedback.',
        assessment: 'Case based nutrition plan and practical evaluation with approved scoring rubric.',
        disclaimer:
            "Education within the learner's professional scope. It does not authorise diagnosis, medication or insulin adjustment, or independent treatment decisions.",
    },
    {
        code: 'C05',
        slug: 'zero-to-online-fitness-consultation-business',
        title: 'Zero to Online Fitness Consultation Business',
        summary: 'Build and test the operating parts of an online consultation business.',
        category: 'Business and Practice',
        price: 69999,
        durationWeeks: 12,
        hours: 60,
        schedule: '24 onsite classes, 2.5 hours each; individual reviews',
        batchGuidance: 'Recommended 8 to 12 learners.',
        overview:
            'A supervised business build program for qualified or aspiring nutrition and fitness professionals. Participants create a brand, offers, social profiles, landing and booking process, consultation scripts, onboarding materials, and a client delivery workflow. They test a lead to client journey and leave with a 90 day growth plan.',
        audience:
            "Dietitians, nutritionists, qualified fitness trainers, and aspiring fitness business owners. Clinical and exercise services must match each participant's qualifications.",
        outcomes: [
            'Launch a clear professional identity and defined offers.',
            'Set up an enquiry, booking, payment and onboarding path.',
            'Create an initial content plan and supervised advertising setup.',
            'Demonstrate a working consultation and client management process.',
        ],
        curriculum: [
            ['Business foundations and niche', 'Personal roadmap.'],
            ['Brand and positioning', 'Brand identity and profile.'],
            ['Service packages', 'Three proposed offers.'],
            ['Pricing and finance', 'Price and revenue worksheet.'],
            ['Instagram, Facebook and WhatsApp Business', 'Professional profiles.'],
            ['Content and video marketing', 'Calendar and sample posts.'],
            ['Client acquisition and Meta ads', 'Supervised campaign setup.'],
            ['Consultation and sales', 'Mock consultation and scripts.'],
            ['Landing, booking and payments', 'Functional enquiry and booking path.'],
            ['Onboarding and delivery', 'Client workflow and tracking.'],
            ['Launch implementation', 'Test campaign and enrolment process.'],
            ['Review and optimisation', 'Portfolio and 90 day growth plan.'],
        ],
        inclusions:
            'Editable templates, three individual business reviews, classroom simulations, portfolio feedback and a training demonstration of FITOO web panel capabilities where available.',
        assessment:
            'Demonstrate the lead to client workflow from marketing to progress review, using fictional clients or consented real participants.',
        disclaimer:
            'Advertising spend, domains, hosting, paid software, payment processing and commercial panel access are excluded unless FITOO expressly includes them. No promise of paying clients or income.',
    },
    {
        code: 'C06',
        slug: 'practical-gym-training-for-nutritionists',
        title: 'Practical Gym Training for Nutritionists',
        summary: 'Learn exercise technique, program design and supervised gym coaching.',
        category: 'Fitness Training and Coaching',
        price: 59999,
        durationWeeks: 12,
        hours: 72,
        schedule: '36 onsite classes, 2 hours each; at least 40 gym floor hours within the 72',
        batchGuidance: 'Recommended 8 to 10 learners, subject to gym access and supervision.',
        overview:
            'A practical gym education program for nutritionists and dietitians who want to develop foundational exercise coaching skills. Students practise exercise demonstrations, client screening, coaching cues, adaptations, and resistance programming under supervision.',
        audience:
            'Nutritionists and dietitians seeking additional fitness coaching skills. Trainers from other backgrounds may be considered if FITOO approves entry criteria.',
        outcomes: [
            'Screen and assess a general fitness client and recognise referral needs.',
            'Demonstrate and coach key push, pull, lower body, core and mobility exercises.',
            'Build a beginner or intermediate resistance program.',
            'Lead a supervised training session with safe technique and communication.',
        ],
        curriculum: [
            ['Anatomy and movement', 'Identify muscles and movement patterns.'],
            ['Physiology and biomechanics', 'Analyse joint actions and mechanics.'],
            ['Screening and fitness assessment', 'Practise baseline assessment.'],
            ['Chest, shoulders and triceps', 'Demonstrate push exercises.'],
            ['Back and biceps', 'Demonstrate pull exercises.'],
            ['Legs and glutes', 'Coach squat, hinge and leg exercises.'],
            ['Core, mobility and flexibility', 'Teach suitable progressions.'],
            ['Resistance programming', 'Write beginner and intermediate plans.'],
            ['Strength, hypertrophy and fat loss', 'Select training variables.'],
            ['Different populations', 'Modify and refer appropriately.'],
            ['Supervised personal training', 'Coach practice clients.'],
            ['Final gym assessment', 'Complete observed evaluation.'],
        ],
        inclusions:
            'At least 40 gym floor hours within total contact time, including a minimum of 24 supervised practicum hours; exercise library, programming templates and observed coaching feedback.',
        assessment:
            '75 percent overall pass with all essential safety competencies demonstrated. Exercise demonstration 25 percent; assessment 20 percent; programming 20 percent; supervised coaching 25 percent; professionalism 10 percent.',
        disclaimer:
            'FITOO Academy Certificate of Completion in Practical Gym Training and Fitness Trainer Development records FITOO assessed training. It is not automatically an internationally accredited personal trainer qualification. Clinical and rehabilitation cases require appropriate referral.',
    },
];

const toCourseDoc = (course, index) => ({
    ...course,
    originalPrice: Math.round(course.price * ACTUAL_PRICE_MARKUP),
    venue: VENUE,
    curriculum: course.curriculum.map(([topic, practical], i) => ({ week: i + 1, topic, practical })),
    status: COURSE_STATUS.PUBLISHED,
    sortOrder: index + 1,
});

// Insert-only: a course whose slug already exists is left untouched, so
// re-running this never overwrites edits made in the admin panel.
const run = async () => {
    await connectDB();

    let created = 0;
    for (const [index, course] of COURSES.entries()) {
        const result = await Course.updateOne(
            { slug: course.slug },
            { $setOnInsert: toCourseDoc(course, index) },
            { upsert: true }
        );
        if (result.upsertedCount) created += 1;
    }
    console.log(`Seeded ${created} course(s); ${COURSES.length - created} already existed.`);

    await mongoose.disconnect();
};

run().catch((err) => {
    console.error(err);
    process.exit(1);
});

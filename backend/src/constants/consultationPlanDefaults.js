// Starting set of programs per goal, used to lazily create ConsultationPlan
// documents the first time a goal is read with zero plans (see
// consultationPlans.controller.js). Once created, admins fully own this data
// — they can rename, reprice, or delete these, and add as many more programs
// as they like. Content mirrors FITOO Consultation Programs - Pricing
// Structure & Features (app/assets/pricing), no discounts.
export const CONSULTATION_PLAN_DEFAULTS = [
    // 1. Fat Loss Transformation Program
    { goal: 'fat-loss', label: '14-Day Trial', durationMonths: 1, price: 2999, features: [
        'Personalized fat loss diet plan', 'Customized workout plan (Home/Gym)', 'WhatsApp coaching support', 'Regular progress monitoring',
        'Body measurement tracking', 'Weight tracking', 'Habit-building guidance', 'Diet modifications according to progress', 'Transformation progress reports',
    ] },
    { goal: 'fat-loss', label: '3 Months Program', durationMonths: 3, price: 14999, features: [
        'Personalized fat loss diet plan', 'Customized workout plan (Home/Gym)', 'WhatsApp coaching support', 'Regular progress monitoring',
        'Body measurement tracking', 'Weight tracking', 'Habit-building guidance', 'Diet modifications according to progress', 'Transformation progress reports',
    ] },
    { goal: 'fat-loss', label: '6 Months Program', durationMonths: 6, price: 24999, features: [
        'Personalized fat loss diet plan', 'Customized workout plan (Home/Gym)', 'WhatsApp coaching support', 'Regular progress monitoring',
        'Body measurement tracking', 'Weight tracking', 'Habit-building guidance', 'Diet modifications according to progress', 'Transformation progress reports',
    ] },

    // 2. Muscle Gain Program
    { goal: 'muscle-gain', label: '3 Months Program', durationMonths: 3, price: 17999, features: [
        'Personalized muscle gain nutrition plan', 'Strength training program', 'Progressive overload tracking', 'Workout performance monitoring',
        'Supplement guidance', 'Muscle growth tracking', 'Body composition monitoring', 'Regular coaching support',
    ] },
    { goal: 'muscle-gain', label: '6 Months Program', durationMonths: 6, price: 29999, features: [
        'Personalized muscle gain nutrition plan', 'Strength training program', 'Progressive overload tracking', 'Workout performance monitoring',
        'Supplement guidance', 'Muscle growth tracking', 'Body composition monitoring', 'Regular coaching support',
    ] },

    // 3. Body Recomposition Program
    { goal: 'body-recomposition', label: '3 Months Program', durationMonths: 3, price: 19999, features: [
        'Complete body transformation strategy', 'Personalized nutrition plan', 'Customized workout programming', 'Fat loss and muscle building approach',
        'Body composition tracking', 'Progress photos tracking', 'Strength improvement monitoring', 'Lifestyle optimization', 'Regular coaching and accountability',
    ] },
    { goal: 'body-recomposition', label: '6 Months Program', durationMonths: 6, price: 34999, features: [
        'Complete body transformation strategy', 'Personalized nutrition plan', 'Customized workout programming', 'Fat loss and muscle building approach',
        'Body composition tracking', 'Progress photos tracking', 'Strength improvement monitoring', 'Lifestyle optimization', 'Regular coaching and accountability',
    ] },

    // 4. FITOO Busy Moms Program
    { goal: 'mother-wellness', label: 'Personalized Coaching', durationMonths: 3, price: 14999, features: [
        'Family-friendly meal planning', 'Busy schedule workout plans', 'Home-based workout options', 'Accountability support',
        'Lifestyle coaching', 'Craving management', 'Stress and routine management',
    ] },
    { goal: 'mother-wellness', label: 'Group Coaching', durationMonths: 3, price: 4999, features: [
        'Family-friendly meal planning', 'Busy schedule workout plans', 'Home-based workout options', 'Group accountability support',
        'Lifestyle coaching', 'Craving management', 'Stress and routine management',
    ] },

    // 5. PCOS Management Program
    { goal: 'pcos', label: '3 Months Program', durationMonths: 3, price: 14999, features: [
        'PCOS-friendly nutrition plan', 'Hormonal health lifestyle guidance', 'Weight management strategy', 'Menstrual cycle tracking',
        'Symptom tracking', 'Exercise programming', 'Lifestyle modification', 'Lab report guidance', 'Regular follow-ups',
    ] },
    { goal: 'pcos', label: '6 Months Program', durationMonths: 6, price: 24999, features: [
        'PCOS-friendly nutrition plan', 'Hormonal health lifestyle guidance', 'Weight management strategy', 'Menstrual cycle tracking',
        'Symptom tracking', 'Exercise programming', 'Lifestyle modification', 'Lab report guidance', 'Regular follow-ups',
    ] },

    // 6. Diabetes Management Program
    { goal: 'diabetes', label: '3 Months Program', durationMonths: 3, price: 19999, features: [
        'Diabetes-friendly customized diet plan', 'Blood sugar management strategy', 'Exercise prescription', 'Glucose monitoring guidance',
        'Lifestyle modification coaching', 'Diabetes education', 'Progress tracking', 'Lab parameter monitoring guidance', 'Regular follow-ups',
    ] },
    { goal: 'diabetes', label: '6 Months Program', durationMonths: 6, price: 34999, features: [
        'Diabetes-friendly customized diet plan', 'Blood sugar management strategy', 'Exercise prescription', 'Glucose monitoring guidance',
        'Lifestyle modification coaching', 'Diabetes education', 'Progress tracking', 'Lab parameter monitoring guidance', 'Regular follow-ups',
    ] },

    // 7. One-on-One Home Training (Lahore) — launched paused ("Coming Soon")
    // until in-home training operations go live. Pricing per FITOO handoff:
    // days-per-month tiers, one calendar month each.
    { goal: 'home-training', label: '12 Days / Month', durationMonths: 1, price: 29999, isPaused: true, features: [
        'Certified trainer at your home', '12 one-on-one sessions per month', 'Personalized workout plan (goal-based)',
        'Form correction and technique coaching', 'Progress and body measurement tracking', 'Flexible scheduling around you',
        'WhatsApp coaching support',
    ] },
    { goal: 'home-training', label: '16 Days / Month', durationMonths: 1, price: 39999, isPaused: true, features: [
        'Certified trainer at your home', '16 one-on-one sessions per month', 'Personalized workout plan (goal-based)',
        'Form correction and technique coaching', 'Progress and body measurement tracking', 'Flexible scheduling around you',
        'WhatsApp coaching support',
    ] },
    { goal: 'home-training', label: '20 Days / Month', durationMonths: 1, price: 49999, isPaused: true, features: [
        'Certified trainer at your home', '20 one-on-one sessions per month', 'Personalized workout plan (goal-based)',
        'Form correction and technique coaching', 'Progress and body measurement tracking', 'Flexible scheduling around you',
        'Priority WhatsApp coaching support',
    ] },

    // 8. Personalized Consultation at FITOO Office — launched paused
    // ("Coming Soon"). Single in-person session, priced per consultation.
    { goal: 'office-consultation', label: 'Single Consultation', durationMonths: 1, price: 4999, isPaused: true, features: [
        'In-person consultation at the FITOO office', 'Personalized fitness, nutrition and lifestyle guidance',
        'Body composition and goal assessment', 'Custom program direction and next steps', 'Follow-up recommendations',
    ] },
];

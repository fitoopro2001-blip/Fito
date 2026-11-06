// Kept in sync with the goal ids used by admin/src/constants/consultationGoals.js
// (CONSULTATION_GOALS) and app/utils/consultationConfig.js (CONSULTATION_GOALS).
export const CONSULTATION_GOALS = Object.freeze([
    'fat-loss',
    'muscle-gain',
    'body-recomposition',
    'pcos',
    'mother-wellness',
    'diabetes',
    // One-on-One Home Training and Personalized Office Consultation — see
    // FITOO_Website_Booking_Forms_Developer_Handoff. Launched paused (all
    // default plans have isPaused: true), so they show as "Coming Soon".
    'home-training',
    'office-consultation',
]);

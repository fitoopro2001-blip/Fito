// Mirrors CONSULTATION_GOALS ids in the main app (app/utils/consultationConfig.js)
export const CONSULTATION_GOALS = [
    { id: 'fat-loss', title: 'Fat Loss', icon: '🔥' },
    { id: 'muscle-gain', title: 'Muscle Gain', icon: '💪' },
    { id: 'body-recomposition', title: 'Body Recomposition', icon: '⚖️' },
    { id: 'pcos', title: 'PCOS', icon: '🌸' },
    { id: 'mother-wellness', title: 'Busy Moms', icon: '🤱' },
    { id: 'diabetes', title: 'Diabetic Patients', icon: '🩸' },
    { id: 'home-training', title: 'Home Training', icon: '🏠' },
    { id: 'office-consultation', title: 'Office Consultation', icon: '🏢' },
];

export const CONSULTATION_STATUSES = ['pending', 'in_review', 'completed'];

export const STATUS_COLORS = {
    pending: 'gold',
    in_review: 'blue',
    completed: 'green',
};

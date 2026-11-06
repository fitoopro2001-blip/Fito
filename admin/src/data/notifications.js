import { CONSULTATION_GOALS } from '../constants/consultationGoals';

export const NOTIFICATION_TYPES = [
    { value: 'info', label: 'Info' },
    { value: 'promo', label: 'Promotion' },
    { value: 'alert', label: 'Alert' },
];

export const NOTIFICATION_AUDIENCES = [
    { value: 'all', label: 'All Users' },
    ...CONSULTATION_GOALS.map((g) => ({ value: g.id, label: g.title })),
];

export const NOTIFICATION_STATUSES = ['sent', 'scheduled', 'draft'];

export const notifications = [
    {
        id: 1,
        title: 'New Year, New Goals',
        message: 'Kick off the year with 20% off all consultation plans this week only.',
        type: 'promo',
        audience: 'all',
        status: 'sent',
        date: '2026-01-02',
    },
    {
        id: 2,
        title: 'PCOS Support Webinar',
        message: 'Join our free live session on managing PCOS symptoms through nutrition.',
        type: 'info',
        audience: 'pcos',
        status: 'sent',
        date: '2026-03-14',
    },
    {
        id: 3,
        title: 'Payment Verification Delay',
        message: 'Payment verifications may take up to 24 hours longer than usual this week.',
        type: 'alert',
        audience: 'all',
        status: 'sent',
        date: '2026-05-20',
    },
    {
        id: 4,
        title: 'Diabetic Plan Check-in Reminder',
        message: "Don't forget to log your latest blood sugar readings for your dietitian.",
        type: 'info',
        audience: 'diabetes',
        status: 'scheduled',
        date: '2026-08-10',
    },
    {
        id: 5,
        title: 'Busy Moms Referral Bonus',
        message: 'Refer a friend to the Busy Moms program and both get Rs. 1,000 off.',
        type: 'promo',
        audience: 'mother-wellness',
        status: 'draft',
        date: '2026-08-25',
    },
];

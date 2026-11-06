// Kept in sync with admin/src/data/notifications.js on the admin frontend.
export const NOTIFICATION_TYPE = Object.freeze({
    INFO: 'info',
    PROMO: 'promo',
    ALERT: 'alert',
});

export const NOTIFICATION_STATUS = Object.freeze({
    DRAFT: 'draft',
    SCHEDULED: 'scheduled',
    SENT: 'sent',
});

// 'all' broadcasts to every active user; anything else is a consultation
// goal id (see admin/src/constants/consultationGoals.js) but there's no
// server-side link between a user and their goal yet, so only 'all' is
// actually delivered — narrower audiences are accepted and stored for when
// that link exists, but won't reach anyone until then.
export const NOTIFICATION_AUDIENCE_ALL = 'all';

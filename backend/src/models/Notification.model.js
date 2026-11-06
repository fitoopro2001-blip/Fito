import mongoose from 'mongoose';
import { NOTIFICATION_TYPE, NOTIFICATION_STATUS, NOTIFICATION_AUDIENCE_ALL } from '../constants/notification.js';

const notificationSchema = new mongoose.Schema(
    {
        title: { type: String, required: true, trim: true },
        message: { type: String, required: true, trim: true },
        type: {
            type: String,
            enum: Object.values(NOTIFICATION_TYPE),
            default: NOTIFICATION_TYPE.INFO,
        },
        // 'all' or a consultation goal id — see the constants file for why
        // only 'all' is actually delivered right now.
        audience: { type: String, default: NOTIFICATION_AUDIENCE_ALL, trim: true },
        status: {
            type: String,
            enum: Object.values(NOTIFICATION_STATUS),
            default: NOTIFICATION_STATUS.DRAFT,
        },
        // When this notification should start showing up for users. Only
        // enforced for status 'sent' — drafts/scheduled never reach the app.
        sendDate: { type: Date, required: true },
        createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'Admin' },
        // Who has read it — checked with .includes() per-request, so this
        // stays a plain array rather than a separate collection.
        readBy: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    },
    { timestamps: true }
);

notificationSchema.index({ status: 1, sendDate: -1 });

export default mongoose.model('Notification', notificationSchema);

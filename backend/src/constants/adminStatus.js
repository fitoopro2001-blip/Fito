// Admin account status. Kept in sync with admin/src/constants/adminStatus.js
// on the frontend — both must use these exact string values. New self-serve
// signups start inactive; a super admin activates them from the admin panel.
export const ADMIN_STATUS = Object.freeze({
    INACTIVE: 'inactive',
    ACTIVE: 'active',
});

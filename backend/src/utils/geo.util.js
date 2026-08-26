// Vercel's edge network sets this header on every request that reaches a
// Vercel-hosted function — including CORS calls the browser makes straight to
// this API — based on the requester's real IP, so it can't be spoofed by the
// client on an actual Vercel deployment. Off Vercel (e.g. local dev), it's
// simply absent and callers fall through to the fallback below.
const COUNTRY_HEADER = 'x-vercel-ip-country';

export const getCountryFromRequest = (req) => {
    const value = req.headers[COUNTRY_HEADER];
    return typeof value === 'string' && value.trim() ? value.trim().toUpperCase() : null;
};

// PK -> PKR, SA -> SAR, everything else (including a failed/missing
// detection) -> USD.
export const getCurrencyForCountry = (country) => {
    if (country === 'PK') return 'PKR';
    if (country === 'SA') return 'SAR';
    return 'USD';
};

// Physical products only ship within Pakistan; consultations have no such
// restriction (see consultations.controller.js).
export const isPhysicalProductAvailable = (country) => country === 'PK';

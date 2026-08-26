// This backend isn't deployed on Vercel (it runs on Railway), so there's no
// platform-injected x-vercel-ip-country header to read — country is resolved
// from the request's real IP via a free geo-IP lookup instead. Results are
// cached in-memory per IP (this is a long-running process, not a
// per-request cold start, so the cache actually helps) so repeat visitors
// don't pay a network round trip on every request.
const CACHE_TTL_MS = 24 * 60 * 60 * 1000; // an IP's country essentially never changes within a day.
const LOOKUP_TIMEOUT_MS = 2500;

const countryCache = new Map(); // ip -> { country, expiresAt }

// Railway (like most PaaS) sits behind a proxy, so req.socket.remoteAddress
// is Railway's own proxy, not the visitor — the real client IP is the first
// entry of X-Forwarded-For.
const getClientIp = (req) => {
    const forwarded = req.headers['x-forwarded-for'];
    if (typeof forwarded === 'string' && forwarded.trim()) {
        return forwarded.split(',')[0].trim();
    }
    return req.socket?.remoteAddress || null;
};

// Loopback/private-range IPs (localhost, LAN, Docker) can't be geo-located —
// treated as a detection failure (see getCountryFromRequest's null return),
// which is expected and harmless in local dev.
const isPrivateOrLocalIp = (ip) =>
    !ip ||
    ip === '::1' ||
    ip === '127.0.0.1' ||
    /^(10\.|127\.|192\.168\.|::ffff:127\.)/.test(ip) ||
    /^172\.(1[6-9]|2\d|3[0-1])\./.test(ip);

const fetchWithTimeout = async (url) => {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), LOOKUP_TIMEOUT_MS);
    try {
        return await fetch(url, { signal: controller.signal });
    } finally {
        clearTimeout(timer);
    }
};

const isValidCountryCode = (code) => typeof code === 'string' && /^[A-Z]{2}$/.test(code);

// Primary provider — HTTPS, no API key, no documented hard rate limit.
const lookupViaGeoJs = async (ip) => {
    const res = await fetchWithTimeout(`https://get.geojs.io/v1/ip/country.json?ip=${encodeURIComponent(ip)}`);
    if (!res.ok) return null;
    const data = await res.json();
    const code = data?.[0]?.country?.toUpperCase();
    return isValidCountryCode(code) ? code : null;
};

// Fallback if the primary is down/times out — HTTP only on the free tier,
// which is fine for a server-to-server lookup of non-sensitive data.
const lookupViaIpApi = async (ip) => {
    const res = await fetchWithTimeout(`http://ip-api.com/json/${encodeURIComponent(ip)}?fields=countryCode`);
    if (!res.ok) return null;
    const data = await res.json();
    const code = data?.countryCode?.toUpperCase();
    return isValidCountryCode(code) ? code : null;
};

const lookupCountry = async (ip) => {
    try {
        const primary = await lookupViaGeoJs(ip);
        if (primary) return primary;
    } catch {
        // fall through to the backup provider
    }
    try {
        return await lookupViaIpApi(ip);
    } catch {
        return null;
    }
};

// Async — every caller must await this (it wasn't previously, back when it
// just read a header synchronously). Returns null on a private/local IP or
// when both geo-IP providers fail; callers treat null the same as any other
// unrecognized country (USD fallback, products unavailable).
export const getCountryFromRequest = async (req) => {
    const ip = getClientIp(req);
    if (isPrivateOrLocalIp(ip)) return null;

    const cached = countryCache.get(ip);
    if (cached && cached.expiresAt > Date.now()) return cached.country;

    const country = await lookupCountry(ip);
    if (country) {
        countryCache.set(ip, { country, expiresAt: Date.now() + CACHE_TTL_MS });
    }
    return country;
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

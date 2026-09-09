// Thin wrapper around the Meta Pixel's global `fbq`, which is injected by
// components/shared/MetaPixel.jsx. Every call here is a no-op until that
// script has loaded (and, if a consent gate is added later, until consent is
// granted), so these helpers are safe to call from anywhere — including code
// paths that also run during SSR.

export const META_PIXEL_ID = process.env.NEXT_PUBLIC_META_PIXEL_ID;

const canTrack = () =>
  typeof window !== 'undefined' && typeof window.fbq === 'function';

// Standard events reference:
// https://www.facebook.com/business/help/402791146561655
// `options` carries things like { eventID } used to de-duplicate a browser
// event against its Conversions API twin.
export const trackEvent = (name, params = {}, options = {}) => {
  if (!canTrack()) return;
  window.fbq('track', name, params, options);
};

// For events Meta has no standard name for.
export const trackCustom = (name, params = {}) => {
  if (!canTrack()) return;
  window.fbq('trackCustom', name, params);
};

// Reuse the same id for the browser event and the matching server-side
// (Conversions API) event so Meta counts them once. Generate it at the call
// site, fire the pixel with it, and send the same value from the backend.
export const newEventId = () =>
  globalThis.crypto?.randomUUID?.() ??
  `${Date.now()}-${Math.random().toString(16).slice(2)}`;

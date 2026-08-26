import { getCountryFromRequest, isPhysicalProductAvailable } from '../utils/geo.util.js';

// Physical products only ship within Pakistan. Applied to the public product
// routes and order creation so the restriction holds even if a client calls
// the API directly, bypassing the storefront's own UI-level gating.
export const restrictToPakistan = (req, res, next) => {
    if (!isPhysicalProductAvailable(getCountryFromRequest(req))) {
        res.status(403);
        throw new Error('Not available in your country');
    }
    next();
};

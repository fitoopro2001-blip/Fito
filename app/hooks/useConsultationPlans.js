'use client';

import { useMemo } from 'react';
import useApiResource from './useApiResource';
import { getConsultationPlans } from '../services/consultation.service';
import { CONSULTATION_GOALS as STATIC_GOALS } from '../utils/consultationConfig';

/**
 * Admins fully own the list of programs offered per goal (label, duration,
 * price, discount, feature bullets — see the admin panel's "Manage Pricing"
 * page), so the real plan list for a goal can be any length, not just the
 * static 3 tiers this file's fallback ships with. Images stay owned by the
 * static goal config (see PlanSelection.jsx), since admins don't manage those.
 *
 * Falls back to the static plans before the fetch resolves, or if a goal has
 * no admin-managed plans yet, so the flow is never blocked on the network or
 * left with an empty plan list.
 */
export default function useConsultationPlans() {
  const { data: remotePlans } = useApiResource(getConsultationPlans, [], {
    fallback: null,
  });

  return useMemo(() => {
    if (!remotePlans) return STATIC_GOALS;

    return STATIC_GOALS.map((goal) => {
      const goalPlans = remotePlans
        .filter((plan) => plan.goal === goal.id)
        .map((plan) => ({
          id: plan.id,
          label: plan.label,
          durationMonths: plan.durationMonths,
          price: plan.price,
          priceSAR: plan.priceSAR,
          priceUSD: plan.priceUSD,
          discountPercent: plan.discountPercent,
          discountedPrice: plan.discountedPrice,
          discountedPriceSAR: plan.discountedPriceSAR,
          discountedPriceUSD: plan.discountedPriceUSD,
          features: plan.features,
          isPaused: plan.isPaused,
        }));

      return goalPlans.length ? { ...goal, plans: goalPlans } : goal;
    });
  }, [remotePlans]);
}

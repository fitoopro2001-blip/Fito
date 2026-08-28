'use client';

import { CheckCircleFilled, CheckOutlined, InfoCircleOutlined } from '@ant-design/icons';

import Card from '../../atoms/Card';
import Image from '../../atoms/Image';
import { H2, H3, Text, Caption } from '../../atoms/Typography';
import { useCountry } from '../../../context/CountryContext';
import { formatPrice } from '../../../utils/formatCurrency';
import { resolvePlanPrice } from '../../../utils/planPrice';

function formatDuration(months) {
  return `${months} Month${months > 1 ? 's' : ''}`;
}

export default function PlanSelection({
  goal,
  plans,
  selectedPlan,
  onSelect,
}) {
  const { currency } = useCountry();

  return (
    <div>

      <div className="text-center mb-10">
        <H2 className="mb-2">
          Choose your plan{goal ? ` for ${goal.title}` : ''}
        </H2>

        <Text muted>
          Here&apos;s what&apos;s included and what it costs — pick the duration that works for you.
        </Text>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

        {plans.map((plan) => {

          const isSelected = selectedPlan?.id === plan.id;
          const resolved = resolvePlanPrice(plan, currency);
          const hasDiscount = resolved.discountPercent > 0;
          const chargedPrice = resolved.discountedPrice;
          const isPaused = Boolean(plan.isPaused);

          return (
            <Card
              key={plan.id}
              hoverable={!isPaused}
              padding={0}
              onClick={() => !isPaused && onSelect(plan)}
              className={`
                relative
                overflow-hidden
                border
                flex flex-col

                ${
                  isSelected
                    ? 'border-primary bg-primary/10'
                    : 'border-border-light glass hover:border-primary/40'
                }
              `}
            >
              {isPaused && (
                <div className="absolute inset-0 z-20 flex items-center justify-center bg-black/25">
                  <span className="text-white text-sm font-bold px-4 py-2 rounded-full bg-black/70 tracking-wide uppercase">
                    Coming Soon
                  </span>
                </div>
              )}

              <div className={`flex flex-col grow ${isPaused ? 'blur-sm pointer-events-none select-none' : ''}`}>

                {isSelected && (
                  <CheckCircleFilled
                    className="absolute top-3 right-3 z-10 text-primary text-xl bg-surface rounded-full"
                  />
                )}

                {plan.badge && (
                  <span className="absolute top-3 left-3 z-10 text-xs font-semibold px-2 py-1 rounded-full bg-primary text-text-inverse">
                    {plan.badge}
                  </span>
                )}

                <div className="relative w-full aspect-square">
                  <Image
                    src={plan.image || goal?.image}
                    alt={`${plan.label} plan reference`}
                    fill
                    objectFit="contain"
                  />

                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/5 to-transparent" />

                  {/* Tier name is fully admin-controlled (see the admin panel's
                      "Manage Pricing" page) — shown exactly as entered. */}
                  {plan.label && (
                    <span className="absolute bottom-3 left-4 z-10 text-white text-2xl font-bold tracking-wide drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]">
                      {plan.label}
                    </span>
                  )}
                </div>

                <div className="p-6 flex flex-col grow">

                  <Caption>{formatDuration(plan.durationMonths)}</Caption>

                  <div className="mt-1 mb-1">
                    <div className="flex items-baseline gap-2 flex-wrap">
                      <H3 className="m-0 whitespace-nowrap">
                        {formatPrice(chargedPrice, resolved.currency)}
                      </H3>
                      {hasDiscount && (
                        <Text muted className="line-through whitespace-nowrap">
                          {formatPrice(resolved.price, resolved.currency)}
                        </Text>
                      )}
                    </div>
                    {hasDiscount && (
                      <span className="inline-block mt-1 text-xs font-semibold px-2 py-0.5 rounded-full bg-success/10 text-success whitespace-nowrap">
                        {resolved.discountPercent}% off
                      </span>
                    )}
                  </div>

                  <Text muted className="mb-4">
                    {formatPrice(Math.round(chargedPrice / plan.durationMonths), resolved.currency)} / month
                  </Text>

                  {plan.bestFor && (
                    <div className="flex items-start gap-2 bg-overlay rounded-lg p-3 mb-4">
                      <InfoCircleOutlined className="text-primary mt-0.5 text-sm shrink-0" />
                      <Text className="text-sm">{plan.bestFor}</Text>
                    </div>
                  )}

                  <ul className="space-y-2 mt-auto">
                    {plan.features.map((feature) => (
                      <li key={feature} className="flex items-start gap-2">
                        <CheckOutlined className="text-primary mt-1 text-xs shrink-0" />
                        <Text className="text-sm">{feature}</Text>
                      </li>
                    ))}
                  </ul>

                </div>

              </div>

            </Card>
          );
        })}

      </div>

    </div>
  );
}

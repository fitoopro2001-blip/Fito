// Static section. The before/after reveal is CSS-only — a hidden checkbox
// drives both the hover wipe (desktop) and the tap-to-reveal (mobile, via a
// <label> wrapping the image) — so this needs no state, no framer-motion,
// and no client bundle.
import Image from 'next/image';
import Link from 'next/link';
import { H2, Text } from '../../components/atoms/Typography';
import Icon from '../../components/atoms/Icon';
import ba101 from '@/assets/images/ba101.jpeg';
import ba102 from '@/assets/images/ba102.jpeg';
import ba201 from '@/assets/images/ba201.jpeg';
import ba202 from '@/assets/images/ba202.jpeg';
import ba301 from '@/assets/images/ba301.jpeg';
import ba302 from '@/assets/images/ba302.jpeg';
import ba401 from '@/assets/images/ba401.jpeg';
import ba402 from '@/assets/images/ba402.jpeg';

const transformations = [
  {
    id: 't1',
    name: 'M. Hassan',
    program: 'Muscle Building Program',
    goal: 'Muscle Gain',
    beforeWeight: 37,
    afterWeight: 65,
    duration: '8 months',
    story: 'Hassan went from a skinny 37 kg to a muscular 65 kg in 8 months.',
    beforeImage: ba101,
    afterImage: ba102,
  },
  {
    id: 't2',
    name: 'Tahir Mehmood',
    program: 'Body Recomposition Program',
    goal: 'Body Recomposition',
    beforeWeight: 85,
    afterWeight: 72,
    duration: '6 months',
    story: 'Tahir went from 85 kg of fat to 72 kg of lean muscle through body recomposition.',
    beforeImage: ba201,
    afterImage: ba202,
  },
  {
    id: 't3',
    name: 'Shair Muhammad',
    program: 'Weight Loss Program',
    goal: 'Weight Loss',
    beforeWeight: 152,
    afterWeight: 76,
    duration: '6 months',
    story: 'Shair transformed his life, going from 152 kg to 76 kg in just 6 months.',
    beforeImage: ba301,
    afterImage: ba302,
  },
  {
    id: 't4',
    name: 'Asmara',
    program: 'Weight Loss Program',
    goal: 'Weight Loss',
    beforeWeight: 85,
    afterWeight: 60,
    duration: '3 months',
    story: 'Asmara dropped from 85 kg to 60 kg in just 3 months, transforming her health and confidence.',
    beforeImage: ba401,
    afterImage: ba402,
  },
];

export default function TransformationStories() {
  return (
    <section className="relative py-20 section-defer">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12 reveal">
          <H2>Transformation Stories</H2>
          <Text muted className="mt-3 max-w-xl mx-auto">
            Real results from real people who trusted Fitoo to help them reach their goals.
          </Text>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 reveal">
          {transformations.map((story) => {
            const delta = story.beforeWeight - story.afterWeight;

            return (
              <div
                key={story.id}
                className="story group relative glass border border-border-light rounded-2xl overflow-hidden hover-lift hover-lift-sm hover:border-primary/30"
              >
                {/* Drives the reveal on devices without hover. Sits outside
                    the label so `~` sibling selectors in CSS can target the
                    image layers below from a single checked state. */}
                <input
                  type="checkbox"
                  id={`reveal-${story.id}`}
                  className="story-toggle sr-only"
                  aria-label={`Toggle before and after photo for ${story.name}`}
                />

                {/* Before/After Image Container — also a label, so tapping
                    it on touch devices toggles the checkbox above. */}
                <label htmlFor={`reveal-${story.id}`} className="story-media relative block w-full aspect-[4/5] overflow-hidden cursor-pointer md:cursor-default">
                  {/* Before — always visible underneath */}
                  <div className="absolute inset-0">
                    <Image
                      src={story.beforeImage}
                      alt={`${story.name} before transformation`}
                      fill
                      sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 25vw"
                      className="object-cover"
                    />
                    <div className="absolute inset-0 bg-background/20" />
                    <span className="absolute top-3 left-3 glass-strong text-text text-xs font-medium px-3 py-1.5 rounded-full">
                      Before
                    </span>
                  </div>

                  {/* After — wiped in on hover (desktop) or tap (mobile).
                      clip-path via a CSS transition instead of framer-motion:
                      the old version drove clipPath off React state, so every
                      frame of the 600ms wipe was a React render plus a full
                      image repaint. */}
                  <div className="story-after absolute inset-0">
                    <Image
                      src={story.afterImage}
                      alt={`${story.name} after transformation`}
                      fill
                      sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 25vw"
                      className="object-cover"
                    />
                    <div className="absolute inset-0 bg-background/20" />
                    <span className="absolute top-3 left-3 bg-primary/90 text-text-inverse text-xs font-medium px-3 py-1.5 rounded-full">
                      After
                    </span>
                  </div>

                  {/* Wipe edge */}
                  <div className="story-handle absolute top-0 bottom-0 w-0.5 bg-primary shadow-lg shadow-primary/50" />

                  {/* Glowing tap hint — mobile only (no hover there), fades
                      out once the checkbox is checked. */}
                  <span className="story-tap-hint md:hidden absolute bottom-3 inset-x-0 mx-auto w-fit bg-primary text-text-inverse text-xs font-semibold px-4 py-2 rounded-full">
                    Tap to see results
                  </span>
                </label>

                {/* Content */}
                <div className="p-5 space-y-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="text-lg font-semibold text-text">{story.name}</h3>
                      <p className="text-sm text-text-muted">
                        {story.program}
                      </p>
                    </div>
                    <div className="flex items-center gap-1 text-sm">
                      <span className="text-text-muted">{story.beforeWeight}kg</span>
                      <span className="text-primary">→</span>
                      <span className="text-primary font-semibold">{story.afterWeight}kg</span>
                    </div>
                  </div>

                  <p className="text-sm text-text-secondary leading-relaxed">{story.story}</p>

                  <div className="flex items-center justify-between pt-2 border-t border-border-light">
                    <span className="text-xs text-text-muted">⏱ {story.duration}</span>
                    <div className="flex items-center gap-1 text-primary text-sm">
                      <span className="font-medium">
                        {delta > 0 ? `-${delta}kg` : `+${Math.abs(delta)}kg`}
                      </span>
                      <Icon name="trending-up" className="w-4 h-4" />
                    </div>
                  </div>
                </div>

                {/* Hover hint — only rendered for hover-capable pointers, since
                    "Hover to see transformation" is meaningless on a phone. */}
                <div className="story-hint absolute inset-0 pointer-events-none hidden md:flex items-center justify-center">
                  <div className="glass-strong text-text text-xs font-medium px-4 py-2 rounded-full border border-border-light">
                    Hover to see transformation →
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* CTA */}
        <div className="text-center mt-12 reveal">
          <Text className="text-text-secondary">Ready to write your own success story?</Text>
          <Link
            href="/consultation"
            className="mt-4 inline-flex items-center gap-2 text-primary font-semibold hover:text-primary-hover transition-colors group"
          >
            Start Your Transformation Today
            <span className="transition-transform md:group-hover:translate-x-1">→</span>
          </Link>
        </div>
      </div>
    </section>
  );
}

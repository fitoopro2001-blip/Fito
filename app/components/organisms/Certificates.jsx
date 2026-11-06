// Trust/certification marquee.
//
// Was a client component purely because of `styled-jsx`; the keyframes now live
// in globals.css so this ships no JavaScript.
//
// The marquee itself is a transform animation, which the compositor handles
// without the main thread — but it used to run forever, even scrolled out of
// view. `section-defer` (content-visibility: auto) now lets the browser skip it
// entirely when off-screen, and it pauses under prefers-reduced-motion.
import Image from 'next/image';
import { H2, Text } from '../../components/atoms/Typography';

import gmpIcon from '../../assets/icons/Gmp-certified-01.svg';
import halalIcon from '../../assets/icons/Halal-01.svg';
import isoIcon from '../../assets/icons/ISO-01.svg';
import qualityIcon from '../../assets/icons/Quantity-01.svg';
import timeTestedIcon from '../../assets/icons/Time-tested.svg';

const certificates = [
  { name: 'GMP Certified', img: gmpIcon },
  { name: 'ISO 9001:2015', img: isoIcon },
  { name: 'Halal Certified', img: halalIcon },
  { name: 'Quality Assured', img: qualityIcon },
  { name: 'Lab-Tested Formulas', img: timeTestedIcon },
];

// Duplicate the list once so the marquee can loop seamlessly at -50%.
const track = [...certificates, ...certificates];

export default function Certificates() {
  return (
    <section className="relative py-20 section-defer">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center mb-12">
        <H2>Expert-Led, Not Guesswork</H2>
        <Text muted className="mt-3 max-w-xl mx-auto">
          Every program at Fitoo is built by qualified practitioners — not influencers repeating
          trends.
        </Text>
      </div>

      <div className="group overflow-hidden">
        <div className="marquee flex w-max gap-12 px-6">
          {track.map((cert, idx) => (
            <div
              key={`${cert.name}-${idx}`}
              className="flex flex-col items-center w-36 shrink-0"
              // The second copy exists only to make the loop seamless, so hide
              // it from assistive tech rather than announcing everything twice.
              aria-hidden={idx >= certificates.length ? 'true' : undefined}
            >
              <div className="relative w-24 h-24 rounded-full overflow-hidden border border-border-light bg-overlay">
                <Image
                  src={cert.img}
                  alt={cert.name}
                  fill
                  sizes="96px"
                  unoptimized
                  className="object-cover"
                />
              </div>
              <span className="mt-4 text-sm text-text-muted text-center leading-snug">
                {cert.name}
              </span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

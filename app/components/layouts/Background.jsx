// Decorative app-wide backdrop. Deliberately NOT a client component and
// deliberately free of framer-motion.
//
// This element is `fixed`, so it stays in the compositor for the entire
// session. It previously animated two `blur-3xl` glows (600px and 300px) on an
// infinite loop, which meant the GPU re-blurred ~400k pixels every frame for as
// long as the tab was open — including while scrolling. That was the single
// largest contributor to mobile scroll jank.
//
// The glows are now static radial gradients. A radial gradient is rasterized
// once and cached; a blurred div is not. Visually they're the same soft falloff
// at a fraction of the cost, and the drift animation was never perceptible
// against a full-page scroll anyway.
export default function Background() {
  return (
    <div className="fixed inset-0 z-0 decor" aria-hidden="true">
      {/* Brand wash — background fading into primary, per design tokens */}
      <div className="absolute inset-0 bg-gradient-brand opacity-20" />

      {/* Centre glow + top-right glow, baked into one paint. */}
      <div
        className="absolute inset-0"
        style={{
          backgroundImage: `
            radial-gradient(
              38% 32% at 50% 50%,
              color-mix(in srgb, var(--primary) 20%, transparent) 0%,
              transparent 100%
            ),
            radial-gradient(
              20% 18% at 88% 22%,
              color-mix(in srgb, var(--primary) 12%, transparent) 0%,
              transparent 100%
            )
          `,
        }}
      />

      {/* Precision grid — hidden on small screens where it's near-invisible
          but still costs a full-viewport tiled paint. */}
      <div className="absolute inset-0 opacity-[0.1] bg-grid-pattern hidden sm:block" />
    </div>
  );
}

// components/atoms/SocialLinks.jsx
// Small overlay of profile links (Facebook/Instagram/LinkedIn) rendered in the
// bottom corner of a coach/team-member image. Plain markup, no hooks — safe
// to drop into server components as well as client ones.

function FacebookIcon({ className }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
      <path
        d="M14 21v-7h2.4l.4-3H14V9.2c0-.9.2-1.5 1.6-1.5H17V5c-.3 0-1.2-.1-2.3-.1-2.3 0-3.8 1.4-3.8 3.9V11H8.5v3H11v7h3z"
        fill="currentColor"
      />
    </svg>
  );
}

function InstagramIcon({ className }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
      <rect x="3" y="3" width="18" height="18" rx="5" stroke="currentColor" strokeWidth="1.5" />
      <circle cx="12" cy="12" r="3.5" stroke="currentColor" strokeWidth="1.5" />
      <circle cx="17.2" cy="6.8" r="1" fill="currentColor" />
    </svg>
  );
}

function LinkedinIcon({ className }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
      <rect x="3" y="3" width="18" height="18" rx="3" stroke="currentColor" strokeWidth="1.5" />
      <path
        d="M7.5 10.5v6M7.5 7.8v.01M11 16.5v-3.6c0-1.2.9-2.1 2-2.1s2 .9 2 2.1v3.6M11 10.5v6"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </svg>
  );
}

const ICONS = { facebook: FacebookIcon, instagram: InstagramIcon, linkedin: LinkedinIcon };
const LABELS = { facebook: 'Facebook', instagram: 'Instagram', linkedin: 'LinkedIn' };
const ORDER = ['facebook', 'instagram', 'linkedin'];

export default function SocialLinks({ links, name, className = '' }) {
  const entries = ORDER.filter((key) => links?.[key]);
  if (entries.length === 0) return null;

  return (
    <div className={`absolute bottom-3 right-3 z-10 flex items-center gap-2 ${className}`}>
      {entries.map((key) => {
        const IconComp = ICONS[key];
        return (
          <a
            key={key}
            href={links[key]}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={`${name}'s ${LABELS[key]} profile`}
            className="flex h-8 w-8 items-center justify-center rounded-full bg-black/35 text-white ring-1 ring-white/25 backdrop-blur-sm transition-colors hover:bg-primary"
          >
            <IconComp className="w-4 h-4" />
          </a>
        );
      })}
    </div>
  );
}

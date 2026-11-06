import Image from 'next/image';
import Link from 'next/link';
import logo from '@assets/logo/fitoo-logo.svg';

export default function Logo({ className = 'h-10 w-auto', href = '/', priority = false }) {
  const image = <Image src={logo} alt="Fitoo" className={className} priority={priority} />;

  if (!href) return image;

  return (
    <Link href={href} aria-label="Fitoo home" className="shrink-0">
      {image}
    </Link>
  );
}

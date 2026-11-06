// Server component.
//
// `children` was always fine here (children pass through a client boundary as
// already-rendered server output), but Background and Footer were being pulled
// into the client tree just because their parent was a client component. Now
// only the pieces that genuinely need the route — the header and footer — sit
// behind a client boundary, and providers are isolated in their own file.
import Footer from '@/components/organisms/Footer';
import WhatsAppCTA from '@/components/organisms/WhatsAppCTA';
import Background from './Background';
import AppProviders from './AppProviders';
import LayoutChrome from './LayoutChrome';

export default function MainLayout({ children }) {
  return (
    <AppProviders>
      <div className="min-h-screen flex flex-col bg-background text-text antialiased relative">
        <Background />
        {/* WhatsAppCTA and Footer are passed in as props so they stay
            server-rendered even though LayoutChrome decides whether to show them. */}
        <LayoutChrome whatsappCta={<WhatsAppCTA />} footer={<Footer />}>
          {children}
        </LayoutChrome>
      </div>
    </AppProviders>
  );
}

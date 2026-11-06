import Icon from '../atoms/Icon';
import Button from '../atoms/Button';
import { Caption, Text } from '../atoms/Typography';
import {
  SUPPLEMENT_WHATSAPP_NUMBER,
  SUPPLEMENT_WHATSAPP_DISPLAY,
  CONSULTATION_WHATSAPP_NUMBER,
  CONSULTATION_WHATSAPP_DISPLAY,
} from '../../utils/siteConfig';

const CONTACTS = [
  {
    key: 'supplement',
    title: 'Supplement Inquiry',
    number: SUPPLEMENT_WHATSAPP_NUMBER,
    display: SUPPLEMENT_WHATSAPP_DISPLAY,
  },
  {
    key: 'consultation',
    title: 'Consultation',
    number: CONSULTATION_WHATSAPP_NUMBER,
    display: CONSULTATION_WHATSAPP_DISPLAY,
  },
];

export default function WhatsAppCTA() {
  return (
    <div className="bg-background border-t border-border-light">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {CONTACTS.map((contact) => (
            <a
              key={contact.key}
              href={`https://wa.me/${contact.number}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-between flex-wrap gap-4 bg-overlay border border-border-light rounded-2xl p-5 sm:p-6 hover:border-primary/40 transition-colors"
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-green-500/10 flex items-center justify-center text-green-400 shrink-0">
                  <Icon name="whatsapp" className="w-6 h-6" />
                </div>
                <div>
                  <Caption className="text-text-muted">{contact.title}</Caption>
                  <Text className="mt-1 font-semibold">{contact.display}</Text>
                </div>
              </div>
              <Button variant="outline" size="md" icon={<Icon name="whatsapp" className="w-4 h-4" />}>
                Chat on WhatsApp
              </Button>
            </a>
          ))}
        </div>
      </div>
    </div>
  );
}

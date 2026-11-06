// Static team section — no state, no client JS.
import Image from 'next/image';
import { H2, Text } from '../../components/atoms/Typography';
import SocialLinks from '../../components/atoms/SocialLinks';

import umerImage from '@assets/images/owner1.webp';
import basitImage from '@assets/images/owner2.webp';

const coaches = [
  {
    id: 'umer-shabbir',
    image: umerImage,
    name: 'Umer Shabbir',
    role: 'Founder | Clinical Dietitian & UK-Certified Fitness Trainer',
    bio: 'Specialist in Diabetes Management, PCOS, and body recomposition. 1,000+ clients transformed over 8 years.',
    social: {
      linkedin: 'https://www.linkedin.com/in/umer-shabbir-66804521b?utm_source=share&utm_campaign=share_via&utm_content=profile&utm_medium=android_app',
      instagram: 'https://www.instagram.com/umers1017?igsh=MmpqZ2tycjVtZzl0',
      facebook: 'https://www.facebook.com/share/1H76fXNLjV/',
    },
  },
  {
    id: 'abdul-basit-khan',
    image: basitImage,
    name: 'Abdul Basit Khan',
    role: 'Certified Fitness Trainer | Former Mr. Lahore, Mr. Punjab & Mr. Pakistan',
    bio: 'Specialist in competition prep and physique conditioning.',
    social: {
      instagram: 'https://www.instagram.com/fitoofitness?igsh=MTVzOXltczE4dnZxMQ==',
      facebook: 'https://www.facebook.com/khanbasit012',
      linkedin: 'https://linkedin.com/comm/mynetwork/discovery-see-all?usecase=PEOPLE_FOLLOWS&followMember=m-basit-khan-a6b971321',
    },
  },
];

export default function MeetYourCoaches() {
  return (
    <section className="relative py-20 section-defer">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12 reveal">
          <H2>Led By Practitioners, Not Marketers</H2>
          <Text muted className="mt-3 max-w-xl mx-auto">
            Fitoo is founded by a UK-certified fitness trainer and clinical dietitian, alongside a
            title-winning bodybuilding coach.
          </Text>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 max-w-3xl mx-auto reveal">
          {coaches.map((coach) => (
            <div
              key={coach.id}
              className="glass border border-border-light rounded-2xl overflow-hidden hover-lift hover-lift-sm hover:border-primary/30"
            >
              <div className="relative w-full aspect-[4/5]">
                <Image
                  src={coach.image}
                  alt={coach.name}
                  fill
                  sizes="(max-width: 640px) 100vw, 380px"
                  placeholder="blur"
                  className="object-cover"
                />
                <SocialLinks links={coach.social} name={coach.name} />
              </div>
              <div className="p-6">
                <h3 className="text-lg font-semibold text-text">{coach.name}</h3>
                <p className="mt-1 text-sm text-primary font-medium">{coach.role}</p>
                <p className="mt-2 text-sm text-text-muted leading-relaxed">{coach.bio}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

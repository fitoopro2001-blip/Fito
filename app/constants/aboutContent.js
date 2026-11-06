// Shared between the About page UI and its schema.org AboutPage markup, so the
// team listed to crawlers can't drift from the team shown on screen.
import owner1 from '@/assets/images/owner1.webp';
import owner2 from '@/assets/images/owner2.webp';

export const TEAM_MEMBERS = [
    {
        name: 'Muhammad Umer',
        title: 'Co-Founder & Head Coach & Lead Nutritionist',
        image: owner1,
        credentials: ['CISSN Certified', '10+ Yrs Coaching'],
        social: {
            linkedin: 'https://www.linkedin.com/in/umer-shabbir-66804521b?utm_source=share&utm_campaign=share_via&utm_content=profile&utm_medium=android_app',
            instagram: 'https://www.instagram.com/umers1017?igsh=MmpqZ2tycjVtZzl0',
            facebook: 'https://www.facebook.com/share/1H76fXNLjV/',
        },
    },
    {
        name: 'Abdul Basit',
        title: 'Co-Founder & Operations',
        image: owner2,
        credentials: ['MBA', 'Supply Chain'],
        social: {
            instagram: 'https://www.instagram.com/fitoofitness?igsh=MTVzOXltczE4dnZxMQ==',
            facebook: 'https://www.facebook.com/khanbasit012',
            linkedin: 'https://linkedin.com/comm/mynetwork/discovery-see-all?usecase=PEOPLE_FOLLOWS&followMember=m-basit-khan-a6b971321',
        },
    },
];

export const ABOUT_STATS = [
    { value: '10,000+', label: 'Clients Coached' },
    { value: '50,000+', label: 'Orders Fulfilled' },
    { value: '4.9/5', label: 'Avg. Rating' },
];

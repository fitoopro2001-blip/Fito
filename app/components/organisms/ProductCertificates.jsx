'use client';

import { useRef } from 'react';
import Image from 'next/image';
import { H2 } from '../atoms/Typography';

import certificate01 from '../../assets/images/Certificates-01.jpg.jpeg';
import certificate02 from '../../assets/images/Certificates-02.jpg.jpeg';
import certificate03 from '../../assets/images/Certificates-03.jpg.jpeg';
import certificate04 from '../../assets/images/Certificates-04.jpg.jpeg';
import certificate05 from '../../assets/images/Certificates-05.jpg.jpeg';

const certificates = [
    certificate01,
    certificate02,
    certificate03,
    certificate04,
    certificate05,
];

export default function ProductCertificates() {
    const sliderRef = useRef(null);

    const slide = (direction) => {
        const slider = sliderRef.current;
        if (!slider) return;

        const card = slider.querySelector('[data-certificate-card]');
        const gap = Number.parseFloat(window.getComputedStyle(slider).columnGap) || 0;
        slider.scrollBy({
            left: direction * ((card?.getBoundingClientRect().width || slider.clientWidth) + gap),
            behavior: 'smooth',
        });
    };

    return (
        <section className="mt-16" aria-label="Our Certifications">
            <H2 className="text-center text-primary text-3xl sm:text-4xl mb-10">
                Our Certifications
            </H2>

            <div className="relative px-10 sm:px-12">
                <div
                    ref={sliderRef}
                    className="flex gap-6 overflow-x-auto scroll-smooth snap-x snap-mandatory"
                    aria-label="Product certifications"
                >
                    {certificates.map((certificate, index) => (
                        <div
                            key={certificate.src}
                            data-certificate-card
                            className="relative aspect-[3/4] w-[80%] shrink-0 snap-start overflow-hidden bg-white sm:w-[42%] lg:flex-1"
                        >
                            <Image
                                src={certificate}
                                alt={`Fitoo certification ${index + 1}`}
                                fill
                                sizes="(max-width: 640px) 80vw, (max-width: 1024px) 42vw, 20vw"
                                className="object-cover"
                            />
                        </div>
                    ))}
                </div>

                <button
                    type="button"
                    onClick={() => slide(-1)}
                    aria-label="Show previous certifications"
                    className="absolute left-0 top-1/2 -translate-y-1/2 bg-black/80 px-3 py-3 text-2xl leading-none text-white transition-colors hover:bg-primary"
                >
                    <span aria-hidden="true">‹</span>
                </button>
                <button
                    type="button"
                    onClick={() => slide(1)}
                    aria-label="Show next certifications"
                    className="absolute right-0 top-1/2 -translate-y-1/2 bg-black/80 px-3 py-3 text-2xl leading-none text-white transition-colors hover:bg-primary"
                >
                    <span aria-hidden="true">›</span>
                </button>
            </div>
        </section>
    );
}

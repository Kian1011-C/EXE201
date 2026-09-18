import React from 'react';

const CARRIERS = [
  { key: 'bcbs',    icon: 'verified',           name: 'BlueCross BlueShield' },
  { key: 'uhc',     icon: 'health_and_safety',  name: 'UnitedHealthcare' },
  { key: 'aetna',   icon: 'shield',             name: 'Aetna / CVS Health' },
  { key: 'humana',  icon: 'volunteer_activism',  name: 'Humana Medicare' },
  { key: 'cigna',   icon: 'favorite',           name: 'Cigna Healthcare' },
  { key: 'omaha',   icon: 'vital_signs',        name: 'Mutual of Omaha' },
  { key: 'ameritas',icon: 'security',           name: 'Ameritas Life' },
  { key: 'wellcare',icon: 'medical_information', name: 'Wellcare Medicare' },
];

export default function CarrierLogosStrip() {
  return (
    <section className="bg-surface-container-lowest py-8 border-b border-stroke-subtle overflow-hidden" id="carrier-network">
      <div className="max-w-7xl mx-auto px-4 lg:px-8 mb-4 text-center">
        <p className="text-xs uppercase tracking-widest font-bold text-outline">
          Access To Top-Rated Health &amp; Life Carriers Through Independent Licensed Agents
        </p>
      </div>

      {/* Marquee with edge fade masks */}
      <div className="relative w-full overflow-hidden [mask-image:linear-gradient(to_right,transparent,black_15%,black_85%,transparent)]">
        <div className="animate-marquee flex items-center space-x-12 sm:space-x-16 py-2">
          {/* Group 1 */}
          <div className="flex items-center space-x-12 sm:space-x-16 text-on-surface-variant font-semibold text-sm tracking-wide shrink-0">
            {CARRIERS.map((c) => (
              <span key={`g1-${c.key}`} className="flex items-center gap-2 opacity-75 hover:opacity-100 transition-opacity cursor-default whitespace-nowrap">
                <span className="material-symbols-outlined text-primary text-[20px]">{c.icon}</span>
                {c.name}
              </span>
            ))}
          </div>
          {/* Group 2 — duplicate for seamless loop */}
          <div aria-hidden="true" className="flex items-center space-x-12 sm:space-x-16 text-on-surface-variant font-semibold text-sm tracking-wide shrink-0">
            {CARRIERS.map((c) => (
              <span key={`g2-${c.key}`} className="flex items-center gap-2 opacity-75 hover:opacity-100 transition-opacity cursor-default whitespace-nowrap">
                <span className="material-symbols-outlined text-primary text-[20px]">{c.icon}</span>
                {c.name}
              </span>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

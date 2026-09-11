import React from 'react';

export function UhcLogo({ className = "h-8" }) {
  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <svg viewBox="0 0 40 40" className="h-full w-auto" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect width="40" height="40" rx="6" fill="#002677" />
        <path d="M11 12H16V22C16 24.2 17.8 26 20 26C22.2 26 24 24.2 24 22V12H29V22C29 27 25 31 20 31C15 31 11 27 11 22V12Z" fill="#00A3E0" />
        <path d="M16 12H24V16H16V12Z" fill="#FFFFFF" />
      </svg>
      <div className="flex flex-col text-left leading-none">
        <span className="font-extrabold text-sm tracking-tight text-[#002677]">UnitedHealthcare</span>
        <span className="text-[9px] font-semibold text-gray-500 uppercase tracking-wider">Authorized Agency</span>
      </div>
    </div>
  );
}

export function BcbsLogo({ className = "h-8" }) {
  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <svg viewBox="0 0 40 40" className="h-full w-auto" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect width="40" height="40" rx="6" fill="#005A9C" />
        <path d="M9 11L20 7L31 11V20C31 26.5 26 32 20 34C14 32 9 26.5 9 20V11Z" fill="#0079C1" stroke="#FFFFFF" strokeWidth="1.5" />
        <path d="M18 13H22V17H26V21H22V25H18V21H14V17H18V13Z" fill="#FFFFFF" />
      </svg>
      <div className="flex flex-col text-left leading-none">
        <span className="font-extrabold text-sm tracking-tight text-[#005A9C]">BlueCross BlueShield</span>
        <span className="text-[9px] font-semibold text-gray-500 uppercase tracking-wider">of Texas</span>
      </div>
    </div>
  );
}

export function AetnaLogo({ className = "h-8" }) {
  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <svg viewBox="0 0 40 40" className="h-full w-auto" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect width="40" height="40" rx="6" fill="#7D226A" />
        <text x="20" y="27" textAnchor="middle" fill="#FFFFFF" fontSize="20" fontWeight="900" fontFamily="sans-serif">æ</text>
      </svg>
      <div className="flex flex-col text-left leading-none">
        <span className="font-extrabold text-sm tracking-tight text-[#7D226A]">aetna</span>
        <span className="text-[9px] font-semibold text-gray-500 uppercase tracking-wider">A CVS Health Co.</span>
      </div>
    </div>
  );
}

export function HumanaLogo({ className = "h-8" }) {
  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <svg viewBox="0 0 40 40" className="h-full w-auto" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect width="40" height="40" rx="6" fill="#4B7A2B" />
        <path d="M13 11V29M27 11V29M13 20H27" stroke="#78BE20" strokeWidth="4" strokeLinecap="round" />
      </svg>
      <div className="flex flex-col text-left leading-none">
        <span className="font-extrabold text-sm tracking-tight text-[#3B6620]">Humana.</span>
        <span className="text-[9px] font-semibold text-gray-500 uppercase tracking-wider">Medicare &amp; Group</span>
      </div>
    </div>
  );
}

export function MutualOfOmahaLogo({ className = "h-8" }) {
  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <svg viewBox="0 0 40 40" className="h-full w-auto" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect width="40" height="40" rx="6" fill="#0B2545" />
        <circle cx="20" cy="20" r="12" fill="#D97706" />
        <path d="M15 16L20 25L25 16" stroke="#0B2545" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
      <div className="flex flex-col text-left leading-none">
        <span className="font-extrabold text-sm tracking-tight text-[#0B2545]">Mutual of Omaha</span>
        <span className="text-[9px] font-semibold text-gray-500 uppercase tracking-wider">Life &amp; Medigap</span>
      </div>
    </div>
  );
}

export function CignaLogo({ className = "h-8" }) {
  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <svg viewBox="0 0 40 40" className="h-full w-auto" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect width="40" height="40" rx="6" fill="#0B5763" />
        <circle cx="20" cy="15" r="5" fill="#F08521" />
        <path d="M12 28C14 22 26 22 28 28" stroke="#F08521" strokeWidth="3.5" strokeLinecap="round" />
      </svg>
      <div className="flex flex-col text-left leading-none">
        <span className="font-extrabold text-sm tracking-tight text-[#0B5763]">Cigna Healthcare</span>
        <span className="text-[9px] font-semibold text-gray-500 uppercase tracking-wider">Global Network</span>
      </div>
    </div>
  );
}

export function AmeritasLogo({ className = "h-8" }) {
  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <svg viewBox="0 0 40 40" className="h-full w-auto" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect width="40" height="40" rx="6" fill="#003A70" />
        <polygon points="20,10 30,20 20,30 10,20" fill="#00A3E0" />
      </svg>
      <div className="flex flex-col text-left leading-none">
        <span className="font-extrabold text-sm tracking-tight text-[#003A70]">Ameritas</span>
        <span className="text-[9px] font-semibold text-gray-500 uppercase tracking-wider">Dental • Vision</span>
      </div>
    </div>
  );
}

export default function CarrierLogosStrip() {
  const carriers = [
    { component: <UhcLogo />, key: 'uhc' },
    { component: <BcbsLogo />, key: 'bcbs' },
    { component: <AetnaLogo />, key: 'aetna' },
    { component: <HumanaLogo />, key: 'humana' },
    { component: <MutualOfOmahaLogo />, key: 'omaha' },
    { component: <CignaLogo />, key: 'cigna' },
    { component: <AmeritasLogo />, key: 'ameritas' },
  ];

  return (
    <div className="w-full bg-white border-y border-gray-200 py-6 overflow-hidden relative">
      <div className="max-w-7xl mx-auto px-4 mb-4 text-center">
        <div className="inline-flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-success-emerald animate-ping"></span>
          <span className="text-xs font-bold uppercase tracking-wider text-gray-500">
            Top Rated Insurance Carriers We Represent &amp; Compare For You
          </span>
        </div>
      </div>

      {/* Marquee Container with edge fade masks */}
      <div className="relative w-full overflow-hidden">
        {/* Left and right fade gradient overlays */}
        <div className="absolute inset-y-0 left-0 w-12 sm:w-24 bg-gradient-to-r from-white via-white/80 to-transparent z-10 pointer-events-none"></div>
        <div className="absolute inset-y-0 right-0 w-12 sm:w-24 bg-gradient-to-l from-white via-white/80 to-transparent z-10 pointer-events-none"></div>

        <div className="animate-marquee flex items-center gap-4 sm:gap-6 py-2">
          {/* First set */}
          {carriers.map((item) => (
            <div
              key={`carrier-1-${item.key}`}
              className="p-3 bg-gray-50/80 rounded-xl border border-gray-200 hover:border-primary/40 hover:bg-white hover:-translate-y-1 hover:shadow-md transition-all duration-300 shrink-0 cursor-default"
            >
              {item.component}
            </div>
          ))}
          {/* Duplicate set for seamless infinite loop */}
          {carriers.map((item) => (
            <div
              key={`carrier-2-${item.key}`}
              className="p-3 bg-gray-50/80 rounded-xl border border-gray-200 hover:border-primary/40 hover:bg-white hover:-translate-y-1 hover:shadow-md transition-all duration-300 shrink-0 cursor-default"
            >
              {item.component}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

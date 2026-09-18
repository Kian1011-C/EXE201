export const services = [
  {
    id: 'medicare',
    title: 'Medicare Solutions',
    shortDesc: 'Comprehensive coverage for seniors 65+ and individuals with qualifying disabilities.',
    icon: 'ShieldCheck',
    slug: '/insurance-services/medicare',
    bannerImg: 'https://images.unsplash.com/photo-1576765608535-5f04d1e3f289?auto=format&fit=crop&w=1200&q=80',
    highlight: 'Annual Enrollment: Oct 15 - Dec 7',
    subtypes: [
      {
        id: 'medicare-c',
        name: 'Medicare Part C (Medicare Advantage)',
        desc: 'All-in-one bundled alternative to Original Medicare offering vision, hearing, dental, and wellness programs alongside hospital & medical coverage.',
        features: ['Vision, Dental & Hearing coverage included', 'Often \$0 monthly plan premium options', 'Prescription drug coverage built-in', 'Maximum out-of-pocket spending limits'],
      },
      {
        id: 'medicare-d',
        name: 'Medicare Part D (Prescription Drugs)',
        desc: 'Stand-alone prescription drug plans helping lower medicine costs and protect against future higher drug expenses.',
        features: ['Covers brand-name and generic medications', 'Copays as low as \$0 on tier 1 drugs', 'Accepted at local & national pharmacy chains', 'Helps avoid late-enrollment penalty fees'],
      },
      {
        id: 'medigap',
        name: 'Medicare Supplement (Medigap)',
        desc: 'Standardized private plans (Plan G, Plan N) covering the out-of-pocket "gaps" in Original Medicare (Part A and Part B deductibles & coinsurance).',
        features: ['Keep any doctor or hospital that accepts Medicare', 'No network restrictions or referrals needed', 'Predictable healthcare costs with minimal out-of-pocket', 'Guaranteed renewable for life'],
      },
    ],
  },
  {
    id: 'health-insurance',
    title: 'Health Insurance (ACA / Obamacare)',
    shortDesc: 'Quality affordable healthcare plans for individuals, families, and self-employed professionals.',
    icon: 'HeartPulse',
    slug: '/insurance-services/health-insurance',
    bannerImg: 'https://images.unsplash.com/photo-1505751172876-fa1923c5c528?auto=format&fit=crop&w=1200&q=80',
    highlight: 'Eligible for Federal Subsidies & Premium Tax Credits',
    subtypes: [
      {
        id: 'aca-family',
        name: 'Individual & Family Health Insurance',
        desc: 'ACA marketplace health insurance plans offering comprehensive essential health benefits, preventive care, pediatric care, and maternity coverage.',
        features: ['Federal subsidies can lower premiums down to \$0/month', 'Free preventive wellness checkups & vaccinations', 'No denial for pre-existing conditions', 'HMO and PPO network selections'],
      },
      {
        id: 'disability',
        name: 'Individual Disability Insurance',
        desc: 'Income protection providing monthly financial support if an unexpected injury or illness prevents you from working.',
        features: ['Protects 60%-70% of your gross income', 'Short-term and long-term disability benefits', 'Tax-free monthly income replacement', 'Peace of mind for mortgage and household expenses'],
      },
      {
        id: 'ltc',
        name: 'Individual Long-Term Care (LTC) Insurance',
        desc: 'Protects retirement assets from the skyrocketing costs of assisted living, nursing facilities, or in-home care assistants.',
        features: ['In-home caregiver & nursing home coverage', 'Relieves caregiving burden from your children', 'Tax-qualified plan advantages', 'Hybrid life + LTC options available'],
      },
    ],
  },
  {
    id: 'life-insurance',
    title: 'Life Insurance & Wealth Protection',
    shortDesc: 'Safeguard your family’s financial future, leave a legacy, and secure retirement accumulation.',
    icon: 'Umbrella',
    slug: '/insurance-services/life-insurance',
    bannerImg: 'https://images.unsplash.com/photo-1511895426328-dc8714191300?auto=format&fit=crop&w=1200&q=80',
    highlight: 'Living Benefits & Cash Value Accumulation',
    subtypes: [
      {
        id: 'individual-life',
        name: 'Term Life & Whole Life (IUL)',
        desc: 'Term life provides maximum financial protection during your working years, while Indexed Universal Life (IUL) builds tax-free retirement wealth.',
        features: ['High coverage amounts at affordable monthly rates', 'Living benefits for critical, chronic, and terminal illness', 'Cash value growth tied to market index with 0% floor protection', 'Tax-free death benefit paid to loved ones'],
      },
      {
        id: 'final-expense',
        name: 'Final Expense / Burial Insurance',
        desc: 'Affordable whole life coverage designed specifically to pay for funeral expenses, burial costs, and outstanding medical bills.',
        features: ['No medical exam required in most cases', 'Guaranteed acceptance options available', 'Premiums never increase with age', 'Coverage lasts your entire lifetime'],
      },
      {
        id: 'fixed-annuities',
        name: 'Fixed Index Annuities',
        desc: 'Guaranteed principal growth and lifetime retirement income streams that protect you from outliving your savings.',
        features: ['Guaranteed lifetime income you cannot outlive', '100% principal protection against stock market crashes', 'Tax-deferred earnings compounding', 'Rollover options from 401(k) / Traditional IRA'],
      },
      {
        id: 'mortgage-protection',
        name: 'Mortgage Protection Insurance',
        desc: 'Custom life policy designed to pay off your home mortgage balance in the event of premature death or disability.',
        features: ['Ensures family remains in the home stress-free', 'Matches your mortgage balance and amortization schedule', 'Living benefits if diagnosed with disability or stroke', 'Return of premium options available'],
      },
    ],
  },
  {
    id: 'group-benefits',
    title: 'Group Benefits',
    shortDesc: 'Comprehensive employer group health, life, dental, and disability packages tailored for small businesses.',
    icon: 'Building2',
    slug: '/insurance-services/group-benefits',
    bannerImg: 'https://images.unsplash.com/photo-1556761175-5973dc0f32e7?auto=format&fit=crop&w=1200&q=80',
    highlight: 'Tax-Advantaged Small Business Coverage',
    subtypes: [
      {
        id: 'group-health',
        name: 'Small Business Group Health',
        desc: 'Custom medical plans for 2 to 50+ employees with tax incentives and competitive deductibles.',
        features: ['Major carrier networks (BCBS, UHC, Aetna)', 'Pre-tax premium deductions for employers', 'Flexible HMO & PPO deductible tiers', 'Attract & retain top tier talent'],
      },
      {
        id: 'group-life',
        name: 'Group Life & AD&D',
        desc: 'Provide financial security for your employees and their families with low-cost group term life insurance.',
        features: ['Guaranteed issue coverage with no medical exams', 'Accidental Death & Dismemberment benefits', 'Voluntary supplemental coverage options', 'Simple payroll deduction integration'],
      },
      {
        id: 'group-dental-vision',
        name: 'Group Dental, Vision & Hearing',
        desc: 'Comprehensive supplemental care keeping your workforce healthy and productive year-round.',
        features: ['Nationwide networks including Ameritas & MetLife', 'Preventive dental cleaning covered 100%', 'Annual eye exams & hardware allowance', 'Flexible employer or voluntary contribution'],
      },
    ],
  },
];

export const targetProfiles = [
  {
    title: 'Single Adults',
    desc: 'Affordable ACA health plans with zero-dollar preventive care, plus low-cost term life to protect loans and build strong savings early.',
    icon: 'User',
    recommended: ['Health Insurance (ACA)', 'Individual Term Life', 'Disability Insurance'],
  },
  {
    title: 'Married Couples with Children',
    desc: 'Comprehensive family health networks, college education savings via IUL, and mortgage protection so your kids never lose their home.',
    icon: 'Users',
    recommended: ['Family ACA Plan', 'Mortgage Protection', 'Indexed Universal Life (IUL)'],
  },
  {
    title: 'Empty Nesters & Seniors (65+)',
    desc: 'Maximize your Medicare healthcare benefits, zero-gap hospital protection (Medigap), and guaranteed lifetime annuities.',
    icon: 'HeartHandshake',
    recommended: ['Medicare Advantage / Part D', 'Medigap Plan G/N', 'Fixed Index Annuities'],
  },
  {
    title: 'Independent Agents & Agencies',
    desc: 'Join our verified agent partner network, access high-intent prospective client matches in your licensed states, and grow your practice.',
    icon: 'Briefcase',
    recommended: ['Agent Partner Network', 'Verified Lead Matches', 'State Licensing Support'],
  },
];

export const reviews = [
  {
    author: 'Linda N.',
    location: 'Houston, TX',
    rating: 5,
    source: 'Google Review',
    text: 'InsurMatch connected my parents with a patient, bilingual licensed agent who explained Medicare Part C and Part D clearly in Vietnamese and English. It made a complicated decision simple and reassuring!',
  },
  {
    author: 'David H. Nguyen',
    location: 'Katy, TX',
    rating: 5,
    source: 'Yelp Review',
    text: 'I needed an ACA health plan for my family after becoming self-employed. InsurMatch paired me with an agent who verified our doctor network and helped us qualify for substantial federal subsidies. Fast, professional match!',
  },
  {
    author: 'Sarah Jenkins',
    location: 'Dallas / Garland, TX',
    rating: 5,
    source: 'Google Review',
    text: 'Great platform! I was matched with an independent agent who took the time to show me the real differences between term life and an IUL. Zero high-pressure sales.',
  },
  {
    author: 'Michael Tran',
    location: 'Sugar Land, TX',
    rating: 5,
    source: 'Facebook Review',
    text: 'Joining the InsurMatch Agent Partner Network has been fantastic for my practice. I receive high-intent prospective clients in Texas who genuinely need Vietnamese-speaking guidance.',
  },
];

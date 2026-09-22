# INSURMATCH — COMPREHENSIVE UI/UX DESIGN SYSTEM & INTERFACE SPECIFICATION

> **Platform:** InsurMatch (Digital Lead Generation & Insurance Agent Matchmaking Platform)  
> **Target Audience:** Vietnamese-American individuals, families, seniors, and small business owners in the United States  
> **Tech Stack:** React 19, Tailwind CSS v4, Motion (Framer Motion), Lucide React & Google Material Symbols Outlined  
> **Design Philosophy:** Premium Editorial, Cultural Empathy, High-Trust Hierarchy (Ivory, Deep Navy, Champagne Gold)  
> **Document Status:** Complete UI Blueprint & Implementation Reference

---

## TABLE OF CONTENTS
1. [Product Identity & UX Value Journey](#1-product-identity--ux-value-journey)
2. [Design Tokens & Foundational System](#2-design-tokens--foundational-system)
   - [2.1 Color Palette & Semantic Tokens](#21-color-palette--semantic-tokens)
   - [2.2 Typography Hierarchy](#22-typography-hierarchy)
   - [2.3 Elevation, Shadows & Borders](#23-elevation-shadows--borders)
   - [2.4 Grid, Spacing & Layout Principles](#24-grid-spacing--layout-principles)
   - [2.5 Iconography & Asset Conventions](#25-iconography--asset-conventions)
   - [2.6 Animation & Transition Tokens](#26-animation--transition-tokens)
3. [Global Components & Navigation Framework](#3-global-components--navigation-framework)
   - [3.1 Top Announcement Bar](#31-top-announcement-bar)
   - [3.2 Main Sticky Header (`Navbar.jsx`)](#32-main-sticky-header-navbarjsx)
   - [3.3 Mobile Bottom Quick-Action Bar (`MobileBottomBar.jsx`)](#33-mobile-bottom-quick-action-bar-mobilebottombarjsx)
   - [3.4 Carrier Partner Network Strip (`CarrierLogos.jsx`)](#34-carrier-partner-network-strip-carrierlogosjsx)
   - [3.5 Interactive Matchmaking Modal (`QuoteModal.jsx`)](#35-interactive-matchmaking-modal-quotemodaljsx)
   - [3.6 Cookie & Privacy Consent Banner (`CookieBanner.jsx`)](#36-cookie--privacy-consent-banner-cookiebannerjsx)
   - [3.7 Global Editorial Footer (`Footer.jsx`)](#37-global-editorial-footer-footerjsx)
4. [Public Pages Architecture & Section Breakdowns](#4-public-pages-architecture--section-breakdowns)
   - [4.1 Home Page (`HomePage.jsx`)](#41-home-page-homepagejsx)
   - [4.2 About Us Page (`AboutPage.jsx`)](#42-about-us-page-aboutpagejsx)
   - [4.3 Insurance Services Portfolio (`ServicesPage.jsx`)](#43-insurance-services-portfolio-servicespagejsx)
   - [4.4 Medicare Guidance & Matching (`MedicarePage.jsx`)](#44-medicare-guidance--matching-medicarepagejsx)
   - [4.5 ACA Healthcare & Subsidies (`HealthPage.jsx`)](#45-aca-healthcare--subsidies-healthpagejsx)
   - [4.6 Life Insurance & Wealth Preservation (`LifePage.jsx`)](#46-life-insurance--wealth-preservation-lifepagejsx)
   - [4.7 Regional Coverage & Agent Hubs (`LocationsPage.jsx`)](#47-regional-coverage--agent-hubs-locationspagejsx)
   - [4.8 Agent Partner Network & Careers (`CareersPage.jsx`)](#48-agent-partner-network--careers-careerspagejsx)
   - [4.9 Contact & Support Center (`ContactPage.jsx`)](#49-contact--support-center-contactpagejsx)
   - [4.10 Dedicated 4-Step Match Intake Flow (`QuotePage.jsx`)](#410-dedicated-4-step-match-intake-flow-quotepagejsx)
5. [Authentication & Role-Based Portals (Staff Canonical Standard)](#5-authentication--role-based-portals-staff-canonical-standard)
   - [5.1 Portal Sign-In (`LoginPage.jsx`)](#51-portal-sign-in-loginpagejsx)
   - [5.2 Canonical Enterprise Portal Shell (`StaffCrmLayout.jsx` Standard)](#52-canonical-enterprise-portal-shell-staffcrmlayoutjsx-standard)
   - [5.3 Platform Staff Portal — Master Template (`StaffDashboard.jsx`)](#53-platform-staff-portal--master-template-staffdashboardjsx)
   - [5.4 Licensed Agent Portal — 5-Step AgentFlow (`AgentDashboard.jsx`)](#54-licensed-agent-portal--5-step-agentflow-agentdashboardjsx)
   - [5.5 System Administrator Portal — Platform Operations (`AdminDashboard.jsx`)](#55-system-administrator-portal--platform-operations-admindashboardjsx)
   - [5.6 Cross-Actor UI Consistency & Inheritance Matrix](#56-cross-actor-ui-consistency--inheritance-matrix)
6. [Data Structures & Mock Models](#6-data-structures--mock-models)
7. [Regulatory Compliance & Legal Disclaimers](#7-regulatory-compliance--legal-disclaimers)
8. [Responsive Behavior & Accessibility Matrix](#8-responsive-behavior--accessibility-matrix)

---

## 1. PRODUCT IDENTITY & UX VALUE JOURNEY

### 1.1 Core Mission & Identity
**InsurMatch** is a digital lead generation and intelligent insurance agent matchmaking platform. It is **NOT** an insurance agency, brokerage, or carrier. It does not underwrite policies, collect insurance premiums, or act as an insurance carrier.

Its dedicated purpose is to solve the complex barrier Vietnamese-Americans experience when navigating the American insurance system (Medicare, ACA health plans, life insurance, and annuities) by pairing them directly with **verified, independent licensed agents** who speak Vietnamese and English.

```
+---------------------------------------------------------------------------------------+
|                                INSURMATCH UX JOURNEY                                  |
+---------------------------------------------------------------------------------------+
|  1. CONSUMER INTAKE          2. VALIDATION & RULES           3. VERIFIED AGENT        |
|  Vietnamese consumer in US  --> Rule-based validation   --> Matched with licensed    |
|  submits coverage need,        of state license, zip,         independent agent       |
|  zip code, language & income   specialty & language           in consumer's state     |
|                                                                                       |
|  4. PERSONALIZED GUIDANCE    5. ZERO SALES PRESSURE          6. ENROLLMENT FREEDOM    |
|  Agent reviews options,     --> Consumer reviews at      --> Consumer selects best    |
|  doctors, prescription gaps    own pace with zero spam        plan with direct agent  |
+---------------------------------------------------------------------------------------+
```

### 1.2 UX Value Pillars
1. **Language & Cultural Affinity:** Bilingual Vietnamese-English guidance eliminating fear of misunderstanding policy clauses.
2. **Strict Verification:** Every agent partner's National Producer Number (NPN) and state license (e.g., Texas TDI, California CDI) are verified.
3. **Zero Spam Guarantee:** Requests are matched with one dedicated licensed agent; user details are never sold to high-volume telemarketing call centers.
4. **100% Free for Consumers:** Matching services are completely free for applicants with zero hidden fees.

---

## 2. DESIGN TOKENS & FOUNDATIONAL SYSTEM

### 2.1 Color Palette & Semantic Tokens
The color palette uses a high-end **Warm Ivory, Deep Navy, and Champagne Gold** palette. This moves away from generic corporate blue/white templates toward a distinguished, editorial atmosphere that communicates permanence and trust.

#### CSS Variables Defined in `@theme` (`src/index.css`):

| Token Name | CSS Variable | Hex Code | Visual Swatch | Semantic Purpose & Usage |
|:---|:---|:---|:---|:---|
| **Deep Navy (Primary)** | `--color-navy-deep` / `--color-primary` | `#0B172A` | `rgb(11, 23, 42)` | Main headers, hero text, primary CTA buttons, footer background |
| **Midnight Navy** | `--color-navy-midnight` / `--color-primary-container` | `#14243A` | `rgb(20, 36, 58)` | Active button hovers, dark cards, secondary hero accents |
| **Warm Ivory (Surface)** | `--color-ivory` / `--color-surface` | `#F7F5EF` | `rgb(247, 245, 239)` | Main page background, modal bodies, navigation background |
| **Sand (Dim Surface)** | `--color-sand` / `--color-surface-dim` | `#ECE8DE` | `rgb(236, 232, 222)` | Subtle section backgrounds, card containers, divider accents |
| **Champagne Gold** | `--color-champagne` / `--color-warning-amber` | `#C8A96B` | `rgb(200, 169, 107)` | Brand accent, eyebrow bullets, directional arrows, highlight cards |
| **Champagne Light** | `--color-champagne-light` | `#DFCAA0` | `rgb(223, 202, 160)` | Button hover states, glowing highlights |
| **Charcoal (On-Surface)** | `--color-charcoal` / `--color-on-surface` | `#17202A` | `rgb(23, 32, 42)` | Primary readable body text, high contrast typography |
| **Muted Slate** | `--color-slate-muted` / `--color-surface-variant` | `#6E7D91` | `rgb(110, 125, 145)` | Secondary labels, eyebrow kickers, captions, unselected states |
| **Subtle Stroke** | `--color-stroke-subtle` / `--color-outline-variant` | `#DED8C9` | `rgb(222, 216, 201)` | Card borders, table dividers, input borders |
| **Emerald Success** | `--color-success-emerald` | `#10B981` | `rgb(16, 185, 129)` | Verified status badges, completed checkmarks, trust markers |
| **Ice Cyan** | `--color-cyan-ice` | `#E8E3D5` | `rgb(232, 227, 213)` | Tinted pill backgrounds, soft decorative badges |

---

### 2.2 Typography Hierarchy

InsurMatch combines **Lora** (a literary serif that brings warmth and authority) with **Plus Jakarta Sans** (a clean, modern geometric sans-serif for UI components).

```css
body {
  font-family: 'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
}
.font-serif {
  font-family: "Lora", Georgia, serif;
}
```

#### Typographic Scale:
1. **Display / Hero Headline:**
   - Size: `text-4xl sm:text-5xl lg:text-6xl` (36px to 60px)
   - Weight: `font-extrabold` (800)
   - Leading: `leading-[1.08]` to `leading-tight`
   - Characteristic: Dual-texture styling (e.g., Bold Navy sans paired with italic serif accent: `Find the right insurance agent <span className="font-serif italic font-normal text-navy-midnight">for your needs.</span>`)
2. **Section Headings (H2):**
   - Size: `text-3xl sm:text-4xl lg:text-5xl` (30px to 48px)
   - Weight: `font-extrabold` (800)
   - Tracking: `tracking-tight` (-0.025em)
3. **Card & Subtitle Headings (H3):**
   - Size: `text-xl sm:text-2xl` (20px to 24px)
   - Weight: `font-bold` (700)
4. **Eyebrow / Kicker Text:**
   - Size: `text-[10px]` to `text-[11px]` (10px - 11px)
   - Weight: `font-bold` (700) or `font-semibold` (600)
   - Letter Spacing: `tracking-widest` (0.1em)
   - Transformation: `uppercase`
   - Accents: Preceded by a `1.5 x 1.5` rounded champagne dot (`bg-champagne`)
5. **Body Copy:**
   - Size: `text-sm sm:text-base` (14px to 16px)
   - Color: `text-charcoal/75` or `text-charcoal/80`
   - Line-height: `leading-relaxed` (1.625)
6. **Captions & Disclaimers:**
   - Size: `text-xs` to `text-[11px]` (11px - 12px)
   - Color: `text-charcoal/60` (light backgrounds) or `text-ivory/50` (dark navy backgrounds)

---

### 2.3 Elevation, Shadows & Borders

- **Border Aesthetics:** Low-contrast architectural lines using `border border-stroke-subtle` (`#DED8C9`) on light surfaces, or `border border-white/10` on dark navy backgrounds.
- **Card Radius Hierarchy:**
  - Standard buttons & inputs: `rounded-lg` (8px)
  - Interactive feature cards & sub-cards: `rounded-xl` (12px)
  - Major sections, modals & hero image frames: `rounded-2xl` (16px)
  - Prominent story containers & dashboard panels: `rounded-3xl` (24px)
  - Pill badges & avatar tags: `rounded-full`
- **Box Shadows:** Soft, understated elevation without aggressive drop shadows:
  - Default: `shadow-xs` / `shadow-sm`
  - Floating Overlays & Modals: `shadow-2xl` with backdrop blur (`backdrop-blur-md bg-navy-deep/75`)

---

### 2.4 Grid, Spacing & Layout Principles

- **Maximum Container Widths:**
  - Main Website Width: `max-w-7xl` (1280px) with `px-4 lg:px-8` horizontal gutters
  - Reading / Editorial Width: `max-w-6xl` (1152px)
  - Intake Forms / Detail Sections: `max-w-3xl` (768px)
  - Auth Cards & Popovers: `max-w-md` (448px)
- **Asymmetric Editorial 12-Column Grids:**
  - Hero & Major Features: Split `lg:grid-cols-12` (7 columns for copy & CTA, 5 columns for imagery or diagram)
  - Inverted Service Blocks: 6-column / 6-column alternating text-left vs text-right layout
- **Section Spacing:** Generous breathing room using `py-20 lg:py-32` per major section.

---

### 2.5 Iconography & Asset Conventions

1. **Google Material Symbols Outlined (`material-symbols-outlined`):**
   - Font loaded from Google Fonts CDN
   - Used for UI directional cues (`arrow_forward`, `lock`, `menu`, `close`, `dashboard`, `request_quote`, `verified`)
2. **Lucide React Icons:**
   - Clean vector icons (`Shield`, `ShieldCheck`, `CheckCircle2`, `HeartPulse`, `Umbrella`, `Clock`, `ArrowRight`, `MapPin`, `Mail`, `Send`)
3. **Imagery Standards:**
   - Real, authentic photography representing multigenerational Vietnamese families, seniors in consultation, and professional independent advisors
   - Soft gradient overlays (`bg-gradient-to-t from-navy-deep/60 via-transparent to-transparent`) applied to imagery for text contrast and depth

---

### 2.6 Animation & Transition Tokens

```css
/* Infinite Carrier Marquee */
@keyframes marquee {
  0% { transform: translateX(0%); }
  100% { transform: translateX(-50%); }
}

/* Floating Elements */
@keyframes float {
  0%, 100% { transform: translateY(0px); }
  50% { transform: translateY(-5px); }
}

/* Atmospheric Glow */
@keyframes pulseGlow {
  0%, 100% { opacity: 0.35; transform: scale(1); }
  50% { opacity: 0.7; transform: scale(1.08); }
}
```

---

## 3. GLOBAL COMPONENTS & NAVIGATION FRAMEWORK

### 3.1 Top Announcement Bar
- **File:** Embedded at top of `src/components/Navbar.jsx`
- **Visibility:** Visible on desktop & tablet (`hidden md:block`)
- **Structure:**
  - **Left Section:**
    - Eyebrow badge: `LICENSED AGENT MATCHING PLATFORM` (`text-champagne font-semibold tracking-widest text-[10px]`)
    - Vertical divider: `|`
    - Sub-label: `Connecting Vietnamese Consumers With Verified Agents` (`text-ivory/80 text-[11px]`)
  - **Right Section:**
    - Support Email Link: `Support: support@insurmatch.us` (mailto link with hover transition)
    - Vertical divider: `|`
    - Portal Link: `Agent & Staff Portal` (deep link to `/login`)

---

### 3.2 Main Sticky Header (`Navbar.jsx`)
- **File:** `src/components/Navbar.jsx`
- **Behavior:** `sticky top-0 z-40`, transitions on scroll (`window.scrollY > 20` switches from solid `bg-ivory` to `bg-ivory/95 backdrop-blur-md shadow-xs py-3.5`).
- **Components:**
  1. **Brand Lockup (Left):**
     - Logo: `/images/insurmatch-logo.png` (`h-9 w-9 rounded-lg`)
     - Wordmark: `INSUR` (`font-black text-navy-deep`) + `MATCH` (`text-slate-muted font-normal`)
     - Subtitle: `Digital Lead & Agent Matching Platform` (`text-[10px] uppercase tracking-widest text-slate-muted font-medium`)
  2. **Navigation Links (Center, Desktop):**
     - `Insurance Types` (`/insurance-services`)
     - `How It Works` (anchor `#how-it-works`)
     - `Get Matched` (`/get-quote`)
     - `About Us` (`/about`)
     - `Contact Support` (`/contact`)
     - Active link state: `border-b-2 border-navy-deep font-semibold text-navy-deep`
  3. **Action Cluster (Right):**
     - `Sign In` text link (`/login`)
     - `Get Matched` primary button (`bg-navy-deep text-ivory hover:bg-navy-midnight px-5 py-2.5 rounded-lg text-xs font-semibold uppercase tracking-wide`) with champagne arrow icon (`arrow_forward`)
     - Mobile menu hamburger toggle button (`lg:hidden`)
  4. **Mobile Drawer (`AnimatePresence`):**
     - Slide-down menu on small screens
     - Includes all navigation links, portal lockup link (`Agent & Staff Portal`), and full-width `Get Matched` button

---

### 3.3 Mobile Bottom Quick-Action Bar (`MobileBottomBar.jsx`)
- **File:** `src/components/MobileBottomBar.jsx`
- **Behavior:** `sm:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-gray-200 px-3 py-2.5` with safe-area bottom inset support.
- **Controls:**
  - Left Button: `How It Works` (`href="#how-it-works"` with emerald dot + verified badge)
  - Right Button: `Get Matched` (`bg-navy-deep text-ivory` triggering the `onOpenQuote` modal)

---

### 3.4 Carrier Partner Network Strip (`CarrierLogos.jsx`)
- **File:** `src/components/CarrierLogos.jsx`
- **Behavior:** Continuous horizontal scrolling marquee (`animate-marquee`) with edge transparency gradient masks `[mask-image:linear-gradient(to_right,transparent,black_15%,black_85%,transparent)]`.
- **Integrated Carriers Displayed:**
  1. BlueCross BlueShield
  2. UnitedHealthcare
  3. Aetna / CVS Health
  4. Humana Medicare
  5. Cigna Healthcare
  6. Mutual of Omaha
  7. Ameritas Life
  8. Wellcare Medicare
- **Sub-label:** `ACCESS TO TOP-RATED HEALTH & LIFE CARRIERS THROUGH INDEPENDENT LICENSED AGENTS`

---

### 3.5 Interactive Matchmaking Modal (`QuoteModal.jsx`)
- **File:** `src/components/QuoteModal.jsx`
- **Trigger:** Clicked from any `Get Matched` button across Navbar, Hero, and Service pages.
- **Modal Framework:**
  - Centered overlay with dark navy blur (`bg-navy-deep/75 backdrop-blur-sm`).
  - Container: `max-w-xl bg-ivory rounded-2xl border border-stroke-subtle shadow-2xl`.
  - Header: Deep navy strip with champagne kicker `INSURMATCH / REQUEST AN AGENT MATCH`, title `Request an Agent Match`, and close button (`X`).
- **Form Controls:**
  1. **Category Pills (Single Select):**
     - `Health (ACA)`
     - `Medicare (65+)`
     - `Life / Annuity`
  2. **Inputs Grid:**
     - Full Name (`text`)
     - Phone Number (`tel`)
     - Email Address (`email`)
     - State & Zip Code (`text`, max 5 digits)
  3. **Dropdown Selects:**
     - Age Range (`Under 26`, `26-40`, `41-64`, `65+ (Medicare)`)
     - Preferred Language (`English & Tiếng Việt`, `Tiếng Việt`, `English`)
  4. **Submit Button:** Full-width Navy CTA with loading state indicator (`Matching With Licensed Agents...`).
  5. **Trust Reassurance:** Shield icon + text: *"Your information is shared only with your matched licensed agent. Never sold to telemarketers."*
- **Success State:**
  - Green checkmark icon (`CheckCircle2`).
  - Active match notification detailing user's name and zip code.
  - Next Steps checklist (Agent review, phone/email contact protocol, support contact).

---

### 3.6 Cookie & Privacy Consent Banner (`CookieBanner.jsx`)
- **File:** `src/components/CookieBanner.jsx`
- **Behavior:** Floats up after a 1.5-second delayed entrance (`fixed bottom-20 sm:bottom-6 right-4 sm:right-6 sm:max-w-md bg-white/95 backdrop-blur-md rounded-2xl shadow-2xl border border-gray-200/90`).
- **Controls:**
  - Header with `ShieldCheck` icon.
  - Explanation of cookies used for personalized matching and traffic compliance.
  - Primary button: `Accept All` (`bg-primary text-on-primary`).
  - Secondary button: `Essential Only` (`border border-gray-300`).

---

### 3.7 Global Editorial Footer (`Footer.jsx`)
- **File:** `src/components/Footer.jsx`
- **Layout:** Deep Navy background (`bg-navy-deep text-ivory/80 pt-16 pb-12`).
- **Grid Breakdown (12 Columns):**
  - **Brand Column (4 Columns):**
    - Logo + `INSURMATCH` wordmark with champagne accent
    - Italic tagline: *"Connecting consumers with licensed insurance professionals."*
    - Narrative summary of InsurMatch platform identity
    - Direct platform support links (`support@insurmatch.us`, `agents@insurmatch.us`)
  - **Coverage Needs Column (2-3 Columns):** Links to Medicare Guidance, Medicare Advantage (Part C), Medigap Supplements, ACA Marketplace, Life & Living Benefits, Fixed Indexed Annuities.
  - **Company Column (2-3 Columns):** About InsurMatch, How It Works, Leadership Team, Regional Partner Hubs, Agent Network, Contact Support, Agent & Staff Portal link.
  - **Resources Column (2-3 Columns):** Matching Flow, Insurance Guides, FAQ, Regional Coverage.
- **Regulatory Disclaimers Block:**
  - Official non-agency clarification: InsurMatch is a technology platform, not an agency/carrier.
  - CMS Medicare compliance disclaimer.
- **Legal Strip:**
  - Copyright statement: `© 2026 INSURMATCH. All rights reserved. Digital Insurance Lead-Generation & Matchmaking Platform.`
  - Links: Privacy Policy, Terms of Service, Legal & Licensing.

---

## 4. PUBLIC PAGES ARCHITECTURE & SECTION BREAKDOWNS

```
+---------------------------------------------------------------------------------------+
|                                PUBLIC ROUTES ARCHITECTURE                             |
+---------------------------------------------------------------------------------------+
|  /                                     -->  HomePage.jsx                              |
|  /about, /about-us                     -->  AboutPage.jsx                             |
|  /insurance-services                   -->  ServicesPage.jsx                          |
|  /insurance-services/medicare          -->  MedicarePage.jsx                          |
|  /insurance-services/health-insurance  -->  HealthPage.jsx                            |
|  /insurance-services/life-insurance    -->  LifePage.jsx                              |
|  /locations, /locations/:officeId      -->  LocationsPage.jsx                         |
|  /careers                              -->  CareersPage.jsx                           |
|  /contact, /secure-contact-form        -->  ContactPage.jsx                           |
|  /get-quote, /secure-quote-request     -->  QuotePage.jsx                             |
+---------------------------------------------------------------------------------------+
```

---

### 4.1 Home Page (`HomePage.jsx`)

#### Section 1: Hero Section (Editorial Split 7/5)
- **Left Column (7 Cols):**
  - Eyebrow: `INSURMATCH / DIGITAL LEAD & AGENT MATCHING PLATFORM` with champagne indicator dot.
  - Headline: `Find the right` `<br />` `insurance agent` `<span className="font-serif italic font-normal text-navy-midnight">for your needs.</span>`
  - Subhead: Narrative emphasizing Vietnamese customer focus in the US, licensed agent verification, language alignment, and budget matching.
  - CTAs: Primary button `Get Matched` + Secondary button `How It Works`.
  - Signature Bullets: `State-Based Matching • Verified Licensed Agents • Bilingual: Tiếng Việt & English`.
- **Right Column (5 Cols):**
  - High-resolution photograph (`/images/advisor-counselor.jpg`) inside an Ivory/Sand double-border card.
  - Overlaid Navy badge: `YOUR REQUIREMENTS → LICENSED AGENT MATCH`.

#### Section 2: Brand Statement & Philosophy (No Cards, Pure Typography)
- **Headline:** `Insurance can be complicated. Finding the right licensed agent shouldn't be.`
- **3 Conceptual Columns with Thin Top Dividers:**
  1. `01 — LANGUAGE & TRUST`: Guidance in your language (Vietnamese & English).
  2. `02 — VERIFICATION`: Verified with state departments of insurance (TDI, CDI).
  3. `03 — RIGHT-FIT MATCH`: Routed to specialized agents for Medicare, ACA, or Life.

#### Section 3: Carrier Partner Network
- Full-width marquee with carrier logos (`CarrierLogosStrip`).

#### Section 4: How It Works (Timeline with Connecting Line)
- Thin horizontal connecting line across steps on desktop.
- **Three Step Cards (Pure Typography):**
  - `01 — TELL US WHAT YOU NEED`: Category selection, location, budget, language.
  - `02 — VERIFY & MATCH`: Intelligent rule-based engine pairs with qualified licensed agent.
  - `03 — CONNECT & DECIDE`: Agent reaches out with options; zero obligation or sales pressure.

#### Section 5: Insurance Category Spotlights (Differentiated Rhythms)
1. **01 Medicare Specialists:**
   - Text Left (01, headline, description, link `Find A Medicare Agent →`)
   - Image Right (`/images/service-medicare.jpg`)
2. **02 ACA Healthcare (Reversed):**
   - Image Left (`/images/service-aca.jpg`)
   - Text Right (02, headline, subsidy guidance description, link `Find An ACA Agent →`)
3. **03 Life & Asset Protection (Climax Dark Navy Section):**
   - Full-width Deep Navy background (`bg-navy-deep text-ivory`).
   - Text Left (03 in Champagne, headline, Living Benefits & Annuities explanation).
   - Image Right (`/images/service-life.jpg` in midnight card).

#### Section 6: Signature "MATCH" Converging Graphic
- Converging branches visual diagram:
  - Branch 1: `01 / CONSUMER — YOU (State, language & needs)`
  - Branch 2: `02 / NETWORK — AGENTS (Verified state licenses)`
  - Center: SVG converging bezier curves into `RESULT: MATCH (INSURMATCH)` badge.
  - Subline: Explains intelligent matching without telemarketing blasts.

#### Section 7: Human Guidance Spotlight
- Headline: `Technology matches. Licensed agents guide.`
- Image: `/images/team-retreat.jpg`.
- Content: Explains the necessity of cultural empathy and human one-on-one consultation for complex insurance decisions.

#### Section 8: Regional Agent Network & Interactive Texas Map
- **Left Column:** Stylized SVG map outline of Texas with interactive clickable marker pins:
  - Garland Node (North-East TX)
  - Houston Node (South-East TX)
  - Katy Node (Primary Hub, West of Houston)
- **Right Column:** Dynamic detail card displaying selected hub's territory, consultation hours, support email, and coverage map link.

#### Section 9: Closing Call to Action
- Deep Navy card with Champagne primary CTA `Get Matched` + Secondary outline button `Join Agent Network`.
- Trust line: `Free for consumers • Zero spam guarantee • Direct independent licensed agent matching`.

---

### 4.2 About Us Page (`AboutPage.jsx`)
- **Mission Banner:** Deep Navy header framing InsurMatch's purpose as a digital matchmaking platform for Vietnamese communities in the US.
- **The Story & Independent Philosophy:** "Why Having Choices Matters in Insurance" — compares single-carrier monopolies with independent agent choice.
- **4 Core Pillars Grid:**
  1. *Independent Agent Matching* (`ShieldCheck`)
  2. *Intelligent Routing* (`Award`)
  3. *Vietnamese Community First* (`Users`)
  4. *Free & Zero Spam Guarantee* (`Clock`)
- **Founders & Leadership Grid:**
  - Anh Que Pham, CPA (Co-Founder & CFO)
  - Phuc Trinh (CEO)
  - Anh Chau Pham (Co-Founder & Executive Director)
  - Jojo Tram Tran (Co-Founder & Director of Agent Onboarding)
  - Cards include executive photo, role badge, biographical background, and specialty tags.
- **Active State Licensing Footprint:** Grid of active partner states (Texas, California, Florida, Georgia, Illinois, etc.).

---

### 4.3 Insurance Services Portfolio (`ServicesPage.jsx`)
- **Interactive Sticky Filter:** Quick tabs to filter between `All`, `Medicare`, `Health Insurance (ACA)`, and `Life & Wealth Protection`.
- **Category Showcase:** Each service card displays high-intent subtypes with feature checklists (`CheckCircle2`) and individual `Request Match` action triggers.
- **Target Profiles ("Coverage Based On Who You Are"):**
  1. *Single Adults* (ACA plans, entry term life, disability protection)
  2. *Married Couples with Children* (Family health networks, college IUL, mortgage protection)
  3. *Empty Nesters & Seniors 65+* (Medicare Advantage, Medigap Plan G/N, Fixed Annuities)
  4. *Independent Agents & Agencies* (Partner network onboarding)

---

### 4.4 Medicare Guidance & Matching (`MedicarePage.jsx`)
- **Senior Healthcare Theme:** Deep maritime navy banner with Annual Enrollment Period (AEP Oct 15 – Dec 7) urgency notice.
- **3 Plan Subtypes:**
  1. *Medicare Advantage (Part C):* All-in-one HMO/PPO bundling vision, dental, hearing, and prescription drugs.
  2. *Medicare Part D:* Stand-alone prescription drug plans.
  3. *Medicare Supplement (Medigap):* Standardized private plans (Plan G, Plan N) covering 20% coinsurance gaps.
- **Comparison Matrix Table:** Side-by-side comparison of Part C vs. Medigap across Monthly Premium, Doctor Network, Drug Coverage, and Extra Perks.

---

### 4.5 ACA Healthcare & Subsidies (`HealthPage.jsx`)
- **Theme:** Forest emerald gradient communicating health, vitality, and financial relief.
- **Subsidies Notice Banner:** Highlights federal Advance Premium Tax Credits (APTC) that lower premiums down to \$0–\$10/month.
- **Subtypes:** Individual & Family ACA, Disability Income Protection, Long-Term Care (LTC).
- **Enrollment Windows Guide:** Open Enrollment Period (Nov 1 – Jan 15) vs. Special Enrollment Period (SEP 60-day qualifying life events).

---

### 4.6 Life Insurance & Wealth Preservation (`LifePage.jsx`)
- **Theme:** Warm bronze/gold palette representing stability, inheritance, and asset protection.
- **Subtypes:** Term Life & Indexed Universal Life (IUL), Final Expense / Burial Insurance, Fixed Index Annuities, Mortgage Protection Insurance.
- **Living Benefits Feature Spotlight:** Dedicated card explaining modern life insurance riders that allow accessing tax-free cash while alive for critical, chronic, or terminal illness.

---

### 4.7 Regional Coverage & Agent Hubs (`LocationsPage.jsx`)
- Replaces physical agency office models with **Regional Partner Network Hubs**.
- Displays coverage territories for Katy, Houston, and Garland (DFW) with consultation windows, online match availability, and simulated map visualizations.

---

### 4.8 Agent Partner Network & Careers (`CareersPage.jsx`)
- **B2B Agent Recruitment:** Positions the platform to independent licensed agents seeking qualified Vietnamese-American consumer leads.
- **4 Value Propositions:** Pre-Qualified Leads, Transparent Pay-Per-Lead Model, Bilingual Community Demand, Verified Professional Status.
- **Onboarding Application Form:** Full Name, Phone, Email, Lines of Authority, Experience Years, and NPN verification notes.

---

### 4.9 Contact & Support Center (`ContactPage.jsx`)
- **Dual-Track Support Architecture:**
  - Consumer Support: `support@insurmatch.us` (Bilingual English/Vietnamese matching assistance)
  - Agent Network: `agents@insurmatch.us` (Verification and partnership onboarding)
- **Secure Inquiry Form:** Includes department routing dropdown (`General Match`, `Medicare`, `ACA Health`, `Life & Annuities`, `Agent Partnership`, `Technical Support`).

---

### 4.10 Dedicated 4-Step Match Intake Flow (`QuotePage.jsx`)
- **URL:** `/get-quote`
- **Visual Progress Indicator:**
  `01 YOU` ── `02 NEEDS` ── `03 OPTIONS` ── `04 MATCH`
- **Step Breakdown:**
  - **Step 1 (YOU):** Interactive category selection cards (`Health Insurance`, `Medicare Guidance`, `Life & Asset Protection`) + Zip Code & State input.
  - **Step 2 (NEEDS):** Household size selector (1 to 5+), Annual household income tier, Preferred doctor/clinic/hospital input.
  - **Step 3 (OPTIONS):** Full name, phone number, email address, preferred consultation language (`English & Tiếng Việt`, `Tiếng Việt`, `English`).
  - **Step 4 (MATCH Confirmation):** Active match verification screen showing customer's name, phone, email, and expectations timeline.

---

## 5. AUTHENTICATION & ROLE-BASED PORTALS (STAFF CANONICAL STANDARD)

> **ARCHITECTURAL MANDATE:**  
> To ensure enterprise-grade consistency, visual coherence, and streamlined user ergonomics, the **Staff Portal Architecture (`StaffDashboard.jsx` & `StaffCrmLayout.jsx`)** is officially designated as the **Canonical UI Benchmark and Master Design Template** for all portal actors across the InsurMatch & AgentFlow ecosystem.  
> All other roles—including **Licensed Agents (`AgentDashboard.jsx`)** and **System Administrators (`AdminDashboard.jsx`)**—inherit their navigation shell, card hierarchies, data table behaviors, status pill tokens, and mutation modal patterns directly from the Staff blueprint.

```
+---------------------------------------------------------------------------------------+
|                       CANONICAL PORTAL INHERITANCE ARCHITECTURE                       |
+---------------------------------------------------------------------------------------+
|                                                                                       |
|   [ MASTER TEMPLATE ]  ────────────────────────────────────────────────────────────┐  |
|   Platform Staff Portal (`StaffDashboard.jsx` + `StaffCrmLayout.jsx`)              │  |
|   • Slim Dark Navy Rail (w-12, #0C1B33) + Top Utility Bar (h-12, bg-white)        │  |
|   • Archetype A: Operational Cockpit (4 Metric Cards + Action Queue)              │  |
|   • Archetype B: Enterprise Directory (Faceted Filters + Sortable Table)          │  |
|   • Archetype C: Entity 360 Detail Workspace (Stepper + Tri-Column Layout)        │  |
|                                                                                       │  |
|         │                                                     │                       │  |
|         ▼ [INHERITED & SPECIALIZED]                           ▼ [INHERITED & ADAPTED] │  |
|   Licensed Agent Portal (`AgentDashboard.jsx`)          Admin Portal (`Admin...`)     │  |
|   • 5-Step Workflow: Login ➔ Priorities ➔              • Platform Volume & Health     │  |
|     Customer 360 ➔ Update Contract ➔ Commission         • Staff & Agent Roster Table   │  |
|   • NPN & State Licensing Verification                  • Carrier API & Webhooks       │  |
|   • CMS / HIPAA Compliant Customer Drawer               • System Audit Trail           │  |
+---------------------------------------------------------------------------------------+
```

---

### 5.1 Portal Sign-In (`LoginPage.jsx`)
- **Visual Staging:** Deep Navy background (`#0B172A`) with radial architectural grid mesh and glowing ambient blurs (`#14243A`).
- **Container Card:** Warm Ivory container (`#F7F5EF`) with brand lockup, portal access badge, email/password fields with show/hide password toggle.
- **Demo Quick Fill Buttons:** Instant one-click authentication for evaluators:
  - **Admin:** `admin@insurmatch.us` / `Admin@123`
  - **Staff:** `staff@insurmatch.us` / `Staff@123`
  - **Agent:** `agent@insurmatch.us` / `Agent@123`
- **Session Persistence:** Credentials generate a secure bearer token stored in `localStorage` under `tbri_token` and `tbri_user`, validated on protected routes.

---

### 5.2 Canonical Enterprise Portal Shell (`StaffCrmLayout.jsx` Standard)
The Staff CRM Shell defines the golden standard layout for all authenticated portal spaces:

#### 1. Top Utility Header (`h-12 bg-white border-b border-slate-200`)
- **Left Cluster:**
  - Platform Brand Lockup: Gradient shield icon (`from-cyan-500 to-blue-600`) + title `The Best Rate Insurance` / subtitle `InsurMatch Partner Platform`.
  - Mode Switcher Navigation: Deep links between `Portal` (Home) and `Management` (CRM Active View).
- **Right Action Cluster:**
  - **Quick Create Button (`+`):** `w-7 h-7 rounded-md border border-slate-200` to quickly initiate an entity creation modal.
  - **Notification Center:** Bell icon with counter badge (`bg-rose-500 text-white rounded-full text-[9px]`).
  - **Database & Docker Live Health Indicator:** Live heartbeat badge indicating PostgreSQL status (`PostgreSQL Online` with pulsing green dot, or `Connecting DB...`).
  - **Bilingual Language Switcher:** Dropdown toggling between `English` and `Tiếng Việt`.
  - **User Profile Menu:** Circular avatar badge with initial, email truncate, role pill, and popover for `View Public Site` and `Sign Out`.

#### 2. Left Slim Dark Navy Navigation Rail (`w-12 bg-[#0C1B33]` shrink-0)
- **Aesthetic:** Ultra-compact, non-distracting vertical rail in midnight blue (`#0C1B33`), preserving 96% of viewport width for tabular data.
- **Top Launcher:** App switcher trigger icon (`grid_view`).
- **Interactive Flyout Module Menu:** Clicking the module trigger opens an anchored floating popover (`w-48 bg-white rounded-xl shadow-xl border border-slate-200 py-1.5`) providing direct access to:
  - `Dashboard` (`grid_view`)
  - `Contacts / Customers` (`contacts`)
  - `Deals / Contracts` (`handshake`)
  - `Customer Documents` (`description`)
- **Bottom Rail Tools:** Settings gear, documentation, and technical support shortcuts.

---

### 5.3 Platform Staff Portal — Master Template (`StaffDashboard.jsx`)
The Staff Portal implements the **Three Canonical Screen Archetypes**:

#### Archetype A: Operational & Analytical Cockpit (`*CrmDashboard.jsx`)
1. **Welcome & Context Header:** Displaying user name, current operational role, and sub-label explaining lead intake tasks.
2. **Operational Notice Banner:** Highlight container (`bg-surface-container border border-stroke-subtle`) communicating backend sync state and regulatory guidelines.
3. **4-Quadrant KPI Metric Grid:**
   - Card container: `bg-surface-container-lowest rounded-2xl border border-stroke-subtle p-5 shadow-sm`.
   - Left tinted icon badge: `w-10 h-10 rounded-xl` with role-tailored color accents.
   - Numeric typography: `text-headline-sm font-bold text-on-surface`.
   - Secondary subtitle: `text-body-sm text-on-surface-variant`.
4. **Visual Analytics & Distribution:** Progress bars and funnel graphs tracking conversion from `Lead In` ➔ `Contact Made` ➔ `Proposal Sent` ➔ `Closed Won`.

#### Archetype B: Enterprise Data Directory & Filtering Hub (`*ContactsList.jsx`, `*DealsList.jsx`)
1. **Control Toolbar:** Real-time search input with clear trigger (`✕`), multi-select batch actions, export buttons.
2. **Faceted Filter Strip:** Product line pill buttons, status select dropdowns, priority toggles, and active filter dismiss buttons.
3. **Enterprise Data Table:**
   - Clean sticky header: `bg-surface-container text-on-surface-variant text-xs uppercase tracking-wider`.
   - Hover row highlighting: `hover:bg-surface-container/50 transition-colors`.
   - Clickable interactive phone links (`tel:`) and email links (`mailto:`).
   - Standardized status badges:
     - `Active / Won`: `bg-emerald-100 text-emerald-800 border border-emerald-200`
     - `In Underwriting / In Progress`: `bg-amber-100 text-amber-800 border border-amber-200`
     - `Pending Documents`: `bg-purple-100 text-purple-800 border border-purple-200`
     - `New / Unassigned`: `bg-primary/10 text-primary`
4. **Footer Metadata:** Records count (`Displaying X of Y records`) and HIPAA/CMS privacy compliance reassurance.

#### Archetype C: Master-Detail 360 Workspace (`*ContactDetail.jsx`, `*DealDetail.jsx`)
1. **Pipeline Stepper Bar:** Horizontal milestone progress bar illustrating customer lifecycle stages.
2. **Tri-Column Master-Detail Layout:**
   - **Left Column (30%):** Customer identity, tags, demographic data, phone, email, household income, assigned owner.
   - **Center Column (50%):** Tabbed workspace (`Overview`, `Policy / Deals`, `Documents`, `Timeline & Activity Notes`).
   - **Right Column (20%):** Quick action toolbar (`Log Call`, `Send Email`, `Schedule Meeting`, `Upload Doc`) and underwriting tasks.

---

### 5.4 Licensed Agent Portal — 5-Step AgentFlow (`AgentDashboard.jsx`)
The Licensed Agent Dashboard directly inherits the Staff UI template and adapts it into the **5-Step Operating Workflow ("From Customer Data to Daily Action")**:

```
+---------------------------------------------------------------------------------------+
|                             AGENTFLOW 5-STEP WORKFLOW                                 |
+---------------------------------------------------------------------------------------+
|  01. LOGIN          02. PRIORITIES        03. CUSTOMER 360     04. CONTRACT MUTATION  |
|  Agent Khánh       Morning Cockpit       Search & Filter      Update Status, Carrier |
|  NPN #1984210  ──▶ 4 Action Cards    ──▶ 200+ Portfolio   ──▶  Premium & Subsidy      |
|  TX, CA, FL        (Follow-ups, Appts)   (Medicare/ACA/Life)   Log Call Notes         |
|                                                                          │            |
|                                05. COMMISSION DASHBOARD                  │            |
|                                Settled MTD, Pending Underwriting, ◀──────┘            |
|                                Contract Reconciliation Ledger                         |
+---------------------------------------------------------------------------------------+
```

#### Application of Staff Archetypes to AgentFlow:
1. **01 — Identity & Compliance Banner (Adopted from Staff Header & Banner):**
   - Header displays: `Good day, Khánh 🧑‍💼`, `NPN #1984210 • Licensed in TX (TDI), CA (CDI) & FL`, with a CMS & HIPAA Compliant active badge.
   - Tab Jump Bar: Instant switching between `All Overview`, `02 Priorities`, `03 Customers (200+)`, and `05 Commission`.
2. **02 — Today's Priorities (Staff Archetype A):**
   - 4 Action Cards styled identically to Staff KPIs:
     * `Customers to Follow-up (<24h)` (Rose tint)
     * `Today's Appointments` (Amber tint)
     * `Upcoming Renewals` (Purple tint)
     * `Important Tasks & Proof of Income` (Blue tint)
   - **Interactive Filtering:** Clicking any card filters the table below in real time.
3. **03 — Customer 360 & Portfolio Management (Staff Archetype B):**
   - Real-time search across 200+ sample customer records.
   - Faceted filters for `Medicare (Part C/Supp)`, `ObamaCare / ACA`, and `Life / Annuity`.
   - Table columns: Client Name & Language, Policy & Carrier, Contact, Due Dates / Appointments, Status Badge, Actions (`View 360 👁️`, `Update →`).
   - **Customer 360 Modal:** Drawer detailing household size, APTC subsidy, doctor/clinic network, and consultation notes.
4. **04 — Update Contract Lifecycle (Staff Archetype C Mutation Modal):**
   - Interactive modal modifying Contract Status (`Application Submitted`, `In Underwriting`, `Approved & Active`, `Pending Documents`, `Renewal Required`).
   - Carrier dropdown, Policy #, Monthly Premium, APTC Subsidy, and Follow-up flag.
   - **Automated Workflow Payoff:** Saving an `Approved & Active` status immediately shifts the contract's estimated earnings into `Settled Commission` in Step 05.
5. **05 — Commission & Revenue Analytics (Staff Reconciliation Ledger Archetype):**
   - 3 Financial Metric Cards: `Settled MTD`, `Pending Underwriting`, `YTD Total Commission`.
   - **Contract-Commission Reconciliation Ledger:** Detailed tabular audit trail mapping each customer policy directly to carrier payout formulas (CMS Medicare Renewal $306, ACA $30 PMPM, Life 85% FYC).

---

### 5.5 System Administrator Portal — Platform Operations (`AdminDashboard.jsx`)
The Administrator Portal applies the Staff UI template to system governance:

1. **Adoption of Staff Navigation Shell:** Full dual-tier navigation (Dark Navy Rail + Utility Header) with system health diagnostics.
2. **Platform KPI Cockpit (Staff Archetype A):**
   - *Total Match Inquiries* (`primary/10` tint)
   - *Verified Partner Agents* (`emerald-50` tint)
   - *Staff Operations Members* (`amber-50` tint)
   - *Monthly Match Volume & Conversion* (`rose-50` tint)
3. **Platform Inquiries & Audit Roster (Staff Archetype B):**
   - Centralized inquiry queue tracking consumer submissions from `/get-quote`.
   - Staff and Agent account roster with role-based access management, NPN verification tags, and state licensing compliance audit.
4. **Integration Center (Staff Archetype C):**
   - Carrier API configuration (BlueCross, UHC, Humana webhooks).
   - Docker container & PostgreSQL live monitoring.

---

### 5.6 Cross-Actor UI Consistency & Inheritance Matrix

| UI Component / Paradigm | Staff Portal (Canonical Template) | Agent Portal (AgentFlow) | Admin Portal (System Governance) |
| :--- | :--- | :--- | :--- |
| **Navigation Shell** | Slim Rail (`w-12 #0C1B33`) + Header (`h-12`) | Dual-Tier Shell / Integrated Workspace | Slim Rail (`w-12 #0C1B33`) + Header (`h-12`) |
| **Visual Theme Tokens** | Slate-50 / Ivory, Navy `#0B172A`, Blue `#00B4D8` | Ivory `#F7F5EF`, Navy `#0B172A`, Champagne `#C8A96B` | Slate-50 / Ivory, Navy `#0B172A`, Rose/Slate |
| **Operational Cockpit** | Inquiries Queue & Assignment Velocity | Today's Priorities (4 Action Columns) | Global Match Volume & Docker Health |
| **Directory Table** | Lead Inquiries & Deals with Faceted Filters | 200+ Customer Portfolio with Product Filters | Platform Account Roster & Audit Log |
| **Status Pill Badges** | `New`, `Assigned`, `Closed Won` | `Active`, `In Underwriting`, `Renewal Due` | `Active`, `Pending NPN`, `Suspended` |
| **Detail 360 View** | Master-Detail 3-Column Pipeline Stepper | Customer 360 Modal with APTC & Doctor Network | Account Accreditation & License Inspector |
| **Mutation Workflow** | Route & Assign Lead to Verified Agent | Update Contract Status & Carrier Policy # | Role Assignment & API Credentials Update |
| **Financial Ledger** | Deals Pipeline Value & Won Revenue | Contract-Commission Direct Reconciliation | Gross Match Volume & Carrier Contract Billing |

---

## 6. DATA STRUCTURES & MOCK MODELS

### 6.1 Regional Coverage Hubs (`src/data/locationsData.js`)
```javascript
export const locations = [
  {
    id: 'katy',
    name: 'Katy Regional Hub (Partner Network)',
    address: 'Digital Matching & Field Partner Coverage',
    city: 'Katy / West Houston, Texas',
    phone: 'support@insurmatch.us',
    hours: 'Partner Consultations: Mon-Fri: 9:00am - 6:00pm',
    specialHours: 'Digital Match Requests: Active 24/7 Online',
    email: 'support@insurmatch.us',
    mapLink: 'https://maps.google.com/?q=Katy+TX',
    isHQ: true,
  },
  {
    id: 'houston',
    name: 'Houston Regional Hub (Partner Network)',
    address: 'Bilingual Agent Network & Local Support',
    city: 'Houston, Texas',
    phone: 'support@insurmatch.us',
    hours: 'Partner Consultations: Mon-Fri: 9:00am - 5:00pm',
    specialHours: 'Digital Match Requests: Active 24/7 Online',
    email: 'support@insurmatch.us',
    mapLink: 'https://maps.google.com/?q=Houston+TX',
    isHQ: false,
  },
  {
    id: 'garland',
    name: 'Garland / DFW Hub (Partner Network)',
    address: 'Dallas-Fort Worth Partner Coverage',
    city: 'Garland / Dallas, Texas',
    phone: 'support@insurmatch.us',
    hours: 'Partner Consultations: Mon-Fri: 9:00am - 5:00pm',
    specialHours: 'Digital Match Requests: Active 24/7 Online',
    email: 'support@insurmatch.us',
    mapLink: 'https://maps.google.com/?q=Garland+TX',
    isHQ: false,
  },
];
```

### 6.2 Leadership & Core Values (`src/data/teamData.js`)
Contains data objects for executive founders (Anh Que Pham CPA, Phuc Trinh, Anh Chau Pham, Jojo Tram Tran) and core platform values (*Independent Agent Matching*, *Intelligent Routing*, *Vietnamese Community First*, *Free & Zero Spam Guarantee*).

### 6.3 Authentication Session Store (`src/auth/authService.js`)
Stores authentication state in `localStorage` under `tbri_token` and `tbri_user` keys, enabling session persistence across page refreshes.

---

## 7. REGULATORY COMPLIANCE & LEGAL DISCLAIMERS

InsurMatch adheres to strict regulatory compliance standards required by the Centers for Medicare & Medicaid Services (CMS) and state insurance departments.

### 7.1 Official Disclaimer (Rendered in Footer & Service Pages)
> **Regulatory Disclaimer:** InsurMatch is a technology and lead-generation platform, not an insurance agency or carrier. InsurMatch does not sell insurance, provide personalized insurance advice, underwrite policies, or collect insurance premiums. All insurance quotes, consultations, and policies are provided solely by independent, properly licensed insurance agents. Not connected with or endorsed by the U.S. government or the federal Medicare program.

### 7.2 CMS Medicare Compliance Notice
> **Medicare Notice:** We do not offer every plan available in your area. Any information we provide is limited to those plans offered by partner agents in your area. Please contact Medicare.gov or 1-800-MEDICARE (1-800-633-4227), or your local State Health Insurance Program (SHIP) to get information on all of your options.

---

## 8. RESPONSIVE BEHAVIOR & ACCESSIBILITY MATRIX

| Viewport | Screen Width | Navbar Navigation | Hero Layout | Card Grids | Mobile Bottom Bar |
|:---|:---|:---|:---|:---|:---|
| **Mobile (Small)** | `< 640px` | Collapsed hamburger menu | Stacked 1-col (Text top, Image bottom) | 1 column | Visible fixed bar with CTAs |
| **Tablet** | `640px – 1024px` | Hamburger menu or compact links | Stacked or compact 2-col | 2 columns | Hidden (or compact) |
| **Desktop** | `> 1024px` | Full horizontal menu + top announcement bar | Asymmetric 12-col (7/5 split) | 3 or 4 columns | Completely hidden |

### Accessibility Features:
- **High Contrast Ratios:** Deep Navy text on Ivory background satisfies WCAG 2.1 AA requirements (contrast ratio > 12:1).
- **Keyboard Navigation:** All interactive elements (`<button>`, `<a>`, `<input>`) feature explicit focus outlines (`focus:outline-none focus:border-navy-deep`).
- **Screen Reader Support:** Semantic tags (`<header>`, `<nav>`, `<main>`, `<footer>`, `<aside>`), explicit `aria-label` attributes on modal close buttons and mobile toggles, and image `alt` attributes.
- **Touch Targets:** All clickable interactive buttons adhere to a minimum touch target size of 44px x 44px.

---

*Document compiled and verified against the InsurMatch production codebase.*

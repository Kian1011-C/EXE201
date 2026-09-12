---
name: Modern Trust Insurance System
colors:
  surface: '#f7fafd'
  surface-dim: '#d7dadd'
  surface-bright: '#f7fafd'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f1f4f7'
  surface-container: '#ebeef1'
  surface-container-high: '#e5e8eb'
  surface-container-highest: '#e0e3e6'
  on-surface: '#181c1e'
  on-surface-variant: '#414752'
  inverse-surface: '#2d3133'
  inverse-on-surface: '#eef1f4'
  outline: '#717783'
  outline-variant: '#c1c7d4'
  surface-tint: '#005fae'
  primary: '#0059a4'
  on-primary: '#ffffff'
  primary-container: '#0072ce'
  on-primary-container: '#f4f6ff'
  inverse-primary: '#a5c8ff'
  secondary: '#00658d'
  on-secondary: '#ffffff'
  secondary-container: '#41befd'
  on-secondary-container: '#004b69'
  tertiary: '#4b5972'
  on-tertiary: '#ffffff'
  tertiary-container: '#63718b'
  on-tertiary-container: '#f4f6ff'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#d4e3ff'
  primary-fixed-dim: '#a5c8ff'
  on-primary-fixed: '#001c3a'
  on-primary-fixed-variant: '#004785'
  secondary-fixed: '#c6e7ff'
  secondary-fixed-dim: '#81cfff'
  on-secondary-fixed: '#001e2d'
  on-secondary-fixed-variant: '#004c6b'
  tertiary-fixed: '#d6e3ff'
  tertiary-fixed-dim: '#b9c7e4'
  on-tertiary-fixed: '#0d1c32'
  on-tertiary-fixed-variant: '#39475f'
  background: '#f7fafd'
  on-background: '#181c1e'
  surface-variant: '#e0e3e6'
  cyan-ice: '#D4F7FF'
  trust-navy-deep: '#06101E'
  card-slate: '#F8FAFC'
  stroke-subtle: '#E2E8F0'
  success-emerald: '#10B981'
  warning-amber: '#F59E0B'
typography:
  display-xl:
    fontFamily: Plus Jakarta Sans
    fontSize: 56px
    fontWeight: '800'
    lineHeight: 64px
    letterSpacing: -0.03em
  headline-lg:
    fontFamily: Plus Jakarta Sans
    fontSize: 40px
    fontWeight: '700'
    lineHeight: 48px
    letterSpacing: -0.02em
  headline-lg-mobile:
    fontFamily: Plus Jakarta Sans
    fontSize: 30px
    fontWeight: '700'
    lineHeight: 38px
    letterSpacing: -0.02em
  headline-md:
    fontFamily: Plus Jakarta Sans
    fontSize: 28px
    fontWeight: '700'
    lineHeight: 36px
    letterSpacing: -0.015em
  headline-sm:
    fontFamily: Plus Jakarta Sans
    fontSize: 22px
    fontWeight: '600'
    lineHeight: 30px
    letterSpacing: -0.01em
  title-md:
    fontFamily: Plus Jakarta Sans
    fontSize: 18px
    fontWeight: '600'
    lineHeight: 26px
    letterSpacing: 0em
  body-lg:
    fontFamily: Plus Jakarta Sans
    fontSize: 18px
    fontWeight: '400'
    lineHeight: 28px
    letterSpacing: 0em
  body-md:
    fontFamily: Plus Jakarta Sans
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
    letterSpacing: 0em
  body-sm:
    fontFamily: Plus Jakarta Sans
    fontSize: 14px
    fontWeight: '400'
    lineHeight: 20px
    letterSpacing: 0em
  label-lg:
    fontFamily: Plus Jakarta Sans
    fontSize: 14px
    fontWeight: '700'
    lineHeight: 20px
    letterSpacing: 0.04em
  label-md:
    fontFamily: Plus Jakarta Sans
    fontSize: 12px
    fontWeight: '600'
    lineHeight: 16px
    letterSpacing: 0.02em
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  gutter: 1.5rem
  gutter-mobile: 1rem
  margin: 2rem
  margin-mobile: 1rem
  space-xs: 0.25rem
  space-sm: 0.5rem
  space-md: 1rem
  space-lg: 1.5rem
  space-xl: 2.5rem
  space-2xl: 4rem
  space-3xl: 6rem
---

## Brand & Style

This design system establishes an aura of absolute financial security, approachable empathy, and modern clarity. Serving individuals, families, and seniors navigating healthcare, Medicare, and life insurance policies, the experience eliminates clinical anxiety and replaces it with protective confidence. 

The aesthetic is **Corporate Modern with Tactile Refinements**: combining structural clarity, pristine white and subtle slate negative space, vibrant layered cerulean and cyan accents, and refined rounded container architecture. Trust is prioritized through razor-sharp typographic hierarchy, high-contrast actions, and transparent policy data visualizations.

## Colors

The palette balances vibrancy and security through an authentic corporate insurance spectrum:

- **Primary (`#0072CE`)**: The authoritative Royal Blue anchor used for primary callouts, header accents, and active state indicators.
- **Secondary (`#00A3E0`)**: A vivid Cyan Blue embodying modern accessibility, applied to key conversion buttons ("Get A Quote", "Find An Agent"), micro-badges, and interactive card borders.
- **Tertiary (`#0A192F`)**: A deep institutional Navy, anchoring high-importance footers, contrast trust bars, and high-impact headlines.
- **Neutral (`#F4F7FA`)**: A cool, clinical-free slate white foundation that keeps high-volume rate calculators and complex plan comparison matrices calm and legible.
- **Cyan Ice (`#D4F7FF`)**: A soft luminous tint dedicated to badge backgrounds, selected pill fills, and subtle focus glows.

## Typography

Standardized on **Plus Jakarta Sans**, this design system achieves crisp legibility across all touchpoints. Its balanced geometry and open counters maintain extreme readability across complex insurance quotes and benefit tables while exuding warm approachability.

- **Uppercase Micro-Headers**: Use `label-lg` with positive letter spacing (`0.04em`) in primary blue (`#0072CE`) for service category overlines (e.g., "OUR SERVICES", "INSURING ALL OF TEXAS").
- **Numerical Impact**: Stat callouts (e.g., "10k+ Clients", "50 States") leverage `display-xl` set at 800-weight for instant visual authority.

## Layout & Spacing

A 12-column responsive fluid grid structured with generous vertical breathing room ensures insurance information never feels dense or intimidating:

- **Desktop (1024px+)**: 12 columns, `1.5rem` (24px) gutters, max container width capped at `1280px` with centered auto-margins.
- **Tablet (768px - 1023px)**: 8 columns, `1.25rem` (20px) gutters, and `1.5rem` edge margins.
- **Mobile (<768px)**: 4 columns, `1rem` (16px) gutters, and `1rem` edge margins.

Section separation mandates rhythmic spacing tokens: use `space-2xl` between standard thematic modules and `space-3xl` above global CTA and conversion zones.

## Elevation & Depth

Visual hierarchy uses a refined combination of surface layers, crisp hairline borders, and tinted ambient shadows that create buoyant elevation without looking heavy:

- **Level 0 (Flat)**: Base canvas `#FFFFFF` or alternate section slate `#F4F7FA`.
- **Level 1 (Card & Container)**: Pure white background with a subtle border `1px solid #E2E8F0` and faint ambient drop shadow: `0 4px 16px -2px rgba(10, 25, 47, 0.05)`.
- **Level 2 (Interactive Hover / Dropdown)**: `0 12px 32px -4px rgba(0, 114, 206, 0.12)`, lifted 2px along the Y-axis.
- **Level 3 (Modal / Persistent Action Bars)**: `0 20px 48px -8px rgba(10, 25, 47, 0.18)` paired with backdrop blur (`backdrop-filter: blur(8px)`).
- **Navy Contrast Blocks**: Sections using `tertiary_color_hex` (`#0A192F`) use internal luminous borders: `1px solid rgba(212, 247, 255, 0.12)`.

## Shapes

The design system implements a friendly, reliable **Rounded (`2`)** shape language:

- **Cards and Containers**: `1rem` (`16px`) corner radius (`rounded-lg`) to balance structural modernism with organic softness.
- **Buttons, Badges, and Input Fields**: `0.5rem` (`8px`) radius for crisp affordance and tactile alignment.
- **Status Pills and Floating Callouts**: Full circular pill radius (`9999px`) to emphasize lightness and speed.
- **Shield & Checkmark Brand Accents**: Rounded joins (stroke-linejoin: round) reflecting the protective brand crest.

## Components

### Buttons & CTAs
- **Primary Action ("Get A Quote", "Find An Agent")**: Vibrant cyan `#00A3E0` fill with bold white typography, 48px height, `0.5rem` radius, and a gentle hover transform (`scale(1.01)` with shadow expansion `0 6px 20px rgba(0,163,224,0.3)`).
- **Secondary Action ("Contact Us")**: White surface with a `1.5px solid #0072CE` stroke and primary blue text, darkening slightly on hover.
- **Tertiary Utility**: Slate transparent surface `#F4F7FA` with dark navy text `#0A192F` for in-card navigation.

### Cards & Service Tiles
- **Insurance Product Cards**: White cards with a `16px` border-radius and top-inset image wrapper. Cards contain an icon badge tinted in `#D4F7FF`, a semibold title, 2 lines of description, and an inline link with an arrow glyph.
- **Agent Contact Cards**: Dual-tier cards with a royal blue header zone transitioning into clean white data rows containing phone, email, and localized office hours.

### Trust Badges & Metrics
- **Metric Banners**: Dark navy background (`#0A192F`) housing white metrics with subtle vertical divider strokes (`rgba(255,255,255,0.15)`).
- **Accreditation Chips**: `32px` height, soft cyan fill (`#D4F7FF`), deep blue text (`#0049A0`), and embedded vector shield checkmark icons.

### Inputs & Selection Controls
- **Form Fields**: `48px` height, `#FFFFFF` fill, `1px solid #E2E8F0` border, `8px` corner radius. Focused state shifts the border to `#00A3E0` with an outer ring of `0 0 0 3px rgba(0, 163, 224, 0.15)`.
- **Radio & Policy Selectors**: Card-style radio tiles that highlight with a full `2px solid #0072CE` border and `#D4F7FF` tint when active.
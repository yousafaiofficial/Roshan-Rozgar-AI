# Roshan Rozgar — Figma Design Studio & Expanded Workforce Implementation Plan

## User Review & Critical Decisions

> **Important Notice on Figma Files**: Figma uses a closed, binary `.fig` file format that cannot be generated natively without proprietary Figma desktop serialization. To provide the requested phone and desktop Figma experience directly in your application:
> 1. We will build an in-app **Figma Design Studio & Artboard Inspector** featuring side-by-side **Desktop (1440 × 900)** and **Mobile (390 × 844 iPhone 15)** live artboards with canvas pan/zoom, device frame bezels, artboard view switcher, and component tree inspection.
> 2. We will provide **Export to Figma** capabilities:
>    - **Copy Figma Design Tokens (JSON)** formatted for the standard *Tokens Studio for Figma* plugin (colors, typography, radii, spacing, elevations).
>    - **Download Desktop & Mobile SVG Artboards** or clipboard-ready HTML for the official *HTML to Figma* / *Figma to Code* plugins for 1-click import into native Figma.
> 3. We will expand the worker database from **20 to 36+ realistic skilled professionals** across all 8 trades and additional Islamabad/Rawalpindi sectors (DHA, Bahria Phase 7, Chaklala, PWD, E-11, F-7, Saddar, Satellite Town), complete with bilingual Urdu/English profiles, verified badges, real service pricing, and GPS coordinates for the interactive Leaflet map.

---

## 1. Overview & Core Concept

This update delivers two core enhancements:
1. **Figma Canvas & Artboard Studio**: A dedicated creative workspace within Roshan Rozgar that presents the entire application as an authentic Figma canvas. Designers, stakeholders, and developers can toggle between the full marketplace views, zoom between 25% and 200%, inspect layout specs and typography tokens, test responsive breakpoints live in mobile/desktop bezels, and export design assets directly into Figma.
2. **Expanded Workforce Density**: Scale the database to 36+ highly detailed, culturally authentic skilled technicians across Islamabad & Rawalpindi. Every trade (Electrician, Plumber, AC Tech, Carpenter, Mechanic, Painter, Home Cleaning, Appliance Repair) will feature at least 4–5 verified specialists with distinct service specializations, emergency availability toggles, hourly rates, CNIC verification flags, and accurate geo-coordinates for local map discovery.

---

## 2. User Experience & Visual Design

### A. Figma Artboard Studio View
- **Canvas Interface**:
  - Dark slate Figma canvas background (`#1E1E1E` / `#2C2C2C`) with subtle dot-matrix grid and coordinate rulers.
  - Top Toolbar: Zoom controls (50%, 75%, 100%, 150%, Fit), Artboard switchers (`All`, `Homepage`, `Worker Discovery`, `Worker Profile`, `Booking Flow`), and an "Export for Figma" modal button.
  - Side-by-side Artboards:
    - **Desktop Frame (1440px × 960px)**: Elevated white canvas with rounded top title pill: `Roshan Rozgar — Desktop (1440w)` displaying real-time responsive previews.
    - **Mobile Frame (390px × 844px)**: Realistic iPhone 15 Pro bezel with dynamic island, status bar (4G, battery, clock), and bottom swipe indicator: `Roshan Rozgar — Mobile (390w)`.
  - **Spec & Token Inspector Drawer**:
    - Interactive tab showing the exact brand design tokens: Deep Forest Green (`#123D32`), Primary Green (`#176B50`), Vibrant Lime (`#C6F36B`), Warm Ivory (`#F8F7F2`), Dark Charcoal (`#202823`), font stacks (Manrope, Inter, Noto Nastaliq Urdu), spacing scale, and border-radii.
    - One-click "Copy Tokens for Figma" (compatible with Figma Tokens / Tokens Studio).
  - **Export Modal**:
    - Option 1: Copy JSON Tokens for Figma.
    - Option 2: Copy SVG / HTML snippet for Figma plugin import.
    - Option 3: Download Design Spec Cheat Sheet (colors, typography hierarchy, component inventory).

### B. Expanded Worker Profiles & Map Experience
- **16 New Realistic Workers** (Bringing total from 20 to 36):
  - **AC Technicians**: Inverter PCB specialists, split AC master servicing, compressor replacement in F-7, DHA-2, and Saddar.
  - **Electricians**: Solar inverter & battery setup experts, 3-phase wiring, smart home automation in Bahria Phase 8 and G-11.
  - **Plumbers**: Geyser repair specialists, underground leak detection, PPR pipe fitting in Chaklala Scheme 3 and I-8.
  - **Carpenters**: Modular kitchen builders, custom wood carving, polish & hinge repair in PWD and Rawalpindi Westridge.
  - **Mechanics**: Hybrid battery scan, roadside EFI engine diagnostics, brake overhaul in I-9 and Murree Road.
  - **Painters**: Weather-sheet texture, damp-proofing (seep/silan treatment), deco polish in E-11 and Satellite Town.
  - **Home Cleaning**: Deep sofa shampoo, post-renovation disinfection, water tank cleaning in F-6 and Bahria Town.
  - **Appliance Repair**: Automatic washing machine inverter boards, microwave magnetron, refrigerator gas charging in G-9.
- **Enhanced Discovery & Map**:
  - All 36 workers mapped accurately with Twin Cities latitude/longitude on the interactive Leaflet map.
  - Filter chips and sector dropdowns immediately show enriched results with no empty categories.

---

## 3. Key Product Decisions & Trade-Offs

| Decision | Chosen Approach | Rationale / Trade-Off |
| :--- | :--- | :--- |
| **Figma Format** | Interactive In-App Canvas + Token/SVG Exporter | Figma `.fig` is proprietary binary and cannot be generated serverless. A live dual-artboard canvas gives an instant visual mockup experience plus seamless 1-click import into Figma. |
| **Worker Data Architecture** | Seeded in Express server + persistent local sync | Keeps zero external setup friction while providing instantaneous search, map pinpointing, booking persistence, and filtering across all 36 workers. |
| **Navigation Placement** | Header Nav Tab ("Figma Studio") with Badge | Easy toggle between the live marketplace experience and the designer Figma inspection view without disrupting existing consumer flows. |
| **Dual Viewport Rendering** | Synchronized React Sub-Frames | Allows users to test how the exact same data and state look on an iPhone 15 Pro vs a 1440p MacBook Pro side by side. |

---

## 4. Technical Architecture & Data Strategy

### System Architecture Flow

```
[ User Interaction ]
       │
       ├───► [ Marketplace Navigation ] ───► [ Live App (Desktop/Mobile responsive) ]
       │                                            │
       │                                            ▼
       │                                     [ /api/workers ] (36 Verified Workers)
       │                                            ▲
       └───► [ Figma Studio Tab ]                   │
                 │                                  │
                 ├───► [ 1440px Desktop Frame ] ────┤ (Live rendered components)
                 ├───► [ 390px Mobile Frame ] ──────┘
                 ├───► [ Canvas Zoom & Pan Controls ]
                 ├───► [ Design Token Inspector (Colors, Typography, Spacing) ]
                 └───► [ Export to Figma (Tokens Studio JSON & SVG) ]
```

### New Worker Dataset Schema (Sample additions)
- `w-21`: **Tariq Mehmood** — Solar & 3-Phase Electrician (Bahria Town Phase 7, Rawalpindi) • Rating: 4.95 (142 reviews) • PKR 1,200/hr
- `w-22`: **Khurram Shahzad** — Inverter AC & PCB Repair Expert (F-7 Markaz, Islamabad) • Rating: 4.92 (98 reviews) • PKR 1,500/hr
- `w-23`: **Mian Rashid** — Geyser & Underfloor Plumbing Master (Chaklala Scheme 3) • Rating: 4.88 (84 reviews) • PKR 1,000/hr
- `w-24`: **Master Altaf Hussain** — Deco Polish & Modular Woodwork (PWD Housing Scheme) • Rating: 4.97 (176 reviews) • PKR 1,400/hr
- `w-25`: **Zeeshan 'Shani' Ustad** — Hybrid & EFI Car Diagnostic Specialist (I-9 Industrial Area) • Rating: 4.89 (112 reviews) • PKR 1,800/hr
- `w-26`: **Nadeem Akhtar** — Damp Proofing & Weather-Coat Painter (E-11/2, Islamabad) • Rating: 4.85 (73 reviews) • PKR 950/hr
- `w-27`: **Bisma Bibi & Team** — Eco Deep Home & Water Tank Cleaning (F-6 Super Market) • Rating: 4.96 (129 reviews) • PKR 2,200/hr
- `w-28`: **Arshad Minhas** — Inverter Washing Machine & Fridge Board Tech (G-9/4 Karachi Co.) • Rating: 4.91 (87 reviews) • PKR 1,100/hr
... through `w-36` to ensure dense coverage of all 8 trades in both cities.

---

## 5. Implementation Roadmap

### Phase 1: Database Expansion (`server.ts`)
- Add 16 new workers (`w-21` through `w-36`) with complete profile specs:
  - Urdu name + English title + category tag
  - Authentic Twin Cities GPS coordinates
  - Verified CNIC badges, reviews, pricing, and services list
  - Realistic emergency availability flags and experience years

### Phase 2: Figma Design Studio Component (`src/components/FigmaDesignStudio.tsx`)
- Build the Figma canvas environment:
  - Canvas backdrop with dark mode `#1E1E1E`, zoom scaling (`0.5x`, `0.75x`, `1x`, `Fit`), panning
  - **Desktop Artboard (1440 × 900)** with authentic window frame header, resolution badge, and live responsive view
  - **Mobile Artboard (390 × 844)** with sleek iPhone frame, notch/island, and mobile touch simulation
  - View switcher: Preview Home, Discovery Directory, Worker Profile, or Booking Modal
  - **Design Tokens Panel**: One-click copy JSON for Figma Tokens Studio
  - **Export Modal**: Copy SVG artboard code and token JSON for instant pasting into Figma

### Phase 3: Integration & Navigation Update (`src/components/Navbar.tsx` & `src/App.tsx`)
- Add a stylish "Figma Studio" toggle button with Figma icon and live badge in the top navigation
- Wire up state management so users can freely switch between normal browsing and Figma Studio inspection

### Phase 4: Verification & Polish
- Run full typecheck and linting (`compile_applet` and `lint_applet`)
- Verify responsive scaling, map markers for all 36 workers, and export functionality.

---

*Click **Proceed** below to begin implementation.*

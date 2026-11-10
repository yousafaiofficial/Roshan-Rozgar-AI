<div align="center">
  <img width="1200" height="475" alt="Roshan Rozgar Banner" src="https://ai.google.dev/static/site-assets/images/share-ais-513315318.png" />
  <h1>Roshan Rozgar — AI Skilled Trade Marketplace</h1>
  <p><strong>Hyper-local AI marketplace connecting Pakistani households with skilled trade workers using multimodal voice onboarding in Urdu/Roman Urdu, smart price negotiation, and verified booking availability across Islamabad and Rawalpindi.</strong></p>
  
  <p>
    <a href="https://ai.studio/apps/efa6dd94-3224-44ff-b148-c4e740622470"><strong>🌐 Live AI Studio Applet</strong></a> •
    <a href="https://github.com/yousafaiofficial/Roshan-Rozgar-AI"><strong>💻 GitHub Repository</strong></a>
  </p>
</div>

---

## 🌟 Overview

**Roshan Rozgar** (روشن روزگار) solves the trust, communication, and accessibility barriers in Pakistan's informal skilled trade sector (electricians, plumbers, AC technicians, carpenters, painters, and appliance repair specialists). 

Built specifically for the Islamabad & Rawalpindi twin-cities ecosystem:
- **Multimodal Voice Onboarding:** Tradespeople can onboard simply by speaking in Urdu or Roman Urdu. Powered by Gemini 3.8 Flash, the app transcribes their spoken words and automatically extracts their trade, years of experience, coverage sector (e.g. G-9, Bahria Town, Saddar), base rates, and bio.
- **Interactive Twin Cities Discovery Map:** Dynamic Leaflet map pinpointing verified technicians across Islamabad and Rawalpindi sectors with real-time availability badges.
- **AI-Powered Voice Negotiation & Quotation:** Voice messages between customer and worker are automatically transcribed and analyzed to extract agreed service rates and visit charges.
- **Authentic 5-Category Review Intelligence:** Gemini analyzes customer feedback to score work quality, punctuality, communication, and professionalism with dual-language AI summaries.
- **Fail-Safe Offline Heuristics:** If Gemini API keys are omitted or external network requests time out, the backend gracefully falls back to instant regex heuristics, guaranteeing zero downtime.

---

## 🚀 Quick Start (Local Setup)

### Prerequisites
- **Node.js** (v20+ recommended)
- **npm** or **bun**

### 1. Installation
```powershell
npm install --legacy-peer-deps
```

### 2. Environment Configuration
Create a `.env.local` file (optional for local demo; heuristics handle missing keys):
```env
GEMINI_API_KEY="your_gemini_api_key_here"
PORT=3000
```

### 3. Start Development Server
```powershell
npm run dev
```
Open **http://localhost:3000** in your browser.

### 4. Production Build & Test
```powershell
# Typecheck TypeScript
npm run lint

# Build full-stack bundle (Vite client + Node.js server)
npm run build

# Start production server
npm start
```

---

## 📱 Core Features & User Journeys

### 1. Multimodal Urdu Voice Onboarding (`/api/ai/voice-onboard-fast`)
- Technicians tap the microphone and speak naturally (e.g. *"Mera naam Asif Khan hai, main Saddar Rawalpindi mein plumber hoon, 8 saal ka tajurba hai"*).
- Gemini extracts structured profile attributes and populates bilingual profile cards in Urdu and English.

### 2. Interactive Geo-Discovery Map
- Interactive Leaflet map visualizing 20+ seeded skilled technicians with verified badges and ratings.
- Filter by trade (Electrician, Plumber, AC Tech, Carpenter, Painter, Appliance Repair) and sector (G-9, F-10, I-8, Blue Area, Saddar, Satellite Town, Bahria Town).

### 3. Voice Negotiation & Booking
- Customers initiate job requests with voice or text fault descriptions.
- Automated quotation extraction (`/api/ai/extract-quotation`) parses agreed prices and visit charges.
- Instant atomic status updates prevent double bookings.

### 4. Customer Hub & Worker Console
- Dedicated **Customer Hub** to track active bookings, review quotes, and rate completed jobs.
- **Worker Console** for technicians to manage availability, accept incoming service calls, and review earnings.
- **Figma Design Studio**: Interactive live artboards (Desktop 1440px and Mobile iPhone 15 Pro) with design token inspection.

---

## 👥 Seeded Demonstration Accounts

Pre-configured verified professionals:

| ID | Name | Trade | Sector & City | Starting Price | Phone |
|---|---|---|---|---|---|
| `w-1` | Mohammad Tariq | Electrician | G-9, Islamabad | Rs. 800 | 0300-5123456 |
| `w-2` | Asif Khan | Plumber | Saddar, Rawalpindi | Rs. 700 | 0333-5234567 |
| `w-3` | Ghulam Rasool | AC Technician | Bhara Kahu, Islamabad | Rs. 1,500 | 0312-5345678 |
| `w-4` | Rashid Mehmood | Carpenter | F-10, Islamabad | Rs. 1,000 | 0345-5456789 |
| `w-5` | Bilal Ahmed | Painter | Satellite Town, Rawalpindi | Rs. 600 | 0301-5567890 |
| `w-6` | Kamran Haider | Appliance Repair | I-8, Islamabad | Rs. 800 | 0321-5678901 |

---

## 🏗️ Technical Architecture

```
roshan-rozgar/
├── server.ts            # Express server, Gemini AI integration, fallback heuristics
├── index.html           # Root HTML entry with Leaflet styles & Google Fonts
├── vite.config.ts       # Vite configuration with React & Tailwind plugins
├── metadata.json        # Google AI Studio manifest & permissions
├── src/
│   ├── App.tsx          # Main application coordinator & view router
│   ├── main.tsx         # React 19 entry point
│   ├── types.ts         # TypeScript models (Worker, Customer, Booking, Review)
│   ├── components/
│   │   ├── Navbar.tsx                   # Top navigation with role switchers
│   │   ├── LandingHero.tsx              # Bilingual hero & CTA
│   │   ├── InteractiveMap.tsx           # Leaflet Twin Cities interactive map
│   │   ├── WorkerVoiceOnboarding.tsx    # Urdu speech-to-profile onboarding
│   │   ├── VoiceNegotiationModal.tsx    # Smart quotation audio/text modal
│   │   ├── CustomerDashboardView.tsx    # Customer booking management
│   │   ├── WorkerDashboard.tsx          # Technician job console
│   │   ├── PRDArchitectureView.tsx      # Interactive Figma artboards
│   │   └── ReviewModal.tsx              # 5-star category review modal
│   └── data/
│       └── translations.ts              # English and Urdu UI localization
└── public/                              # Static icons and assets
```

---

## ⚠️ Limitations & Disclosures

- **Demo Scope:** In-memory state and local persistence designed for hackathon evaluation and rapid preview.
- **Hardware Voice Input:** Browser speech recognition requires microphone permissions and browser Web Speech support. Native audio upload fallback is provided.
- **AI Coding Assistant Disclosure:** Built with assistance from Google DeepMind Antigravity and Google AI Studio for prototyping, component integration, and automated testing.

# Roshan Rozgar AI — Hackathon Submission

A hyper-local AI-powered skilled trade marketplace connecting Pakistani households with verified skilled tradespeople (electricians, plumbers, AC technicians, carpenters, painters, mechanics, cleaners) across Islamabad and Rawalpindi. Built with a responsive Next.js 16 frontend and a FastAPI + SQLite backend with an embedded Multilingual AI Smart Matching Engine.

---

## 🚀 Quick Start (Windows PowerShell)

**Requirements:** Node.js 20+, Python 3.10+, npm.

Open two terminal windows in the project root:

### 1. Configuration (Run once)
```powershell
Copy-Item backend\.env.example backend\.env
Copy-Item frontend\.env.example frontend\.env.local
```
*(Defaults work immediately out of the box for local demo. Secrets are ignored by Git).*

### 2. Terminal 1 — Backend API (FastAPI + AI Engine)
```powershell
cd backend
py -m venv .venv
.\.venv\Scripts\python.exe -m pip install -r requirements.txt
.\.venv\Scripts\python.exe -m uvicorn app.main:app --port 8000 --reload
```
- API Health: http://localhost:8000/api/health
- Interactive Swagger API Docs: http://localhost:8000/docs
- AI Matching Endpoint: http://localhost:8000/api/ai/match
- AI Classification Endpoint: http://localhost:8000/api/ai/classify

### 3. Terminal 2 — Frontend (Next.js 16 + React 19)
```powershell
cd frontend
npm install
npm run dev
```
- Web Application: http://localhost:3000

---

## 🛠️ Verified End-to-End Demonstration Flow

1. **Customer Registration & Login**:
   - Register a customer account with phone `03459998877` and password `CustPass123!` or any test credentials.
2. **AI Smart Match & Search**:
   - Type or speak naturally in Urdu, Roman Urdu, or English:
     - *"Bijli ka short circuit ho gya hai switchboard me se dhuan nikal raha hai"*
     - *"AC cooling nahi kar raha gas charge karwani hai Bahria Town"*
     - *"Geyser leak kar raha hai pani tapak raha hai"*
   - The AI classifier extracts the category, city, neighborhood, and urgency, ranking matching workers by score with explainability badges.
3. **Send Job Request**:
   - Select a worker (e.g., Worker 1, Electrician in Islamabad). Submit a service request with description, budget, and scheduled time.
4. **Worker Login & Job Acceptance**:
   - Log in as seeded electrician `03000000001` / `Demo12345!`.
   - Open **My Jobs**, accept the request, and enter the agreed price (e.g. Rs. 1,400).
   - The worker is atomically marked as **Busy**, preventing double bookings.
5. **Job Completion & 5-Category Review**:
   - Complete the job as the worker.
   - Switch back to the customer, open **My Jobs**, and submit ratings across all 5 authentic categories: Safety, Work Quality, Punctuality, Professionalism, and Communication.
   - Worker profile rating and job count update immediately.

---

## 👥 Seeded Demonstration Accounts

All seed accounts use password `Demo12345!`:

| Phone | Trade | City | Role |
|---|---|---|---|
| `03000000001` | Electrician | Islamabad | Worker |
| `03000000002` | Plumber | Rawalpindi | Worker |
| `03000000003` | AC Technician | Islamabad | Worker |
| `03000000004` | Carpenter | Rawalpindi | Worker |
| `03000000005` | Painter | Islamabad | Worker |
| `03000000006` | Cleaner | Rawalpindi | Worker |
| `03459998877` | Customer | Islamabad | Customer |

---

## ✨ Implemented & Working Features

### 1. Multilingual AI Smart Matching Engine (`backend/app/ai/`)
- **Query Preprocessor**: Cleans and normalizes Urdu script, Roman Urdu transliterations, and English text; handles Twin Cities Pakistani trade vocabulary.
- **Multilingual Trade Classifier**: TF-IDF vectorization with class-balanced Naive Bayes trained on an authentic dataset of 100+ local problem expressions across 7 trades in Urdu, Roman Urdu, and English.
- **Entity Extraction**: Automatically extracts Twin Cities locations (Islamabad, Rawalpindi, F-6, F-10, G-9, I-8, Blue Area, Saddar, Satellite Town, Bahria Town), customer budget, and high urgency indicators.
- **Multi-Factor Ranking Algorithm**:
  - Skill & Trade relevance (35%)
  - Location & neighborhood proximity (25%)
  - Real-time availability (20%)
  - Pricing & budget compatibility (10%)
  - Experience & verified review history (10%)
- **Transparent Explainability**: Returns match percentages and reason pills (*"Exact trade match"*, *"Available today"*, *"In your city"*).
- **Graceful Fallback & Clarification**: Suggests candidate category buttons if a query is ambiguous or has low confidence.

### 2. Voice-First Onboarding & Accessibility
- 5-step Urdu and Roman Urdu voice onboarding flow for tradespeople with spoken name and bio capture.
- Browser Web Speech API (`SpeechRecognition`) integrated into the AI search bar for instant voice search in `ur-PK`.
- Accessible manual touch keypads and fallbacks when voice recognition is unavailable.

### 3. Customer & Worker Core Marketplace
- Verified customer-to-worker booking lifecycle: request → price agreement → atomic busy lock → completion → 5-category review.
- Atomic double-booking prevention in SQLite transactions.
- Worker profile pages with completed jobs, experience, starting rates, and category rating breakdowns.
- Secure token authentication (PBKDF2 password hashing, 7-day signed demo tokens).
- Authenticated worker profile photo upload with file-type signature checks and 5 MB limits.

---

## 🧪 Automated Test Suite Verification

Every test has been executed and passed:

```powershell
# 1. Backend tests (18 passed)
cd backend
.\.venv\Scripts\python.exe -m pytest -q
# Output: 18 passed, 1 warning in 3.83s

# 2. Frontend TypeScript typecheck (0 errors)
cd ..\frontend
npm run typecheck
# Output: tsc --noEmit (Passed with 0 errors)

# 3. Frontend ESLint (0 errors, 0 warnings)
npm run lint
# Output: eslint . --max-warnings=0 (Passed with 0 errors, 0 warnings)

# 4. Production Next.js build
npm run build
# Output: Next.js 16.4.6 compiled successfully; / and /workers/[id] routes generated
```

---

## ⚠️ Limitations & Disclosure

- **MVP Scope**: Uses local SQLite database and local disk uploads suitable for single-instance hackathon evaluation, not multi-region cloud deployment.
- **Scheduling Model**: Availability uses an atomic busy/free toggle per worker, rather than multi-slot calendar scheduling.
- **Voice Hardware Dependence**: In-browser speech recognition relies on browser Web Speech API availability for Urdu (`ur-PK`); keyboard and visual fallback chips are always provided.
- **Demo Data**: All CNICs, phone numbers, and profile photos are fictional demonstration data. Never submit real Pakistani CNIC numbers.
- **AI Coding Assistant Disclosure**: In compliance with hackathon transparency guidelines, AI assistants (OpenAI Codex and Google DeepMind Antigravity) were utilized for code generation, test authoring, architectural audit, and refactoring under developer supervision.

---

## 🏗️ Repository Architecture

```
Roshan-Rozgar-AI/
├── backend/
│   ├── app/
│   │   ├── ai/                 # Multilingual AI classifier, matcher, preprocessor
│   │   │   ├── classifier.py   # TF-IDF + Naive Bayes multilingual classifier
│   │   │   ├── matcher.py      # Multi-factor worker ranking and scoring
│   │   │   ├── preprocessor.py # Urdu, Roman Urdu & English text normalizer
│   │   │   ├── router.py       # /api/ai/classify and /api/ai/match endpoints
│   │   │   └── training_data.py# Domain training dataset for Twin Cities trades
│   │   └── main.py             # FastAPI application, auth, booking, reviews
│   ├── tests/
│   │   ├── test_ai_matching.py # 14 tests for AI classification and ranking
│   │   └── test_flow.py        # 4 end-to-end booking and auth tests
│   └── requirements.txt
├── frontend/
│   ├── app/
│   │   ├── page.tsx            # Main marketplace UI with AI search bar
│   │   ├── globals.css         # Styling, tokens, responsive layout
│   │   └── workers/[id]/       # Worker detail profile page
│   ├── components/             # Voice onboarding, service cards
│   └── package.json
└── docs/                       # Project audit and architectural plans
```

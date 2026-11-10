# Roshan Rozgar AI — Hackathon MVP

A responsive local skilled-worker marketplace for Islamabad and Rawalpindi. The interface uses warm cream, espresso brown and copper accents; no purple or neon visuals. The app has a Next.js frontend and a FastAPI + SQLite backend.

## Quick start (Windows PowerShell)

**Requirements:** Node.js 20+, Python 3.10+, npm.

Open two terminals in the project root.

Create local configuration files once (they are ignored by Git):
```powershell
Copy-Item backend\.env.example backend\.env
Copy-Item frontend\.env.example frontend\.env.local
```
Replace `ROSHAN_SECRET` in `backend\.env` with a long random local value. The backend loads this file automatically.

**Terminal 1 — API**
```powershell
cd backend
py -m venv .venv
.\.venv\Scripts\python.exe -m pip install -r requirements.txt
.\.venv\Scripts\python.exe -m uvicorn app.main:app --reload
```
API: http://localhost:8000/api/health ; docs: http://localhost:8000/docs

**Terminal 2 — Web**
```powershell
cd frontend
npm install
npm run dev
```
Website: http://localhost:3000

### Demonstration flow
1. Register a **customer** using a test phone number and password of 8+ characters.
2. Select a worker, send a request with a problem description, budget, optional photo and preferred time.
3. Log out and log in as the seeded worker `03000000001` / `Demo12345!` (electrician) or the corresponding worker number shown below.
4. Open **My Jobs**, accept the request and agree on a price. The backend atomically marks the worker unavailable and declines other pending requests.
5. Mark the job completed, log back in as customer, open **My Jobs**, submit category ratings.
6. Filter by service and city. If no matches, save a **demo waitlist** request (no SMS is sent).

### Seeded accounts
These are fictional demonstration accounts, **not real people**. All have password `Demo12345!`.

| Phone | Trade | City |
|---|---|---|
| 03000000001 | Electrician | Islamabad |
| 03000000002 | Plumber | Rawalpindi |
| 03000000003 | AC Technician | Islamabad |
| 03000000004 | Carpenter | Rawalpindi |
| 03000000005 | Painter | Islamabad |
| 03000000006 | Cleaner | Rawalpindi |

## Features implemented
- Responsive Next.js homepage, service cards with consistent Lucide icons, and a locally bundled AI-generated electrician hero image.
- Search by skill and city, available/busy status, worker profiles and starting rates.
- Dedicated worker profile pages with neighborhood, experience, pricing type, completed-job count, category review averages and service-request form.
- Authenticated worker profile-photo upload with file-type signatures, 5 MB limit, persistent local storage and neutral fallback portraits.
- Three seeded example profiles use clearly fictional AI-generated portraits; remaining profiles use the neutral fallback until a worker uploads a photo.
- Customer and worker registration/login, 7-day signed demo tokens, PBKDF2 password hashes.
- Optional CNIC field stored in local demo database and never exposed by public APIs. **Use fake CNIC data only**.
- Main skill and additional skills for worker signup.
- Job request, optional problem photo upload (5 MB), price agreement, accept/decline, completion and review ratings for safety, quality, punctuality, professionalism and communication.
- SQLite transaction ensures only one accepted job per worker at a time (simplified availability model).
- Urdu-language voice input for job descriptions and worker bio via browser Web Speech API where supported. Roman Urdu headline toggle is limited; not full translation.
- Five-step voice-first worker onboarding with Urdu/Roman-Urdu guidance, spoken name and bio capture, large service/city controls, on-screen phone/PIN keypad, audio review and a complete manual fallback.
- Demo waitlist storage.

## Limitations — do not present as finished
- **Not production-ready.** Local SQLite, local uploads, no HTTPS deployment or multi-instance coordination. Secret must be set in environment; default is development-only.
- **No actual AI model/API is integrated.** Browser speech recognition is provided by browser/vendor services and may be unavailable or inaccurate for Urdu; no guarantee of offline operation. This is an accessibility experiment, not a trained proprietary AI model.
- **Browser support:** Chromium-family browsers may expose `SpeechRecognition`/`webkitSpeechRecognition` and speech synthesis, but availability varies by browser build, operating system, device language, network service and microphone permission. Firefox, Safari and embedded/in-app browsers may not expose Urdu recognition. The app detects support at runtime and retains large manual controls when voice is unavailable.
- Voice onboarding still requires button/keypad interaction for private phone and PIN entry; there is no voice price negotiation, two-way messaging, GPS proximity matching, geocoding, push/SMS notifications, guardian/minor workflow or mandatory worker profile-photo enforcement.
- No identity verification, CNIC validation, government integration, background checks, payment processing, or arrival-time guarantee. Profiles are fictional and **not verified**.
- Availability is a single busy/free flag per worker, **not time-slot scheduling**. A worker cannot accept a second booking until the accepted job is completed. Both parties can mark a job complete (simplified demo).
- Registration currently allows an optional CNIC; **never enter real CNIC data in this demo**. Sensitive-data encryption and privacy policy are not implemented.
- Auth token is stored in localStorage; use secure HttpOnly cookies and CSRF controls before real deployment.
- No spam protection, account recovery, OTP verification, rate limiting, moderation, photo malware scanning or hardened image validation. Local uploaded images are publicly retrievable by unguessable filename.
- The electrician hero is AI-generated marketing imagery and does not represent a real, listed or verified worker. Worker cards use a neutral trade icon rather than invented profile photographs or letter avatars.
- The waitlist **does not send notifications**.

## Architecture
```
frontend/    Next.js 16 App Router, React 19, TypeScript, CSS, Lucide icons
backend/     FastAPI, SQLite, local uploads, auth and booking APIs
docs/        Architecture and hackathon notes
```

## AI services and coding assistance disclosure
- **AI coding assistance:** OpenAI Codex was used to generate, integrate, test and review project code and documentation. Team members must review and understand it.
- **Generated visual:** The homepage electrician hero is an AI-generated illustrative marketing image, not a photograph of a listed or verified worker.
- **Speech input:** Browser Web Speech API (`SpeechRecognition` / `webkitSpeechRecognition`) if the browser provides it; may use browser vendor cloud speech services.
- **No other AI service, LLM API, or trained model is connected in this MVP.**

## Hackathon eligibility
Only use this project if its creation and first GitHub commit comply with your event's official hacking window and originality rules. The provided source is a starting MVP; do not claim features work without running the demo yourself. **Do not commit local `.env`, `roshan.db`, `uploads/` or `node_modules/`.**

## Tests
```powershell
cd backend
.\.venv\Scripts\python.exe -m pytest -q
cd ..\frontend
npm run typecheck
npm run lint
npm run build
```

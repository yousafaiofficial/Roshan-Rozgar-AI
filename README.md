# Roshan Rozgar AI — Local Services Marketplace

A responsive local skilled-worker marketplace for Islamabad and Rawalpindi. The interface uses warm cream, espresso brown and copper accents; no purple or neon visuals. The app has a Next.js frontend and a FastAPI + SQLite backend.

## Quick start (Windows PowerShell)

**Requirements:** Node.js 20+, Python 3.10+, npm.

Open two terminals in the project root.

Create local configuration files once (they are ignored by Git):
```powershell
Copy-Item backend\.env.example backend\.env
Copy-Item frontend\.env.example frontend\.env.local
```
The backend loads `backend\.env` automatically. Password recovery requires a configured Twilio account; leave the Twilio fields blank to keep recovery disabled. The API reports that configuration is missing rather than pretending to send a message.

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

### Marketplace flow
1. Register customer and worker accounts using Pakistani mobile numbers and passwords of at least 12 characters.
2. Select a worker, send a request with a problem description, budget, optional photo and preferred time.
3. Log in using the worker account and review incoming requests.
4. Open **My Jobs**, accept the request and agree on a price. The backend atomically marks the worker unavailable and declines other pending requests.
5. Mark the job completed, log back in as customer, open **My Jobs**, submit category ratings.
6. Filter by service and city. If no matches, save an availability request (no SMS is sent).

## Features implemented
- Responsive Next.js homepage, service cards with consistent Lucide icons, and a locally bundled AI-generated electrician hero image.
- Search by skill and city, available/busy status, worker profiles and starting rates.
- Dedicated worker profile pages with neighborhood, experience, pricing type, completed-job count, category review averages and service-request form.
- Authenticated worker profile-photo upload with file-type signatures, 5 MB limit, persistent local storage and neutral fallback portraits.
- Three seeded example profiles use clearly fictional AI-generated portraits; remaining profiles use the neutral fallback until a worker uploads a photo.
- Customer and worker registration/login with PBKDF2 password hashes, seven-day server-side sessions, HttpOnly/SameSite cookies, CSRF checks, logout revocation and account-wide session revocation.
- Pakistani phone validation and E.164 normalization; optional CNIC format validation. CNIC values are not stored or verified, and are never returned by APIs.
- Password recovery with one-use, 8-digit codes that expire after 15 minutes and a configured Twilio SMS integration.
- Per-IP/per-phone login limits and registration/recovery throttles.
- Main skill and additional skills for worker signup.
- Job request, optional problem photo upload (5 MB), price agreement, accept/decline, completion and review ratings for safety, quality, punctuality, professionalism and communication.
- SQLite transaction ensures only one accepted job per worker at a time (simplified availability model).
- Urdu-language voice input for job descriptions and worker bio via browser Web Speech API where supported. Roman Urdu headline toggle is limited; not full translation.
- Five-step voice-first worker onboarding with Urdu/Roman-Urdu guidance, spoken name and bio capture, large service/city controls, private password entry, audio review and a complete manual fallback.
- Demo waitlist storage.

## Limitations — do not present as finished
- **Not production-ready.** Local SQLite and uploads are single-instance only. Configure HTTPS and set `APP_ENV=production` so session cookies use the Secure attribute before deployment.
- Login tokens from earlier app versions are not migrated; existing users must sign in again after upgrading.
- **No actual AI model/API is integrated.** Browser speech recognition is provided by browser/vendor services and may be unavailable or inaccurate for Urdu; no guarantee of offline operation. This is an accessibility experiment, not a trained proprietary AI model.
- **Browser support:** Chromium-family browsers may expose `SpeechRecognition`/`webkitSpeechRecognition` and speech synthesis, but availability varies by browser build, operating system, device language, network service and microphone permission. Firefox, Safari and embedded/in-app browsers may not expose Urdu recognition. The app detects support at runtime and retains large manual controls when voice is unavailable.
- Voice onboarding still requires button interaction for phone/password entry; there is no voice price negotiation, two-way messaging, GPS proximity matching, geocoding, push notifications, guardian/minor workflow or mandatory worker profile-photo enforcement.
- No identity verification, CNIC government verification, background checks, payment processing, or arrival-time guarantee. Profiles are fictional and **not verified**.
- Availability is a single busy/free flag per worker, **not time-slot scheduling**. A worker cannot accept a second booking until the accepted job is completed. Both parties can mark a job complete (simplified demo).
- CNIC is only checked for format; it is not verified, retained or needed for signup. Existing database records are not automatically deleted.
- Password-recovery SMS will not be sent until valid Twilio credentials and a Pakistan-capable sender are configured. Configure `TWILIO_ACCOUNT_SID`, `TWILIO_AUTH_TOKEN`, and `TWILIO_FROM_NUMBER` in the ignored backend `.env` file.
- Current interface language coverage is incomplete; full English, Roman Urdu and Urdu localization remains in progress.
- Login, registration and recovery attempts are rate limited, but broader spam controls, moderation, photo malware scanning and hardened image storage are not implemented. Local uploaded images are publicly retrievable by unguessable filename.
- The electrician hero is AI-generated marketing imagery and does not represent a real, listed or verified worker. Worker cards use a neutral trade icon rather than invented profile photographs or letter avatars.
- The waitlist **does not send notifications**.

## Architecture
```
frontend/    Next.js 16 App Router, React 19, TypeScript, CSS, Lucide icons
backend/     FastAPI, SQLite, local uploads, auth and booking APIs
docs/        Architecture and project status
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

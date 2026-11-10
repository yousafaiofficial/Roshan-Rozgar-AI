# Architecture and flow

- **Frontend**: Next.js 14 App Router; one responsive client page; localStorage bearer token (demo only); calls `NEXT_PUBLIC_API_URL` (default http://localhost:8000).
- **Backend**: FastAPI; SQLite with foreign keys, DB initialized on import; seeded fictional workers only on first database initialization.
- **Customer flow**: register → browse workers → submit job request → worker accepts → job completed → customer submits 5 category ratings.
- **Worker flow**: register with main/extra skills → open My Jobs → accept/decline and set price → mark complete.
- **Booking consistency**: `BEGIN IMMEDIATE` SQLite write lock and conditional `UPDATE workers SET available=0 WHERE available=1` prevent two simultaneous accepts for the same worker. Other pending requests are declined on acceptance.
- **Privacy**: local-only prototype; do not input real CNIC; no public API returns CNIC. Replace demo authentication, data storage and uploads before deployment.
- **Accessibility**: responsive cards, labels, simple icons, optional browser Urdu dictation in selected fields. Fully voice-first onboarding is not yet implemented.
- **Next steps**: real voice onboarding, conversational price negotiation, geo distance and time-slot availability, photo/profile verification with consent, guardian policy, safe storage and security hardening.

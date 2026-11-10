# Roshan Rozgar AI — Product Audit and Implementation Plan

Audit date: 10 November 2026
Audited baseline: `main` at `8e638762f658ab76b53d797cd4a9b417f78d7128`

## Executive summary

Roshan Rozgar AI is a working single-instance marketplace MVP. It has real FastAPI endpoints, SQLite persistence, password hashing, signed sessions, customer and worker registration, worker discovery, service requests, atomic acceptance, completion, category reviews, image uploads and a responsive Next.js interface. It is not production-ready and does not yet satisfy the complete-product specification.

The highest risks are authentication/session design, sensitive-data handling, missing account recovery/deletion, incomplete booking states and permissions, no persistent messaging, no moderation/admin model, no rate limiting, and local-only database/media storage. Development should proceed in small verified phases rather than adding disconnected screens.

## Audited architecture

- Frontend: Next.js 16 App Router, React 19, TypeScript, CSS modules/global responsive CSS.
- Backend: FastAPI with synchronous SQLite access.
- Authentication: PBKDF2-HMAC-SHA256 password hashes and seven-day `itsdangerous` signed bearer tokens.
- Persistence: one local SQLite file plus local filesystem uploads.
- Routes: homepage and a dynamic worker profile route.
- Tests: four backend integration tests; no frontend unit suite or automated browser suite.
- Deployment: no container, managed database, object storage, migration tool, CI workflow or production runtime configuration.

## Verified implemented functionality

| Area | Evidence | Current status |
|---|---|---|
| Customer/worker registration | `POST /api/auth/register`; exercised by tests | Working MVP |
| Login and current user | `POST /api/auth/login`, `GET /api/me` | Working MVP |
| Password hashing | PBKDF2 with per-user random salt and constant-time comparison | Working, parameters not centrally configurable |
| Worker discovery/filtering | `GET /api/workers` with skill, city and availability filters | Working |
| Worker detail | `GET /api/workers/{id}` and `/workers/[id]` UI | Working |
| Worker profile update | `PATCH /api/workers/me` | Partial: limited fields only |
| Profile/problem photos | authenticated upload endpoint, MIME allowlist, signature checks, 5 MB cap | Working locally; not deployment-grade storage |
| Service request | `POST /api/jobs` | Working |
| Worker accept/reject | atomic transaction; accepting one request declines other pending requests | Working simplified model |
| Double-booking protection | transactional `available=1 → 0` update | Working for the single-worker flag model |
| Completion | authorized customer or worker can complete an accepted job | Working but overly permissive workflow |
| Reviews | completed-job ownership check, one review per job, five categories | Working |
| Voice onboarding | Web Speech API feature detection, Urdu recognition/guidance, manual fallback | Working where browser services exist; accuracy not verified |
| Responsive UI | shared homepage/profile components and CSS breakpoints | Working at previously checked viewports |
| Image/profile tests | upload, invalid signature and profile persistence test | Covered |

## Partially implemented or misleading functionality

### Authentication and accounts

- Tokens live in `localStorage`; an XSS can steal them. There are no HttpOnly cookies, CSRF design, refresh/revocation, device/session list or logout invalidation.
- Logout only removes browser state; the token remains valid until expiry.
- No password reset, email/SMS delivery integration, customer profile edit, full worker profile editor, account deletion or data export.
- Roles are only `customer` and `worker`; no admin role or permission model exists.
- Optional CNIC is stored in plaintext. It is omitted from public responses, but encryption, retention policy, audit access and deletion are absent.
- Phone numbers and CNICs have only generic length validation in the committed baseline.

### Marketplace and worker operations

- Availability is one boolean, not a calendar or working-hours model.
- Search is substring matching; there is no proximity calculation, area taxonomy, sorting, pagination or ranking.
- Worker profile fields cover biography, skills, experience, rate and neighborhood, but not portfolio, working hours, structured services or availability slots.
- Three fictional AI-generated portraits are bundled; remaining profiles use a neutral fallback. No profile is identity verified.
- Existing local databases may contain QA-created accounts. Fresh seed data is fictional development data.

### Booking lifecycle

- Implemented statuses: `pending`, `accepted`, `declined`, `completed`.
- Missing: `in_progress`, `cancelled`, `rescheduled`, `disputed`, state-transition history and timestamps.
- Completion can be triggered by either party immediately after acceptance; there is no start confirmation or two-party completion policy.
- Preferred time is stored but not checked against slots or overlapping schedules.
- No customer cancellation, worker cancellation after acceptance, rescheduling, dispute flow or audit trail.
- Atomic protection has not been stress-tested with concurrent database connections.

### Communication, AI and notifications

- No messages, conversations, unread counters, negotiation records or polling/websocket transport.
- The availability notification endpoint only stores a record; it sends no SMS/push/email.
- No service-category classifier or description assistant exists.
- Current matching is deterministic filtering and must not be described as a trained AI model.
- Voice features rely on browser/vendor speech services and can be unavailable or inaccurate.

### Trust, safety and administration

- No complaints, worker reports, moderation decisions, evidence attachments or admin dashboard.
- No rate limiting, abuse throttling, login lockout, bot protection or moderation queue.
- Upload checks cover declared MIME and magic bytes but do not decode images, strip metadata, scan malware or isolate serving domains.
- No security headers/content security policy are configured in the app.
- No structured security/audit logging exists.

### Localization and accessibility

- Committed UI contains English plus a limited Roman-Urdu headline toggle; it is not a centralized, complete translation system.
- No persistent three-language preference or document-level Urdu RTL behavior.
- Backend validation errors are not localized.
- Accessibility has reasonable labels and controls but no automated axe/WCAG suite, keyboard-dialog focus trap or systematic screen-reader audit.

## Security findings

| Priority | Finding | Required remediation |
|---|---|---|
| Critical before public deployment | Development fallback signing secret | Fail closed outside development; require a strong secret from deployment configuration |
| High | Bearer token in `localStorage` and no revocation | Move to Secure, HttpOnly, SameSite cookies with CSRF protection and server-side session/revocation records |
| High | Plaintext CNIC and undefined retention | Minimize collection; encrypt sensitive values, restrict audited access, define deletion/retention |
| High | No rate limiting | Add per-IP/account throttling to login, registration, uploads, messaging and public submission endpoints |
| High | Local public uploads | Decode/re-encode images, strip metadata, use private object storage and signed/controlled delivery |
| Medium | No password policy breach checks or reset | Add policy, reset-token lifecycle and configured delivery provider |
| Medium | No security headers/CSP | Configure CSP, HSTS at deployment, frame and MIME protections |
| Medium | No audit log | Add immutable security and moderation event records without sensitive payloads |
| Medium | SQLite write contention | Use PostgreSQL and transaction/locking tests for multi-user deployment |

## Missing database models/endpoints

Required models: server sessions, password-reset tokens, user profile details, structured service categories, worker services, portfolios, working hours, availability slots, booking status events, reschedule proposals, conversations, messages, notifications, complaints, reports, moderation actions, admin audit events and optional encrypted identity records.

Required endpoint groups:

- `/api/auth/logout`, `/forgot-password`, `/reset-password`, session management.
- `/api/profile` customer/worker read-update-delete and privacy export.
- Worker services, portfolio, working hours and availability endpoints.
- Booking transition/cancel/reschedule/dispute endpoints with role/state authorization.
- Booking-scoped conversations/messages and unread state.
- Complaint/report creation and status endpoints.
- Backend-enforced `/api/admin/*` operations and operational statistics.

## Testing gaps

- No frontend unit/component tests.
- No automated end-to-end browser suite in the repository.
- No authentication expiry/revocation, role-boundary or IDOR test matrix.
- No concurrent acceptance/availability race test.
- No tests for cancellation, rescheduling, disputes or messaging because those features do not exist.
- No database restart/persistence test, migration rollback test or PostgreSQL test target.
- No accessibility automation, localization snapshot/RTL tests or upload fuzzing.
- No CI workflow enforcing checks on pushes and pull requests.

## Deployment blockers

1. SQLite and local uploads are not safe for horizontally scaled or ephemeral hosting.
2. No formal migration tool; schema changes run ad hoc at application import.
3. No production secrets policy or fail-closed configuration.
4. No managed delivery provider for password reset or notifications.
5. No monitoring, structured logs, backups, restore drill or health/readiness separation.
6. No domain/HTTPS/CSP/cookie deployment configuration.

## Prioritized implementation plan

### Phase 1 — Identity, validation and localization foundation

- Pakistani phone normalization and CNIC format normalization on frontend/backend.
- Date-of-birth and guardian rules with explicit privacy copy.
- Centralized `en`, `ur-Latn`, `ur-PK` dictionaries, persisted preference and Urdu RTL.
- Localized validation errors and tests.
- Keep CNIC format validation explicitly separate from NADRA verification.

Exit criteria: backend validation tests, frontend type/lint/build, language persistence and RTL browser checks, existing booking regression pass.

### Phase 2 — Production authentication and account lifecycle

- Server-side sessions in Secure HttpOnly cookies, CSRF protection, logout revocation.
- Customer/worker profile management and account deletion.
- Password-reset token lifecycle behind a delivery-provider interface.
- Provider decision required before sending real reset messages; local development may use a non-delivery sink clearly labeled as such.

Exit criteria: account E2E tests, revocation/expiry/IDOR tests and no secrets/private identifiers in responses or logs.

### Phase 3 — Database and migration foundation

- Introduce SQLAlchemy/SQLModel plus Alembic and PostgreSQL configuration while retaining a local development option.
- Normalize service categories and worker availability models.
- Add object-storage abstraction and metadata-safe image processing.

Exit criteria: migrations from a clean database, persistence across restarts, PostgreSQL integration tests, backup/restore documentation.

### Phase 4 — Complete booking state machine

- Requested → Accepted → In Progress → Completed plus Rejected, Cancelled, Rescheduled and Disputed.
- Explicit state-transition permissions and booking event history.
- Availability slots and transactional overlap prevention.
- Concurrency and unauthorized-transition tests.

### Phase 5 — Booking-scoped communication

- Persistent conversations/messages, unread state, price proposals and notification events.
- Begin with documented polling; do not claim real-time behavior until a websocket/SSE transport is implemented and tested.

### Phase 6 — Trust, safety and admin

- Complaints, reports, moderation actions and backend-enforced admin permissions.
- Admin UI for users, workers, bookings, categories, reports and operational statistics.
- Rate limiting, security headers, audit logging and media hardening.

### Phase 7 — Practical assistance and matching

- Rule-based category suggestions labeled honestly as rules.
- Optional AI provider interface only after privacy/cost approval.
- Skill/location/availability matching with transparent scoring and deterministic fallback.
- Preserve browser voice onboarding and its manual fallback.

### Phase 8 — Release engineering

- CI checks, end-to-end browser suite, accessibility suite, observability and deployment runbook.
- Staging deployment with managed PostgreSQL/object storage, HTTPS and restore verification.
- Production-readiness review; do not label the application production-ready until all blockers are closed.

## External decisions required later

- Password-reset and notification delivery provider (email and/or Pakistan-capable SMS), including cost and sender compliance.
- Managed PostgreSQL host and deployment platform.
- Object-storage/CDN provider and retention policy.
- Whether CNIC collection is genuinely necessary; default recommendation is not to collect it until a documented business/legal need exists.
- Admin ownership/bootstrap method and moderation policy.

## Honest verified-functionality checklist

- [x] Customer and worker registration/login
- [x] Persistent local records across process restarts
- [x] Worker discovery and profile viewing
- [x] Service request, worker accept/reject and simplified completion
- [x] Category review after completion
- [x] Worker photo upload and profile persistence
- [x] Urdu voice onboarding with feature detection/manual fallback
- [ ] Password reset and revocable server session
- [ ] Complete profile/account lifecycle
- [ ] Full booking state machine and calendar
- [ ] Persistent customer-worker messaging
- [ ] Complaints, reports and admin moderation
- [ ] Deployment-grade database/media persistence
- [ ] Production security controls and monitoring

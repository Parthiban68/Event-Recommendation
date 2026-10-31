# EventMatch - Recommended Events

A full-stack event discovery and recommendation platform for developers, with a
public catalogue and a secure admin workspace for managing events.

Candidates select the technologies they know and the topics they want to explore.
The API scores every upcoming published event in PostgreSQL and returns a ranked
list with a transparent explanation for each recommendation.

This project implements the **Recommended Events** technical interview
assignment, including admin authentication, event CRUD, a draft/publish
workflow, public discovery pages, security hardening and automated tests.

- **Frontend:** React 19, Vite 7, TypeScript 5.9, Tailwind CSS 4, Axios, React
  Router 7, React Hook Form
- **Backend:** Node.js, Express 5, TypeScript, Prisma 6, PostgreSQL (Neon)
- **Testing:** Vitest 5, Supertest 7
- **Security:** JWT in an HttpOnly cookie, CSRF double-submit validation,
  origin checks, rate limiting, Helmet and bcrypt password hashing

---

## Table of contents

1. [Features](#features)
2. [Demo walkthrough](#demo-walkthrough)
3. [Project structure](#project-structure)
4. [Recommendation algorithm](#recommendation-algorithm)
5. [Database schema](#database-schema)
6. [API reference](#api-reference)
7. [Local setup](#local-setup)
8. [Environment variables](#environment-variables)
9. [Commands](#commands)
10. [Testing](#testing)
11. [Security](#security)
12. [Design decisions and assumptions](#design-decisions-and-assumptions)
13. [Known limitations](#known-limitations)

---

## Features

### Public experience

- Candidate profile builder with 13 selectable technologies, split into **skills
  you have** and **interests you want to explore**.
- Dedicated `/recommendations` page with ranked results and an explanation of
  every score.
- Dedicated `/events` catalogue with a keyword search and filters for technology,
  category, date range and online/in-person format. All filtering and pagination
  happen in PostgreSQL.
- Event detail page with summary, banner, schedule, timezone, skills, topics and
  the official registration link.
- Published-only visibility: drafts never appear in the public catalogue, public
  detail endpoints or recommendations.
- Responsive SaaS-style UI with loading, empty, error and success states.

### Admin workspace

- Email/password login at `/admin/login` with JWT session cookies.
- Protected dashboard with total, published, draft, upcoming and past counts plus
  recently updated events.
- Event table with search, status filter, pagination, publish/unpublish and
  delete actions.
- Create and edit form with validation for all event fields.
- Draft/publish workflow: incomplete events can be saved as drafts, but
  publishing enforces all required fields and a future date.
- Authenticated admin session recovery after a page refresh.

### API and data

- REST API with a consistent response shape, Zod validation and centralised
  error handling.
- Prisma schema with migrations and an idempotent seed script.
- 24 seeded events: 20 published and 4 drafts, all with future dates.
- Health endpoint that checks the database connection.
- No secrets, password hashes or stack traces returned to clients.

## Demo walkthrough

### Public site

1. Apply migrations and seed the database.
2. Start the API and web app.
3. Open `http://localhost:5173`.
4. Select **React.js** and **TypeScript** as skills and **PostgreSQL** as an
   interest, or click **Try an example**.
5. Submit the form. The UI calls `POST /api/recommendations` and renders ranked
   results.
6. Open **Why this event** on a card to see the exact matching data.
7. Visit `/events` to search and filter the published catalogue.
8. Open an event and use **Register for this event** to open the official URL in
   a new tab.

### Admin site

1. Open `http://localhost:5173/admin/login`.
2. Sign in with the seeded development credentials:
   - Email: `admin@eventhub.dev`
   - Password: `Admin@12345!`
3. Review the dashboard counts and recent activity.
4. Create a draft with only a title; it is accepted and remains private.
5. Try to publish it; the API returns field-level validation errors.
6. Complete the required fields with a future date and publish it.
7. Confirm it appears in the public catalogue and recommendations.
8. Unpublish or delete it from the admin event table.

These credentials are for local development only. Set strong values through
environment variables for any shared deployment.

## Project structure

```text
interview/
|-- client/
|   |-- src/
|   |   |-- components/
|   |   |   |-- admin/{ProtectedAdminRoute,StatusBadge,TagMultiSelect}.tsx
|   |   |   |-- events/EventCard.tsx
|   |   |   |-- home/{Hero,InterestSelector,SearchBar,FilterBar,HowItWorks}.tsx
|   |   |   |-- layout/{Navbar,Footer}.tsx
|   |   |   |-- ui/{Badge,EmptyState,ErrorState,LoadingSkeletons,ScoreBadge}.tsx
|   |   |   `-- ScrollToTop.tsx
|   |   |-- constants/interests.ts
|   |   |-- contexts/AuthContext.tsx
|   |   |-- hooks/useDebouncedValue.ts
|   |   |-- layouts/{RootLayout,AdminLayout}.tsx
|   |   |-- pages/
|   |   |   |-- admin/{AdminLoginPage,AdminDashboardPage,AdminEventsPage,AdminEventFormPage}.tsx
|   |   |   `-- {HomePage,EventsPage,RecommendationsPage,EventDetailsPage,NotFoundPage}.tsx
|   |   |-- services/api.ts
|   |   |-- types/index.ts
|   |   |-- utils/{cn,format}.ts
|   |   |-- validation/adminEvent.ts
|   |   |-- App.tsx
|   |   |-- main.tsx
|   |   `-- index.css
|   |-- .env.example
|   |-- index.html
|   |-- package.json
|   |-- tsconfig.json
|   `-- vite.config.ts
|-- server/
|   |-- prisma/
|   |   |-- migrations/
|   |   |   |-- 20261031000000_init/migration.sql
|   |   |   `-- 20261031010000_admin_and_event_management/migration.sql
|   |   |-- schema.prisma
|   |   `-- seed.ts
|   |-- src/
|   |   |-- config/{env,cookies}.ts
|   |   |-- controllers/{event,recommendation,health,admin-auth,admin-event,dashboard}.controller.ts
|   |   |-- lib/{prisma,logger}.ts
|   |   |-- middlewares/
|   |   |   |-- {validate,error,notFound,auth,csrf,adminOrigin,rateLimit,requestLog}.middleware.ts
|   |   |-- repositories/{event,admin}.repository.ts
|   |   |-- routes/
|   |   |   |-- admin/{index,auth,event,dashboard}.routes.ts
|   |   |   `-- {event,recommendation,health}.routes.ts
|   |   |-- services/
|   |   |   |-- admin-event.service.ts
|   |   |   |-- auth.service.ts
|   |   |   |-- dashboard.service.ts
|   |   |   |-- event.service.ts
|   |   |   |-- recommendation.scoring.ts
|   |   |   `-- recommendation.service.ts
|   |   |-- types/express.d.ts
|   |   |-- utils/{ApiError,asyncHandler,auth,date,tags,url}.ts
|   |   |-- validators/{event,recommendation,admin-event,auth}.validator.ts
|   |   |-- app.ts
|   |   |-- container.ts
|   |   `-- server.ts
|   |-- tests/
|   |   |-- integration/{recommendations,admin}.db.test.ts
|   |   |-- api.validation.test.ts
|   |   |-- recommendation.scoring.test.ts
|   |   `-- setup.ts
|   |-- .env.example
|   |-- package.json
|   |-- tsconfig.json
|   |-- tsconfig.build.json
|   `-- vitest.config.ts
|-- .gitignore
`-- README.md
```

The frontend and backend are independent npm projects. Run commands inside
`client/` or `server/`; there is no root package.

## Recommendation algorithm

The scoring logic lives in `server/src/services/recommendation.scoring.ts` and is
made of pure functions so it can be tested without a database.
`RecommendationService` loads upcoming published candidates from PostgreSQL and
passes them to those functions.

### Candidate input

```json
{
  "skills": ["Node.js", "Express.js"],
  "interests": ["React.js", "PostgreSQL"]
}
```

Candidate tags are canonicalised and validated against the supported list:
React.js, Next.js, Node.js, Express.js, NestJS, TypeScript, PostgreSQL, MongoDB,
Python, AI/ML, AWS, Docker and System Design. Common aliases such as `react`,
`nodejs`, `postgres` and `Node.js Backend` are normalised to canonical tags.

### Scoring

```text
skillScore    = (matchedSkills / requiredSkills) * 40
interestScore = (matchedInterests / interestPool) * 35
dateScore     = 25 | 20 | 15 | 10 | 5
totalScore    = skillScore + interestScore + dateScore
relevance%    = round(totalScore, 1)
```

- `requiredSkills` is the event's de-duplicated `requiredSkills` array.
- `interestPool` is the de-duplicated union of the event's `interests` and
  `requiredSkills`, so interests can match both topic tags and relevant
  technologies.
- If either denominator is zero, the corresponding component scores 0.
- Component scores are clamped to their maximum weights.
- Tags are compared case-insensitively through the alias map.

### Date relevance

| Days until event | Points |
| ---------------- | ------ |
| 0-7              | 25     |
| 8-30             | 20     |
| 31-60            | 15     |
| 61-90            | 10     |
| 91+              | 5      |

Events with no date, a date in the past or a non-published status are excluded
before scoring.

### Ranking and explanations

Results are sorted by total score descending, then by soonest event date, then by
title. Each result includes `matchedSkills`, `matchedInterests`, a score
breakdown, `daysUntil` and a generated explanation derived only from actual
event data.

## Database schema

Two Prisma models are defined in `server/prisma/schema.prisma`.

### Admin

| Field          | Notes                                      |
| -------------- | ------------------------------------------ |
| `id`           | UUID primary key                           |
| `name`         | Display name                               |
| `email`        | Unique, lower-cased login identifier       |
| `passwordHash` | bcrypt hash; never returned by the API     |
| `isActive`     | Deactivated admins cannot authenticate     |
| `createdAt`    | Timestamp                                  |
| `updatedAt`    | Timestamp                                  |
| `events`       | Events created by this admin               |

### Event

| Field             | Notes                                                   |
| ----------------- | ------------------------------------------------------- |
| `id`              | UUID primary key                                        |
| `title`           | Unique                                                  |
| `seedKey`         | Optional unique key used by the idempotent seed         |
| `summary`         | Short card summary, default empty                       |
| `description`     | Full description, default empty                         |
| `category`        | Category label, default empty                           |
| `requiredSkills`  | String array                                            |
| `interests`       | String array                                            |
| `bannerUrl`       | Optional http(s) image URL                              |
| `eventDate`       | Nullable date; required before publishing               |
| `startTime`       | `HH:MM`, default empty                                  |
| `endTime`         | Optional `HH:MM`                                        |
| `timezone`        | IANA timezone, default `UTC`                            |
| `location`        | Venue or online location, default empty                 |
| `isOnline`        | Boolean, default `false`                                |
| `registrationUrl` | Official registration URL, default empty                |
| `status`          | `DRAFT` or `PUBLISHED`, default `DRAFT`                 |
| `createdById`     | Optional admin owner, `onDelete: Restrict`              |
| `createdAt`       | Timestamp                                               |
| `updatedAt`       | Timestamp                                               |

Indexes cover `category`, `eventDate`, `isOnline`, `status`, `createdById` and
`(eventDate, isOnline)`.

## API reference

All responses use one of these shapes:

```json
{ "success": true, "data": {}, "meta": {} }
```

```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Request validation failed",
    "details": [{ "path": "email", "message": "Enter a valid email address" }]
  }
}
```

### Public API

| Method | Endpoint              | Description                                                        |
| ------ | --------------------- | ------------------------------------------------------------------ |
| GET    | `/api/health`         | Health and database status                                         |
| GET    | `/api/events`         | Paginated upcoming **published** events with search and filters    |
| GET    | `/api/events/:id`     | Published event detail                                             |
| POST   | `/api/recommendations`| Ranked recommendations for a candidate profile                     |

`GET /api/events` query parameters:

- `search` - matches title, summary and description
- `category` - case-insensitive category match
- `technology` - matches `requiredSkills` or `interests`
- `dateFrom`, `dateTo` - `YYYY-MM-DD` bounds
- `isOnline` - `true` or `false`
- `page` (default 1) and `limit` (default 9 in the UI, maximum 50)

Public event listing is always constrained to `status = PUBLISHED` and events
dated today or later. Public detail is constrained to `PUBLISHED`.

### Admin authentication

| Method | Endpoint                    | Description                                  |
| ------ | --------------------------- | -------------------------------------------- |
| POST   | `/api/admin/auth/login`     | Sign in and set session + CSRF cookies       |
| GET    | `/api/admin/auth/session`   | Current admin and CSRF token                 |
| POST   | `/api/admin/auth/logout`    | Clear cookies (requires session and CSRF)    |

Cookies:

- `eventmatch_admin` - JWT, `HttpOnly`, `SameSite=Lax`, `Secure` in production
- `eventmatch_csrf` - readable CSRF token for the double-submit header

State-changing admin requests must send `X-CSRF-Token` equal to both cookies and
the JWT `csrf` claim.

### Admin events and dashboard

All routes below require a valid admin session.

| Method | Endpoint                          | Description                                  |
| ------ | --------------------------------- | -------------------------------------------- |
| GET    | `/api/admin/dashboard/stats`      | Total/published/draft/upcoming/past counts   |
| GET    | `/api/admin/dashboard/recent-events` | Six most recently updated events          |
| GET    | `/api/admin/events`               | Paginated admin list with search/status      |
| POST   | `/api/admin/events`               | Create a draft or published event            |
| GET    | `/api/admin/events/:id`           | Full event for editing                       |
| PUT    | `/api/admin/events/:id`           | Update an event and/or its status            |
| PATCH  | `/api/admin/events/:id/status`    | Publish or unpublish                         |
| DELETE | `/api/admin/events/:id`           | Permanently delete an event                  |

Publishing requires:

- title of at least 5 characters
- summary of at least 10 characters
- description of at least 30 characters
- category of at least 2 characters
- at least one required skill and one interest
- a future event date, start time and valid IANA timezone
- a venue or online location
- a valid http(s) registration URL
- `endTime` after `startTime` when both are present

Incomplete events can still be saved as drafts. Drafts are excluded from all
public endpoints.

### Error codes

| Status | Code                | When                                             |
| ------ | ------------------- | ------------------------------------------------ |
| 400    | `VALIDATION_ERROR`  | Invalid input or incomplete publish              |
| 401    | `UNAUTHORIZED`      | Missing, invalid or expired admin session        |
| 403    | `FORBIDDEN`         | CSRF or origin validation failure                |
| 404    | `NOT_FOUND`         | Unknown route or event                           |
| 409    | `CONFLICT`          | Unique constraint or related-data conflict       |
| 413    | `VALIDATION_ERROR`  | Request body over the size limit                 |
| 429    | `RATE_LIMITED`      | Too many requests                                |
| 503    | `SERVICE_UNAVAILABLE` | Database unavailable                           |

## Local setup

### Prerequisites

- Node.js 20.19 or newer (tested on Node 24)
- A PostgreSQL database (Neon or local)
- npm 10 or newer

### 1. Install dependencies

Run these separately inside each project:

```powershell
cd server
npm install

cd ../client
npm install
```

### 2. Configure the server

```powershell
cd server
Copy-Item .env.example .env
```

Fill in `DATABASE_URL`, `CLIENT_ORIGIN`, `JWT_SECRET` and the seed admin values.
Use a Neon pooled connection string for the application. Apply migrations with
`prisma migrate deploy` or use a direct URL for `prisma migrate dev`.

### 3. Apply migrations and seed

```powershell
cd server
npm run prisma:generate
npm run prisma:deploy
npm run db:seed
```

The seed is idempotent. It creates or updates 24 events and the admin account
without overwriting the existing password.

### 4. Run both apps

Terminal 1:

```powershell
cd server
npm run dev
```

Terminal 2:

```powershell
cd client
npm run dev
```

Open:

- Public app: `http://localhost:5173`
- Events catalogue: `http://localhost:5173/events`
- Recommendations: `http://localhost:5173/recommendations`
- Admin login: `http://localhost:5173/admin/login`
- API health: `http://localhost:4000/api/health`

If Prisma reports `EPERM` while regenerating on Windows, stop the running API
process first because it holds the query engine DLL.

## Environment variables

### `server/.env`

| Variable                         | Required | Default                     | Purpose                                              |
| -------------------------------- | -------- | --------------------------- | ---------------------------------------------------- |
| `DATABASE_URL`                   | Yes      | -                           | PostgreSQL connection string                          |
| `NODE_ENV`                       | No       | `development`               | `development`, `test` or `production`                |
| `PORT`                           | No       | `4000`                      | API port                                             |
| `CLIENT_ORIGIN`                  | Yes      | -                           | Comma-separated allowed browser origins               |
| `JWT_SECRET`                     | Yes      | dev-only fallback           | At least 32 characters; required in production       |
| `JWT_EXPIRES_IN`                 | No       | `30m`                       | Session lifetime                                     |
| `SESSION_COOKIE_NAME`            | No       | `eventmatch_admin`          | Session cookie name                                  |
| `CSRF_COOKIE_NAME`               | No       | `eventmatch_csrf`           | CSRF cookie name                                     |
| `SEED_ADMIN_NAME`                | No       | `EventHub Admin`            | Seeded admin display name                            |
| `SEED_ADMIN_EMAIL`               | No       | `admin@eventhub.dev`        | Seeded admin email                                   |
| `SEED_ADMIN_PASSWORD`            | Prod     | dev-only fallback           | At least 12 characters; required in production       |
| `GENERAL_RATE_LIMIT_MAX`         | No       | `600`                       | General requests per window                          |
| `GENERAL_RATE_LIMIT_WINDOW_MS`   | No       | `900000`                    | General rate-limit window                            |
| `LOGIN_RATE_LIMIT_MAX`           | No       | `10`                        | Failed login attempts per window                     |
| `LOGIN_RATE_LIMIT_WINDOW_MS`     | No       | `900000`                    | Login rate-limit window                              |
| `RECOMMENDATION_RATE_LIMIT_MAX`  | No       | `60`                        | Recommendation requests per window                   |
| `RECOMMENDATION_RATE_LIMIT_WINDOW_MS` | No   | `900000`                    | Recommendation rate-limit window                     |
| `LOG_LEVEL`                      | No       | `info`                      | pino log level                                       |

### `client/.env`

| Variable                | Default                        | Purpose                                    |
| ----------------------- | ------------------------------ | ------------------------------------------ |
| `VITE_API_URL`          | `/api`                         | API base URL; Vite proxies `/api` in dev   |
| `VITE_CSRF_COOKIE_NAME` | `eventmatch_csrf`              | Must match the server CSRF cookie name     |

Do not commit `.env` files or real credentials.

## Commands

### Server

```powershell
cd server
npm run dev             # tsx watch
npm run build           # compile to dist/
npm start               # run compiled server
npm run typecheck       # tsc --noEmit
npm test                # unit and API tests (DB tests skipped)
npm run prisma:generate
npm run prisma:migrate  # migrate dev
npm run prisma:deploy   # apply committed migrations
npm run db:seed
npm run db:reset        # destructive: reset and reseed
```

### Client

```powershell
cd client
npm run dev
npm run build           # typecheck and production build
npm run typecheck
npm run preview
```

## Testing

### Server tests

```powershell
cd server
npm test
```

This runs the scoring unit tests, API validation tests and public API tests that
do not require a database. Database tests are skipped by default.

To run the PostgreSQL integration suite against the configured database:

```powershell
cd server
$env:RUN_DB_TESTS="1"; npm test
```

The integration suite covers:

- recommendation ranking and date/status exclusion
- public published-only filtering, detail and health
- admin login, session recovery and logout
- protected dashboard access
- draft creation and public invisibility
- field-level publish validation
- CSRF and origin enforcement
- fully validated publish, public visibility, unpublish and delete
- password-hash redaction and secure cookie flags

The suite creates a temporary admin and temporary events, then removes them in
`afterAll`.

### Client tests

```powershell
cd client
npm test
```

These cover date/URL formatting helpers and the admin event form schema,
including drafts with cleared optional fields and unsafe URL rejection.

### Test coverage summary

- 11 client tests
- 32 server tests run without a database
- 50 server tests run with `RUN_DB_TESTS=1`
- Unit coverage includes score boundaries, aliases, empty arrays, past dates and
  ordering

## Security

- Passwords are hashed with bcrypt (cost 12 in seed, lower cost only in tests).
- Login compares against a dummy hash for unknown emails to reduce user
  enumeration through timing.
- JWTs use HS256, a strict claims schema, a 30-minute default expiry, and are
  stored in HttpOnly cookies.
- CSRF uses a double-submit token bound to the JWT claim.
- Admin state-changing requests validate `Origin` against configured origins.
- Rate limits protect the whole API, login attempts and recommendations.
- Helmet sets security headers; JSON bodies are size-limited.
- Admin password hashes are never serialized.
- Prisma errors are mapped to safe client messages; stack traces stay in logs.
- CORS allows credentials only for configured origins.

## Design decisions and assumptions

- **Single-admin-capable role model:** the schema supports multiple admins, but
  the assignment only needs an admin role. No public user accounts are created.
- **JWT cookie over server sessions:** it keeps the API stateless while still
  protecting the token from JavaScript. Logout clears cookies; there is no
  server-side denylist.
- **Draft-first workflow:** requiring every field to create an event would make
  admin authoring frustrating. Drafts hold incomplete work, while publishing is
  strict.
- **Published-only public surface:** drafts are excluded at the repository level
  so they cannot leak through listing, detail or recommendation endpoints.
- **Upcoming public listing:** the catalogue shows events from today onward, while
  published past events remain reachable by direct detail URL for reference.
- **Technologies are constrained:** skills and interests use the 13 supported
  technology tags for consistent scoring. Seeded `interests` may also include
  category-style labels such as "Backend"; the recommendation engine compares
  only the selected technology tags.
- **Server-side filtering:** search, filters and pagination are SQL queries, not
  client-side array filtering.
- **Stable seed:** `seedKey` and title upserts let the script run repeatedly
  without duplicating events or resetting an existing admin password.
- **No root package:** each app owns its dependencies and scripts.

## Known limitations

- Admin sessions cannot be revoked before expiry because there is no token
  denylist or session table.
- There is no audit log or event history; updates overwrite previous values.
- Recommendations use a fixed weighting model rather than learning from clicks.
- Banner images are external URLs; there is no upload pipeline or image proxy.
- The Neon credentials used during development must be rotated before the
  repository is shared publicly or deployed.
- There is no CI pipeline or container configuration in this repository.
- The admin UI handles one role; finer permissions would need a role field.

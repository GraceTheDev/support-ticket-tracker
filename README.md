# Support Ticket Tracker

## For assessors (quick access)

| Item | Value |
|------|--------|
| **Deployed app (HTTPS)** | https://support-ticket-tracker-ddx4.onrender.com/|
| **Access** | **No login required.** No demo credentials. Open the URL and choose **Log a ticket** or **Support desk**. |
| **Swagger / API docs** | https://support-ticket-tracker-ddx4.onrender.com/api-docs |
| **Source repository** | https://github.com/GraceTheDev/support-ticket-tracker |
| **Commit SHA (40 chars)** | `c672b4f3317a7036361d4378d842b496b39df77d` |

Cold start on free Render may take 30–60 seconds on the first request.

**No login required.** Demo-only sample data. 

## Deployed app

| Item | Value |
|------|--------|
| **Public HTTPS URL** | https://support-ticket-tracker-ddx4.onrender.com/|
| **Access** | No login / no credentials |
| **API example** | `GET /api/tickets/summary` |
| **Swagger docs** | `/api-docs` (OpenAPI JSON: `/api-docs.json`) |

## Stack

- **Frontend:** React + TypeScript — requester page + support desk page
- **Backend:** Node.js + Express (TypeScript)
- **Database:** MongoDB Atlas (persists across restarts and redeploys)
- **Containers:** Docker (root `Dockerfile` serves UI + API)

## Prerequisites

- Node.js 18+
- npm 9+
- Docker Desktop (optional; for local MongoDB)
- Git

## Exact run commands

### Option A — full stack with Docker (UI + API + MongoDB)

```bash
docker compose up --build
```

- App UI + API: http://localhost:3000  
- Health: http://localhost:3000/health  
- Data survives `docker compose restart` via the `mongo_data` volume

Load demo tickets (API/Mongo must be reachable):

```bash
cd backend && npm run seed
```

### Option B — local development

```bash
# Terminal 1 — MongoDB
docker compose up mongo -d

# Terminal 2 — API
cd backend
cp .env.example .env   # if needed
npm install
npm run seed           # optional sample dataset
npm run dev            # http://localhost:3000

# Terminal 3 — Frontend
cd Frontend
npm install
npm run dev            # http://localhost:5173 (proxies /api → :3000)
```

## Exact test commands

```bash
cd backend
npm install
npm test
```

**18 tests passing.** Coverage includes:

- Validation (empty title, invalid priority/status, query filters)
- Happy path create → status moves (with comment) → search/filter → summary counts
- Agent priority change with comment
- Invalid status updates return `400`

## Sample dataset

File: `backend/src/data/sample-tickets.json

```bash
cd backend
npm run seed
```


## How to try the deployed app

1. Open the public HTTPS URL (table above).  
2. **Log a ticket** — submit title, priority, description.  
3. Return Home → **Support desk** — filter, change status/priority (comment required), view summary.  
4. Refresh the page — data remains (MongoDB Atlas).

### Testable API examples (replace host)

```bash
curl -s https://YOUR-RENDER-URL.onrender.com/health
curl -s https://YOUR-RENDER-URL.onrender.com/api/tickets/summary
curl -s "https://YOUR-RENDER-URL.onrender.com/api/tickets?status=Open"
```

```

## API reference

**Interactive docs (Swagger UI):** http://localhost:3000/api-docs  
**OpenAPI JSON:** http://localhost:3000/api-docs.json  

On the deployed app: `{DEPLOYED_URL}/api-docs` (e.g. https://support-ticket-tracker-ddx4.onrender.com/api-docs).

Base path: `/api/tickets`

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/tickets` | Create ticket |
| `GET` | `/api/tickets` | List / search (`search`) / filter (`status`, `priority`) |
| `GET` | `/api/tickets/summary` | Total + counts by status |
| `GET` | `/api/tickets/:id` | Get one ticket (numeric id) |
| `PATCH` | `/api/tickets/:id` | Update fields |
| `PATCH` | `/api/tickets/:id/status` | Move status (requires `comment`) |
| `PATCH` | `/api/tickets/:id/priority` | Agent priority change (requires `comment`) |
| `DELETE` | `/api/tickets/:id` | Delete ticket |

Priorities: `low` | `medium` | `high`  
Statuses: `Open` | `In progress` | `Resolved` (default on create: `Open`)

Empty titles, invalid priorities, and invalid statuses are rejected with HTTP `400` and helpful error messages.


## Design decisions

- **MongoDB Atlas** for durable storage so tickets and summary counts survive restarts (not in-memory-only).
- **Two UI entry points** without login: **Log a ticket** (requesters create + view) and **Support desk** (agents filter, update status/priority with comments).
- **Express + Mongoose** keep the API thin: routes → controllers → model, with shared validation helpers.
- **Single Docker image** builds the Vite frontend and serves it from Express so one HTTPS service hosts UI + API.
- **Statuses** use the challenge wording exactly (`Open`, `In progress`, `Resolved`).

## Known limitations

- No authentication (intentional for a short demo; roles are chosen on the landing page).
- No pagination; suitable for small support queues.
- Title search is case-insensitive substring match.
- Free-tier Render may sleep after idle time (cold start).
- Secrets (`MONGODB_URI`) live only in Render env vars — never in the repo.

## Deployment
 **Render + MongoDB Atlas**.

### MongoDB Atlas

1. Free M0 cluster + database user + Network Access `0.0.0.0/0`.  
2. Connection string with database name `support-ticket-tracker`.  
3. Set as Render env var `MONGODB_URI` only (never commit).

### Render

- Runtime: **Docker**, Dockerfile `./Dockerfile`, branch `main`, health `/health`  
- Env: `MONGODB_URI`, `PORT=3000`

### Local production-like run

```bash
cd Frontend && npm install && npm run build
mkdir -p backend/public && cp -R Frontend/dist/* backend/public/
cd ../backend && npm install && npm run build && npm start
```

## AI disclosure

**AI tools used:** Cursor (Composer agent).

**Helped with:** scaffolding Express/React TypeScript and making the coding faster, validation and ticket API, React UI (landing, logger page, support desk)

**How output was checked:** ran `npm test` (18 passing), manual curl acceptance flow against MongoDB, frontend `npm run build`, health/summary checks, and review of validation rules against the brief (empty title, invalid priority/status, status transitions with comments, summary counts, persistence).

API Documentation 
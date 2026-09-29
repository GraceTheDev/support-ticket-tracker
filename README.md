# Support Ticket Tracker

Help a small support team track requests from arrival to resolution.

**No login required.** Open the web UI and use the API freely with demo-only sample data.

## Deployed app

| Item | Value |
|------|--------|
| **Public HTTPS URL** | _Not published yet — you must deploy (see [Deployment](#deployment))_ |
| **Access** | No login / no credentials once live |
| **Health check** | `GET /health` on your host |
| **API example** | `GET /api/tickets/summary` |

Docker + MongoDB persistence, tests, sample data, and a production Dockerfile (UI + API) are ready. A temporary local tunnel was attempted but is **not** suitable for marking (unstable / machine must stay online). Publish on Render (or similar) with MongoDB Atlas before submission and paste the HTTPS URL here.

## Stack

- **Frontend:** React + TypeScript (Vite)
- **Backend:** Node.js + Express (TypeScript)
- **Database:** MongoDB (persists across restarts)
- **Containers:** Docker Compose (full app + MongoDB)

## Prerequisites

- Node.js 18+
- npm 9+
- Docker Desktop (recommended for MongoDB / full stack)
- Git (optional, for repository submission)

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

Tests cover:

- Validation (empty title, invalid priority/status, query filters)
- Happy path create → status moves → search/filter → summary counts
- Invalid status updates return `400`

## Sample dataset

File: `backend/src/data/sample-tickets.json` (demo-only; no real customer data).

```bash
cd backend
npm run seed
```

Includes:

- **Cannot reset password** · Priority: high · Status: Open  
- **Billing portal timeout** · Priority: medium · Status: Open  
- **Update company address** · Priority: low · Status: In progress  

## Acceptance scenario

```bash
# 1. Create two tickets with different priorities
curl -s -X POST http://localhost:3000/api/tickets \
  -H "Content-Type: application/json" \
  -d '{"title":"Cannot reset password","description":"Reset link fails","priority":"high"}'

curl -s -X POST http://localhost:3000/api/tickets \
  -H "Content-Type: application/json" \
  -d '{"title":"Billing portal timeout","description":"Page hangs on load","priority":"medium"}'

# 2. Move the first ticket: Open → In progress → Resolved (replace TICKET_ID)
curl -s -X PATCH http://localhost:3000/api/tickets/TICKET_ID/status \
  -H "Content-Type: application/json" \
  -d '{"status":"In progress","comment":"Investigating the issue."}'

curl -s -X PATCH http://localhost:3000/api/tickets/TICKET_ID/status \
  -H "Content-Type: application/json" \
  -d '{"status":"Resolved","comment":"Issue fixed and confirmed with user."}'

# 3. Filter remaining Open tickets
curl -s "http://localhost:3000/api/tickets?status=Open"

# 4. Restart and verify persistence
docker compose restart app
curl -s http://localhost:3000/api/tickets
curl -s http://localhost:3000/api/tickets/summary
```

## API reference

Base path: `/api/tickets`

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/tickets` | Create ticket |
| `GET` | `/api/tickets` | List / search (`search`) / filter (`status`, `priority`) |
| `GET` | `/api/tickets/summary` | Total + counts by status |
| `GET` | `/api/tickets/:id` | Get one ticket |
| `PATCH` | `/api/tickets/:id` | Update fields |
| `PATCH` | `/api/tickets/:id/status` | Move status (requires `comment`) |
| `PATCH` | `/api/tickets/:id/priority` | Agent priority change (requires `comment`) |
| `DELETE` | `/api/tickets/:id` | Delete ticket |

Priorities: `low` | `medium` | `high`  
Statuses: `Open` | `In progress` | `Resolved` (default on create: `Open`)

Empty titles, invalid priorities, and invalid statuses are rejected with HTTP `400` and helpful error messages.

## Design decisions

- **MongoDB** for durable storage so tickets and summary counts survive restarts (requirement: not in-memory-only).
- **Express + Mongoose** keep the API thin: routes → controllers → model, with shared validation helpers for create/update/query.
- **React UI** mirrors the same workflow (create, filter, advance status, live summary) for assessors who prefer a browser over curl.
- **Single Docker image** builds the Vite frontend into `backend/public` and serves it from Express so one HTTPS service can host both UI and API.
- **Statuses** use the challenge wording exactly (`Open`, `In progress`, `Resolved`), including the space in `In progress`.

## Known limitations

- No authentication or role-based access (intentional for a small demo; not production-hardened).
- No pagination; suitable for small support queues.
- Title search is case-insensitive substring match, not full-text ranking.
- Free-tier cloud hosts may sleep after idle time (cold start).
- Public deployment requires a MongoDB URI (e.g. Atlas) and a host account (Render/Fly/Railway); see below.

## Deployment

Follow these steps in order. You need free accounts on **MongoDB Atlas**, **GitHub**, and **Render**.

### Part 1 — MongoDB Atlas

1. Go to [mongodb.com/atlas](https://www.mongodb.com/atlas) → sign up / log in.
2. **Create** → **M0 FREE** → pick a nearby region → **Create Deployment**.
3. **Database Access** → **Add New Database User**  
   - Auth: Password  
   - Username e.g. `support-demo`  
   - Save the password  
   - Privileges: **Read and write to any database**
4. **Network Access** → **Add IP Address** → **Allow Access from Anywhere** (`0.0.0.0/0`) for the demo.
5. **Database** → **Connect** → **Drivers** → copy the URI and edit it:

```
mongodb+srv://support-demo:YOUR_PASSWORD@cluster0.xxxxx.mongodb.net/support-ticket-tracker?retryWrites=true&w=majority
```

- Replace `YOUR_PASSWORD` (URL-encode special characters).  
- Keep the database name `support-ticket-tracker` before `?`.  
- **Do not commit this URI** — paste it only into Render as `MONGODB_URI`.

### Part 2 — Push to GitHub

```bash
cd "/Users/macbook/support ticket tracker"
git init -b main   # if not already a repo
git add .
git commit -m "Support Ticket Tracker — exam submission"
```

1. On GitHub, create a **new empty** repository (no README).
2. Then:

```bash
git remote add origin https://github.com/YOUR_USERNAME/support-ticket-tracker.git
git push -u origin main
```

### Part 3 — Deploy on Render

1. Go to [render.com](https://render.com) → sign up / log in.
2. **New +** → **Web Service** → connect GitHub → select this repo.
3. Settings:

| Setting | Value |
|--------|--------|
| Name | `support-ticket-tracker` |
| Language / Runtime | **Docker** |
| Branch | `main` |
| Dockerfile path | `./Dockerfile` |
| Instance | **Free** |
| Health check path | `/health` |

4. Environment variables:

| Key | Value |
|-----|--------|
| `MONGODB_URI` | Your Atlas URI from Part 1 |
| `PORT` | `3000` |

5. **Create Web Service**. First build takes ~5–10 minutes.  
   Logs should show: `MongoDB connected: support-ticket-tracker` and `Server listening on port 3000`.

### Part 4 — Verify

Open `https://YOUR-SERVICE.onrender.com` (no login).

- UI loads  
- `GET /health`  
- `GET /api/tickets/summary`  
- Run the acceptance scenario in the browser; refresh to confirm Atlas persistence  

Free Render apps may sleep; first load can take 30–60 seconds.

### Part 5 — Update this README

Replace the Deployed app table at the top with your live URL, then commit and push again.

### Local production-like run

```bash
cd Frontend && npm install && npm run build
mkdir -p backend/public && cp -R Frontend/dist/* backend/public/
cd ../backend && npm install && npm run build && npm start
```

## Submission notes

- Exclude `node_modules/`, `dist/`, `.env` from any ZIP (max 15 MB).
- Do not commit secrets; use `.env.example` only.
- If submitting a repository URL, include the full 40-character commit SHA.

## AI disclosure

**AI tools used:** Cursor (Composer agent).

**Helped with:** scaffolding Express/React TypeScript project structure, Docker setup, validation and ticket API, React UI, automated tests, sample seed data, and README/checklist alignment.

**How output was checked:** ran `npm test`, manual curl acceptance flow against a live MongoDB instance, frontend build (`npm run build`), health/summary checks through the Vite proxy, and a line-by-line review of validation rules against the brief (empty title, invalid priority/status, status transitions, summary counts, persistence).

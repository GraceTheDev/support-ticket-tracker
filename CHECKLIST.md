# Challenge checklist

## Required functionality

| Requirement | Status | Evidence |
|-------------|--------|----------|
| Create ticket (title, description, priority, unique ID) | Done | `POST /api/tickets`, UI form; numeric IDs from 1 |
| List + search by title; filter status/priority | Done | `GET /api/tickets?search&status&priority`, UI filters |
| Move Open → In progress → Resolved; timestamps | Done | `PATCH /api/tickets/:id/status` + comment |
| Agent can change priority | Done | `PATCH /api/tickets/:id/priority` + comment |
| Reject empty titles, invalid priorities/statuses | Done | API `400` + UI validation; tests |
| Total tickets + counts by status | Done | `GET /api/tickets/summary`, UI summary |
| Persist across restarts | Done | MongoDB / Atlas |
| Acceptance scenario | Done | `tickets.api.test.ts` + README |
| Sample dataset | Done | `npm run seed` |
| Automated tests | Done | `cd backend && npm test` |
| README (setup, usage, design, limits, AI) | Done | Root `README.md` |
| Public HTTPS deployed app | **Do Parts 1–5 in README** | Atlas + GitHub + Render |

## Your remaining steps

1. **Atlas** — free cluster + user + `0.0.0.0/0` + connection URI  
2. **GitHub** — create empty repo → `git push -u origin main`  
3. **Render** — Docker web service + `MONGODB_URI`  
4. Paste live HTTPS URL into README + CHECKLIST  
5. Submit ZIP or repo URL + full commit SHA  

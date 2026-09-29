# Assessors — submission map

This project meets the common requirements as follows.

| Requirement | Where to find it |
|-------------|------------------|
| Deployed HTTPS app (not repo-only) | README **For assessors** → Public URL (Render) |
| Access instructions / no login | README: **No login required** |
| Testable API endpoint | `{URL}/health`, `{URL}/api/tickets/summary` |
| Persist across restarts | MongoDB Atlas |
| Automated tests | `cd backend && npm test` (18 tests) |
| README: prerequisites, run/test, usage, design, limits | Root `README.md` |
| Sample dataset | `backend/src/data/sample-tickets.json` + `npm run seed` |
| AI disclosure | README **AI disclosure** |
| Source + commit SHA | https://github.com/GraceTheDev/support-ticket-tracker @ `a3077c137d392ed71eaf910bb0f69612caf66c99` |
| No secrets in source | `.env` gitignored; Atlas URI only on Render |

## Before you submit

1. Confirm Render is **Live** and paste the URL into README (both tables).  
2. Open the URL → Log a ticket / Support desk → create & resolve a ticket.  
3. Hit `/health` and `/api/tickets/summary`.  
4. Submit **repo URL + full 40-character SHA**, or a ZIP without `node_modules`/`dist`/`.env`.  
5. Keep Render + Atlas running for marking.  

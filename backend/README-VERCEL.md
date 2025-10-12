Backend on Vercel (Serverless) - Quick Guide

1) What was prepared
- api/index.js serverless entrypoint (exports the Express app from src/index.js)
- vercel.json routing all paths to api/index.js
- paths.js writes uploads to /tmp when VERCEL env is present

2) Environment variables
- DB_* (or MYSQL* from host), JWT_SECRET, FRONTEND_BASE_URL, etc.
- EMAIL: EMAIL_PROVIDER=resend (recommended), RESEND_API_KEY, RESEND_USE_SANDBOX=true, RESEND_SANDBOX_FROM=onboarding@resend.dev, EMAIL_ENABLED=true
- To force lightweight emails globally (no attachments):
	- FORCE_SIMPLE_TICKET=1
	- or EMAIL_TICKET_MODE=lite

3) Limitations on Vercel
- File writes must use /tmp (ephemeral). We already route uploads there at runtime.
- Long operations should avoid large attachments. Prefer sending links (send-ticket-lite endpoint).

4) Test endpoints
- GET /api/health -> should return ok
- POST /api/sph-participants/:id/send-ticket-lite -> sends lightweight email (no attachments)

5) Notes
- If you need persistent storage for generated files, use an object storage (S3/R2) instead of local filesystem.

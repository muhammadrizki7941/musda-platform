# Email Provider Integration

## Overview
This backend now supports a pluggable email provider layer with priority:
1. Resend (modern API) if `EMAIL_PROVIDER=resend` and `RESEND_API_KEY` present.
2. Fallback SMTP (Gmail or other) via Nodemailer.

## Environment Variables
| Name | Required | Description |
|------|----------|-------------|
| EMAIL_ENABLED | yes | `true` to enable sending; `false` skips actual send. |
| EMAIL_PROVIDER | optional | Set to `resend` to use Resend. Otherwise uses SMTP. |
| RESEND_API_KEY | required if provider=resend | API key from dashboard.resend.com. |
| EMAIL_FROM | optional | Custom From header (e.g. `MUSDA HIMPERRA <noreply@musda.local>`). |
| SMTP_HOST | required for SMTP fallback | e.g. `smtp.gmail.com`. |
| SMTP_PORT | required for SMTP fallback | e.g. `587`. |
| SMTP_USER | required for SMTP fallback | SMTP auth user. |
| SMTP_PASS | required for SMTP fallback | SMTP auth password or app password. |
| DEBUG_EMAIL | optional | Set `1` to enable verbose logs. |
| SMTP_PORTS | optional | Comma list for multi-port retry (e.g. `587,465`). |
| SMTP_CONNECTION_TIMEOUT | optional | Milliseconds for initial connection timeout (default 10000). |
| SMTP_SOCKET_TIMEOUT | optional | Milliseconds for socket inactivity (default 15000). |
| EMAIL_RETRY_ATTEMPTS | optional | Retry attempts for transient SMTP errors (default 2). |

## Resend Setup Steps
1. Create account at https://resend.com and obtain API key.
2. Add `RESEND_API_KEY` & set `EMAIL_PROVIDER=resend` in Railway variables.
3. (Optional) Configure a verified domain in Resend for better deliverability.
4. Ensure `EMAIL_ENABLED=true`.
5. Trigger `/api/participants/:id/resend-ticket` or registration flow.

## Fallback Behavior
If Resend send fails, system logs `[EMAIL][RESEND] Failed, switching to SMTP fallback:` then attempts SMTP (provided SMTP env vars are set). If both fail, error propagates.

## Attachments
Ticket PNG and QR code are converted to base64 automatically for Resend. On failure to generate PNG, QR only is attached.

## Health Check (to add)
Planned endpoint `/api/email/health` could report provider status & last send attempt metadata (not yet implemented).

## Troubleshooting
- No email: Check logs for `[EMAIL][ERROR]` or `[EMAIL][RESEND]` lines.
- Resend unauthorized: Ensure API key correct and not revoked.
- Images missing: Verify ticket PNG generation (canvas dependencies) or fallback path.
- Deliverability: Add SPF/DKIM for custom domain & avoid spam words.

## Next Improvements
- Add queue for retry with exponential backoff.
- Add `/api/email/health` endpoint.
- Store send logs in a table for auditing.

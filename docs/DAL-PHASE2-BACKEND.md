# DAL Phase 2 — Lightning payments and Telegram integration

Follow-up work after the Phase 1 static page at [`bitcoin-for-corporations.html`](../bitcoin-for-corporations.html) (Bitcoin for Corporations / Digital Asset Leaders Association).

## Phase 1 (current)

| Setting | Value |
|---------|-------|
| Lightning address | `leftwhorl421@walletofsatoshi.com` (Wallet of Satoshi) — shown only inside payment modal after email |
| Membership price | $99 / year |
| Telegram group | **Members only** — invite URL stored in config, not public on page |
| Proof email | `info@duacrypto.com` — member emails screenshot or payment hash |
| Member count | **Founding members** messaging (no fake live count) |

Configured in [`src/js/dal-config.js`](../src/js/dal-config.js).

### Manual gating (Phase 1)

1. User enters email and pays $99 to the Lightning address (not a fixed invoice).
2. User emails payment proof to `info@duacrypto.com` with their membership email.
3. Admin verifies payment against Wallet of Satoshi history.
4. User requests Telegram access via modal (link revealed only post-proof step).
5. Admin approves join request in Telegram (**Approve new members** must be enabled in group settings).

Phase 2 replaces manual steps with BTCPay invoice verification, bot-generated single-use invites, and a real member count API.

## Prerequisites (Wrangler secrets)

Set these in Cloudflare Pages → **dc-site** → Settings → Environment variables (encrypted):

| Secret | Purpose |
|--------|---------|
| `BTCPAY_URL` | BTCPay Server base URL (e.g. `https://pay.example.com`) |
| `BTCPAY_API_KEY` | Store API key with invoice create + webhook permissions |
| `BTCPAY_STORE_ID` | Store ID for $99 membership invoices |
| `BTCPAY_WEBHOOK_SECRET` | HMAC secret for webhook signature verification |
| `TELEGRAM_BOT_TOKEN` | Bot with admin rights in the private DAL group |
| `TELEGRAM_GROUP_ID` | Numeric chat ID (e.g. `-1001234567890`) |
| `RESEND_API_KEY` | Optional — transactional email receipts |

## D1 database

Create binding in `wrangler.toml`:

```toml
[[d1_databases]]
binding = "DB"
database_name = "dal-members"
database_id = "<your-id>"
```

Migration:

```sql
CREATE TABLE members (
  id TEXT PRIMARY KEY,
  email TEXT NOT NULL,
  invoice_id TEXT UNIQUE NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  telegram_invite TEXT,
  joined_at TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX idx_members_email ON members(email);
CREATE INDEX idx_members_invoice ON members(invoice_id);
CREATE INDEX idx_members_status ON members(status);
```

## API endpoints

Implement under [`functions/api/`](../functions/api/) using Hono (already in project dependencies).

### `POST /api/create-invoice`

**Request:** `{ "email": "user@company.com", "membership": "annual" }`

**Response:** `{ "payment_request", "invoice_id", "expires_at" }`

- Validate email format
- Rate limit: 3 requests / hour per IP and per email (KV or D1)
- Create BTCPay invoice for $99 USD (Lightning)
- Insert `members` row with `status = pending`
- Return BOLT11 `payment_request` from BTCPay

### `POST /api/payment-webhook`

- Called by BTCPay only (verify `BTCPay-Sig` header)
- On `InvoiceSettled`: set `status = paid`, trigger invite generation
- Never trust client-side payment confirmation

### `POST /api/generate-telegram-invite` (internal)

- Not exposed publicly; called after verified payment
- `createChatInviteLink` with `member_limit: 1`, `expire_date` ~24h
- Store link on member row; return to polling client or email

### `GET /api/telegram-count`

**Response:** `{ "count": 127, "accepting": true }`

Phase 1 stub: [`functions/api/telegram-count.ts`](../functions/api/telegram-count.ts)

Phase 2: return `SELECT COUNT(*) FROM members WHERE status = 'paid'` or cached Telegram `getChatMemberCount`.

## Frontend swap (Phase 2)

In [`src/js/dal-page.js`](../src/js/dal-page.js) (and a future dedicated payment module):

1. Replace manual Lightning proof flow with `fetch('/api/create-invoice', { method: 'POST', ... })`
2. Poll invoice status or use BTCPay SSE until settled
3. On success, fetch invite URL and redirect to Telegram
4. Remove manual email-proof step once webhooks are live

## Security checklist

- [ ] Invoice verification server-side only (BTCPay webhook)
- [ ] Single-use Telegram invites (`member_limit: 1`)
- [ ] Rate limits on invoice creation
- [ ] Webhook signature validation
- [ ] No bot token or BTCPay keys in client bundle
- [ ] CORS restricted to `duacrypto.com`

## Analytics events

Track via existing gtag:

- `invoice_created`
- `payment_success`
- `invite_generated`
- `telegram_join` (optional redirect callback)

## Local testing

```bash
npm run build
npx wrangler pages dev dist
curl http://localhost:8788/api/telegram-count
```

## Related files

- Page: [`bitcoin-for-corporations.html`](../bitcoin-for-corporations.html)
- Styles: [`src/css/dal-page.css`](../src/css/dal-page.css)
- Three.js: [`src/js/dal-three.js`](../src/js/dal-three.js)
- Page shell: [`src/js/dal-page.js`](../src/js/dal-page.js)
- SEO: [`scripts/seo-config.mjs`](../scripts/seo-config.mjs)

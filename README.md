# Torq Agents Dashboard

Internal tool for managing outbound call campaigns. Built on Next.js 14, PostgreSQL (Neon), and LiveKit.

**Production:** https://torq-outbound-dashboard.vercel.app/dashboard
**Local:** http://localhost:3000 → redirects to `/dashboard`

---

## First-time Setup

You need Node 18+, access to the Neon DB, and the LiveKit credentials (ask the team lead if you don't have them).

```bash
git clone <repo-url>
cd torq-dashboard
npm install
cp .env.example .env.local   # fill in your values — see below
psql $DATABASE_URL -f db/schema.sql   # only needed once per new DB
npm run dev
```

> If the DB schema already exists in production, skip the `psql` step for your local env too — just point `DATABASE_URL` at the shared staging DB.

---

## Environment Variables

Get the actual values from the team's shared credentials store. Do not commit `.env.local`.

| Variable | What it is |
|---|---|
| `DATABASE_URL` | Neon PostgreSQL connection string — find it in the Neon console under Connection Details |
| `LIVEKIT_URL` | WebSocket URL for our LiveKit Cloud project, e.g. `wss://torq-xxxx.livekit.cloud` |
| `LIVEKIT_API_KEY` | LiveKit API key — server-side only, used to sign room tokens |
| `LIVEKIT_API_SECRET` | LiveKit API secret — never expose this to the client |
| `NEXT_PUBLIC_LIVEKIT_URL` | Same LiveKit URL as above, but prefixed so Next.js exposes it to the browser |

`.env.local` example:

```
DATABASE_URL=postgresql://user:pass@host.neon.tech/neondb?sslmode=require
LIVEKIT_URL=wss://torq-xxxx.livekit.cloud
LIVEKIT_API_KEY=APIxxxxxxxxxxxxxxx
LIVEKIT_API_SECRET=xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
NEXT_PUBLIC_LIVEKIT_URL=wss://torq-xxxx.livekit.cloud
```

---

## What Each Page Does

**Dashboard (`/dashboard`)**
Overview metrics: total contacts, pending queue, completion rate, active campaigns. Shows recent calls and a per-campaign progress bar. Data loads fresh on each page visit — no websocket polling.

**Campaigns (`/campaigns`)**
Create and manage campaigns. Each campaign belongs to a `client_id` and has a calling window (e.g. 09:00–18:00), follow-up delay in hours, and a max follow-up attempt count. Status can be `active`, `paused`, `completed`, or `archived`.

**Upload CSV (`/upload`)**
Select a campaign, then drag-and-drop (or browse) a CSV file. The file is parsed in the browser — you'll see a preview before anything hits the DB. Clicking "Push to DB" bulk-inserts all rows into Neon in a single transaction.

CSV must have at minimum:

| Column | Notes |
|---|---|
| `name` | Contact's full name |
| `phone` | Any format — the agent handles normalisation |
| any other columns | Automatically stored in the `metadata` JSONB field on the contact row |

So if your CSV has `name, phone, company, lead_source`, the contact record will have `metadata: { "company": "...", "lead_source": "..." }`. The agent reads this at call time for context — no schema changes needed for new fields.

**Contacts (`/contacts`)**
Browse all contacts with filters for campaign and status (`pending`, `called`, `completed`, `failed`, `do_not_call`). Shows follow-up date and attempt count inline.

**Call Logs (`/calls`)**
Full history of every call: contact, campaign, duration, outcome, and LiveKit room name. When a call is logged via the API with an `outcome`, the parent contact's status is updated automatically.

**Settings (`/settings`)**
Reference page for the credential values and DB connection. Also has a "Test Connection" button that hits `/api/health` to confirm the DB is reachable.

---

## Database

Three tables. Schema is in `db/schema.sql` — run it once to set up a fresh DB.

```
campaigns   — one per client campaign, holds calling config
contacts    — one per person, belongs to a campaign, holds status + metadata
calls       — one per call attempt, belongs to a contact, holds outcome + transcript
```

Foreign keys are enforced. Deleting a campaign cascades to contacts and calls. A trigger keeps `contacts.updated_at` current automatically.

**Contact statuses:** `pending` → `called` / `completed` / `failed` / `do_not_call`

**Call outcomes:** `answered` · `voicemail` · `no_answer` · `busy` · `failed` · `completed`

---

## API Reference

All responses are JSON. Success: `{ data: ... }`. Failure: `{ error: "..." }` with an appropriate HTTP status.

### Campaigns

| Method | Path | Description |
|---|---|---|
| `GET` | `/api/campaigns` | All campaigns with contact counts and progress |
| `POST` | `/api/campaigns` | Create a campaign |
| `PATCH` | `/api/campaigns/:id` | Update status, name, calling window, follow-up config |
| `DELETE` | `/api/campaigns/:id` | Delete campaign (cascades to contacts + calls) |

```json
// POST /api/campaigns
{
  "name": "June Enterprise Push",
  "client_id": "client_001",
  "status": "active",
  "calling_window_start": "09:00",
  "calling_window_end": "18:00",
  "follow_up_delay_hours": 48,
  "max_follow_up_attempts": 3
}
```

### Contacts

| Method | Path | Description |
|---|---|---|
| `GET` | `/api/contacts` | List contacts — filter with `?campaign_id=` and/or `?status=` |
| `PATCH` | `/api/contacts/:id` | Update status, `follow_up_at`, `follow_up_attempts`, or `metadata` |

### Upload

| Method | Path | Description |
|---|---|---|
| `POST` | `/api/upload` | Bulk insert contacts from a parsed CSV into a campaign |

```json
// POST /api/upload
{
  "campaign_id": 12,
  "contacts": [
    { "name": "Jane Smith", "phone": "+91-9876543210", "company": "Acme" },
    { "name": "Bob Jones",  "phone": "+91-9876543211" }
  ]
}
// Response: { "inserted": 2, "message": "2 contacts pushed to campaign 12" }
```

### Calls

| Method | Path | Description |
|---|---|---|
| `GET` | `/api/calls` | All call logs — filter with `?contact_id=` |
| `POST` | `/api/calls` | Log a call; updates parent contact status if outcome is provided |

```json
// POST /api/calls
{
  "contact_id": 44,
  "livekit_room_name": "torq-campaign12-contact44-1717123456789",
  "outcome": "answered",
  "transcript": "Full transcript text here...",
  "agent_notes": "Requested callback on Monday."
}
```

### Health

| Method | Path | Description |
|---|---|---|
| `GET` | `/api/health` | Confirms DB connectivity — used by Vercel health checks |

```json
// Response
{ "status": "ok", "db": true, "timestamp": "2025-06-05T10:00:00.000Z" }
```

---

## Project Structure

```
torq-dashboard/
├── app/
│   ├── (dashboard)/        # Shared sidebar+topbar layout wraps all these pages
│   │   ├── dashboard/
│   │   ├── campaigns/
│   │   ├── upload/
│   │   ├── contacts/
│   │   ├── calls/
│   │   └── settings/
│   ├── api/                # Server-side only — never runs in the browser
│   │   ├── campaigns/
│   │   ├── contacts/
│   │   ├── calls/
│   │   ├── upload/
│   │   └── health/
│   ├── globals.css
│   └── layout.tsx
├── components/
│   ├── Topbar.tsx
│   ├── Sidebar.tsx
│   └── UI.tsx              # All shared components: Card, Button, Badge, Toast, etc.
├── lib/
│   ├── db.ts               # Postgres pool — reuses connection in dev to avoid exhaustion
│   ├── livekit.ts          # JWT token generation, room name helpers
│   └── types.ts            # TypeScript interfaces shared across app + API
├── db/
│   └── schema.sql          # Run once to initialise the DB
└── .env.example
```

**Adding a new API route:** create `app/api/your-route/route.ts`, export named `GET`/`POST`/`PATCH`/`DELETE` functions, use `query()` from `lib/db.ts`, return `NextResponse.json({ data })` or `NextResponse.json({ error }, { status: 4xx })`.

---

## Builds & Deployment

```bash
npm run build    # production build — surfaces any type errors
npm run start    # run the production build locally
```

Deployments are on Vercel. Pushing to `main` triggers a deploy automatically. Environment variables are managed in the Vercel project settings — do not rely on `.env.local` in production.

Before merging anything that touches the DB or API, hit `/api/health` on the preview deployment to confirm the DB connection is live:

```bash
curl https://<preview-url>.vercel.app/api/health
# Should return: { "status": "ok", "db": true }
```
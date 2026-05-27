# Torq Agents Dashboard

## Setup

```bash
npm install
cp .env.local .env.local   # fill in your values
npm run dev
```

## Environment Variables

```
DATABASE_URL=postgresql://user:password@host:5432/dbname
LIVEKIT_URL=wss://your-instance.livekit.cloud
LIVEKIT_API_KEY=your_api_key
LIVEKIT_API_SECRET=your_api_secret
```

## Features

- **Dashboard** — Live metrics, campaign summaries, recent calls
- **Campaigns** — Create/manage campaigns with calling windows and follow-up config
- **Upload CSV** — Drag-and-drop CSV upload, validates name/phone columns, pushes to Neon DB
- **Contacts** — Browse and filter all contacts by campaign/status
- **Call Logs** — Full call history with transcripts and agent notes
- **Settings** — LiveKit and DB connection config

## CSV Format

Required columns: `name`, `phone`  
Any extra columns are stored in the `metadata` JSONB field.

## API Routes

| Method | Path | Description |
|--------|------|-------------|
| GET | /api/campaigns | List all campaigns |
| POST | /api/campaigns | Create campaign |
| PATCH | /api/campaigns/:id | Update campaign |
| GET | /api/contacts | List contacts (filter by campaign_id, status) |
| PATCH | /api/contacts/:id | Update contact |
| POST | /api/upload | Bulk insert contacts |
| GET | /api/calls | List calls |
| POST | /api/calls | Create call record |
| GET | /api/health | DB health check |

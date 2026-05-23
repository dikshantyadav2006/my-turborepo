# ⚡ Study OS | SHAI Library Ecosystem

Study OS is a fast, offline-first productivity workspace built for students and scholars. It focuses on low-latency UI, local-first persistence, and seamless sync with a backend service. This README gives a concise developer-oriented overview, quickstart, and deployment guidance for the `apps/studyOs` Vite app inside the monorepo.

---

## Table of Contents
- [Quickstart (dev)](#quickstart-dev)
- [Build & Preview](#build--preview)
- [Environment](#environment)
- [Vercel Deployment (recommended)](#vercel-deployment-recommended)
- [Monorepo notes](#monorepo-notes)
- [Project Layout](#project-layout)
- [Contributing](#contributing)
- [Troubleshooting](#troubleshooting)

---

## Quickstart (dev)
Requirements: Node 18+, pnpm.

1. From repo root:

```bash
pnpm install
pnpm --filter @study-os/study-web dev
```

2. Or from this app folder:

```bash
cd apps/studyOs
pnpm install
pnpm dev
```

The app should open at `http://localhost:5173`.

## Build & Preview

```bash
# from repo root
pnpm --filter @study-os/study-web build
pnpm --filter @study-os/study-web preview

# or from app folder
cd apps/studyOs
pnpm build
pnpm preview
```

Production output: `apps/studyOs/dist` (or `dist` when Vercel builds with `apps/studyOs` as root).

## Environment
Create a `.env.local` in `apps/studyOs` or provide env vars in Vercel dashboard.

Important variables:

```
VITE_API_URL=https://api.sailibrary.online
VITE_SOCKET_URL=https://api.sailibrary.online
```

Note: Do not commit `.env` files.

## Vercel Deployment (recommended)
This is a SPA (Vite + React). To avoid 404 on direct route refreshes, `vercel.json` includes an SPA rewrite that serves `index.html` for all routes.

Recommended Vercel settings when importing the monorepo:

- **Root Directory**: `apps/studyOs`
- **Framework**: Vite (auto-detect)
- **Build Command**: `pnpm build`
- **Output Directory**: `dist`
- **Install Command**: `pnpm install`

Make sure `apps/studyOs/vercel.json` (already included) contains the SPA rewrite.

### What to Deploy to Vercel
- Deploy only the frontend (`apps/studyOs`). Do not deploy backend services (Express, Socket.IO, AI orchestrators) to Vercel.

Recommended hosting split:

| Service | Platform |
|---|---|
| Frontend (studyOs) | Vercel |
| Backend (API, sockets) | Railway / VPS |
| Database | MongoDB Atlas |
| Redis | Upstash |

## Monorepo notes
- Ensure root `package.json` has `"packageManager": "pnpm@10.0.0"` for deterministic builds on Vercel.
- Root `.npmrc` contains recommended flags: `auto-install-peers=true`, `strict-peer-dependencies=false`, `shamefully-hoist=true`.
- When referencing internal workspace packages use `workspace:*` in `dependencies` so Vercel can resolve them.

## Project Layout (short)

```
apps/studyOs/
  ├─ public/
  ├─ src/
  │  ├─ features/
  │  ├─ components/
  │  ├─ layouts/
  │  └─ lib/
  ├─ package.json
  └─ vercel.json
```

For the full architecture and API flow see the docs in this folder.

## Contributing
- Read `CONTRIBUTING.md` for commit/guidelines and branch rules.
- Workflow:

```bash
git checkout -b feature/my-feature
pnpm --filter @study-os/study-web dev
# implement, test, commit
```

## Troubleshooting
- If routes 404 on Vercel: confirm `vercel.json` rewrite and Vercel root directory set to `apps/studyOs`.
- If dependency resolution fails on Vercel: verify `packageManager` and `.npmrc` settings at repo root.
- If local build fails: run `pnpm build --filter @study-os/study-web --reporter=ndjson` for more logs.

---

If you want, I can:
- run a local build/preview to validate the `dist` output, or
- open a PR with these README changes and commit them for you.

Built with ❤️ by the DK AND TEAM.

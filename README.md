# MyWatchList

Track the movies and TV shows you watch, rate them, comment on them and follow other people's activity.
Show data comes from [TMDB](https://www.themoviedb.org/). Built as a university project (Dokuz Eylül University, Computer Engineering).

## Features

- Search movies and TV shows and open a detail page with genres, seasons and episodes
- Personal lists per show: *Plan To Watch*, *Watching*, *Completed*, *On Hold*, *Dropped*, with a score and (for TV) season/episode progress
- Comments on shows and on user profiles
- Follow other users and see their activity on your home page
- Admin panel: manage users, preload popular shows from TMDB, clear the show catalogue
- Light and dark theme

Not finished yet: the **Statistics** page is a placeholder (the backend already exposes per-user statistics at `GET /user/statistics`).

## Tech stack

| Part | Stack |
| --- | --- |
| Frontend | React 19, Vite, TypeScript, Tailwind CSS, shadcn/ui, React Router |
| Backend | Node.js, Express 4, TypeScript, `pg` |
| Database | PostgreSQL (tables, view and trigger are created automatically on first start) |
| Shared | `shared/` holds the request/response types used by both sides |

## Quick start

You need **Node.js 20 or newer**, **Yarn 1** and a running **PostgreSQL** server.

```bash
git clone https://github.com/boranbereketli/MyWatchList.git
cd MyWatchList

# 1. Backend
cd backend
cp .env.example .env        # then fill in the values, see "Configuration"
yarn
yarn dev                    # http://localhost:3000

# 2. Frontend (second terminal)
cd frontend
yarn
yarn dev                    # http://localhost:5173
```

On first start the backend creates the database and all tables. Open the frontend and register:
**the very first account that registers becomes the admin.** After that, open the admin panel and use *Preload shows* to fill the catalogue.

## Configuration

All backend settings live in `backend/.env` (never commit this file).

| Variable | Required | Description |
| --- | --- | --- |
| `PORT` | no | API port, default `3000` |
| `CORS_ORIGIN` | no | Frontend origin allowed to call the API, default `http://localhost:5173` |
| `PGUSER`, `PGPASSWORD`, `PGHOST`, `PGPORT`, `PGDATABASE` | yes | PostgreSQL connection. The user must be allowed to create databases |
| `TMDB_API_KEY` | yes | Free key from <https://www.themoviedb.org/settings/api> |
| `JWT_SECRET` | yes | At least 16 random characters. The server refuses to start without it |

Generate a strong `JWT_SECRET`:

```bash
node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"
```

The frontend reads `API_URL` from `frontend/.env.development` (default `http://localhost:3000`).

## Scripts

| Where | Command | What it does |
| --- | --- | --- |
| `backend` | `yarn dev` | Run the API with auto-reload |
| `backend` | `yarn build && yarn start` | Compile and run in production mode |
| `frontend` | `yarn dev` | Run the Vite dev server |
| `frontend` | `yarn build` | Type-check and build to `frontend/dist` |
| `frontend` | `yarn lint` | Run ESLint |

## Project layout

```
backend/    Express API (auth, user, show, admin routers) and database setup
frontend/   React app (pages, components, API client in src/lib/api.ts)
shared/     TypeScript types shared by backend and frontend
documents/  Project reports (Phase 1 and Phase 3)
```

## API overview

| Prefix | Purpose |
| --- | --- |
| `/auth` | register, login, logout, current user |
| `/show` | show details, search, discover, personal list entries, show comments |
| `/user` | profiles, lists, follows, activity feed, statistics, profile comments |
| `/admin` | user management and catalogue tools (admin only) |

Authentication is a signed JWT stored in an HTTP-only, same-site cookie.

## Troubleshooting

- **`JWT_SECRET is missing or too short`** – add a `JWT_SECRET` to `backend/.env` (see above).
- **Backend exits right after start with a database message** – check the `PG*` values and that PostgreSQL is running.
- **Pages show no shows** – log in as the admin and run *Preload shows*, or open any show page (it is fetched from TMDB on demand).
- **`yarn install` complains about the Node version** – use Node 20.15 or newer.

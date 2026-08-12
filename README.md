# IPL Auction 🏏

A real-time fantasy cricket auction platform for IPL-style team drafts and season-long league play. Admins run a live player auction with bidding, timers, and budgets; teams join and compete week-to-week with lineups, match points, and a leaderboard.

Built with a Node.js/Express/Socket.IO backend and a React (Vite) frontend.

## Features

- **Live auction room** — admin-controlled player pool, bidding, countdown timer, force-sold/unsold/revert controls, all synced in real time over WebSockets (`AuctionDashboard`, `LiveAuctionPanel`, `BidControls`, `Timer`).
- **Multiple auction instances** — create, list, and delete independent auctions (`auctionInstanceRoutes`), so several leagues/seasons can run side by side.
- **Team management** — teams join an auction, get a budget, build a squad, and can release players (`teamRoutes`, `TeamCard`, `TeamDetailsModal`).
- **Season/league layer** — weekly matches, lineups, match points entry, and a live leaderboard on top of the drafted squads (`leagueRoutes`, `LeagueDashboard`, `LeagueLeaderboard`, `MatchPointsEntry`).
- **Mini-auctions** — mid-season top-up auctions to re-pool and re-sell players between teams (`miniAuctionRoutes`, `MiniAuction.jsx`).
- **Weekly release requests** — teams can request to drop players between weeks (`WeeklyReleaseRequest` model, `LeagueReleases.jsx`).
- **Analytics & exports** — squad analytics, team performance history, and CSV/PDF export of a team's squad (`SquadAnalytics`, `AnalyticsDashboard`, `exportTeamSquad`, `json2csv`, `jspdf`).
- **Public leaderboard view** — a read-only page for spectators (`PublicLeaderboard.jsx`).

## Tech stack

**Backend**
- Node.js + Express 5
- MongoDB + Mongoose
- Socket.IO (real-time auction state, bidding, timers)
- Redis (`ioredis`) for auction/timer state
- `dotenv`, `cors`, `json2csv`

**Frontend**
- React 19 + Vite
- Tailwind CSS
- Socket.IO client
- Recharts (analytics), Framer Motion (animations), `jspdf` / `html2canvas` / `html-to-image` (exports), `xlsx`, `lucide-react`

## Project structure

```
auction/
├── backend/
│   ├── config/db.js            # MongoDB connection
│   ├── controllers/            # Route handlers (auction, team, player, league, mini-auction)
│   ├── models/                 # Mongoose schemas (Auction, Team, Player, LeagueWeek, ...)
│   ├── routes/                 # Express routers, mounted under /api/*
│   ├── socket/socketHandler.js # Socket.IO event handlers
│   ├── workers/timerWorker.js  # Auction countdown timer logic
│   ├── services/               # Business logic helpers
│   └── server.js               # App entrypoint
└── frontend/
    ├── src/components/         # Auction, league, team & analytics UI
    ├── src/context/            # SocketContext (shared socket + live auction state)
    ├── src/services/api.js     # Axios client (calls /api via Vite proxy)
    └── vite.config.js
```

## Getting started

### Prerequisites
- Node.js 18+
- MongoDB (local or Atlas)
- Redis (local or hosted)

### 1. Backend setup

```bash
cd backend
npm install
```

Create `backend/.env` (this file is gitignored and must never be committed):

```env
MONGO_URI=mongodb://localhost:27017/ipl-auction
PORT=5000
CLIENT_URL=http://localhost:5173
REDIS_URL=redis://localhost:6379
```

Run the server:

```bash
npm run dev   # nodemon, auto-restart
# or
node server.js
```

### 2. Frontend setup

```bash
cd frontend
npm install
npm run dev
```

The frontend dev server proxies `/api` and the socket connection to the backend (see `vite.config.js` / `src/services/api.js`), so no separate API base URL is needed locally.

### 3. Open the app

Visit `http://localhost:5173`, create an auction, join as a team, and start bidding.

## API overview

All routes are mounted under `/api`:

| Base path | Purpose |
|---|---|
| `/api/auctions` | Create/list/delete auction instances |
| `/api/auction/:auctionId` | Run a live auction (start, preview/next player, sold/unsold, revert, price updates, state, export) |
| `/api/teams` | Join an auction, list teams, view/release a team's players |
| `/api/players` | List/add players (bulk import supported) |
| `/api/league/:auctionId/weeks` | Weekly matches, lineups, match points, leaderboard, team performance, release requests |
| `/api/mini-auction/:auctionId/weeks` | Seed/run mid-season mini-auctions and view transactions |

Real-time auction state (current player, current bid, highest bidder, timer) is pushed over Socket.IO — see `backend/socket/socketHandler.js` and `frontend/src/context/SocketContext.jsx`.

## Deployment

The app is set up to deploy as two services:
- **Backend** → a Node host (e.g. Render): set `MONGO_URI`, `REDIS_URL`, `CLIENT_URL`, and `PORT` as environment variables.
- **Frontend** → a static/edge host (e.g. Vercel): `npm run build` produces the static bundle in `frontend/dist`.

Point the frontend's proxy/base URL at the deployed backend URL in production (or configure a rewrite/proxy on the hosting platform).

## Notes

- `backend/db_backup_pre_auction/` contains a `mongodump` snapshot checked into the repo as a restore point — restore with `mongorestore` if needed.
- Several one-off maintenance scripts live at the root of `backend/` (`fixRoles.js`, `syncRosters.js`, `resetAuction.js`, etc.) for data cleanup/migrations; run them with care against the intended database.

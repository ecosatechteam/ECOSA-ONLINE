# ECOSA Online

ECOSA Online is a React + TypeScript single-page application built with Vite for the Equatorial College Old Students Association. It supports alumni registration, member discovery, membership payments, community posts, job listings, leadership details, chapters, resources, and project donation workflows.

## Architecture

This repository contains two major parts:

- `frontend/`: Vite-powered React SPA that renders the application UI and handles member interactions.
- `backend/`: Express API server that exposes member, payments, auth, posts, and other routes on `http://localhost:4000/api`.

### Frontend

- Entry point: `frontend/src/main.tsx`
- Routes and pages: `frontend/src/App.tsx` and `frontend/src/pages/*`
- Shared service layer: `frontend/src/services/mockService.ts`
- Static assets: `frontend/public/`
- Build output: `frontend/dist/`
- Deployment config: `vercel.json`

### Backend

- Entry point: `backend/server/index.js`
- API routes: `backend/server/routes/*`
- Middleware: `backend/server/middleware/*`
- Mongoose models: `backend/server/models/*`
- Optional local data storage fallback: browser `localStorage`

## How the app works

### User experience

1. The home page lets visitors explore ECOSA services and navigate to registration, payments, community, members, projects, leadership, chapters, and resources.
2. Users can register as alumni, search members, and view member details.
3. The payments page accepts mobile or card details and records payments locally or via the backend when available.
4. Community posts, job listings, leaders, resources, and project data are served through the shared `mockService.ts` layer.

### Backend integration

- The frontend service wrapper in `frontend/src/services/mockService.ts` is configured to call `import.meta.env.VITE_API_BASE || 'http://localhost:4000/api'`.
- If a local backend is available, API requests are sent to that server.
- If the backend is unavailable, the app gracefully falls back to browser `localStorage` and continues operating as a self-contained demo.

### SPA behavior

- The app uses `react-router-dom` for client-side navigation.
- `vercel.json` and `frontend/public/_redirects` are configured to send unknown routes back to `index.html` so page refreshes continue to work.

## Running locally

### 1. Start the backend API server

```bash
cd backend
npm install
npm run dev
```

The backend listens on `http://localhost:4000` by default and provides API endpoints under `/api`.

### MongoDB Atlas

The backend already reads its MongoDB connection string from `backend/.env` through `MONGODB_URI`. To connect it to MongoDB Atlas:

1. Create `backend/.env` from the template below.
2. Replace `<db_password>` with your Atlas database user's password.
3. Make sure the Atlas cluster allows your IP address in Network Access.

```text
MONGODB_URI=mongodb+srv://tuancreationsafrica_db_user:<db_password>@cluster0.xhk6biz.mongodb.net/tuan_creations?appName=Cluster0
PORT=4000
JWT_SECRET=replace-with-a-long-secret
```

If Atlas is reachable, the backend connects to it on startup. If the connection fails, the server logs a warning and continues in fallback mode.

### 2. Start the frontend dev server

```bash
cd frontend
npm install
npm run dev
```

Open the URL printed by Vite, usually `http://localhost:5173`.

### 3. Use the full stack

When both frontend and backend are running, the app will call the backend for API operations and fall back to local browser storage if the backend is not reachable.

## Deployment

### Vercel

This project is configured for static deployment with Vercel using `vercel.json`.

- Frontend source: `frontend/package.json`
- Build command: `npm run build`
- Output directory: `frontend/dist`
- SPA fallback: handled by Vercel routes
- Optional environment variable: `VITE_API_BASE`

If you deploy the backend separately, set `VITE_API_BASE` in Vercel to the backend URL, for example:

```text
VITE_API_BASE=https://your-backend.vercel.app/api
```

### Netlify

The repository includes `netlify.toml` for Netlify static hosting.

- Base directory: `frontend`
- Build command: `npm run build`
- Publish directory: `dist`
- Redirects: `public/_redirects`

## Notes

- `frontend/src/services/mockService.ts` is the central data access layer. Use it for all member, payment, auth, post, job, leader, and resource operations.
- The frontend is designed to work both as a demo using local browser storage and as a frontend to an Express backend.
- If you want a production-ready API, deploy the backend separately and configure `VITE_API_BASE` to point to that service.
- `backend/server/index.js` will still start if MongoDB is unavailable, but data persistence will depend on whether it can connect to the configured database.
# ECOSA-ONLINE

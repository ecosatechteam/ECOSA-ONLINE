# ECOSA

## Admin authentication

The dashboard is available only to `ecosaadmin@gmail.com`. Configure these backend environment variables before deployment:

- `ADMIN_INITIAL_PASSWORD`: creates the first admin password when no admin record exists.
- `JWT_SECRET`: secret used to sign dashboard sessions.
- `PUBLIC_APP_URL`: public frontend URL used in password-reset links.
- `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASSWORD`, and optional `SMTP_SECURE` / `MAIL_FROM`: SMTP settings for sending reset links to `ecosaadmin@gmail.com`.

Password reset links expire after 15 minutes and can be used once. Public website pages, member registration, and payment initiation remain accessible without an admin login.
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
2. Users can register as alumni, choose a country calling code and gender, search members, and view member details.
3. The payments page creates Flutterwave hosted checkout sessions for Uganda mobile money or cards. Membership is confirmed only after server-side transaction verification.
4. Community posts, job listings, leaders, resources, and project data are served through the shared `mockService.ts` layer.
5. Admins can review and update all member records from the dashboard, open titled member details with per-member payment history, and manage payment records. Full member records and payment-history API responses require admin authentication.

### Backend integration

- The frontend service wrapper in `frontend/src/services/mockService.ts` is configured to call `import.meta.env.VITE_API_BASE || 'http://localhost:4000/api'`.
- If a local backend is available, API requests are sent to that server.
- If the backend is unavailable, non-payment demo data may fall back to browser `localStorage`. Payment checkout fails explicitly and is never recorded as successful without provider confirmation.

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
FLUTTERWAVE_SECRET_KEY=replace-with-flutterwave-secret-key
FLUTTERWAVE_WEBHOOK_SECRET=replace-with-flutterwave-webhook-secret-hash
FLUTTERWAVE_REDIRECT_URL=http://localhost:5173/payments
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

### Production services

- Deploy the Express backend separately and set `VITE_API_BASE` in the frontend deployment to the backend API URL ending in `/api`.
- Configure `MONGODB_URI` and a strong `JWT_SECRET` on the backend. The in-memory fallback is temporary and loses data when the backend restarts; it is not suitable for production persistence.
- Configure `FLUTTERWAVE_SECRET_KEY`, `FLUTTERWAVE_WEBHOOK_SECRET`, and `FLUTTERWAVE_REDIRECT_URL` on the backend before accepting payments. Use the Flutterwave secret key and the exact webhook secret hash configured in the Flutterwave dashboard; never put either secret in the frontend.
- Set the Flutterwave webhook URL to `https://your-backend.example/api/payments/webhook` and enable `charge.completed` notifications. The backend checks Flutterwave's `verif-hash` header and verifies transaction reference, amount, currency, and final status with Flutterwave before confirming membership.
- Set the redirect URL to the public frontend payments page (for example, `https://your-site.example/payments`). Flutterwave account settings must allow UGX card and Uganda mobile-money payment methods; disable the dashboard payment-options override so the per-checkout method selection is applied.
- Keep MongoDB configured in production. The in-memory fallback is temporary and loses pending payments when the backend restarts, so it is unsuitable for real transactions.

## Notes

- `frontend/src/services/mockService.ts` is the central data access layer. Use it for all member, payment, auth, post, job, leader, and resource operations.
- The frontend is designed to work both as a demo using local browser storage and as a frontend to an Express backend.
- If you want a production-ready API, deploy the backend separately and configure `VITE_API_BASE` to point to that service.
- `backend/server/index.js` will still start if MongoDB is unavailable, but data persistence will depend on whether it can connect to the configured database.
# ECOSA-ONLINE

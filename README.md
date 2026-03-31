# ⚡ Daily Engine — Production

A full-stack daily planner built for SDE interview prep. Features email/password auth, per-user PostgreSQL storage, smart DSA scheduling, and deployment on Netlify + Render.

**Live demo:** `https://your-site.netlify.app`  
**Backend API:** `https://your-api.onrender.com`

---

## Tech Stack

| Layer | Tech |
|-------|------|
| Frontend | React + Vite, React Router |
| Backend | Node.js + Express |
| Auth | JWT + bcrypt |
| Database | PostgreSQL (Supabase free tier) |
| Deploy | Netlify (frontend) + Render (backend) |

---

## Local Setup

### 1. Set up Supabase Database

1. Go to [supabase.com](https://supabase.com) → create a free project
2. Go to **SQL Editor** → paste the entire contents of `schema.sql` → Run
3. Go to **Project Settings → Database → Connection string (URI)** → copy it

### 2. Backend

```bash
cd backend
npm install
cp .env.example .env
# Edit .env — paste your DATABASE_URL and set a JWT_SECRET
npm run dev
```

Backend runs on `http://localhost:3001`

### 3. Frontend

```bash
cd frontend
npm install
npm run dev
```

Frontend runs on `http://localhost:5173`  
API calls proxy to `localhost:3001` via `vite.config.js`.

---

## Deployment

### Deploy Backend → Render

1. Push the `backend/` folder to a GitHub repo
2. Go to [render.com](https://render.com) → New → **Web Service**
3. Connect your GitHub repo
4. Build command: `npm install`
5. Start command: `node src/server.js`
6. Add Environment Variables:
   - `DATABASE_URL` → your Supabase connection string
   - `JWT_SECRET` → any long random string
   - `CLIENT_URL` → your Netlify URL (set after deploying frontend)
   - `NODE_ENV` → `production`

### Deploy Frontend → Netlify

1. Push the `frontend/` folder to GitHub (can be same repo, different folder)
2. Go to [netlify.com](https://netlify.com) → New Site → Import from Git
3. Build command: `npm run build`
4. Publish directory: `dist`
5. Add Environment Variable:
   - `VITE_API_URL` → your Render backend URL (e.g. `https://daily-engine-api.onrender.com`)
6. Deploy!

The `netlify.toml` handles SPA routing automatically.

---

## API Reference

### Auth
| Method | Route | Body | Description |
|--------|-------|------|-------------|
| POST | `/api/auth/register` | `{ name, email, password }` | Create account, returns JWT |
| POST | `/api/auth/login` | `{ email, password }` | Login, returns JWT |
| GET | `/api/auth/me` | — | Get current user from token |

### Entries (all require `Authorization: Bearer <token>`)
| Method | Route | Description |
|--------|-------|-------------|
| GET | `/api/entries/today` | Get/create today's entry |
| PUT | `/api/entries/today` | Update tasks, notes, busyDay |
| POST | `/api/entries/end-day` | Save today, generate tomorrow |
| GET | `/api/entries/history` | All past entries, latest first |
| GET | `/api/entries/stats` | Streak + 7-day avg + topic breakdown |

---

## Interview Talking Points

> *"I built and deployed a full-stack habit tracking app for my SDE prep. The frontend is on Netlify, the backend is a Node + Express API on Render, and data is stored in Supabase (PostgreSQL). I implemented JWT-based authentication with bcrypt password hashing, a JSONB schema for per-user daily task logs, and a rule engine that auto-generates tomorrow's DSA problems based on completion rate and a 12-week topic roadmap. My own account has weeks of real usage data."*

---

## Database Schema

See [`schema.sql`](./schema.sql) for the full SQL — two tables:
- `users` (id, name, email, password_hash, created_at)
- `day_entries` (id, user_id → FK, date, tasks_json JSONB, notes_json JSONB, completion_rate, busy_day, created_at, updated_at)

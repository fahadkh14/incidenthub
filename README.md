# IncidentHub

A production-ready, 3-tier incident management platform for DevOps/IT teams — built with React, Flask, and MySQL, running entirely on Docker.

IncidentHub lets teams create incidents, assign engineers, track status and severity, comment, and review a full activity history — all from a polished operations dashboard.

---

## Features

- JWT authentication (register, login, logout, current-user) with bcrypt password hashing
- Role-based accounts: `ADMIN`, `ENGINEER`, `VIEWER`
- Incident lifecycle: `OPEN → INVESTIGATING → MITIGATED → RESOLVED → CLOSED`
- Severity levels (`P1`–`P4`), categories, and environments (Production/Staging/Development)
- Auto-generated incident numbers (`INC-000001`, `INC-000002`, ...)
- Full-text search, filtering (severity/status/environment/category), sorting, and pagination
- Comments and a chronological activity timeline per incident
- Operations dashboard with live stats, severity/status distribution, recent incidents & activity
- Toast notifications, loading skeletons, empty states, confirmation dialogs
- Responsive, dark-themed "SaaS ops console" UI

## Architecture

```
                    Browser
                       |
                       v
                  +---------+
                  |  Nginx  |   (reverse proxy, single entry point)
                  +----+----+
                       |
             +---------+---------+
             |                   |
             v                   v
       React Frontend       Flask Backend
       (static, Nginx)      (Gunicorn + REST API)
                              |
                              v
                           MySQL 8.4
```

Nginx serves as the single entry point: it proxies `/api/*` to the Flask backend and everything else to the React frontend (which itself is served by its own internal Nginx). The Flask backend talks to MySQL over SQLAlchemy.

## Technology Stack

| Layer      | Technology |
|------------|------------|
| Frontend   | React, Vite (default config), Tailwind CSS, React Router, Axios, Lucide React |
| Backend    | Python 3.12, Flask, Gunicorn, SQLAlchemy, Flask-Migrate, Flask-JWT-Extended, Flask-Bcrypt, Flask-CORS |
| Database   | MySQL 8.4 |
| Proxy      | Nginx |
| Runtime    | Docker, Docker Compose |

> **Note:** This project intentionally does **not** contain a `vite.config.js`/`vite.config.ts`. The frontend runs on Vite's default configuration and builds with plain `npm ci && npm run build`.

## Folder Structure

```
incidenthub/
├── frontend/           # React + Vite + Tailwind SPA
│   ├── src/
│   │   ├── components/ # Reusable UI (Button, Card, Modal, Badge, ...)
│   │   ├── pages/       # Route-level pages
│   │   ├── layouts/     # Sidebar, Topbar, DashboardLayout
│   │   ├── services/    # Axios API clients
│   │   ├── context/     # Auth + Toast providers
│   │   └── utils/       # Formatting, constants
│   ├── Dockerfile       # Multi-stage: Node build -> Nginx serve
│   └── nginx.conf
├── backend/            # Flask application factory
│   ├── app/
│   │   ├── models/      # User, Incident, Comment, Activity
│   │   ├── routes/      # auth, incidents, dashboard, users, health
│   │   ├── services/    # Incident numbering, activity logging
│   │   └── middleware/  # Role-based access control
│   ├── Dockerfile
│   └── entrypoint.sh    # Waits for MySQL, creates schema, seeds demo data, starts Gunicorn
├── nginx/
│   └── nginx.conf       # Reverse proxy: / -> frontend, /api/ -> backend
├── database/
│   └── init.sql
├── docker-compose.yml
├── .env.example
└── Makefile
```

## Environment Setup

```bash
cp .env.example .env
```

Edit `.env` and replace every `change_me` value — in particular `MYSQL_PASSWORD`, `MYSQL_ROOT_PASSWORD`, and `JWT_SECRET` (generate one with `openssl rand -hex 32`).

## Running with Docker Compose

```bash
docker compose build
docker compose up -d
```

Once all services are healthy, open:

```
http://localhost:8080
```

(or whatever port you set as `NGINX_PORT` in `.env`).

### Useful commands

```bash
docker compose ps                 # check service health
docker compose logs -f backend    # tail backend logs
docker compose logs -f frontend
docker compose logs -f mysql
docker compose logs -f nginx
docker compose down               # stop containers (keeps data)
docker compose up -d              # start again — your data is still there
```

A `Makefile` wraps these as `make build`, `make up`, `make down`, `make logs`, etc.

**Important:** never run `docker compose down -v` unless you intend to permanently delete the MySQL volume and all application data.

## API Documentation

All responses follow a consistent envelope:

```json
{ "success": true, "message": "Incident created successfully", "data": { } }
```

```json
{ "success": false, "message": "Incident not found", "error": "NOT_FOUND" }
```

| Method | Endpoint                              | Description                     |
|--------|----------------------------------------|----------------------------------|
| POST   | `/api/auth/register`                  | Create an account                |
| POST   | `/api/auth/login`                     | Log in, receive a JWT            |
| GET    | `/api/auth/me`                        | Current authenticated user       |
| GET    | `/api/dashboard`                      | Aggregated dashboard stats       |
| GET    | `/api/incidents`                      | List incidents (search/filter/paginate) |
| POST   | `/api/incidents`                      | Create an incident                |
| GET    | `/api/incidents/:id`                  | Incident details                  |
| PUT    | `/api/incidents/:id`                  | Update an incident                |
| DELETE | `/api/incidents/:id`                  | Delete an incident                |
| GET    | `/api/incidents/:id/comments`         | List comments                     |
| POST   | `/api/incidents/:id/comments`         | Add a comment                     |
| GET    | `/api/incidents/:id/activity`         | Incident activity timeline        |
| GET    | `/api/users`                          | List users                        |
| GET    | `/api/users/:id`                      | Get a single user                 |
| GET    | `/api/health`                         | Backend + database health check   |

All endpoints except `/api/auth/register`, `/api/auth/login`, and `/api/health` require a `Authorization: Bearer <token>` header.

## Database Structure

**users** — `id, name, email, password_hash, role, created_at, updated_at`

**incidents** — `id, incident_number, title, description, severity, status, category, environment, service_name, created_by, assigned_to, started_at, resolved_at, resolution, created_at, updated_at`

**comments** — `id, incident_id, user_id, comment, created_at`

**activities** — `id, incident_id, user_id, action, old_value, new_value, created_at`

Tables are created automatically on first backend startup. Schema changes going forward should use Flask-Migrate (see `backend/migrations/README.md`).

## Demo Credentials

These accounts are seeded automatically the first time the backend starts against an empty database. **Development only — change or remove them before any real deployment.**

| Role     | Email                        | Password       |
|----------|------------------------------|----------------|
| Admin    | admin@incidenthub.local      | Admin123!      |
| Engineer | engineer@incidenthub.local   | Engineer123!   |
| Viewer   | viewer@incidenthub.local     | Viewer123!     |

## Troubleshooting

**`docker compose ps` shows a service as unhealthy**
Check its logs: `docker compose logs <service>`. The backend waits for MySQL to be healthy before starting, and Nginx waits for both the frontend and backend to be healthy.

**Frontend loads but API calls fail**
Confirm the backend is healthy (`docker compose ps`). You can access the app via the Nginx port (`NGINX_PORT`, default 8080), or directly via the frontend port (`FRONTEND_PORT`, default 8070) / backend port (`BACKEND_PORT`, default 5673) since both are published to the host.

**"Access denied for user" from MySQL**
Your `.env` values likely changed after the MySQL volume was already initialized with the old credentials. Either revert `.env`, or (if you don't need the existing data) reset with `docker compose down -v` and `docker compose up -d`.

**Changes to `.env` aren't taking effect**
Recreate the affected containers: `docker compose up -d --force-recreate`.

**Port already in use**
Change `NGINX_PORT` (and/or `BACKEND_PORT`/`FRONTEND_PORT`) in `.env` to a free port.

## Future DevOps Roadmap

This repository intentionally implements only Phase 1. Planned future phases:

```
Phase 1 — Docker + Docker Compose            ✅ (this repo)
Phase 2 — GitHub Actions CI
Phase 3 — Jenkins CI/CD
Phase 4 — Trivy Security Scanning
Phase 5 — Docker Hub
Phase 6 — Kubernetes
Phase 7 — Prometheus + Grafana
Phase 8 — Cloud Deployment
```

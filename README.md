# Ngula Analytics — Operational Intelligence for Mining Excellence

A mining operations intelligence platform that consolidates Production, Engineering, Maintenance, and SHEQ data into a single decision-support system.

The stack is a single container:
- **Backend:** ASP.NET Core 9 Web API (`src/NgulAnalytics.Api`)
- **Frontend:** React + Vite (`src/ngula-frontend`), built and served as static files from the API's `wwwroot`
- **Database:** PostgreSQL

---

## 🔑 Demo Login Credentials

This is a **demo application**. On first startup the database is automatically created and seeded with demo users. Log in with any of the accounts below.

| Role        | Email                     | Password    |
|-------------|---------------------------|-------------|
| Executive   | `exec@ngula.demo`         | `Demo@2025` |
| Engineering | `engineer@ngula.demo`     | `Demo@2025` |
| Production  | `production@ngula.demo`   | `Demo@2025` |
| SHEQ        | `sheq@ngula.demo`         | `Demo@2025` |
| Supervisor  | `supervisor@ngula.demo`   | `Demo@2025` |

> All demo accounts share the same password: **`Demo@2025`**.
> Start with `exec@ngula.demo` for the fullest view (Executive has access to every module).

---

## 🚀 Run Locally

The easiest way to run the whole stack (Postgres + API + frontend) is Docker Compose.

### Prerequisites
- [Docker Desktop](https://www.docker.com/products/docker-desktop/) (includes Docker Compose)

### 1. Start the full stack

```bash
git clone https://github.com/AllanDzingo/NgulaAnaytics.git
cd NgulaAnaytics

docker-compose up --build
```

The first boot takes ~1–2 minutes because it builds the frontend, builds the API, starts Postgres, and seeds ~60 days of demo data.

### 2. Open the app

- **App (frontend):** http://localhost:5000
- **API base:** http://localhost:5000/api
- **Swagger (dev only):** http://localhost:5000/swagger
- **Health check:** http://localhost:5000/health

Log in with the demo credentials in the table above.

### 3. Stop / reset

```bash
# Stop the stack
docker-compose down

# Stop AND wipe the database (forces a fresh re-seed on next start)
docker-compose down -v
```

---

## 🧑‍💻 Run for Development (without Docker)

Run the database in Docker but the API/frontend directly for hot reload.

### 1. Start Postgres only

```bash
docker-compose up postgres
```

### 2. Run the backend API

```bash
cd src/NgulAnalytics.Api

# Point the API at the local Postgres container
# (Windows PowerShell)
$env:ConnectionStrings__DefaultConnection="Host=localhost;Database=ngula_analytics;Username=ngula;Password=NgulaDb2025!"
# (macOS/Linux)
export ConnectionStrings__DefaultConnection="Host=localhost;Database=ngula_analytics;Username=ngula;Password=NgulaDb2025!"

dotnet run
```

The API listens on `http://localhost:8080` by default when no `PORT`/`ASPNETCORE_URLS` is set. Swagger is available at `/swagger` in Development.

### 3. Run the frontend

```bash
cd src/ngula-frontend
npm install
npm run dev
```

The Vite dev server runs on http://localhost:5173 and proxies API calls. CORS is already configured for `http://localhost:5173` and `http://localhost:3000`.

---

## 🔨 Build & Test

### Build the backend
```bash
dotnet build src/NgulAnalytics.Api/NgulAnalytics.Api.csproj -c Release
```

### Build the frontend
```bash
cd src/ngula-frontend
npm install
npm run build
```

### Build the full production image (what Railway/Fly build)
```bash
docker build -t ngula-analytics .
```

### Tests

> ⚠️ **There are currently no automated unit/integration tests** in this repository
> (no .NET test project such as xUnit/NUnit, and no frontend test runner such as
> Vitest/Jest). The frontend `package.json` only defines `dev`, `build`, and `preview`.

The verification available today is a **smoke test** that builds the API and hits the
running endpoints (health + login + client-data). With the stack running
(`docker-compose up`), run:

```bash
# macOS / Linux
bash scripts/smoke-test.sh

# Windows PowerShell
powershell -File scripts/smoke-test.ps1
```

The smoke test:
1. Compiles the backend (`dotnet build`).
2. Checks `GET /health` returns 200.
3. Logs in as `exec@ngula.demo` and checks a JWT is returned.
4. Calls `/api/plant-data/production/summary` and `/api/plant-data/engineering/summary` with the token.

To add real unit tests later, create a test project, e.g.:
```bash
dotnet new xunit -o tests/NgulAnalytics.Api.Tests
dotnet add tests/NgulAnalytics.Api.Tests reference src/NgulAnalytics.Api/NgulAnalytics.Api.csproj
dotnet test
```

---

## ⚙️ Configuration


The API reads configuration from environment variables (or `appsettings.json`):

| Variable | Purpose | Default |
|----------|---------|---------|
| `PORT` | Port to bind (Railway / Heroku style) | — |
| `ASPNETCORE_URLS` | URLs to bind (Fly.io / Docker) | `http://0.0.0.0:8080` if neither is set |
| `DATABASE_URL` | Postgres connection (accepts `postgres://user:pass@host:port/db`) | — |
| `ConnectionStrings__DefaultConnection` | Npgsql connection string (fallback) | — |
| `Jwt__Key` | JWT signing key | built-in demo key |
| `Jwt__Issuer` / `Jwt__Audience` | JWT issuer / audience | `NgulaAnalytics` |
| `ASPNETCORE_ENVIRONMENT` | `Development` enables Swagger + HTTPS redirect | `Production` |

On startup the app:
1. Creates the database schema if it doesn't exist (`EnsureCreated`).
2. Seeds demo data only if the `Users` table is empty.
3. Serves the `/health` endpoint immediately (registered before seeding) so platform health checks pass even while seeding runs.

Seeding failures are logged but **do not crash the process**, so the container stays up.

---

## ☁️ Deployment

The app deploys as a single Docker image to either **Railway** or **Fly.io**.

Both platforms terminate TLS at the edge and forward plain HTTP to the container, so the API only speaks HTTP internally and HTTPS redirection is disabled outside of local Development.

### Railway
- Uses the root `Dockerfile` (`railway.toml`).
- Health check path: `/health`.
- Railway injects `PORT` — the app binds to it automatically.
- Add a **PostgreSQL** plugin/service and set either `DATABASE_URL` or `ConnectionStrings__DefaultConnection`.

### Fly.io
- Uses the root `Dockerfile` (`fly.toml`).
- Internal port `5000` (`ASPNETCORE_URLS=http://+:5000`).
- Provision Postgres (`fly postgres create`) and attach it so `DATABASE_URL` is set.
- VM is sized at 512MB to give .NET + seeding enough headroom.

> **Note:** A reachable Postgres database is required. If the database is unreachable at startup, the API still boots and serves `/health`, but data endpoints will error until the DB is available.

---

## 📊 Client Dataset (PGM Concentrator, 400 tph)

The demo ingests a real client-supplied dataset (`PGM_Concentrator_400tph_Random_Data.xlsx`).
The workbook was converted to JSON (`src/NgulAnalytics.Api/Seed/Data/*.json`) and is loaded
into the database on first startup:

- **Plant Production** — 180 shift records (feed TPH, RoM tonnes, recovery, concentrate
  tonnes/grade, availability, utilisation, downtime, production status, etc.)
- **Engineering Condition Monitoring** — 1,440 equipment readings (vibration, bearing
  temperatures, oil analysis, wear-liner %, days to PM, condition status, estimated RUL, etc.)

To regenerate the JSON from an updated workbook, run:

```bash
python scripts/convert_xlsx_to_json.py
```

### API endpoints (require login / JWT)

| Method | Route | Description |
|--------|-------|-------------|
| GET | `/api/plant-data/production` | Plant production records (filters: `shift`, `crew`, `status`, `take`) |
| GET | `/api/plant-data/production/summary` | Production KPIs (RoM tonnes, avg feed, recovery, availability, action shifts) |
| GET | `/api/plant-data/engineering` | Equipment CM readings (filters: `area`, `equipmentId`, `conditionStatus`, `take`) |
| GET | `/api/plant-data/engineering/summary` | CM KPIs (critical/alert counts, avg vibration & bearing temp, PM due ≤10 days) |
| GET | `/api/plant-data/engineering/latest` | Latest condition reading per equipment item (fleet health snapshot) |

## 📚 Additional Docs
- `docs/backend-to-frontend-implementation-matrix.md`
- `docs/frontend-audit.md`


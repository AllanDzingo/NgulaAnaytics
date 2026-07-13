# Deployment & Database Setup (why demo logins were broken)

## Root cause

The app deployed, but **no `DATABASE_URL` was configured**, so:

1. `appsettings.json` ships with an empty `ConnectionStrings:DefaultConnection`.
2. `Program.cs` reads the `DATABASE_URL` environment variable; if it is missing the
   connection string is empty.
3. The startup seeder (`DataSeeder.SeedAsync`) is wrapped in a `try/catch` that only
   logs on failure, so a bad/empty DB connection **fails silently** and **no demo
   users are ever created**.
4. Result: every demo login (`exec@ngula.demo`, etc. / `Demo@2025`) returns
   "invalid credentials", and the API itself returns **502** because it cannot serve
   DB-backed routes.

The live health check returned **HTTP 502** during diagnosis, confirming the app
could not reach a database.

## Code fixes already applied

- `Program.cs` now:
  - Correctly parses `postgres://user:pass@host:port/db` URLs, **URL-decodes** the
    username/password, and forces `SSL Mode=Require` (managed Postgres requires TLS).
  - Logs a clear `FATAL: No database connection string configured` message instead of
    starting silently with no DB.
- `fly.toml` `primary_region` changed from `lax` → **`ams`** to match the Postgres
  cluster (cluster ID `n83v7rgw91l05gxk`, region `ams`).

## Demo accounts (created by the seeder once the DB is connected)

| Email                    | Role        | Password    |
|--------------------------|-------------|-------------|
| exec@ngula.demo          | Executive   | Demo@2025   |
| engineer@ngula.demo      | Engineering | Demo@2025   |
| production@ngula.demo    | Production  | Demo@2025   |
| sheq@ngula.demo          | SHEQ        | Demo@2025   |
| supervisor@ngula.demo    | Supervisor  | Demo@2025   |

## What you must do on the platform

You are deploying on **Fly.io** (per `fly.toml`), and you have a managed Postgres
cluster **`ngula`** in `ams`. The app needs the connection string as a secret.

### Fly.io (recommended, since fly.toml targets it)

```bash
# 1. Attach the existing Postgres cluster to the app. This automatically sets the
#    DATABASE_URL secret on the ngula-analytics app.
fly postgres attach ngula --app ngula-analytics

# --- OR, if attach is unavailable for a managed cluster, set it manually ---
# Get the connection string from the Fly dashboard (Postgres cluster > Connect),
# then:
fly secrets set DATABASE_URL="postgres://<user>:<password>@<host>:5432/<db>?sslmode=require" \
  --app ngula-analytics

# 2. Redeploy so the code fixes + region change take effect and seeding runs.
fly deploy --app ngula-analytics

# 3. Verify
curl https://ngula-analytics.fly.dev/health          # -> {"status":"ok"}
fly logs --app ngula-analytics                        # look for "Database seeding completed successfully."
```

### Railway (only if you deploy there instead)

Railway auto-provisions a Postgres plugin and injects `DATABASE_URL`. Ensure the
Postgres plugin is added to the project and linked to the service, then redeploy.
The same code path handles Railway's `DATABASE_URL` format.

## Verifying demo login works

```bash
curl -X POST https://ngula-analytics.fly.dev/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"exec@ngula.demo","password":"Demo@2025"}'
# Expect: 200 with a JWT token
```

## Notes

- Seeding is idempotent: it only runs when the `Users` table is empty, so redeploys
  are safe.
- The seeder uses `EnsureCreatedAsync()` (no EF migrations shipped), so it builds the
  schema on first connection to an empty database.

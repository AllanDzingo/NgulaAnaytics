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

## Exact DATABASE_URL secret for this cluster

Fly gave two connection strings:

| Type              | URL |
|-------------------|-----|
| **Direct** (use this) | `postgresql://fly-user:...@direct.n83v7rgw91l05gxk.flympg.net/fly-db` |
| Pooled (PgBouncer)    | `postgresql://fly-user:...@pgbouncer.n83v7rgw91l05gxk.flympg.net/fly-db` |

**Use the DIRECT url**, not the pgbouncer one. EF Core's `EnsureCreated`/schema
work and Npgsql's prepared statements don't play well with a transaction-mode
pooler. (The app now auto-detects a `pgbouncer`/`pooler` host and disables
prepared statements as a safety net, but direct is still preferred for the
schema-building + seeding this demo does.)

Set it once:

```bash
fly secrets set \
  DATABASE_URL="postgresql://fly-user:NBiraHPGGyACzK9gvYtmjA9s@direct.n83v7rgw91l05gxk.flympg.net/fly-db" \
  --app ngula-analytics
```

Notes on the format:
- No explicit port → the app defaults to `5432`.
- No `?sslmode=require` needed → the app **forces** `SSL Mode=Require` for all
  managed hosts, so TLS is always on.

Then redeploy: `fly deploy --app ngula-analytics`.

## Resilience built into the app (so you don't hit DB issues again)

`Program.cs` now configures the Npgsql connection with:
- `SSL Mode=Require` (always TLS on managed Postgres)
- `Timeout=30`, `CommandTimeout=60`, `KeepAlive=30` (survive idle NAT / brief stalls)
- `MaxPoolSize=20`
- Auto-disable of prepared statements when the host is a pooler
- **`EnableRetryOnFailure(5, 10s)`** — transient connection drops are retried
  automatically instead of throwing, which is the main guard against sporadic
  "database" errors.

Combined with `min_machines_running = 1` in `fly.toml` (machine stays warm, no
cold-start re-seed), demo logins should be reliable.

## Notes

- Seeding is idempotent: it only runs when the `Users` table is empty, so redeploys
  are safe.
- The seeder uses `EnsureCreatedAsync()` (no EF migrations shipped), so it builds the
  schema on first connection to an empty database.
- **Rotate that password** after the demo — it is now in your shell history and this
  doc. Regenerate credentials in the Fly dashboard and re-run `fly secrets set`.



# Ngula Analytics — Operational Intelligence for Mining Excellence

A mining operations intelligence platform that consolidates Production, Engineering, Maintenance, and SHEQ data into a single decision-support system.

## Deployment

This repository is configured for Railway. The app is containerized through the existing Dockerfile and uses the Railway-provided PORT environment variable at runtime.

### Railway notes
- Remove any Fly.io configuration from the deployment target.
- Set the service to use the root Dockerfile.
- Ensure the service exposes port 5000 and uses the health check path /health.

## Quick Start

### Prerequisites
- Docker & Docker Compose
- .NET 9 SDK (for local backend development)
- Node.js 22+ (for local frontend development)

### Run with Docker Compose

```bash
# Clone the repository
git clone https://github.com/AllanDzingo/NgulaAnaytics.git
cd NgulaAnaytics

# Start the full stack
docker-compose up --build

# Access the application
# API: http://localhost:5000
# Swagger: http://localhost:5000/swagger
# Frontend: http://localhost:5000 (served via ASP.NET static files)# NgulaAnaytics

# ============================================
# Stage 1: Build ASP.NET Core Backend
# ============================================
FROM mcr.microsoft.com/dotnet/sdk:9.0 AS backend-build
WORKDIR /src

# Copy csproj and restore
COPY src/NgulAnalytics.Api/NgulAnalytics.Api.csproj src/NgulAnalytics.Api/
RUN dotnet restore src/NgulAnalytics.Api/NgulAnalytics.Api.csproj

# Copy backend source and build
COPY src/NgulAnalytics.Api/ src/NgulAnalytics.Api/
RUN dotnet publish src/NgulAnalytics.Api/NgulAnalytics.Api.csproj -c Release -o /app/publish

# ============================================
# Stage 2: Build React Frontend
# ============================================
FROM node:22-alpine AS frontend-build
WORKDIR /frontend

# Copy package files
COPY src/ngula-frontend/package*.json ./
RUN npm ci && chmod +x node_modules/.bin/*

# Copy frontend source and build
COPY src/ngula-frontend/ ./
RUN npm run build

# ============================================
# Stage 3: Runtime — ASP.NET + Static Files
# ============================================
FROM mcr.microsoft.com/dotnet/aspnet:9.0 AS runtime
WORKDIR /app

# Install curl for health checks
RUN apt-get update && apt-get install -y curl && rm -rf /var/lib/apt/lists/*

# Copy backend publish output
COPY --from=backend-build /app/publish .

# Copy frontend build into wwwroot for static file serving
COPY --from=frontend-build /frontend/dist ./wwwroot

# Environment
ENV ASPNETCORE_URLS=http://+:5000
ENV ASPNETCORE_ENVIRONMENT=Production

EXPOSE 5000

HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
    CMD curl -f http://localhost:5000/health || exit 1

ENTRYPOINT ["dotnet", "NgulAnalytics.Api.dll"]
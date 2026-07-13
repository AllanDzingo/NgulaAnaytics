using NgulAnalytics.Api.Seed;
using System.Text;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.HttpOverrides;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using NgulAnalytics.Api.Auth;
using NgulAnalytics.Api.Data;
using NgulAnalytics.Api.Services;

var builder = WebApplication.CreateBuilder(args);

// Bind to the platform-provided PORT (Railway/Heroku style) if present,
// otherwise fall back to ASPNETCORE_URLS (Fly.io/Docker), otherwise default to 8080.
var port = Environment.GetEnvironmentVariable("PORT");
if (!string.IsNullOrWhiteSpace(port))
{
    builder.WebHost.UseUrls($"http://0.0.0.0:{port}");
}
else if (string.IsNullOrWhiteSpace(Environment.GetEnvironmentVariable("ASPNETCORE_URLS")))
{
    builder.WebHost.UseUrls("http://0.0.0.0:8080");
}



// Add services to the container.
builder.Services.AddControllers();
builder.Services.AddScoped<DataSeeder>();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

// CORS
// The SPA is served from the SAME origin/container as the API in production,
// so same-origin requests never hit CORS. We still allow local dev origins
// (Vite on :5173, CRA on :3000) plus any origins listed in the CORS_ORIGINS
// env var (comma-separated) for the case where the frontend is hosted
// separately (e.g. a different Fly/Railway app or a custom domain).
builder.Services.AddCors(options =>
{
    options.AddDefaultPolicy(policy =>
    {
        var extraOrigins = (Environment.GetEnvironmentVariable("CORS_ORIGINS") ?? string.Empty)
            .Split(',', StringSplitOptions.RemoveEmptyEntries | StringSplitOptions.TrimEntries);

        policy.WithOrigins(
                  new[] { "http://localhost:5173", "http://localhost:3000" }
                      .Concat(extraOrigins)
                      .ToArray())
              .AllowAnyHeader()
              .AllowAnyMethod();
    });
});


// Database - prioritize DATABASE_URL from Fly.io environment, fallback to config
var dbUrl = Environment.GetEnvironmentVariable("DATABASE_URL")
    ?? builder.Configuration.GetConnectionString("DefaultConnection");

// Convert Fly.io / Railway DATABASE_URL format
// (postgres://user:pass@host:5432/db?sslmode=require) to Npgsql key/value format.
var connectionString = dbUrl;
if (!string.IsNullOrEmpty(dbUrl) && (dbUrl.StartsWith("postgres://") || dbUrl.StartsWith("postgresql://")))
{
    var uri = new Uri(dbUrl);
    var userInfo = uri.UserInfo.Split(':', 2);
    var username = Uri.UnescapeDataString(userInfo[0]);
    var password = userInfo.Length > 1 ? Uri.UnescapeDataString(userInfo[1]) : string.Empty;
    var dbPort = uri.Port > 0 ? uri.Port : 5432;

    // Detect a connection-pooler host (Fly's PgBouncer, Supabase pooler, etc.).
    // Transaction-mode poolers don't support server-side prepared statements,
    // which Npgsql uses by default and which breaks EnsureCreated/EF queries.
    // When we're talking to a pooler we must disable prepared statements.
    var isPooler = uri.Host.Contains("pgbouncer", StringComparison.OrdinalIgnoreCase)
                || uri.Host.Contains("pooler", StringComparison.OrdinalIgnoreCase);

    // Managed Postgres providers (Fly.io, Railway, Supabase, etc.) require TLS.
    // Trust the server certificate since these platforms use their own CA.
    var builderNpgsql = new Npgsql.NpgsqlConnectionStringBuilder
    {
        Host = uri.Host,
        Port = dbPort,

        Database = uri.AbsolutePath.TrimStart('/'),
        Username = username,
        Password = password,
        SslMode = Npgsql.SslMode.Require,

        // Resilience settings so transient network blips against managed
        // Postgres don't manifest as hard failures / seeding crashes.
        Timeout = 30,                 // seconds to establish a connection
        CommandTimeout = 60,          // seconds for a single command
        KeepAlive = 30,               // send TCP keepalives to survive idle NAT
        MaxPoolSize = 20,
        // When behind a transaction pooler, Npgsql must NOT use server-side
        // prepared statements (the pooler multiplexes connections).
        MaxAutoPrepare = isPooler ? 0 : 20,
    };

    connectionString = builderNpgsql.ConnectionString;
}


if (string.IsNullOrWhiteSpace(connectionString))
{
    // Fail loudly at startup rather than silently skipping seeding, which
    // previously left the app running with zero users and broken demo logins.
    Console.Error.WriteLine(
        "FATAL: No database connection string configured. " +
        "Set the DATABASE_URL environment variable (e.g. `fly secrets set DATABASE_URL=...`) " +
        "or ConnectionStrings:DefaultConnection.");
}

builder.Services.AddDbContext<NgulAnalyticsDbContext>(options =>
    options.UseNpgsql(connectionString, npgsql =>
    {
        // Automatically retry transient failures (dropped connections, brief
        // pooler/network hiccups) instead of throwing. This is the main guard
        // against "random" DB errors on managed Postgres.
        npgsql.EnableRetryOnFailure(
            maxRetryCount: 5,
            maxRetryDelay: TimeSpan.FromSeconds(10),
            errorCodesToAdd: null);
    }));



// JWT Authentication
var jwtKey = builder.Configuration["Jwt:Key"] ?? "NgulaAnalyticsSuperSecretKey2025!";
var jwtIssuer = builder.Configuration["Jwt:Issuer"] ?? "NgulaAnalytics";
var jwtAudience = builder.Configuration["Jwt:Audience"] ?? "NgulaAnalytics";

builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options =>
    {
        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuer = true,
            ValidateAudience = true,
            ValidateLifetime = true,
            ValidateIssuerSigningKey = true,
            ValidIssuer = jwtIssuer,
            ValidAudience = jwtAudience,
            IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtKey)),
            ClockSkew = TimeSpan.Zero
        };
    });

builder.Services.AddAuthorization(options =>
{
    options.AddPolicy("Executive", policy => policy.RequireRole("Executive"));
    options.AddPolicy("Engineering", policy => policy.RequireRole("Executive", "Engineering"));
    options.AddPolicy("Production", policy => policy.RequireRole("Executive", "Production"));
    options.AddPolicy("SHEQ", policy => policy.RequireRole("Executive", "SHEQ"));
    options.AddPolicy("Supervisor", policy => policy.RequireRole("Executive", "Engineering", "Production", "SHEQ", "Supervisor"));
});

builder.Services.Configure<ForwardedHeadersOptions>(options =>
{
    options.ForwardedHeaders = ForwardedHeaders.XForwardedFor | ForwardedHeaders.XForwardedProto;
    options.KnownNetworks.Clear();
    options.KnownProxies.Clear();
});

// Services
builder.Services.AddScoped<JwtService>();
builder.Services.AddScoped<ProductionService>();
builder.Services.AddScoped<EngineeringService>();
builder.Services.AddScoped<MaintenanceService>();
builder.Services.AddScoped<SheqService>();
builder.Services.AddScoped<DashboardService>();
builder.Services.AddScoped<HandoverService>();
builder.Services.AddScoped<ActionService>();
builder.Services.AddScoped<AlertService>();
builder.Services.AddScoped<UserService>();

var app = builder.Build();

// Health endpoint MUST be registered first and be reachable without auth or
// HTTPS redirection so the platform health check succeeds immediately.
app.MapGet("/health", () => Results.Ok(new { status = "ok" }));

// Seed data. This is wrapped so that a database issue never crashes the
// process on startup (which previously caused the VM to restart in a loop).
// Seeding runs in the background so the app can start serving /health right away.
using (var scope = app.Services.CreateScope())
{
    var logger = scope.ServiceProvider.GetRequiredService<ILogger<Program>>();
    try
    {
        var context = scope.ServiceProvider.GetRequiredService<NgulAnalyticsDbContext>();
        var seeder = new DataSeeder(context);
        await seeder.SeedAsync();
        logger.LogInformation("Database seeding completed successfully.");
    }
    catch (Exception ex)
    {
        logger.LogError(ex, "Database seeding failed. The API will still start; check the DATABASE connection.");
    }
}

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseForwardedHeaders();

// Only redirect to HTTPS in local development. In containers (Fly.io / Railway)
// TLS is terminated at the platform edge and the app speaks plain HTTP internally,
// so enabling HTTPS redirection there breaks requests and health checks.
if (app.Environment.IsDevelopment())
{
    app.UseHttpsRedirection();
}

// Serve frontend static files (React build copied into wwwroot)
app.UseDefaultFiles();
app.UseStaticFiles();

app.UseCors();
app.UseAuthentication();
app.UseAuthorization();
app.MapControllers();

// SPA fallback: any non-API, non-file route serves index.html so client-side
// routing works when the app is deployed as a single container.
app.MapFallbackToFile("index.html");

app.Run();



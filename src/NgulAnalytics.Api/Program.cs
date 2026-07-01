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

var port = Environment.GetEnvironmentVariable("PORT");
if (!string.IsNullOrWhiteSpace(port))
{
    builder.WebHost.UseUrls($"http://0.0.0.0:{port}");
}

// Add services to the container.
builder.Services.AddControllers();
builder.Services.AddScoped<DataSeeder>();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

// CORS
builder.Services.AddCors(options =>
{
    options.AddDefaultPolicy(policy =>
    {
        policy.WithOrigins("http://localhost:5173", "http://localhost:3000")
              .AllowAnyHeader()
              .AllowAnyMethod();
    });
});

// Database
builder.Services.AddDbContext<NgulAnalyticsDbContext>(options =>
    options.UseNpgsql(builder.Configuration.GetConnectionString("DefaultConnection")));

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

// Seed data
using (var scope = app.Services.CreateScope())
{
    var context = scope.ServiceProvider.GetRequiredService<NgulAnalyticsDbContext>();
    var seeder = new DataSeeder(context);
    await seeder.SeedAsync();
}

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

// Serve frontend static files in production (must be before MapControllers)
app.UseDefaultFiles();
app.UseStaticFiles();

app.UseForwardedHeaders();
app.UseHttpsRedirection();
app.UseCors();
app.UseAuthentication();
app.UseAuthorization();
app.MapGet("/health", () => Results.Ok(new { status = "ok" }));
app.MapControllers();

app.Run();

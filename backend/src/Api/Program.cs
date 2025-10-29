using Api.Features.Auth;
using Api.Features.Dashboard;
using Api.Features.Demands;
using Api.Features.Users;
using Api.Features.System;
using Api.Features.Permissions;
using Api.Features.Profiles;
using Api.Features.Configs;
using Api.Persistence;
using Api.Security;
using Api.Services;
using Api.Filters;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Diagnostics.HealthChecks;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.FileProviders;
using Microsoft.IdentityModel.Tokens;
using Serilog;
using System.Text;
using System.Text.Json;
using System.Text.Json.Serialization;
using FluentValidation;

var builder = WebApplication.CreateBuilder(args);

// Serilog
builder.Host.UseSerilog((ctx, cfg) => cfg
    .ReadFrom.Configuration(ctx.Configuration)
    .WriteTo.Console());

// CORS
builder.Services.AddCors(opts =>
{
    var origins = builder.Configuration.GetSection("Cors:Origins").Get<string[]>()
        ?? new[] { "http://localhost:5173", "http://localhost:5177" };
    opts.AddPolicy("frontend", p => p
        .WithOrigins(origins)
        .AllowAnyHeader()
        .AllowAnyMethod()
        .AllowCredentials());
});

// DbContext
builder.Services.AddDbContext<AppDbContext>(o =>
    o.UseNpgsql(builder.Configuration.GetConnectionString("postgres")));

// JWT
var jwtSection = builder.Configuration.GetSection("Jwt");
builder.Services.Configure<JwtOptions>(jwtSection);
var jwt = jwtSection.Get<JwtOptions>()!;
builder.Services.AddSingleton(jwt);

builder.Services
    .AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(opt =>
    {
        opt.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuer = true,
            ValidateAudience = true,
            ValidateLifetime = true,
            ValidateIssuerSigningKey = true,
            ValidIssuer = jwt.Issuer,
            ValidAudience = jwt.Audience,
            IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwt.SigningKey))
        };
    });

builder.Services.AddAuthorization(opts => { opts.AddPermissionPolicies(); });

// Services
builder.Services.AddScoped<ProtocolService>();
builder.Services.AddScoped<FileStorageService>();
builder.Services.Configure<SmtpOptions>(builder.Configuration.GetSection("Smtp"));
builder.Services.AddScoped<EmailService>();

builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();
builder.Services.AddProblemDetails(opts =>
{
    opts.CustomizeProblemDetails = ctx =>
    {
        ctx.ProblemDetails.Extensions["traceId"] = ctx.HttpContext.TraceIdentifier;
    };
});

// JSON: serialize enums as their original names (db remains int)
builder.Services.ConfigureHttpJsonOptions(opts =>
{
    opts.SerializerOptions.Converters.Add(new JsonStringEnumConverter());
});

// Health checks
builder.Services.AddHealthChecks()
    .AddCheck<Api.Health.DbHealthCheck>("db");

// FluentValidation - registra todos os validators do assembly
builder.Services.AddValidatorsFromAssemblyContaining<Api.Features.Auth.LoginDtoValidator>();

var app = builder.Build();

app.UseSerilogRequestLogging();
app.UseExceptionHandler();
app.UseCors("frontend");
app.UseAuthentication();
app.UseAuthorization();

// static files for attachments
app.UseStaticFiles(new StaticFileOptions
{
    FileProvider = new PhysicalFileProvider(Path.Combine(app.Environment.ContentRootPath, "storage")),
    RequestPath = "/storage"
});

// static files for profile pictures and uploads
var uploadsPath = Path.Combine(app.Environment.ContentRootPath, "wwwroot");
if (!Directory.Exists(uploadsPath))
    Directory.CreateDirectory(uploadsPath);

app.UseStaticFiles(new StaticFileOptions
{
    FileProvider = new PhysicalFileProvider(uploadsPath),
    RequestPath = ""
});

app.UseSwagger();
app.UseSwaggerUI();

app.MapGet("/health", () => Results.Ok(new { status = "ok" }));
app.MapHealthChecks("/healthz");
app.MapHealthChecks("/health/db", new HealthCheckOptions
{
    Predicate = r => r.Name == "db"
});

app.MapAuth();
app.MapUserManagement();
app.MapUserProfileEndpoints();
app.MapDemandEndpoints();
app.MapDashboard();
app.MapInit();
app.MapPermissionEndpoints();
app.MapProfileEndpoints();
app.MapFormConfigEndpoints();

app.Run();

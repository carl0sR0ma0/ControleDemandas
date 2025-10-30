using Api.Features.Auth;
using Api.Features.Backlogs;
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

// DbContext com configurações otimizadas de connection pool
builder.Services.AddDbContext<AppDbContext>(o =>
{
    var connectionString = builder.Configuration.GetConnectionString("postgres");
    o.UseNpgsql(connectionString, npgsqlOptions =>
    {
        // Batch múltiplos comandos para reduzir round-trips ao banco
        npgsqlOptions.MaxBatchSize(100);

        // Timeout de comandos (30 segundos)
        npgsqlOptions.CommandTimeout(30);

        // Retry automático em caso de falhas transientes
        npgsqlOptions.EnableRetryOnFailure(
            maxRetryCount: 3,
            maxRetryDelay: TimeSpan.FromSeconds(5),
            errorCodesToAdd: null);

        // Migrations assembly (caso use projeto separado no futuro)
        npgsqlOptions.MigrationsAssembly("Api");
    });

    // Habilitar logging sensível de dados apenas em desenvolvimento
    if (builder.Environment.IsDevelopment())
    {
        o.EnableSensitiveDataLogging();
        o.EnableDetailedErrors();
    }
});

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

// Email Queue (Singleton para compartilhar a mesma fila)
builder.Services.AddSingleton<EmailQueueService>();
builder.Services.AddSingleton<IEmailQueueService>(sp => sp.GetRequiredService<EmailQueueService>());

// Background Service para processar e-mails
builder.Services.AddHostedService<Api.BackgroundServices.EmailBackgroundService>();

builder.Services.AddScoped<DemandNotificationService>();

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

// Aplicar migrations automaticamente na inicialização
try
{
    using var scope = app.Services.CreateScope();
    var dbContext = scope.ServiceProvider.GetRequiredService<AppDbContext>();

    Log.Information("Verificando estado do banco de dados...");

    // Verifica se há migrations pendentes
    var pendingMigrations = dbContext.Database.GetPendingMigrations().ToList();
    if (pendingMigrations.Any())
    {
        Log.Information("Encontradas {Count} migration(s) pendente(s): {Migrations}",
            pendingMigrations.Count,
            string.Join(", ", pendingMigrations));

        // Aplica automaticamente as migrations pendentes
        // Se o banco não existir, ele será criado automaticamente
        dbContext.Database.Migrate();

        Log.Information("Todas as migrations foram aplicadas com sucesso!");
    }
    else
    {
        Log.Information("Banco de dados está atualizado. Nenhuma migration pendente.");
    }
}
catch (Exception ex)
{
    Log.Error(ex, "Erro ao aplicar migrations do banco de dados. A aplicação continuará, mas pode haver problemas.");
    // Não interrompe a aplicação, apenas loga o erro
}

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
app.MapBacklogEndpoints();
app.MapDashboard();
app.MapInit();
app.MapPermissionEndpoints();
app.MapProfileEndpoints();
app.MapFormConfigEndpoints();

app.Run();

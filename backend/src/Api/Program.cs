using Api.Features.Auth;
using Api.Features.Dashboard;
using Api.Features.Demands;
using Api.Features.Users;
using Api.Persistence;
using Api.Security;
using Api.Services;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.FileProviders;
using Microsoft.IdentityModel.Tokens;
using Serilog;
using System.Text;

var builder = WebApplication.CreateBuilder(args);

// Serilog
builder.Host.UseSerilog((ctx, cfg) => cfg
    .ReadFrom.Configuration(ctx.Configuration)
    .WriteTo.Console());

// CORS
builder.Services.AddCors(opts =>
    opts.AddPolicy("frontend", p => p
        .WithOrigins(builder.Configuration["Cors:Origin"] ?? "http://localhost:5173")
        .AllowAnyHeader().AllowAnyMethod().AllowCredentials()));

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

var app = builder.Build();

app.UseSerilogRequestLogging();
app.UseCors("frontend");
app.UseAuthentication();
app.UseAuthorization();

// static files for attachments
app.UseStaticFiles(new StaticFileOptions
{
    FileProvider = new PhysicalFileProvider(Path.Combine(app.Environment.ContentRootPath, "storage")),
    RequestPath = "/storage"
});

app.UseSwagger();
app.UseSwaggerUI();

app.MapGet("/health", () => Results.Ok(new { status = "ok" }));

app.MapAuth();
app.MapUserEndpoints();
app.MapDemandEndpoints();
app.MapDashboard();

app.Run();

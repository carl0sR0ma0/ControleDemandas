using Api.Domain;
using Api.Persistence;
using Microsoft.AspNetCore.Http.HttpResults;
using Microsoft.EntityFrameworkCore;

namespace Api.Features.System;

public static class InitEndpoints
{
    public static IEndpointRouteBuilder MapInit(this IEndpointRouteBuilder app)
    {
        app.MapPost("/init", async (
            AppDbContext db,
            IWebHostEnvironment env,
            IConfiguration cfg,
            HttpRequest req,
            ILoggerFactory loggerFactory) =>
        {
            var logger = loggerFactory.CreateLogger("Init");

            // Security gate: allow in Development; require token otherwise
            if (!env.IsDevelopment())
            {
                var configuredToken = cfg["Init:Token"];
                var providedToken = req.Query["token"].ToString();

                if (string.IsNullOrWhiteSpace(configuredToken) || configuredToken != providedToken)
                {
                    return Results.Forbid();
                }
            }

            var actions = new List<string>();

            // Run migrations
            await db.Database.MigrateAsync();
            actions.Add("migrations_applied");

            // Ensure storage directory exists
            var storagePath = Path.Combine(env.ContentRootPath, "storage");
            if (!Directory.Exists(storagePath))
            {
                Directory.CreateDirectory(storagePath);
                actions.Add("storage_created");
            }
            else
            {
                actions.Add("storage_exists");
            }

            // Ensure default admin exists (idempotent)
            var adminEmail = "admin@empresa.com";
            var admin = await db.Users.AsNoTracking().SingleOrDefaultAsync(u => u.Email == adminEmail);
            if (admin is null)
            {
                var u = new User
                {
                    Name = "Administrador",
                    Email = adminEmail,
                    PasswordHash = BCrypt.Net.BCrypt.HashPassword("Admin@123"),
                    Role = "Admin"
                };
                db.Users.Add(u);
                await db.SaveChangesAsync();
                actions.Add("admin_seeded");
            }
            else
            {
                actions.Add("admin_exists");
            }

            logger.LogInformation("/init executed with actions: {Actions}", string.Join(",", actions));
            return Results.Ok(new
            {
                status = "ok",
                environment = env.EnvironmentName,
                actions
            });
        })
        .WithName("Init")
        .WithSummary("Aplica migrations, prepara storage e semente inicial.")
        .WithDescription("Endpoint idempotente para preparar a aplicação. Em produção, requer token em query string (?token=...).");

        return app;
    }
}

using Api.Domain;
using Api.Persistence;
using Microsoft.AspNetCore.Authorization;
using Microsoft.EntityFrameworkCore;

namespace Api.Features.Configs;

public static class FormConfigEndpoints
{
    public static IEndpointRouteBuilder MapFormConfigEndpoints(this IEndpointRouteBuilder app)
    {
        var g = app.MapGroup("/configs").RequireAuthorization("PERM:" + nameof(Permission.GerenciarUsuarios));

        // Areas
        var areas = g.MapGroup("/areas");
        areas.MapGet("/", async (AppDbContext db) => Results.Ok(await db.Areas.AsNoTracking().OrderBy(x=>x.Name).ToListAsync()));
        areas.MapPost("/", async (AppDbContext db, SimpleCreate dto) => { var e = new Area { Name = dto.Name, Active = dto.Active ?? true }; db.Areas.Add(e); await db.SaveChangesAsync(); return Results.Created($"/configs/areas/{e.Id}", new { e.Id }); });
        areas.MapPut("/{id:guid}", async (Guid id, AppDbContext db, SimpleUpdate dto) => { var e = await db.Areas.FindAsync(id); if (e is null) return Results.NotFound(); if (!string.IsNullOrWhiteSpace(dto.Name)) e.Name = dto.Name!; if (dto.Active is not null) e.Active = dto.Active.Value; await db.SaveChangesAsync(); return Results.NoContent(); });
        areas.MapDelete("/{id:guid}", async (Guid id, AppDbContext db) => { var e = await db.Areas.FindAsync(id); if (e is null) return Results.NotFound(); db.Areas.Remove(e); await db.SaveChangesAsync(); return Results.NoContent(); });

        // Clients
        var clients = g.MapGroup("/clients");
        clients.MapGet("/", async (AppDbContext db) => Results.Ok(await db.Clients.AsNoTracking().OrderBy(x=>x.Name).ToListAsync()));
        clients.MapPost("/", async (AppDbContext db, SimpleCreate dto) => { var e = new Client { Name = dto.Name, Active = dto.Active ?? true }; db.Clients.Add(e); await db.SaveChangesAsync(); return Results.Created($"/configs/clients/{e.Id}", new { e.Id }); });
        clients.MapPut("/{id:guid}", async (Guid id, AppDbContext db, SimpleUpdate dto) => { var e = await db.Clients.FindAsync(id); if (e is null) return Results.NotFound(); if (!string.IsNullOrWhiteSpace(dto.Name)) e.Name = dto.Name!; if (dto.Active is not null) e.Active = dto.Active.Value; await db.SaveChangesAsync(); return Results.NoContent(); });
        clients.MapDelete("/{id:guid}", async (Guid id, AppDbContext db) => { var e = await db.Clients.FindAsync(id); if (e is null) return Results.NotFound(); db.Clients.Remove(e); await db.SaveChangesAsync(); return Results.NoContent(); });

        // Units
        var units = g.MapGroup("/units");
        units.MapGet("/", async (AppDbContext db) => Results.Ok(await db.Units.AsNoTracking().OrderBy(x=>x.Name).ToListAsync()));
        units.MapPost("/", async (AppDbContext db, SimpleCreate dto) => { var e = new Unit { Name = dto.Name, Active = dto.Active ?? true }; db.Units.Add(e); await db.SaveChangesAsync(); return Results.Created($"/configs/units/{e.Id}", new { e.Id }); });
        units.MapPut("/{id:guid}", async (Guid id, AppDbContext db, SimpleUpdate dto) => { var e = await db.Units.FindAsync(id); if (e is null) return Results.NotFound(); if (!string.IsNullOrWhiteSpace(dto.Name)) e.Name = dto.Name!; if (dto.Active is not null) e.Active = dto.Active.Value; await db.SaveChangesAsync(); return Results.NoContent(); });
        units.MapDelete("/{id:guid}", async (Guid id, AppDbContext db) => { var e = await db.Units.FindAsync(id); if (e is null) return Results.NotFound(); db.Units.Remove(e); await db.SaveChangesAsync(); return Results.NoContent(); });

        // Statuses
        var statuses = g.MapGroup("/statuses");
        statuses.MapGet("/", async (AppDbContext db) => Results.Ok(await db.Statuses.AsNoTracking().OrderBy(x=>x.Name).ToListAsync()));
        statuses.MapPost("/", async (AppDbContext db, SimpleCreate dto) => { var e = new StatusConfig { Name = dto.Name, Active = dto.Active ?? true }; db.Statuses.Add(e); await db.SaveChangesAsync(); return Results.Created($"/configs/statuses/{e.Id}", new { e.Id }); });
        statuses.MapPut("/{id:guid}", async (Guid id, AppDbContext db, SimpleUpdate dto) => { var e = await db.Statuses.FindAsync(id); if (e is null) return Results.NotFound(); if (!string.IsNullOrWhiteSpace(dto.Name)) e.Name = dto.Name!; if (dto.Active is not null) e.Active = dto.Active.Value; await db.SaveChangesAsync(); return Results.NoContent(); });
        statuses.MapDelete("/{id:guid}", async (Guid id, AppDbContext db) => { var e = await db.Statuses.FindAsync(id); if (e is null) return Results.NotFound(); db.Statuses.Remove(e); await db.SaveChangesAsync(); return Results.NoContent(); });

        // Systems
        var systems = g.MapGroup("/systems");
        systems.MapGet("/", async (AppDbContext db) => Results.Ok(await db.Systems.AsNoTracking().OrderBy(x=>x.Name).ToListAsync()));
        systems.MapPost("/", async (AppDbContext db, SimpleCreate dto) => { var e = new SystemEntity { Name = dto.Name, Active = dto.Active ?? true }; db.Systems.Add(e); await db.SaveChangesAsync(); return Results.Created($"/configs/systems/{e.Id}", new { e.Id }); });
        systems.MapPut("/{id:guid}", async (Guid id, AppDbContext db, SimpleUpdate dto) => { var e = await db.Systems.FindAsync(id); if (e is null) return Results.NotFound(); if (!string.IsNullOrWhiteSpace(dto.Name)) e.Name = dto.Name!; if (dto.Active is not null) e.Active = dto.Active.Value; await db.SaveChangesAsync(); return Results.NoContent(); });
        systems.MapDelete("/{id:guid}", async (Guid id, AppDbContext db) => { var e = await db.Systems.FindAsync(id); if (e is null) return Results.NotFound(); db.Systems.Remove(e); await db.SaveChangesAsync(); return Results.NoContent(); });

        // System Versions
        var versions = systems.MapGroup("/{systemId:guid}/versions");
        versions.MapGet("/", async (Guid systemId, AppDbContext db) => Results.Ok(await db.SystemVersions.AsNoTracking().Where(v=>v.SystemEntityId==systemId).OrderBy(x=>x.Version).ToListAsync()));
        versions.MapPost("/", async (Guid systemId, AppDbContext db, VersionCreate dto) => { var e = new SystemVersion { SystemEntityId = systemId, Version = dto.Version, Active = dto.Active ?? true }; db.SystemVersions.Add(e); await db.SaveChangesAsync(); return Results.Created($"/configs/systems/{systemId}/versions/{e.Id}", new { e.Id }); });
        versions.MapPut("/{id:guid}", async (Guid systemId, Guid id, AppDbContext db, VersionUpdate dto) => { var e = await db.SystemVersions.FindAsync(id); if (e is null || e.SystemEntityId != systemId) return Results.NotFound(); if (!string.IsNullOrWhiteSpace(dto.Version)) e.Version = dto.Version!; if (dto.Active is not null) e.Active = dto.Active.Value; await db.SaveChangesAsync(); return Results.NoContent(); });
        versions.MapDelete("/{id:guid}", async (Guid systemId, Guid id, AppDbContext db) => { var e = await db.SystemVersions.FindAsync(id); if (e is null || e.SystemEntityId != systemId) return Results.NotFound(); db.SystemVersions.Remove(e); await db.SaveChangesAsync(); return Results.NoContent(); });

        // Modules under a system
        var modules = systems.MapGroup("/{systemId:guid}/modules");
        modules.MapGet("/", async (Guid systemId, AppDbContext db) => Results.Ok(await db.Modules.AsNoTracking().Where(m=>m.SystemEntityId==systemId).OrderBy(x=>x.Name).ToListAsync()));
        modules.MapPost("/", async (Guid systemId, AppDbContext db, SimpleCreate dto) => { var e = new ModuleEntity { SystemEntityId = systemId, Name = dto.Name, Active = dto.Active ?? true }; db.Modules.Add(e); await db.SaveChangesAsync(); return Results.Created($"/configs/systems/{systemId}/modules/{e.Id}", new { e.Id }); });
        modules.MapPut("/{id:guid}", async (Guid systemId, Guid id, AppDbContext db, SimpleUpdate dto) => { var e = await db.Modules.FindAsync(id); if (e is null || e.SystemEntityId != systemId) return Results.NotFound(); if (!string.IsNullOrWhiteSpace(dto.Name)) e.Name = dto.Name!; if (dto.Active is not null) e.Active = dto.Active.Value; await db.SaveChangesAsync(); return Results.NoContent(); });
        modules.MapDelete("/{id:guid}", async (Guid systemId, Guid id, AppDbContext db) => { var e = await db.Modules.FindAsync(id); if (e is null || e.SystemEntityId != systemId) return Results.NotFound(); db.Modules.Remove(e); await db.SaveChangesAsync(); return Results.NoContent(); });

        return app;
    }

    public record SimpleCreate(string Name, bool? Active);
    public record SimpleUpdate(string? Name, bool? Active);
    public record VersionCreate(string Version, bool? Active);
    public record VersionUpdate(string? Version, bool? Active);
}


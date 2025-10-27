using Api.Domain;
using Api.Persistence;
using Microsoft.AspNetCore.Authorization;
using Microsoft.EntityFrameworkCore;

namespace Api.Features.Permissions;

public static class PermissionEndpoints
{
    public static IEndpointRouteBuilder MapPermissionEndpoints(this IEndpointRouteBuilder app)
    {
        var g = app.MapGroup("/permissions").RequireAuthorization("PERM:" + nameof(Permission.GerenciarUsuarios));

        // Catalog from database (value derives from enum by code)
        g.MapGet("/catalog", async (AppDbContext db) =>
        {
            var list = await db.Permissions.AsNoTracking().Where(p => p.Active)
                .Select(p => new { p.Code, p.Name, p.Category, p.Description })
                .ToListAsync();
            var result = list.Select(p => new
            {
                code = p.Code,
                name = p.Name,
                category = p.Category,
                description = p.Description,
                value = Enum.TryParse<Permission>(p.Code, out var en) ? (long)en : 0L
            });
            return Results.Ok(result);
        });

        // Role presets: mapping of common roles -> default flags
        g.MapGet("/roles", () => Results.Ok(PermissionCatalog.RolePresets.Select(kv => new
        {
            role = kv.Key,
            permissions = (long)kv.Value
        })));

        // Optional helper to apply a role preset to a user
        g.MapPost("/apply-role/{id:guid}", async (Guid id, string role, AppDbContext db) =>
        {
            if (!PermissionCatalog.RolePresets.TryGetValue(role, out var flags))
                return Results.BadRequest(new { error = "role_not_found" });

            var u = await db.Users.FindAsync(id);
            if (u is null) return Results.NotFound();
            u.Role = role;
            // apply join rows based on flags
            var catalog = await db.Permissions.AsNoTracking().ToListAsync();
            var current = await db.UserPermissions.Where(x => x.UserId == id).ToListAsync();
            db.UserPermissions.RemoveRange(current);
            foreach (var p in catalog)
            {
                if (Enum.TryParse<Permission>(p.Code, out var en) && flags.HasFlag(en))
                {
                    db.UserPermissions.Add(new UserPermission { UserId = id, PermissionId = p.Id, Granted = true });
                }
            }
            await db.SaveChangesAsync();

            // Atualiza IsSpecial conforme perfil atual
            if (u.ProfileId is not null)
            {
                var userCodes = await db.UserPermissions.Include(x => x.Permission).Where(x => x.UserId == u.Id && x.Granted).Select(x => x.Permission.Code).ToListAsync();
                var profileCodes = await db.ProfilePermissions.Include(x => x.Permission).Where(x => x.ProfileId == u.ProfileId && x.Granted).Select(x => x.Permission.Code).ToListAsync();
                u.IsSpecial = !userCodes.OrderBy(x=>x).SequenceEqual(profileCodes.OrderBy(x=>x));
                await db.SaveChangesAsync();
            }
            return Results.Ok(new { u.Id, u.Role, permissions = (long)flags, u.IsSpecial, u.ProfileId });
        });

        // Helper: list users with current flags (nicer projection)
        g.MapGet("/users", async (AppDbContext db) =>
        {
            var users = await db.Users.AsNoTracking().Include(u=>u.Area).ToListAsync();
            var result = new List<object>();
            foreach (var u in users)
            {
                long mask = 0;
                var ups = await db.UserPermissions.Include(x => x.Permission).Where(x => x.UserId == u.Id && x.Granted).ToListAsync();
                foreach (var up in ups)
                    if (Enum.TryParse<Permission>(up.Permission.Code, out var p)) mask |= (long)p;
                string? profileName = null;
                if (u.ProfileId is not null)
                {
                    var prof = await db.Profiles.AsNoTracking().SingleOrDefaultAsync(p => p.Id == u.ProfileId);
                    profileName = prof?.Name;
                }
                result.Add(new { u.Id, u.Name, u.Email, u.Role, u.Active, permissions = mask, u.CreatedAt, isSpecial = u.IsSpecial, profile = profileName, profileId = u.ProfileId, areaId = u.AreaId, area = u.Area?.Name });
            }
            return Results.Ok(result);
        });

        return app;
    }
}

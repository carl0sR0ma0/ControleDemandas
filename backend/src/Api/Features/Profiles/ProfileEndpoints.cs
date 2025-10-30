using Api.Domain;
using Api.Persistence;
using Microsoft.AspNetCore.Authorization;
using Microsoft.EntityFrameworkCore;

namespace Api.Features.Profiles;

public static class ProfileEndpoints
{
    public static IEndpointRouteBuilder MapProfileEndpoints(this IEndpointRouteBuilder app)
    {
        var g = app.MapGroup("/profiles").RequireAuthorization("PERM:" + nameof(Permission.GerenciarPerfis));

        g.MapGet("/", async (AppDbContext db) =>
        {
            var items = await db.Profiles.AsNoTracking().OrderBy(p => p.Name).ToListAsync();
            var result = new List<object>();
            foreach (var p in items)
            {
                long mask = 0;
                var pps = await db.ProfilePermissions.Include(x => x.Permission).Where(x => x.ProfileId == p.Id && x.Granted).ToListAsync();
                foreach (var pp in pps) if (Enum.TryParse<Permission>(pp.Permission.Code, out var en)) mask |= (long)en;
                var userCount = await db.Users.CountAsync(u => u.ProfileId == p.Id);
                result.Add(new { p.Id, p.Name, p.Active, badgeClass = p.BadgeClass, permissions = mask, userCount });
            }
            return Results.Ok(result);
        });

        g.MapPost("/", async (AppDbContext db, CreateProfile dto) =>
        {
            var p = new Profile { Name = dto.Name, Active = dto.Active ?? true, BadgeClass = dto.BadgeClass };
            db.Profiles.Add(p);
            await db.SaveChangesAsync();

            if (dto.PermissionCodes?.Length > 0)
            {
                var perms = await db.Permissions.Where(x => dto.PermissionCodes.Contains(x.Code)).ToListAsync();
                foreach (var perm in perms)
                    db.ProfilePermissions.Add(new ProfilePermission { ProfileId = p.Id, PermissionId = perm.Id, Granted = true });
                await db.SaveChangesAsync();
            }
            return Results.Created($"/profiles/{p.Id}", new { p.Id });
        });

        g.MapPut("/{id:guid}", async (Guid id, AppDbContext db, UpdateProfile dto) =>
        {
            var p = await db.Profiles.FindAsync(id);
            if (p is null) return Results.NotFound();
            if (!string.IsNullOrWhiteSpace(dto.Name)) p.Name = dto.Name!;
            if (dto.Active is not null) p.Active = dto.Active.Value;
            if (dto.BadgeClass is not null) p.BadgeClass = string.IsNullOrWhiteSpace(dto.BadgeClass) ? null : dto.BadgeClass;
            await db.SaveChangesAsync();
            return Results.NoContent();
        });

        g.MapPut("/{id:guid}/permissions", async (Guid id, AppDbContext db, UpdateProfilePermissions dto) =>
        {
            var exists = await db.Profiles.AnyAsync(p => p.Id == id);
            if (!exists) return Results.NotFound();

            var current = await db.ProfilePermissions.Where(x => x.ProfileId == id).ToListAsync();
            var requestedCodes = dto.PermissionCodes ?? Array.Empty<string>();
            var targetPermissions = await db.Permissions.Where(x => requestedCodes.Contains(x.Code)).ToListAsync();
            var targetIds = targetPermissions.Select(x => x.Id).ToHashSet();
            var existingIds = current.Select(x => x.PermissionId).ToHashSet();

            foreach (var pp in current)
            {
                pp.Granted = targetIds.Contains(pp.PermissionId);
            }

            foreach (var perm in targetPermissions)
            {
                if (!existingIds.Contains(perm.Id))
                {
                    db.ProfilePermissions.Add(new ProfilePermission
                    {
                        ProfileId = id,
                        PermissionId = perm.Id,
                        Granted = true
                    });
                }
            }

            await db.SaveChangesAsync();
            return Results.NoContent();
        });

        g.MapDelete("/{id:guid}", async (Guid id, AppDbContext db) =>
        {
            var p = await db.Profiles.FindAsync(id);
            if (p is null) return Results.NotFound();
            var assignedUsers = await db.Users.AnyAsync(u => u.ProfileId == id);
            if (assignedUsers) return Results.BadRequest(new { error = "profile_in_use" });
            db.Profiles.Remove(p);
            await db.SaveChangesAsync();
            return Results.NoContent();
        });

        // Aplica um perfil a um usuário (única chamada): vincula ProfileId e sobrescreve permissões do usuário
        g.MapPost("/apply/{userId:guid}", async (Guid userId, Guid profileId, AppDbContext db) =>
        {
            var user = await db.Users.FindAsync(userId);
            if (user is null) return Results.NotFound();
            var existsProfile = await db.Profiles.AnyAsync(p => p.Id == profileId);
            if (!existsProfile) return Results.BadRequest(new { error = "profile_not_found" });

            user.ProfileId = profileId;

            var current = await db.UserPermissions.Where(x => x.UserId == userId).ToListAsync();
            db.UserPermissions.RemoveRange(current);
            var pPerms = await db.ProfilePermissions.Include(pp => pp.Permission)
                .Where(pp => pp.ProfileId == profileId && pp.Granted).ToListAsync();
            // Atribui permissões do perfil ao usuário
            db.UserPermissions.AddRange(pPerms.Select(pp => new UserPermission { UserId = userId, PermissionId = pp.PermissionId, Granted = true }));

            await db.SaveChangesAsync();

            // Recalcula máscara e zera IsSpecial (agora igual ao perfil)
            long mask = 0;
            var ups = await db.UserPermissions.Include(x => x.Permission).Where(x => x.UserId == userId && x.Granted).ToListAsync();
            foreach (var up in ups) if (Enum.TryParse<Permission>(up.Permission.Code, out var en)) mask |= (long)en;
            user.IsSpecial = false;
            await db.SaveChangesAsync();

            return Results.Ok(new { user.Id, user.ProfileId, permissions = mask, user.IsSpecial });
        });

        return app;
    }

    public record CreateProfile(string Name, bool? Active, string[]? PermissionCodes, string? BadgeClass);
    public record UpdateProfile(string? Name, bool? Active, string? BadgeClass);
    public record UpdateProfilePermissions(string[] PermissionCodes);
}

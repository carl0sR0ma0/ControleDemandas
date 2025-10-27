using Api.Domain;
using Api.Persistence;
using Microsoft.AspNetCore.Authorization;
using Microsoft.EntityFrameworkCore;

namespace Api.Features.Users;

public static class UserManagementEndpoints
{
    public static IEndpointRouteBuilder MapUserManagement(this IEndpointRouteBuilder app)
    {
        var g = app.MapGroup("/users").RequireAuthorization("PERM:" + nameof(Permission.GerenciarUsuarios));

        g.MapGet("/", async (AppDbContext db) =>
        {
            var list = await db.Users.AsNoTracking().OrderBy(u => u.Name)
                .Select(u => new
                {
                    u.Id, u.Name, u.Email, u.Role, u.Active, u.CreatedAt,
                    AreaId = u.AreaId,
                    Area = u.Area != null ? u.Area.Name : null
                }).ToListAsync();
            return Results.Ok(list);
        });

        g.MapGet("/{id:guid}", async (Guid id, AppDbContext db) =>
        {
            var user = await db.Users.AsNoTracking().Include(u=>u.Area).SingleOrDefaultAsync(u => u.Id == id);
            if (user is null) return Results.NotFound();
            // compute mask
            long mask = 0;
            var ups = await db.UserPermissions.Include(x => x.Permission).Where(x => x.UserId == id && x.Granted).ToListAsync();
            foreach (var up in ups)
                if (Enum.TryParse<Permission>(up.Permission.Code, out var p)) mask |= (long)p;
            return Results.Ok(new { user.Id, user.Name, user.Email, user.Role, user.Active, user.CreatedAt, AreaId = user.AreaId, Area = user.Area?.Name, permissions = mask });
        });

        g.MapPost("/", async (AppDbContext db, CreateUser dto) =>
        {
            var u = new User
            {
                Name = dto.Name,
                Email = dto.Email.ToLowerInvariant(),
                PasswordHash = BCrypt.Net.BCrypt.HashPassword(dto.Password),
                Role = string.IsNullOrWhiteSpace(dto.Role) ? "Colaborador" : dto.Role!,
                Active = true,
                ProfileId = dto.ProfileId,
                AreaId = dto.AreaId
            };
            db.Users.Add(u);
            await db.SaveChangesAsync();

            // Se recebeu profileId, aplicar permissões do perfil caso não tenha vindo lista explícita
            if (dto.ProfileId is not null && (dto.PermissionCodes is null || dto.PermissionCodes.Length == 0))
            {
                var pCodes = await db.ProfilePermissions.Include(pp => pp.Permission)
                    .Where(pp => pp.ProfileId == dto.ProfileId && pp.Granted)
                    .Select(pp => pp.Permission.Code)
                    .ToListAsync();
                dto = dto with { PermissionCodes = pCodes.ToArray() };
            }

            if (dto.PermissionCodes?.Length > 0)
            {
                var perms = await db.Permissions.Where(p => dto.PermissionCodes.Contains(p.Code)).ToListAsync();
                foreach (var p in perms)
                    db.UserPermissions.Add(new UserPermission { UserId = u.Id, PermissionId = p.Id, Granted = true });
                await db.SaveChangesAsync();
            }

            // Define IsSpecial se permissões divergirem do perfil
            if (u.ProfileId is not null)
            {
                var userCodes = await db.UserPermissions.Include(x => x.Permission).Where(x => x.UserId == u.Id && x.Granted).Select(x => x.Permission.Code).ToListAsync();
                var profileCodes = await db.ProfilePermissions.Include(x => x.Permission).Where(x => x.ProfileId == u.ProfileId && x.Granted).Select(x => x.Permission.Code).ToListAsync();
                u.IsSpecial = !userCodes.OrderBy(x=>x).SequenceEqual(profileCodes.OrderBy(x=>x));
                await db.SaveChangesAsync();
            }

            return Results.Created($"/users/{u.Id}", new { u.Id });
        });

        g.MapPut("/{id:guid}", async (Guid id, AppDbContext db, UpdateUser dto) =>
        {
            var u = await db.Users.FindAsync(id);
            if (u is null) return Results.NotFound();
            if (!string.IsNullOrWhiteSpace(dto.Name)) u.Name = dto.Name!;
            if (!string.IsNullOrWhiteSpace(dto.Email)) u.Email = dto.Email!.ToLowerInvariant();
            if (!string.IsNullOrWhiteSpace(dto.Role)) u.Role = dto.Role!;
            if (dto.Active is not null) u.Active = dto.Active.Value;
            if (!string.IsNullOrWhiteSpace(dto.Password)) u.PasswordHash = BCrypt.Net.BCrypt.HashPassword(dto.Password);
            if (dto.ProfileId.HasValue) u.ProfileId = dto.ProfileId;
            if (dto.AreaId.HasValue)
            {
                if (dto.AreaId == null)
                    u.AreaId = null;
                else
                {
                    var exists = await db.Areas.AnyAsync(a => a.Id == dto.AreaId);
                    if (!exists) return Results.BadRequest(new { error = "area_not_found" });
                    u.AreaId = dto.AreaId;
                }
            }
            await db.SaveChangesAsync();
            return Results.NoContent();
        });

        g.MapPut("/{id:guid}/permissions", async (Guid id, AppDbContext db, UpdateUserPermissions dto) =>
        {
            var exists = await db.Users.AnyAsync(u => u.Id == id);
            if (!exists) return Results.NotFound();
            var current = await db.UserPermissions.Where(x => x.UserId == id).ToListAsync();
            var requestedCodes = dto.PermissionCodes ?? Array.Empty<string>();
            var targetPermissions = await db.Permissions.Where(p => requestedCodes.Contains(p.Code)).ToListAsync();
            var targetIds = targetPermissions.Select(p => p.Id).ToHashSet();
            var existingIds = current.Select(up => up.PermissionId).ToHashSet();

            foreach (var up in current)
            {
                up.Granted = targetIds.Contains(up.PermissionId);
            }

            foreach (var perm in targetPermissions)
            {
                if (!existingIds.Contains(perm.Id))
                {
                    db.UserPermissions.Add(new UserPermission
                    {
                        UserId = id,
                        PermissionId = perm.Id,
                        Granted = true
                    });
                }
            }

            await db.SaveChangesAsync();
            // Atualiza IsSpecial baseado no perfil atual
            var u = await db.Users.FindAsync(id);
            if (u is not null && u.ProfileId is not null)
            {
                var userCodes = await db.UserPermissions.Include(x => x.Permission).Where(x => x.UserId == id && x.Granted).Select(x => x.Permission.Code).ToListAsync();
                var profileCodes = await db.ProfilePermissions.Include(x => x.Permission).Where(x => x.ProfileId == u.ProfileId && x.Granted).Select(x => x.Permission.Code).ToListAsync();
                u.IsSpecial = !userCodes.OrderBy(x=>x).SequenceEqual(profileCodes.OrderBy(x=>x));
                await db.SaveChangesAsync();
            }
            return Results.NoContent();
        });

        g.MapDelete("/{id:guid}", async (Guid id, AppDbContext db) =>
        {
            var u = await db.Users.FindAsync(id);
            if (u is null) return Results.NotFound();
            db.Users.Remove(u);
            await db.SaveChangesAsync();
            return Results.NoContent();
        });

        return app;
    }

    public record CreateUser(string Name, string Email, string Password, string? Role, Guid? ProfileId, Guid? AreaId, string[]? PermissionCodes);
    public record UpdateUser(string? Name, string? Email, string? Password, string? Role, bool? Active, Guid? ProfileId, Guid? AreaId);
    public record UpdateUserPermissions(string[] PermissionCodes);
}

using Api.Domain;
using Api.Persistence;
using Api.Security;
using Microsoft.AspNetCore.Authorization;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;

namespace Api.Features.Users;

public static class UserProfileEndpoints
{
    public static IEndpointRouteBuilder MapUserProfileEndpoints(this IEndpointRouteBuilder app)
    {
        var g = app.MapGroup("/profile").RequireAuthorization();

        // GET /profile/me - Retorna dados do usuário logado
        g.MapGet("/me", async (ClaimsPrincipal user, AppDbContext db) =>
        {
            var userIdClaim = user.FindFirstValue(ClaimTypes.NameIdentifier);
            if (userIdClaim is null || !Guid.TryParse(userIdClaim, out var userId))
                return Results.Unauthorized();

            var userData = await db.Users
                .AsNoTracking()
                .Include(u => u.Area)
                .Include(u => u.Profile)
                .Where(u => u.Id == userId)
                .Select(u => new
                {
                    u.Id,
                    u.Name,
                    u.Email,
                    u.Role,
                    u.Active,
                    u.CreatedAt,
                    u.Phone,
                    AreaId = u.AreaId,
                    AreaName = u.Area != null ? u.Area.Name : null,
                    ProfileId = u.ProfileId,
                    ProfileName = u.Profile != null ? u.Profile.Name : null
                })
                .SingleOrDefaultAsync();

            if (userData is null)
                return Results.NotFound();

            // Buscar permissões do usuário
            long mask = 0;
            var ups = await db.UserPermissions
                .Include(x => x.Permission)
                .Where(x => x.UserId == userId && x.Granted)
                .ToListAsync();

            foreach (var up in ups)
            {
                if (Enum.TryParse<Permission>(up.Permission.Code, out var p))
                    mask |= (long)p;
            }

            // Contar demandas criadas pelo usuário
            var demandsCount = await db.Demands
                .Where(d => d.RequesterUserId == userId)
                .CountAsync();

            return Results.Ok(new
            {
                userData.Id,
                userData.Name,
                userData.Email,
                userData.Role,
                userData.Active,
                userData.CreatedAt,
                userData.Phone,
                AreaId = userData.AreaId,
                AreaName = userData.AreaName,
                ProfileId = userData.ProfileId,
                ProfileName = userData.ProfileName,
                Permissions = mask,
                DemandsCount = demandsCount
            });
        });

        // PUT /profile/me - Atualiza dados do usuário logado
        g.MapPut("/me", async (ClaimsPrincipal user, AppDbContext db, UpdateProfileDto dto) =>
        {
            var userIdClaim = user.FindFirstValue(ClaimTypes.NameIdentifier);
            if (userIdClaim is null || !Guid.TryParse(userIdClaim, out var userId))
                return Results.Unauthorized();

            var u = await db.Users.FindAsync(userId);
            if (u is null)
                return Results.NotFound();

            // Atualiza apenas campos permitidos
            if (!string.IsNullOrWhiteSpace(dto.Name))
                u.Name = dto.Name;

            if (!string.IsNullOrWhiteSpace(dto.Phone))
                u.Phone = dto.Phone;

            // Atualiza área se fornecida
            if (dto.AreaId.HasValue)
            {
                if (dto.AreaId.Value == Guid.Empty)
                {
                    u.AreaId = null;
                }
                else
                {
                    var areaExists = await db.Areas.AnyAsync(a => a.Id == dto.AreaId.Value);
                    if (!areaExists)
                        return Results.BadRequest(new { error = "area_not_found", message = "Área não encontrada" });
                    u.AreaId = dto.AreaId.Value;
                }
            }

            await db.SaveChangesAsync();
            return Results.NoContent();
        });

        // PUT /profile/me/password - Altera senha do usuário logado
        g.MapPut("/me/password", async (ClaimsPrincipal user, AppDbContext db, ChangePasswordDto dto) =>
        {
            var userIdClaim = user.FindFirstValue(ClaimTypes.NameIdentifier);
            if (userIdClaim is null || !Guid.TryParse(userIdClaim, out var userId))
                return Results.Unauthorized();

            var u = await db.Users.FindAsync(userId);
            if (u is null)
                return Results.NotFound();

            // Verifica senha atual
            if (!BCrypt.Net.BCrypt.Verify(dto.CurrentPassword, u.PasswordHash))
                return Results.BadRequest(new { error = "invalid_password", message = "Senha atual incorreta" });

            // Valida nova senha
            if (string.IsNullOrWhiteSpace(dto.NewPassword) || dto.NewPassword.Length < 6)
                return Results.BadRequest(new { error = "weak_password", message = "A senha deve ter no mínimo 6 caracteres" });

            // Atualiza senha
            u.PasswordHash = BCrypt.Net.BCrypt.HashPassword(dto.NewPassword);
            await db.SaveChangesAsync();

            return Results.NoContent();
        });

        return app;
    }

    public record UpdateProfileDto(string? Name, string? Phone, Guid? AreaId);
    public record ChangePasswordDto(string CurrentPassword, string NewPassword);
}

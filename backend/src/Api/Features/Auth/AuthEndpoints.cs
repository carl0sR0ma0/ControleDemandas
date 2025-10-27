using Api.Domain;
using Api.Persistence;
using Api.Security;
using Microsoft.AspNetCore.Authorization;
using Microsoft.EntityFrameworkCore;
using Api.Filters;

namespace Api.Features.Auth;

public static class AuthEndpoints
{
    public static IEndpointRouteBuilder MapAuth(this IEndpointRouteBuilder app)
    {
        var g = app.MapGroup("/auth");

        g.MapPost("/login", async (AppDbContext db, JwtOptions jwt, LoginDto dto) =>
        {
            var user = await db.Users.SingleOrDefaultAsync(u => u.Email == dto.Email);
            if (user is null || !user.Active || !BCrypt.Net.BCrypt.Verify(dto.Password, user.PasswordHash))
                return Results.Unauthorized();

            // Compute permission mask from join table
            long mask = 0;
            var ups = await db.UserPermissions
                .Include(x => x.Permission)
                .Where(x => x.UserId == user.Id && x.Granted)
                .ToListAsync();
            foreach (var up in ups)
            {
                if (Enum.TryParse<Permission>(up.Permission.Code, out var p))
                    mask |= (long)p;
            }

            var token = JwtToken.Create(user, mask, jwt);
            return Results.Ok(new { token, user = new { user.Id, user.Name, user.Email, user.Role, permissions = mask } });
        })
        .AddEndpointFilter(new ValidationFilter<LoginDto>());

        g.MapPost("/register", [Authorize(Policy = "PERM:" + nameof(Permission.GerenciarUsuarios))] async (AppDbContext db, CreateUserDto dto) =>
        {
            var u = new User
            {
                Name = dto.Name,
                Email = dto.Email.ToLowerInvariant(),
                PasswordHash = BCrypt.Net.BCrypt.HashPassword(dto.Password),
                Role = dto.Role
            };
            db.Users.Add(u);
            await db.SaveChangesAsync();

            // Persist permissions in join table based on provided bitmask
            foreach (Permission p in Enum.GetValues(typeof(Permission)))
            {
                if (p == Permission.None) continue;
                if (dto.Permissions.HasFlag(p))
                {
                    var code = p.ToString();
                    var perm = await db.Permissions.SingleOrDefaultAsync(x => x.Code == code);
                    if (perm != null)
                        db.UserPermissions.Add(new UserPermission { UserId = u.Id, PermissionId = perm.Id, Granted = true });
                }
            }
            await db.SaveChangesAsync();
            return Results.Created($"/users/{u.Id}", new { u.Id });
        })
        .AddEndpointFilter(new ValidationFilter<CreateUserDto>());

        return app;
    }

    public record LoginDto(string Email, string Password);
    public record CreateUserDto(string Name, string Email, string Password, string Role, Permission Permissions);
}

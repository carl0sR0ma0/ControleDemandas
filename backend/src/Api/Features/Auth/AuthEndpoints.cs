using Api.Domain;
using Api.Persistence;
using Api.Security;
using Microsoft.AspNetCore.Authorization;
using Microsoft.EntityFrameworkCore;

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

            var token = JwtToken.Create(user, jwt);
            return Results.Ok(new { token, user = new { user.Id, user.Name, user.Email, user.Role, permissions = (long)user.Permissions } });
        });

        g.MapPost("/register", [Authorize(Policy = "PERM:" + nameof(Permission.GerenciarUsuarios))] async (AppDbContext db, CreateUserDto dto) =>
        {
            var u = new User
            {
                Name = dto.Name,
                Email = dto.Email.ToLowerInvariant(),
                PasswordHash = BCrypt.Net.BCrypt.HashPassword(dto.Password),
                Role = dto.Role,
                Permissions = dto.Permissions
            };
            db.Users.Add(u);
            await db.SaveChangesAsync();
            return Results.Created($"/users/{u.Id}", new { u.Id });
        });

        return app;
    }

    public record LoginDto(string Email, string Password);
    public record CreateUserDto(string Name, string Email, string Password, string Role, Permission Permissions);
}

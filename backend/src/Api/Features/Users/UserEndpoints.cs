using Api.Domain;
using Api.Persistence;
using Api.Security;
using Microsoft.AspNetCore.Authorization;
using Microsoft.EntityFrameworkCore;

namespace Api.Features.Users;

public static class UserEndpoints
{
    public static IEndpointRouteBuilder MapUserEndpoints(this IEndpointRouteBuilder app)
    {
        var g = app.MapGroup("/users")
            .RequireAuthorization("PERM:" + nameof(Permission.GerenciarUsuarios));

        g.MapGet("/", async (AppDbContext db) =>
            await db.Users.AsNoTracking().Select(u => new {
                u.Id, u.Name, u.Email, u.Role, u.Active, u.CreatedAt
            }).ToListAsync());

        g.MapPut("/{id:guid}", async (Guid id, AppDbContext db, UpdateUserDto dto) =>
        {
            var u = await db.Users.FindAsync(id);
            if (u is null) return Results.NotFound();
            u.Name = dto.Name ?? u.Name;
            u.Role = dto.Role ?? u.Role;
            if (dto.Active is not null) u.Active = dto.Active.Value;
            await db.SaveChangesAsync();
            return Results.NoContent();
        });

        g.MapPost("/{id:guid}/reset-password", async (Guid id, AppDbContext db, ResetPasswordDto dto) =>
        {
            var u = await db.Users.FindAsync(id);
            if (u is null) return Results.NotFound();
            u.PasswordHash = BCrypt.Net.BCrypt.HashPassword(dto.NewPassword);
            await db.SaveChangesAsync();
            return Results.NoContent();
        });

        return app;
    }

    public record UpdateUserDto(string? Name, string? Role, bool? Active);
    public record ResetPasswordDto(string NewPassword);
}

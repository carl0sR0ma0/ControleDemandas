using Api.Domain;
using Api.Persistence;
using FluentValidation;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace Api.Features.Backlogs;

public static class BacklogEndpoints
{
    public static void MapBacklogEndpoints(this IEndpointRouteBuilder app)
    {
        var group = app.MapGroup("/backlogs").WithTags("Backlogs");

        // POST /backlogs - Criar backlog e associar demandas
        group.MapPost("/", CreateBacklog)
            .RequireAuthorization($"PERM:{nameof(Permission.GerenciarBacklogs)}");

        // GET /backlogs - Listar backlogs com paginação
        group.MapGet("/", ListBacklogs)
            .RequireAuthorization($"PERM:{nameof(Permission.VisualizarDemandas)}");

        // GET /backlogs/{id} - Detalhe do backlog com demandas
        group.MapGet("/{id:guid}", GetBacklog)
            .RequireAuthorization($"PERM:{nameof(Permission.VisualizarDemandas)}");

        // POST /backlogs/{id}/demands - Adicionar demandas a um backlog existente
        group.MapPost("/{id:guid}/demands", AddDemandsToBacklog)
            .RequireAuthorization($"PERM:{nameof(Permission.GerenciarBacklogs)}");
    }

    private static async Task<IResult> CreateBacklog(
        [FromBody] CreateBacklogDto dto,
        AppDbContext db,
        IValidator<CreateBacklogDto> validator,
        ILogger<Program> logger,
        HttpContext ctx
    )
    {
        var validation = await validator.ValidateAsync(dto);
        if (!validation.IsValid)
            return Results.ValidationProblem(validation.ToDictionary());

        // Verificar se as demandas existem
        var demands = await db.Demands
            .Where(d => dto.DemandIds.Contains(d.Id))
            .ToListAsync();

        if (demands.Count != dto.DemandIds.Count)
        {
            return Results.BadRequest(new { error = "Uma ou mais demandas não foram encontradas" });
        }

        // Criar backlog
        var backlog = new Backlog
        {
            Name = dto.Name
        };

        db.Backlogs.Add(backlog);

        // Associar demandas ao backlog
        foreach (var demand in demands)
        {
            demand.BacklogId = backlog.Id;
        }

        await db.SaveChangesAsync();

        var userId = ctx.User.FindFirst("sub")?.Value ?? "Unknown";
        logger.LogInformation("Backlog {BacklogId} criado por {UserId} com {Count} demandas",
            backlog.Id, userId, demands.Count);

        return Results.Created($"/backlogs/{backlog.Id}", new { id = backlog.Id, name = backlog.Name });
    }

    private static async Task<IResult> ListBacklogs(
        AppDbContext db,
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 20
    )
    {
        if (page < 1) page = 1;
        if (pageSize < 1 || pageSize > 100) pageSize = 20;

        var query = db.Backlogs.AsQueryable();

        var total = await query.CountAsync();
        var backlogs = await query
            .OrderByDescending(b => b.CreatedAt)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .Select(b => new BacklogSummaryDto(
                b.Id,
                b.Name,
                b.Demands.Count,
                b.CreatedAt
            ))
            .ToListAsync();

        return Results.Ok(new
        {
            data = backlogs,
            page,
            pageSize,
            total,
            totalPages = (int)Math.Ceiling(total / (double)pageSize)
        });
    }

    private static async Task<IResult> GetBacklog(
        Guid id,
        AppDbContext db
    )
    {
        var backlog = await db.Backlogs
            .Include(b => b.Demands)
            .Where(b => b.Id == id)
            .Select(b => new BacklogDetailDto(
                b.Id,
                b.Name,
                b.CreatedAt,
                b.Demands.Select(d => new BacklogDemandDto(
                    d.Id,
                    d.Protocol,
                    d.Description,
                    d.Priority,
                    d.Status.ToString()
                )).ToList()
            ))
            .FirstOrDefaultAsync();

        if (backlog == null)
            return Results.NotFound(new { error = "Backlog não encontrado" });

        return Results.Ok(backlog);
    }

    private static async Task<IResult> AddDemandsToBacklog(
        Guid id,
        [FromBody] AddDemandsToBacklogDto dto,
        AppDbContext db,
        ILogger<Program> logger,
        HttpContext ctx
    )
    {
        // Verificar se o backlog existe
        var backlog = await db.Backlogs.FindAsync(id);
        if (backlog == null)
            return Results.NotFound(new { error = "Backlog não encontrado" });

        // Verificar se as demandas existem
        var demands = await db.Demands
            .Where(d => dto.DemandIds.Contains(d.Id))
            .ToListAsync();

        if (demands.Count != dto.DemandIds.Count)
        {
            return Results.BadRequest(new { error = "Uma ou mais demandas não foram encontradas" });
        }

        // Verificar se alguma demanda já está em outro backlog
        var demandsWithBacklog = demands.Where(d => d.BacklogId != null).ToList();
        if (demandsWithBacklog.Any())
        {
            return Results.BadRequest(new {
                error = "Algumas demandas já estão associadas a outro backlog",
                demandsWithBacklog = demandsWithBacklog.Select(d => new { d.Id, d.Protocol }).ToList()
            });
        }

        // Associar demandas ao backlog
        foreach (var demand in demands)
        {
            demand.BacklogId = id;
        }

        await db.SaveChangesAsync();

        var userId = ctx.User.FindFirst("sub")?.Value ?? "Unknown";
        logger.LogInformation("Adicionadas {Count} demandas ao backlog {BacklogId} por {UserId}",
            demands.Count, id, userId);

        return Results.Ok(new { message = $"{demands.Count} demanda(s) adicionada(s) ao backlog com sucesso" });
    }
}

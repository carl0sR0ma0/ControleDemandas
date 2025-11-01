using Api.Domain;
using Api.Persistence;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace Api.Features.Sprints;

public static class SprintEndpoints
{
    public static void MapSprintEndpoints(this IEndpointRouteBuilder app)
    {
        var group = app.MapGroup("/sprints").WithTags("Sprints");

        group.MapGet("/", ListSprints)
            .RequireAuthorization($"PERM:{nameof(Permission.VisualizarDemandas)}");

        group.MapGet("/{id:guid}", GetSprint)
            .RequireAuthorization($"PERM:{nameof(Permission.VisualizarDemandas)}");

        group.MapPost("/", UpsertSprint)
            .RequireAuthorization($"PERM:{nameof(Permission.GerenciarBacklogs)}");

        group.MapDelete("/{id:guid}", DeleteSprint)
            .RequireAuthorization($"PERM:{nameof(Permission.GerenciarBacklogs)}");

        group.MapGet("/{id:guid}/burndown", GetBurndown)
            .RequireAuthorization($"PERM:{nameof(Permission.VisualizarDemandas)}");

        group.MapPatch("/{id:guid}/status", UpdateSprintStatus)
            .RequireAuthorization($"PERM:{nameof(Permission.GerenciarBacklogs)}");

        group.MapPatch("/items/{itemId:guid}/status", UpdateSprintItemStatus)
            .RequireAuthorization($"PERM:{nameof(Permission.GerenciarBacklogs)}");
    }

    private static async Task<IResult> ListSprints(AppDbContext db)
    {
        var data = await db.Sprints
            .Include(s => s.Items)
            .OrderByDescending(s => s.StartDate)
            .Select(s => new
            {
                s.Id,
                s.Name,
                s.StartDate,
                s.EndDate,
                s.Status,
                percent = CalcPercent(s.Items)
            })
            .ToListAsync();

        return Results.Ok(new { data });
    }

    private static async Task<IResult> GetSprint(Guid id, AppDbContext db)
    {
        var sprint = await db.Sprints
            .Include(s => s.Items)
                .ThenInclude(i => i.Demand)
            .Where(s => s.Id == id)
            .Select(s => new
            {
                s.Id,
                s.Name,
                s.StartDate,
                s.EndDate,
                s.Status,
                items = s.Items.Select(i => new
                {
                    i.Id,
                    i.DemandId,
                    i.PlannedHours,
                    i.WorkedHours,
                    i.Status,
                    demand = new
                    {
                        i.Demand.Id,
                        i.Demand.Protocol,
                        i.Demand.Description,
                        i.Demand.Priority,
                        i.Demand.Status
                    }
                }).ToList()
            })
            .FirstOrDefaultAsync();

        if (sprint is null) return Results.NotFound(new { error = "Sprint nao encontrada" });
        return Results.Ok(sprint);
    }

    public record SprintItemDto(Guid DemandId, double PlannedHours, double WorkedHours);
    public record UpsertSprintDto(Guid? Id, string Name, DateTime StartDate, DateTime EndDate, List<SprintItemDto>? Items);

    private static async Task<IResult> UpsertSprint([FromBody] UpsertSprintDto dto, AppDbContext db)
    {
        if (string.IsNullOrWhiteSpace(dto.Name))
            return Results.ValidationProblem(new Dictionary<string, string[]> { ["name"] = ["Nome e obrigatorio"] });
        if (dto.EndDate < dto.StartDate)
            return Results.ValidationProblem(new Dictionary<string, string[]> { ["endDate"] = ["EndDate deve ser maior/igual a StartDate"] });
        var items = dto.Items ?? new List<SprintItemDto>();
        if (items.Count > 500)
            return Results.BadRequest(new { error = "Lista de itens excede 500" });

        var demandIds = items.Select(i => i.DemandId).Distinct().ToList();
        var existsCount = await db.Demands.CountAsync(d => demandIds.Contains(d.Id));
        if (existsCount != demandIds.Count)
            return Results.BadRequest(new { error = "Uma ou mais demandas nao existem" });

        Api.Domain.Sprint sprint;
        if (dto.Id is null || dto.Id == Guid.Empty)
        {
            sprint = new Api.Domain.Sprint
            {
                Name = dto.Name,
                StartDate = dto.StartDate,
                EndDate = dto.EndDate
            };
            db.Sprints.Add(sprint);
        }
        else
        {
            sprint = await db.Sprints.Include(s => s.Items).FirstOrDefaultAsync(s => s.Id == dto.Id.Value)
                     ?? new Api.Domain.Sprint { Id = dto.Id.Value };

            if (sprint.Id == dto.Id.Value && db.Entry(sprint).State == EntityState.Detached)
                db.Sprints.Add(sprint);

            sprint.Name = dto.Name;
            sprint.StartDate = dto.StartDate;
            sprint.EndDate = dto.EndDate;

            if (db.Entry(sprint).State != EntityState.Added)
            {
                await db.Entry(sprint).Collection(s => s.Items).LoadAsync();
                db.SprintItems.RemoveRange(sprint.Items);
            }
        }

        sprint.Items = items.Select(i => new Api.Domain.SprintItem
        {
            SprintId = sprint.Id,
            DemandId = i.DemandId,
            PlannedHours = i.PlannedHours,
            WorkedHours = i.WorkedHours
        }).ToList();

        await db.SaveChangesAsync();
        return Results.Ok(new { id = sprint.Id });
    }

    private static async Task<IResult> DeleteSprint(Guid id, AppDbContext db)
    {
        var sprint = await db.Sprints.FindAsync(id);
        if (sprint is null) return Results.NotFound(new { error = "Sprint nao encontrada" });
        db.Sprints.Remove(sprint);
        await db.SaveChangesAsync();
        return Results.NoContent();
    }

    private static async Task<IResult> GetBurndown(Guid id, AppDbContext db)
    {
        var sprint = await db.Sprints.Include(s => s.Items).FirstOrDefaultAsync(s => s.Id == id);
        if (sprint is null) return Results.NotFound(new { error = "Sprint nao encontrada" });

        var totalPlanned = sprint.Items.Sum(i => Math.Max(0, i.PlannedHours));
        var totalWorked = sprint.Items.Sum(i => Math.Max(0, i.WorkedHours));
        var days = Math.Max(1, (int)Math.Ceiling((sprint.EndDate.Date - sprint.StartDate.Date).TotalDays) + 1);

        var points = new List<object>(days);
        for (var d = 0; d < days; d++)
        {
            var date = sprint.StartDate.Date.AddDays(d);
            var planned = totalPlanned * (1 - (double)d / Math.Max(1, days - 1));
            var remaining = Math.Max(0, totalPlanned - totalWorked);
            points.Add(new { date, planned = Math.Round(planned, 2), remaining = Math.Round(remaining, 2) });
        }

        return Results.Ok(points);
    }

    public record UpdateSprintStatusDto(SprintStatus Status);

    private static async Task<IResult> UpdateSprintStatus(Guid id, [FromBody] UpdateSprintStatusDto dto, AppDbContext db)
    {
        var sprint = await db.Sprints.FindAsync(id);
        if (sprint is null) return Results.NotFound(new { error = "Sprint nao encontrada" });

        sprint.Status = dto.Status;
        await db.SaveChangesAsync();

        return Results.Ok(new { id = sprint.Id, status = sprint.Status });
    }

    public record UpdateSprintItemStatusDto(SprintItemStatus Status);

    private static async Task<IResult> UpdateSprintItemStatus(Guid itemId, [FromBody] UpdateSprintItemStatusDto dto, AppDbContext db)
    {
        var item = await db.SprintItems.FindAsync(itemId);
        if (item is null) return Results.NotFound(new { error = "Item nao encontrado" });

        item.Status = dto.Status;
        await db.SaveChangesAsync();

        return Results.Ok(new { id = item.Id, status = item.Status });
    }

    private static double CalcPercent(ICollection<Api.Domain.SprintItem> items)
    {
        var planned = items.Sum(i => Math.Max(0, i.PlannedHours));
        var worked = items.Sum(i => Math.Max(0, i.WorkedHours));
        if (planned <= 0) return 0;
        var pct = (worked / planned) * 100.0;
        return Math.Max(0, Math.Min(100, pct));
    }
}

using System.Security.Claims;
using Api.Domain;
using Api.Persistence;
using Api.Security;
using Api.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.EntityFrameworkCore;

namespace Api.Features.Demands;

public static class DemandEndpoints
{
    public static IEndpointRouteBuilder MapDemandEndpoints(this IEndpointRouteBuilder app)
    {
        app.MapGet("/public/protocol/{protocol}", async (string protocol, AppDbContext db) =>
        {
            var d = await db.Demands
                .Include(x => x.History.OrderBy(h => h.Date))
                .Where(x => x.Protocol == protocol)
                .Select(x => new {
                    x.Protocol, x.OpenedAt, x.OccurrenceType, x.Observation, x.Status,
                    Steps = x.History.Select(h => new { h.Status, h.Date, h.Author, h.Note })
                })
                .SingleOrDefaultAsync();

            return d is null ? Results.NotFound() : Results.Ok(d);
        });

        var g = app.MapGroup("/demands").RequireAuthorization("PERM:" + nameof(Permission.VisualizarDemandas));

        g.MapGet("/", async (AppDbContext db, int page = 1, int size = 20, string? q = null,
            DemandStatus? status = null, string? area = null, string? modulo = null,
            string? cliente = null, OccurrenceType? tipo = null, Classification? classificacao = null,
            DateOnly? from = null, DateOnly? to = null) =>
        {
            var qry = db.Demands.AsQueryable();

            if (!string.IsNullOrWhiteSpace(q))
                qry = qry.Where(x => x.Protocol.Contains(q) || x.Description.ToLower().Contains(q.ToLower()) || (x.Client ?? string.Empty).Contains(q));
            if (status is not null) qry = qry.Where(x => x.Status == status);
            if (!string.IsNullOrEmpty(area)) qry = qry.Where(x => x.ReporterArea == area);
            if (!string.IsNullOrEmpty(modulo)) qry = qry.Where(x => x.Module == modulo);
            if (!string.IsNullOrEmpty(cliente)) qry = qry.Where(x => x.Client == cliente);
            if (tipo is not null) qry = qry.Where(x => x.OccurrenceType == tipo);
            if (classificacao is not null) qry = qry.Where(x => x.Classification == classificacao);
            if (from is not null) qry = qry.Where(x => x.OpenedAt >= from.Value.ToDateTime(TimeOnly.MinValue));
            if (to is not null) qry = qry.Where(x => x.OpenedAt < to.Value.AddDays(1).ToDateTime(TimeOnly.MinValue));

            var total = await qry.CountAsync();
            var items = await qry
                .OrderByDescending(x => x.OpenedAt)
                .Skip((page - 1) * size).Take(size)
                .Select(x => new {
                    x.Id, x.Protocol, x.OpenedAt, x.OccurrenceType, x.Module, x.Client,
                    x.ReporterArea, x.Classification, x.Status, x.NextActionResponsible,
                    x.EstimatedDelivery, x.DocumentUrl
                })
                .ToListAsync();

            return Results.Ok(new { total, page, size, items });
        });

        g.MapGet("/{id:guid}", async (Guid id, AppDbContext db) =>
        {
            var d = await db.Demands
                .Include(x => x.Attachments)
                .Include(x => x.History.OrderBy(h => h.Date))
                .SingleOrDefaultAsync(x => x.Id == id);
            return d is null ? Results.NotFound() : Results.Ok(d);
        });

        g.MapPost("/", [Authorize(Policy = "PERM:" + nameof(Permission.RegistrarDemandas))] async (
            AppDbContext db, ProtocolService proto, EmailService mail, CreateDemandDto dto, ClaimsPrincipal user) =>
        {
            var protocol = await proto.GenerateAsync();

            var d = new Demand
            {
                Protocol = protocol,
                Description = dto.Description,
                Observation = dto.Observation,
                Module = dto.Module,
                RequesterResponsible = dto.RequesterResponsible,
                ReporterArea = dto.ReporterArea,
                OccurrenceType = dto.OccurrenceType,
                Unit = dto.Unit,
                Classification = dto.Classification,
                Client = dto.Client,
                Priority = dto.Priority,
                SystemVersion = dto.SystemVersion,
                Reporter = dto.Reporter,
                ProductModule = dto.ProductModule,
                DocumentUrl = dto.DocumentUrl,
                Order = dto.Order
            };

            d.History.Add(new StatusHistory
            {
                Status = DemandStatus.Ranqueado,
                Author = user.Identity?.Name ?? "sistema",
                Note = "Abertura da demanda"
            });

            db.Demands.Add(d);
            await db.SaveChangesAsync();

            if (!string.IsNullOrWhiteSpace(dto.ReporterEmail))
                await mail.SendAsync(dto.ReporterEmail!,
                    $"[Protocolo {d.Protocol}] Solicitação recebida",
                    $"<p>Sua solicitação foi registrada com protocolo <b>{d.Protocol}</b>.</p>");

            return Results.Created($"/demands/{d.Id}", new { d.Id, d.Protocol });
        });

        g.MapPost("/{id:guid}/attachments", async (Guid id, AppDbContext db, HttpRequest req,
            FileStorageService fs, CancellationToken ct) =>
        {
            var demand = await db.Demands.FindAsync(id);
            if (demand is null) return Results.NotFound();

            var files = req.Form.Files;
            var saved = new List<object>();

            foreach (var f in files)
            {
                var (path, size) = await fs.SaveAsync(f, demand.Protocol, ct);
                var att = new Attachment
                {
                    DemandId = id,
                    FileName = f.FileName,
                    ContentType = f.ContentType,
                    Size = size,
                    StoragePath = path
                };
                db.Attachments.Add(att);
                saved.Add(new { att.Id, att.FileName, att.Size });
            }

            await db.SaveChangesAsync();
            return Results.Ok(saved);
        });

        g.MapPut("/{id:guid}", async (Guid id, AppDbContext db, UpdateDemandDto dto) =>
        {
            var d = await db.Demands.FindAsync(id);
            if (d is null) return Results.NotFound();

            d.Observation = dto.Observation ?? d.Observation;
            d.NextActionResponsible = dto.NextActionResponsible ?? d.NextActionResponsible;
            d.EstimatedDelivery = dto.EstimatedDelivery ?? d.EstimatedDelivery;
            d.DocumentUrl = dto.DocumentUrl ?? d.DocumentUrl;
            if (dto.Order is not null) d.Order = dto.Order;

            await db.SaveChangesAsync();
            return Results.NoContent();
        });

        g.MapPost("/{id:guid}/status", [Authorize(Policy = "PERM:" + nameof(Permission.EditarStatus))] async (
            Guid id, AppDbContext db, ChangeStatusDto dto, ClaimsPrincipal user) =>
        {
            var d = await db.Demands.Include(x => x.History).SingleOrDefaultAsync(x => x.Id == id);
            if (d is null) return Results.NotFound();

            d.Status = dto.NewStatus;
            d.History.Add(new StatusHistory
            {
                Status = dto.NewStatus,
                Author = user.Identity?.Name ?? "sistema",
                Note = dto.Note
            });

            await db.SaveChangesAsync();
            return Results.Ok(new { d.Id, d.Status });
        });

        return app;
    }

    public record CreateDemandDto(
        string Description,
        string? Observation,
        string Module,
        string RequesterResponsible,
        string ReporterArea,
        OccurrenceType OccurrenceType,
        string Unit,
        Classification Classification,
        string? Client,
        string? Priority,
        string? SystemVersion,
        string? Reporter,
        string? ProductModule,
        string? DocumentUrl,
        int? Order,
        string? ReporterEmail
    );

    public record UpdateDemandDto(
        string? Observation,
        string? NextActionResponsible,
        DateTime? EstimatedDelivery,
        string? DocumentUrl,
        int? Order
    );

    public record ChangeStatusDto(DemandStatus NewStatus, string? Note);
}

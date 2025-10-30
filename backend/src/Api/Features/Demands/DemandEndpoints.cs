using System.Security.Claims;
using Api.Domain;
using Api.Persistence;
using Api.Security;
using Api.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.EntityFrameworkCore;
using Api.Filters;

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
                    x.Protocol, x.OpenedAt, x.OccurrenceType, x.Description, x.Observation, x.Status, x.EstimatedDelivery,
                    Steps = x.History.Select(h => new { h.Status, h.Date, h.Author, h.Note, h.ResponsibleUser })
                })
                .SingleOrDefaultAsync();

            return d is null ? Results.NotFound() : Results.Ok(d);
        });

        var g = app.MapGroup("/demands").RequireAuthorization("PERM:" + nameof(Permission.VisualizarDemandas));

        g.MapGet("/", async (
            AppDbContext db,
            int page = 1,
            int size = 20,
            string? q = null,
            DemandStatus? status = null,
            Guid? reporterAreaId = null,
            Guid? moduleId = null,
            Guid? unitId = null,
            Guid? requesterUserId = null,
            Guid? systemVersionId = null,
            string? responsavel = null,
            OccurrenceType? tipo = null,
            Classification? classificacao = null,
            int? priority = null,
            bool? hasBacklog = null,
            DateOnly? from = null,
            DateOnly? to = null) =>
        {
            var qry = db.Demands.AsQueryable();

            if (!string.IsNullOrWhiteSpace(q))
            {
                var qLower = q.ToLower();
                qry = qry.Where(x =>
                    x.Protocol.Contains(q) ||
                    x.Description.ToLower().Contains(qLower) ||
                    (x.Responsible ?? string.Empty).ToLower().Contains(qLower) ||
                    x.Module.Name.ToLower().Contains(qLower) ||
                    x.ReporterArea.Name.ToLower().Contains(qLower));
            }
            if (status is not null) qry = qry.Where(x => x.Status == status);
            if (reporterAreaId is not null) qry = qry.Where(x => x.ReporterAreaId == reporterAreaId);
            if (moduleId is not null) qry = qry.Where(x => x.ModuleId == moduleId);
            if (unitId is not null) qry = qry.Where(x => x.UnitId == unitId);
            if (requesterUserId is not null) qry = qry.Where(x => x.RequesterUserId == requesterUserId);
            if (systemVersionId is not null) qry = qry.Where(x => x.SystemVersionId == systemVersionId);
            if (!string.IsNullOrWhiteSpace(responsavel))
            {
                var resLower = responsavel.ToLower();
                qry = qry.Where(x => (x.Responsible ?? string.Empty).ToLower().Contains(resLower));
            }
            if (tipo is not null) qry = qry.Where(x => x.OccurrenceType == tipo);
            if (classificacao is not null) qry = qry.Where(x => x.Classification == classificacao);
            if (priority is not null) qry = qry.Where(x => x.Priority == priority);
            if (hasBacklog is not null)
            {
                if (hasBacklog.Value)
                    qry = qry.Where(x => x.BacklogId != null);
                else
                    qry = qry.Where(x => x.BacklogId == null);
            }
            if (from is not null) qry = qry.Where(x => x.OpenedAt >= from.Value.ToDateTime(TimeOnly.MinValue));
            if (to is not null) qry = qry.Where(x => x.OpenedAt < to.Value.AddDays(1).ToDateTime(TimeOnly.MinValue));

            var total = await qry.CountAsync();
            var items = await qry
                .Include(x => x.Module)
                .Include(x => x.ReporterArea)
                .Include(x => x.Unit)
                .Include(x => x.SystemVersion)
                .Include(x => x.RequesterUser)
                .OrderByDescending(x => x.OpenedAt)
                .Skip((page - 1) * size).Take(size)
                .Select(x => new {
                    x.Id,
                    x.Protocol,
                    x.OpenedAt,
                    x.OccurrenceType,
                    module = new { id = x.ModuleId, name = x.Module.Name },
                    reporterArea = new { id = x.ReporterAreaId, name = x.ReporterArea.Name },
                    unit = new { id = x.UnitId, name = x.Unit.Name },
                    systemVersion = x.SystemVersionId != null ? new { id = x.SystemVersionId, version = x.SystemVersion!.Version } : null,
                    requester = new { id = x.RequesterUserId, name = x.RequesterUser.Name, email = x.RequesterUser.Email },
                    x.Responsible,
                    x.Classification,
                    x.Priority,
                    x.Status,
                    x.NextActionResponsible,
                    x.EstimatedDelivery,
                    x.DocumentUrl,
                    backlogId = x.BacklogId
                })
                .ToListAsync();

            return Results.Ok(new { total, page, size, items });
        });

        g.MapGet("/{id:guid}", async (Guid id, AppDbContext db) =>
        {
            var d = await db.Demands
                .Include(x => x.Module)
                    .ThenInclude(m => m.System)
                .Include(x => x.ReporterArea)
                .Include(x => x.Unit)
                .Include(x => x.SystemVersion)
                .Include(x => x.RequesterUser)
                .Include(x => x.Attachments)
                .Include(x => x.History)
                .Where(x => x.Id == id)
                .Select(x => new
                {
                    x.Id,
                    x.Protocol,
                    x.OpenedAt,
                    x.Description,
                    x.Observation,
                    x.OccurrenceType,
                    x.Classification,
                    x.Priority,
                    x.Status,
                    system = new { id = x.Module.System.Id, name = x.Module.System.Name },
                    module = new { id = x.ModuleId, name = x.Module.Name, systemId = x.Module.SystemEntityId },
                    reporterArea = new { id = x.ReporterAreaId, name = x.ReporterArea.Name },
                    unit = new { id = x.UnitId, name = x.Unit.Name },
                    systemVersion = x.SystemVersionId != null ? new { id = x.SystemVersionId, version = x.SystemVersion!.Version } : null,
                    requester = new { id = x.RequesterUserId, name = x.RequesterUser.Name, email = x.RequesterUser.Email },
                    x.Responsible,
                    x.NextActionResponsible,
                    x.EstimatedDelivery,
                    x.DocumentUrl,
                    attachments = x.Attachments.Select(a => new { a.Id, a.FileName, a.ContentType, a.Size, a.CreatedAt }),
                    history = x.History.OrderBy(h => h.Date).Select(h => new { h.Id, h.Status, h.Date, h.Author, h.Note, h.ResponsibleUser })
                })
                .SingleOrDefaultAsync();
            return d is null ? Results.NotFound() : Results.Ok(d);
        });

        g.MapGet("/protocol/{protocol}", async (string protocol, AppDbContext db) =>
        {
            var d = await db.Demands
                .Include(x => x.Module)
                    .ThenInclude(m => m.System)
                .Include(x => x.ReporterArea)
                .Include(x => x.Unit)
                .Include(x => x.SystemVersion)
                .Include(x => x.RequesterUser)
                .Include(x => x.Attachments)
                .Include(x => x.History)
                .Where(x => x.Protocol == protocol)
                .Select(x => new
                {
                    x.Id,
                    x.Protocol,
                    x.OpenedAt,
                    x.Description,
                    x.Observation,
                    x.OccurrenceType,
                    x.Classification,
                    x.Priority,
                    x.Status,
                    system = new { id = x.Module.System.Id, name = x.Module.System.Name },
                    module = new { id = x.ModuleId, name = x.Module.Name, systemId = x.Module.SystemEntityId },
                    reporterArea = new { id = x.ReporterAreaId, name = x.ReporterArea.Name },
                    unit = new { id = x.UnitId, name = x.Unit.Name },
                    systemVersion = x.SystemVersionId != null ? new { id = x.SystemVersionId, version = x.SystemVersion!.Version } : null,
                    requester = new { id = x.RequesterUserId, name = x.RequesterUser.Name, email = x.RequesterUser.Email },
                    x.Responsible,
                    x.NextActionResponsible,
                    x.EstimatedDelivery,
                    x.DocumentUrl,
                    attachments = x.Attachments.Select(a => new { a.Id, a.FileName, a.ContentType, a.Size, a.CreatedAt }),
                    history = x.History.OrderBy(h => h.Date).Select(h => new { h.Id, h.Status, h.Date, h.Author, h.Note, h.ResponsibleUser })
                })
                .SingleOrDefaultAsync();
            return d is null ? Results.NotFound() : Results.Ok(d);
        });

        g.MapPost("/", [Authorize(Policy = "PERM:" + nameof(Permission.RegistrarDemandas))] async (
            AppDbContext db, ProtocolService proto, DemandNotificationService notificationService, CreateDemandDto dto, ClaimsPrincipal user) =>
        {
            var protocol = await proto.GenerateAsync();

            var module = await db.Modules.FindAsync(dto.ModuleId);
            if (module is null) return Results.BadRequest(new { error = "module_not_found" });

            var requester = await db.Users.FindAsync(dto.RequesterUserId);
            if (requester is null) return Results.BadRequest(new { error = "requester_not_found" });

            var area = await db.Areas.FindAsync(dto.ReporterAreaId);
            if (area is null) return Results.BadRequest(new { error = "area_not_found" });

            var unit = await db.Units.FindAsync(dto.UnitId);
            if (unit is null) return Results.BadRequest(new { error = "unit_not_found" });

            if (dto.SystemVersionId is Guid versionId)
            {
                var version = await db.SystemVersions.FindAsync(versionId);
                if (version is null) return Results.BadRequest(new { error = "system_version_not_found" });
                if (version.SystemEntityId != module.SystemEntityId)
                    return Results.BadRequest(new { error = "system_version_mismatch" });
            }

            var d = new Demand
            {
                Protocol = protocol,
                Description = dto.Description,
                Observation = dto.Observation,
                ModuleId = dto.ModuleId,
                RequesterUserId = dto.RequesterUserId,
                ReporterAreaId = dto.ReporterAreaId,
                OccurrenceType = dto.OccurrenceType,
                UnitId = dto.UnitId,
                Classification = dto.Classification,
                Responsible = dto.Responsible,
                SystemVersionId = dto.SystemVersionId,
                DocumentUrl = dto.DocumentUrl
            };

            d.History.Add(new StatusHistory
            {
                Status = DemandStatus.Aberta,
                Author = user.Identity?.Name ?? "sistema",
                Note = "Abertura da demanda"
            });

            // Definir RequesterUser para notificação
            d.RequesterUser = requester;

            db.Demands.Add(d);
            await db.SaveChangesAsync();

            // Enviar notificação usando o novo serviço
            await notificationService.SendCreationAsync(d, dto.ReporterEmail);

            return Results.Created($"/demands/{d.Id}", new { d.Id, d.Protocol });
        })
        .AddEndpointFilter(new ValidationFilter<CreateDemandDto>());

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

        g.MapPut("/{id:guid}", [Authorize(Policy = "PERM:" + nameof(Permission.EditarDemanda))] async (Guid id, AppDbContext db, UpdateDemandDto dto, ILogger<Program> logger) =>
        {
            try
            {
                logger.LogInformation("Updating demand {Id}", id);

                var d = await db.Demands.Include(x => x.Module).SingleOrDefaultAsync(x => x.Id == id);
                if (d is null)
                {
                    logger.LogWarning("Demand {Id} not found", id);
                    return Results.NotFound();
                }

                // Validações se campos relacionados foram fornecidos
                if (dto.ModuleId is not null)
                {
                    var module = await db.Modules.FindAsync(dto.ModuleId.Value);
                    if (module is null) return Results.BadRequest(new { error = "module_not_found" });
                    d.ModuleId = dto.ModuleId.Value;
                }

                if (dto.ReporterAreaId is not null)
                {
                    var area = await db.Areas.FindAsync(dto.ReporterAreaId.Value);
                    if (area is null) return Results.BadRequest(new { error = "area_not_found" });
                    d.ReporterAreaId = dto.ReporterAreaId.Value;
                }

                if (dto.UnitId is not null)
                {
                    var unit = await db.Units.FindAsync(dto.UnitId.Value);
                    if (unit is null) return Results.BadRequest(new { error = "unit_not_found" });
                    d.UnitId = dto.UnitId.Value;
                }

                if (dto.SystemVersionId is not null)
                {
                    var version = await db.SystemVersions.Include(v => v.System).SingleOrDefaultAsync(v => v.Id == dto.SystemVersionId.Value);
                    if (version is null) return Results.BadRequest(new { error = "system_version_not_found" });

                    // Valida se a versão pertence ao mesmo sistema do módulo
                    var moduleSystemId = dto.ModuleId is not null
                        ? (await db.Modules.FindAsync(dto.ModuleId.Value))?.SystemEntityId
                        : d.Module.SystemEntityId;

                    if (version.SystemEntityId != moduleSystemId)
                        return Results.BadRequest(new { error = "system_version_mismatch" });

                    d.SystemVersionId = dto.SystemVersionId.Value;
                }

                if (dto.Description is not null) d.Description = dto.Description;
                if (dto.Observation is not null) d.Observation = dto.Observation;
                if (dto.OccurrenceType is not null) d.OccurrenceType = dto.OccurrenceType.Value;
                if (dto.Classification is not null) d.Classification = dto.Classification.Value;
                if (dto.Priority is not null) d.Priority = dto.Priority.Value;
                if (dto.Responsible is not null) d.Responsible = dto.Responsible;
                if (dto.NextActionResponsible is not null) d.NextActionResponsible = dto.NextActionResponsible;
                if (dto.EstimatedDelivery is not null) d.EstimatedDelivery = dto.EstimatedDelivery;
                if (dto.DocumentUrl is not null) d.DocumentUrl = dto.DocumentUrl;

                await db.SaveChangesAsync();
                logger.LogInformation("Demand {Id} updated successfully", id);
                return Results.NoContent();
            }
            catch (Exception ex)
            {
                logger.LogError(ex, "Error updating demand {Id}", id);
                return Results.Problem(
                    title: "Error updating demand",
                    detail: ex.Message,
                    statusCode: 500
                );
            }
        })
        .AddEndpointFilter(new ValidationFilter<UpdateDemandDto>());

        g.MapPost("/{id:guid}/status", [Authorize(Policy = "PERM:" + nameof(Permission.EditarStatus))] async (
            Guid id, AppDbContext db, DemandNotificationService notificationService, ChangeStatusDto dto, ClaimsPrincipal user, ILogger<Program> logger) =>
        {
            try
            {
                logger.LogInformation("Changing status for demand {Id} to {Status}", id, dto.NewStatus);

                var d = await db.Demands
                    .Include(x => x.History)
                    .Include(x => x.RequesterUser)
                    .SingleOrDefaultAsync(x => x.Id == id);
                if (d is null)
                {
                    logger.LogWarning("Demand {Id} not found", id);
                    return Results.NotFound();
                }

                var oldStatus = d.Status;
                d.Status = dto.NewStatus;

                var history = new StatusHistory
                {
                    DemandId = d.Id,
                    Status = dto.NewStatus,
                    Author = user.Identity?.Name ?? "sistema",
                    Note = dto.Note,
                    ResponsibleUser = dto.ResponsibleUser
                };

                db.StatusHistory.Add(history);
                await db.SaveChangesAsync();
                logger.LogInformation("Status changed successfully for demand {Id}", id);

                // Enviar notificação de mudança de status
                await notificationService.SendStatusChangeAsync(d, oldStatus, dto.NewStatus, dto.Note, dto.ResponsibleUser);

                return Results.Ok(new { d.Id, d.Status });
            }
            catch (Exception ex)
            {
                logger.LogError(ex, "Error changing status for demand {Id}", id);
                return Results.Problem(
                    title: "Error changing demand status",
                    detail: ex.Message,
                    statusCode: 500
                );
            }
        })
        .AddEndpointFilter(new ValidationFilter<ChangeStatusDto>());

        // PATCH /demands/{id}/priority - Atualizar prioridade
        g.MapPatch("/{id:guid}/priority", [Authorize(Policy = "PERM:" + nameof(Permission.GerenciarBacklogs))] async (
            Guid id, AppDbContext db, UpdatePriorityDemandDto dto, ILogger<Program> logger, ClaimsPrincipal user) =>
        {
            try
            {
                var demand = await db.Demands.FindAsync(id);
                if (demand is null)
                {
                    logger.LogWarning("Demand {Id} not found", id);
                    return Results.NotFound();
                }

                demand.Priority = dto.Priority;
                await db.SaveChangesAsync();

                var userId = user.FindFirst("sub")?.Value ?? "Unknown";
                logger.LogInformation("Priority updated for demand {Id} to {Priority} by {UserId}",
                    id, dto.Priority, userId);

                return Results.Ok(new { id = demand.Id, priority = demand.Priority });
            }
            catch (Exception ex)
            {
                logger.LogError(ex, "Error updating priority for demand {Id}", id);
                return Results.Problem(
                    title: "Error updating priority",
                    detail: ex.Message,
                    statusCode: 500
                );
            }
        })
        .AddEndpointFilter(new ValidationFilter<UpdatePriorityDemandDto>());

        // POST /demands/{id}/notify - Notificar manualmente
        g.MapPost("/{id:guid}/notify", [Authorize(Policy = "PERM:" + nameof(Permission.NotificarEmail))] async (
            Guid id, AppDbContext db, DemandNotificationService notificationService, ManualNotificationRequest request, ILogger<Program> logger) =>
        {
            try
            {
                var demand = await db.Demands
                    .Include(x => x.RequesterUser)
                    .Include(x => x.Module)
                        .ThenInclude(m => m.System)
                    .SingleOrDefaultAsync(x => x.Id == id);

                if (demand is null)
                {
                    logger.LogWarning("Demand {Id} not found for notification", id);
                    return Results.NotFound();
                }

                var sentTo = await notificationService.SendManualAsync(demand, request);

                if (sentTo.Count == 0)
                {
                    return Results.BadRequest(new { error = "no_recipients_found", message = "Nenhum destinatário válido encontrado para enviar a notificação." });
                }

                logger.LogInformation("Manual notification sent for demand {Protocol} to {Count} recipients", demand.Protocol, sentTo.Count);

                return Results.Accepted(value: new { sentTo = sentTo.ToArray(), protocol = demand.Protocol });
            }
            catch (Exception ex)
            {
                logger.LogError(ex, "Error sending notification for demand {Id}", id);
                return Results.Problem(
                    title: "Error sending notification",
                    detail: ex.Message,
                    statusCode: 500
                );
            }
        });

        return app;
    }

    public record CreateDemandDto(
        string Description,
        string? Observation,
        Guid ModuleId,
        Guid RequesterUserId,
        Guid ReporterAreaId,
        OccurrenceType OccurrenceType,
        Guid UnitId,
        Classification Classification,
        string? Responsible,
        Guid? SystemVersionId,
        string? DocumentUrl,
        string? ReporterEmail
    );

    public record UpdateDemandDto(
        string? Description,
        string? Observation,
        Guid? ModuleId,
        Guid? ReporterAreaId,
        OccurrenceType? OccurrenceType,
        Guid? UnitId,
        Classification? Classification,
        int? Priority,
        string? Responsible,
        Guid? SystemVersionId,
        string? NextActionResponsible,
        DateTime? EstimatedDelivery,
        string? DocumentUrl
    );

    public record ChangeStatusDto(DemandStatus NewStatus, string? Note, string? ResponsibleUser);

    public record UpdatePriorityDemandDto(int? Priority);
}



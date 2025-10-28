using Api.Domain;
using Api.Persistence;
using Api.Security;
using Microsoft.EntityFrameworkCore;

namespace Api.Features.Dashboard;

public static class DashboardEndpoints
{
    public static IEndpointRouteBuilder MapDashboard(this IEndpointRouteBuilder app)
    {
        var g = app.MapGroup("/dashboard")
                   .RequireAuthorization("PERM:" + nameof(Permission.AcessarDashboard));

        g.MapGet("/cards", async (AppDbContext db) =>
        {
            var now = DateTime.UtcNow;
            var monthStart = new DateTime(now.Year, now.Month, 1, 0, 0, 0, DateTimeKind.Utc);
            var concludedThisMonth = await db.Demands.CountAsync(d => d.Status == DemandStatus.Concluida && d.OpenedAt >= monthStart);

            var open = await db.Demands.CountAsync(d => d.Status != DemandStatus.Concluida);
            var exec = await db.Demands.CountAsync(d => d.Status == DemandStatus.Execucao);
            var valid = await db.Demands.CountAsync(d => d.Status == DemandStatus.Validacao);

            var slaDates = await db.StatusHistory
                .Where(h => h.Status == DemandStatus.Concluida && h.Demand.OpenedAt >= monthStart)
                .Select(h => new { h.Date, h.Demand.OpenedAt })
                .ToListAsync();

            double slaAvg = slaDates.Count == 0 ? 0 : slaDates.Average(x => (x.Date - x.OpenedAt).TotalDays);

            return Results.Ok(new
            {
                abertas = open,
                emExecucao = exec,
                emValidacao = valid,
                concluidasNoMes = concludedThisMonth,
                slaMedioDias = Math.Round(slaAvg, 1)
            });
        });

        g.MapGet("/por-status", async (AppDbContext db) =>
            await db.Demands.GroupBy(d => d.Status)
                .Select(g => new { status = g.Key, qtde = g.Count() }).ToListAsync());

        g.MapGet("/por-area", async (AppDbContext db) =>
            await db.Demands.GroupBy(d => d.ReporterArea.Name)
                .Select(g => new { area = g.Key, qtde = g.Count() }).ToListAsync());

        g.MapGet("/por-modulo", async (AppDbContext db) =>
            await db.Demands.GroupBy(d => d.Module.Name)
                .Select(g => new { modulo = g.Key, qtde = g.Count() }).ToListAsync());

        g.MapGet("/por-responsavel", async (AppDbContext db) =>
            await db.Demands.Where(d => d.Responsible != null)
                .GroupBy(d => d.Responsible!)
                .Select(g => new { responsavel = g.Key, qtde = g.Count() }).ToListAsync());

        g.MapGet("/por-unidade", async (AppDbContext db) =>
            await db.Demands.GroupBy(d => d.Unit.Name)
                .Select(g => new { unidade = g.Key, qtde = g.Count() }).ToListAsync());

        return app;
    }
}

using Api.Persistence;
using Microsoft.Extensions.Diagnostics.HealthChecks;

namespace Api.Health;

public class DbHealthCheck : IHealthCheck
{
    private readonly AppDbContext _db;
    public DbHealthCheck(AppDbContext db) => _db = db;

    public async Task<HealthCheckResult> CheckHealthAsync(HealthCheckContext context, CancellationToken cancellationToken = default)
    {
        try
        {
            var canConnect = await _db.Database.CanConnectAsync(cancellationToken);
            return canConnect ? HealthCheckResult.Healthy("Database reachable") : HealthCheckResult.Unhealthy("Database unreachable");
        }
        catch (Exception ex)
        {
            return HealthCheckResult.Unhealthy("Database check failed", ex);
        }
    }
}


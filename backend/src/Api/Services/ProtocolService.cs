using Api.Domain;
using Api.Persistence;
using Microsoft.EntityFrameworkCore;

namespace Api.Services;

public class ProtocolService(AppDbContext db)
{
    public async Task<string> GenerateAsync(CancellationToken ct = default)
    {
        var year = DateTime.UtcNow.Year;
        await using var tx = await db.Database.BeginTransactionAsync(System.Data.IsolationLevel.Serializable, ct);
        var row = await db.ProtocolCounters.SingleOrDefaultAsync(p => p.Year == year, ct);
        if (row is null)
        {
            row = new ProtocolCounter { Year = year, LastNumber = 0 };
            db.ProtocolCounters.Add(row);
        }
        row.LastNumber++;
        await db.SaveChangesAsync(ct);
        await tx.CommitAsync(ct);
        return $"{year}-{row.LastNumber:000000}";
    }
}

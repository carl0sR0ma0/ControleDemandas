using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Design;

namespace Api.Persistence;

public class DesignTimeFactory : IDesignTimeDbContextFactory<AppDbContext>
{
    public AppDbContext CreateDbContext(string[] args)
    {
        var builder = new DbContextOptionsBuilder<AppDbContext>();
        builder.UseNpgsql("Host=localhost;Port=5432;Database=controle_demandas;Username=postgres;Password=b4SQIT8krqTArAaw3PIy",
            opts => opts.MigrationsHistoryTable("__EFMigrationsHistory", "public"));
        return new AppDbContext(builder.Options);
    }
}

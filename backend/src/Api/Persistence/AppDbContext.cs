using Api.Domain;
using Microsoft.EntityFrameworkCore;

namespace Api.Persistence;

public class AppDbContext(DbContextOptions<AppDbContext> options) : DbContext(options)
{
    public DbSet<User> Users => Set<User>();
    public DbSet<Demand> Demands => Set<Demand>();
    public DbSet<Attachment> Attachments => Set<Attachment>();
    public DbSet<StatusHistory> StatusHistory => Set<StatusHistory>();
    public DbSet<ProtocolCounter> ProtocolCounters => Set<ProtocolCounter>();

    protected override void OnModelCreating(ModelBuilder b)
    {
        b.HasPostgresExtension("uuid-ossp");
        b.Entity<User>().HasIndex(x => x.Email).IsUnique();

        b.Entity<Demand>().HasIndex(x => x.Protocol).IsUnique();

        b.Entity<Demand>().HasMany(d => d.Attachments).WithOne(a => a.Demand).HasForeignKey(a => a.DemandId);
        b.Entity<Demand>().HasMany(d => d.History).WithOne(h => h.Demand).HasForeignKey(h => h.DemandId);

        var adminId = Guid.NewGuid();
        b.Entity<User>().HasData(new User
        {
            Id = adminId,
            Name = "Administrador",
            Email = "admin@empresa.com",
            PasswordHash = BCrypt.Net.BCrypt.HashPassword("Admin@123"),
            Role = "Admin",
            Permissions = Permission.AcessarDashboard | Permission.VisualizarDemandas |
                          Permission.RegistrarDemandas | Permission.EditarStatus |
                          Permission.Aprovar | Permission.GerenciarUsuarios
        });
    }
}

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
    public DbSet<PermissionEntity> Permissions => Set<PermissionEntity>();
    public DbSet<UserPermission> UserPermissions => Set<UserPermission>();
    public DbSet<Profile> Profiles => Set<Profile>();
    public DbSet<ProfilePermission> ProfilePermissions => Set<ProfilePermission>();
    public DbSet<Area> Areas => Set<Area>();
    public DbSet<Unit> Units => Set<Unit>();
    public DbSet<SystemEntity> Systems => Set<SystemEntity>();
    public DbSet<SystemVersion> SystemVersions => Set<SystemVersion>();
    public DbSet<ModuleEntity> Modules => Set<ModuleEntity>();

    protected override void OnModelCreating(ModelBuilder b)
    {
        b.HasPostgresExtension("uuid-ossp");
        b.Entity<User>().HasIndex(x => x.Email).IsUnique();

        b.Entity<Demand>().HasIndex(x => x.Protocol).IsUnique();

        b.Entity<Demand>().HasMany(d => d.Attachments).WithOne(a => a.Demand).HasForeignKey(a => a.DemandId);
        b.Entity<Demand>().HasMany(d => d.History).WithOne(h => h.Demand).HasForeignKey(h => h.DemandId);
        b.Entity<Demand>()
            .HasOne(d => d.Module).WithMany().HasForeignKey(d => d.ModuleId).OnDelete(DeleteBehavior.Restrict);
        b.Entity<Demand>()
            .HasOne(d => d.RequesterUser).WithMany().HasForeignKey(d => d.RequesterUserId).OnDelete(DeleteBehavior.Restrict);
        b.Entity<Demand>()
            .HasOne(d => d.ReporterArea).WithMany().HasForeignKey(d => d.ReporterAreaId).OnDelete(DeleteBehavior.Restrict);
        b.Entity<Demand>()
            .HasOne(d => d.Unit).WithMany().HasForeignKey(d => d.UnitId).OnDelete(DeleteBehavior.Restrict);
        b.Entity<Demand>()
            .HasOne(d => d.SystemVersion).WithMany().HasForeignKey(d => d.SystemVersionId).OnDelete(DeleteBehavior.SetNull);

        // Map Permissions
        b.Entity<PermissionEntity>().HasIndex(x => x.Code).IsUnique();
        b.Entity<UserPermission>().HasKey(x => new { x.UserId, x.PermissionId });
        b.Entity<UserPermission>()
            .HasOne(x => x.User).WithMany().HasForeignKey(x => x.UserId).OnDelete(DeleteBehavior.Cascade);
        b.Entity<UserPermission>()
            .HasOne(x => x.Permission).WithMany(p => p.Users).HasForeignKey(x => x.PermissionId).OnDelete(DeleteBehavior.Cascade);

        // Map Profiles
        b.Entity<Profile>().HasIndex(x => x.Name).IsUnique();
        b.Entity<ProfilePermission>().HasKey(x => new { x.ProfileId, x.PermissionId });
        b.Entity<ProfilePermission>()
            .HasOne(x => x.Profile).WithMany(p => p.Permissions).HasForeignKey(x => x.ProfileId).OnDelete(DeleteBehavior.Cascade);
        b.Entity<ProfilePermission>()
            .HasOne(x => x.Permission).WithMany().HasForeignKey(x => x.PermissionId).OnDelete(DeleteBehavior.Cascade);

        // User -> Profile
        b.Entity<User>()
            .HasOne(u => u.Profile)
            .WithMany()
            .HasForeignKey(u => u.ProfileId)
            .OnDelete(DeleteBehavior.SetNull);

        // User -> Area (optional)
        b.Entity<User>()
            .HasOne(u => u.Area)
            .WithMany()
            .HasForeignKey(u => u.AreaId)
            .OnDelete(DeleteBehavior.SetNull);

        // Config maps
        b.Entity<Area>().HasIndex(x => x.Name).IsUnique();
        b.Entity<Unit>().HasIndex(x => x.Name).IsUnique();
        b.Entity<SystemEntity>().HasIndex(x => x.Name).IsUnique();
        b.Entity<SystemVersion>().HasIndex(x => new { x.SystemEntityId, x.Version }).IsUnique();
        b.Entity<ModuleEntity>().HasIndex(x => new { x.SystemEntityId, x.Name }).IsUnique();

        b.Entity<SystemVersion>()
            .HasOne(v => v.System).WithMany(s => s.Versions).HasForeignKey(v => v.SystemEntityId)
            .OnDelete(DeleteBehavior.Cascade);
        b.Entity<ModuleEntity>()
            .HasOne(m => m.System).WithMany(s => s.Modules).HasForeignKey(m => m.SystemEntityId)
            .OnDelete(DeleteBehavior.Cascade);

        // Seed Permissions with fixed IDs (must match enum Permission names)
        var pDash = new PermissionEntity { Id = Guid.Parse("11111111-1111-1111-1111-111111111111"), Code = nameof(Permission.AcessarDashboard), Name = "Acessar Dashboard", Category = "Dashboard", Description = "Acesso ao painel principal" };
        var pView = new PermissionEntity { Id = Guid.Parse("11111111-1111-1111-1111-111111111112"), Code = nameof(Permission.VisualizarDemandas), Name = "Visualizar Demandas", Category = "Demandas", Description = "Ver lista e detalhes das demandas" };
        var pCreate = new PermissionEntity { Id = Guid.Parse("11111111-1111-1111-1111-111111111113"), Code = nameof(Permission.RegistrarDemandas), Name = "Registrar Demandas", Category = "Demandas", Description = "Criar novas demandas" };
        var pEdit = new PermissionEntity { Id = Guid.Parse("11111111-1111-1111-1111-111111111114"), Code = nameof(Permission.EditarStatus), Name = "Editar Status", Category = "Demandas", Description = "Alterar status/histórico" };
        var pApprove = new PermissionEntity { Id = Guid.Parse("11111111-1111-1111-1111-111111111115"), Code = nameof(Permission.Aprovar), Name = "Aprovar Demandas", Category = "Demandas", Description = "Aprovar para execução" };
        var pUsers = new PermissionEntity { Id = Guid.Parse("11111111-1111-1111-1111-111111111116"), Code = nameof(Permission.GerenciarUsuarios), Name = "Gerenciar Usuários", Category = "Sistema", Description = "Criar/editar usuários" };
        b.Entity<PermissionEntity>().HasData(pDash, pView, pCreate, pEdit, pApprove, pUsers);

        // Seed Users
        var adminId = Guid.Parse("aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa");
        var gestorId = Guid.Parse("bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb");
        var adminProfileId = Guid.Parse("22222222-2222-2222-2222-222222222222");
        var gestorProfileId = Guid.Parse("33333333-3333-3333-3333-333333333333");
        b.Entity<User>().HasData(
            new User
            {
                Id = adminId,
                Name = "Administrador",
                Email = "admin@empresa.com",
                PasswordHash = BCrypt.Net.BCrypt.HashPassword("Admin@123"),
                Role = "Admin",
                ProfileId = adminProfileId,
                IsSpecial = false
            },
            new User
            {
                Id = gestorId,
                Name = "Gestor",
                Email = "gestor@empresa.com",
                PasswordHash = BCrypt.Net.BCrypt.HashPassword("Gestor@123"),
                Role = "Gestor",
                ProfileId = gestorProfileId,
                IsSpecial = false
            }
        );

        // Seed UserPermissions
        b.Entity<UserPermission>().HasData(
            new UserPermission { UserId = adminId, PermissionId = pDash.Id, Granted = true },
            new UserPermission { UserId = adminId, PermissionId = pView.Id, Granted = true },
            new UserPermission { UserId = adminId, PermissionId = pCreate.Id, Granted = true },
            new UserPermission { UserId = adminId, PermissionId = pEdit.Id, Granted = true },
            new UserPermission { UserId = adminId, PermissionId = pApprove.Id, Granted = true },
            new UserPermission { UserId = adminId, PermissionId = pUsers.Id, Granted = true },

            new UserPermission { UserId = gestorId, PermissionId = pDash.Id, Granted = true },
            new UserPermission { UserId = gestorId, PermissionId = pView.Id, Granted = true },
            new UserPermission { UserId = gestorId, PermissionId = pCreate.Id, Granted = true },
            new UserPermission { UserId = gestorId, PermissionId = pEdit.Id, Granted = true },
            new UserPermission { UserId = gestorId, PermissionId = pApprove.Id, Granted = true }
        );
    }
}

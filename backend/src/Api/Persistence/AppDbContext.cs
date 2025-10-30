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
    public DbSet<Backlog> Backlogs => Set<Backlog>();

    protected override void OnModelCreating(ModelBuilder b)
    {
        b.HasPostgresExtension("uuid-ossp");
        b.Entity<User>().HasIndex(x => x.Email).IsUnique();

        // Índices de Demand
        b.Entity<Demand>().HasIndex(x => x.Protocol).IsUnique();

        // Índices para otimizar queries de filtro e listagem
        b.Entity<Demand>().HasIndex(x => x.Status);
        b.Entity<Demand>().HasIndex(x => x.ReporterAreaId);
        b.Entity<Demand>().HasIndex(x => x.ModuleId);
        b.Entity<Demand>().HasIndex(x => x.UnitId);
        b.Entity<Demand>().HasIndex(x => x.RequesterUserId);
        b.Entity<Demand>().HasIndex(x => x.SystemVersionId);
        b.Entity<Demand>().HasIndex(x => x.BacklogId);
        b.Entity<Demand>().HasIndex(x => x.OpenedAt);

        // Índices compostos para queries mais complexas (mais eficientes para ordenação + filtro)
        b.Entity<Demand>().HasIndex(x => new { x.Status, x.OpenedAt });
        b.Entity<Demand>().HasIndex(x => new { x.ReporterAreaId, x.OpenedAt });
        b.Entity<Demand>().HasIndex(x => new { x.ModuleId, x.OpenedAt });

        // Índices para campos de busca textual comum
        b.Entity<Demand>().HasIndex(x => x.Responsible);
        b.Entity<Demand>().HasIndex(x => x.OccurrenceType);
        b.Entity<Demand>().HasIndex(x => x.Classification);
        b.Entity<Demand>().HasIndex(x => x.Priority);

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
        b.Entity<Demand>()
            .HasOne(d => d.Backlog).WithMany(bl => bl.Demands).HasForeignKey(d => d.BacklogId).OnDelete(DeleteBehavior.SetNull);

        // Map Backlogs
        b.Entity<Backlog>().HasIndex(x => x.Name);

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
        var pEditStatus = new PermissionEntity { Id = Guid.Parse("11111111-1111-1111-1111-111111111114"), Code = nameof(Permission.EditarStatus), Name = "Editar Status", Category = "Demandas", Description = "Alterar status/histórico" };
        var pEditDemand = new PermissionEntity { Id = Guid.Parse("11111111-1111-1111-1111-111111111115"), Code = nameof(Permission.EditarDemanda), Name = "Editar Demanda", Category = "Demandas", Description = "Editar informações das demandas" };
        var pNotify = new PermissionEntity { Id = Guid.Parse("11111111-1111-1111-1111-111111111116"), Code = nameof(Permission.NotificarEmail), Name = "Notificar Email", Category = "Notificações", Description = "Enviar notificações por email" };
        var pUsers = new PermissionEntity { Id = Guid.Parse("11111111-1111-1111-1111-111111111117"), Code = nameof(Permission.GerenciarUsuarios), Name = "Gerenciar Usuários", Category = "Sistema", Description = "Criar/editar usuários" };
        var pProfiles = new PermissionEntity { Id = Guid.Parse("11111111-1111-1111-1111-111111111118"), Code = nameof(Permission.GerenciarPerfis), Name = "Gerenciar Perfis", Category = "Sistema", Description = "Criar/editar perfis" };
        var pConfig = new PermissionEntity { Id = Guid.Parse("11111111-1111-1111-1111-111111111119"), Code = nameof(Permission.Configuracoes), Name = "Configurações", Category = "Sistema", Description = "Acessar configurações" };
        var pBacklogs = new PermissionEntity { Id = Guid.Parse("11111111-1111-1111-1111-11111111111a"), Code = nameof(Permission.GerenciarBacklogs), Name = "Gerenciar Backlogs", Category = "Demandas", Description = "Criar e gerenciar backlogs, editar prioridades" };
        b.Entity<PermissionEntity>().HasData(pDash, pView, pCreate, pEditStatus, pEditDemand, pNotify, pUsers, pProfiles, pConfig, pBacklogs);

        // Seed Users
        var adminId = Guid.Parse("aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa");
        var gestorId = Guid.Parse("bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb");
        b.Entity<User>().HasData(
            new User
            {
                Id = adminId,
                Name = "Administrador",
                Email = "admin@empresa.com",
                PasswordHash = BCrypt.Net.BCrypt.HashPassword("Admin@123"),
                Role = "Admin",
                ProfileId = null,
                IsSpecial = false
            },
            new User
            {
                Id = gestorId,
                Name = "Gestor",
                Email = "gestor@empresa.com",
                PasswordHash = BCrypt.Net.BCrypt.HashPassword("Gestor@123"),
                Role = "Gestor",
                ProfileId = null,
                IsSpecial = false
            }
        );

        // Seed UserPermissions
        b.Entity<UserPermission>().HasData(
            // Admin tem todas as permissões
            new UserPermission { UserId = adminId, PermissionId = pDash.Id, Granted = true },
            new UserPermission { UserId = adminId, PermissionId = pView.Id, Granted = true },
            new UserPermission { UserId = adminId, PermissionId = pCreate.Id, Granted = true },
            new UserPermission { UserId = adminId, PermissionId = pEditStatus.Id, Granted = true },
            new UserPermission { UserId = adminId, PermissionId = pEditDemand.Id, Granted = true },
            new UserPermission { UserId = adminId, PermissionId = pNotify.Id, Granted = true },
            new UserPermission { UserId = adminId, PermissionId = pUsers.Id, Granted = true },
            new UserPermission { UserId = adminId, PermissionId = pProfiles.Id, Granted = true },
            new UserPermission { UserId = adminId, PermissionId = pConfig.Id, Granted = true },
            new UserPermission { UserId = adminId, PermissionId = pBacklogs.Id, Granted = true },

            // Gestor tem permissões operacionais
            new UserPermission { UserId = gestorId, PermissionId = pDash.Id, Granted = true },
            new UserPermission { UserId = gestorId, PermissionId = pView.Id, Granted = true },
            new UserPermission { UserId = gestorId, PermissionId = pCreate.Id, Granted = true },
            new UserPermission { UserId = gestorId, PermissionId = pEditStatus.Id, Granted = true },
            new UserPermission { UserId = gestorId, PermissionId = pEditDemand.Id, Granted = true },
            new UserPermission { UserId = gestorId, PermissionId = pNotify.Id, Granted = true }
        );
    }
}

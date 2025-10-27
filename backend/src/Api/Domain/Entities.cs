using System.ComponentModel.DataAnnotations;

namespace Api.Domain;

public class User
{
    public Guid Id { get; set; } = Guid.NewGuid();
    [MaxLength(120)] public string Name { get; set; } = default!;
    [MaxLength(160)] public string Email { get; set; } = default!;
    public string PasswordHash { get; set; } = default!;
    public bool Active { get; set; } = true;
    public string Role { get; set; } = "Colaborador";
    // Área vinculada ao usuário (opcional)
    public Guid? AreaId { get; set; }
    public Area? Area { get; set; }
    // Perfil associado (opcional)
    public Guid? ProfileId { get; set; }
    public Profile? Profile { get; set; }
    // Indica que as permissões do usuário diferem das do perfil
    public bool IsSpecial { get; set; } = false;
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}

public class Demand
{
    public Guid Id { get; set; } = Guid.NewGuid();
    [MaxLength(32)] public string Protocol { get; set; } = default!;
    public DateTime OpenedAt { get; set; } = DateTime.UtcNow;

    public string Description { get; set; } = default!;
    public string? Observation { get; set; }

    [MaxLength(120)] public string Module { get; set; } = default!;
    [MaxLength(120)] public string RequesterResponsible { get; set; } = default!;
    [MaxLength(60)]  public string ReporterArea { get; set; } = default!;
    public OccurrenceType OccurrenceType { get; set; }
    [MaxLength(120)] public string Unit { get; set; } = default!;
    public Classification Classification { get; set; }

    [MaxLength(120)] public string? Client { get; set; }
    [MaxLength(30)]  public string? Priority { get; set; }
    [MaxLength(30)]  public string? SystemVersion { get; set; }
    [MaxLength(120)] public string? Reporter { get; set; }
    [MaxLength(120)] public string? ProductModule { get; set; }
    public DemandStatus Status { get; set; } = DemandStatus.Ranqueado;
    [MaxLength(120)] public string? NextActionResponsible { get; set; }
    public DateTime? EstimatedDelivery { get; set; }
    public string? DocumentUrl { get; set; }
    public int? Order { get; set; }

    public List<Attachment> Attachments { get; set; } = [];
    public List<StatusHistory> History { get; set; } = [];
}

public class Attachment
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public string FileName { get; set; } = default!;
    public string ContentType { get; set; } = default!;
    public long Size { get; set; }
    public string StoragePath { get; set; } = default!;
    public Guid DemandId { get; set; }
    public Demand Demand { get; set; } = default!;
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}

public class StatusHistory
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public Guid DemandId { get; set; }
    public Demand Demand { get; set; } = default!;
    public DemandStatus Status { get; set; }
    public DateTime Date { get; set; } = DateTime.UtcNow;
    [MaxLength(160)] public string Author { get; set; } = default!;
    public string? Note { get; set; }
}

public class ProtocolCounter
{
    public int Id { get; set; }
    public int Year { get; set; }
    public int LastNumber { get; set; }
}

public class PermissionEntity
{
    public Guid Id { get; set; } = Guid.NewGuid();
    [MaxLength(80)] public string Code { get; set; } = default!; // deve coincidir com enum Permission
    [MaxLength(120)] public string Name { get; set; } = default!;
    [MaxLength(200)] public string Category { get; set; } = default!;
    [MaxLength(400)] public string? Description { get; set; }
    public bool Active { get; set; } = true;

    public ICollection<UserPermission> Users { get; set; } = [];
}

public class UserPermission
{
    public Guid UserId { get; set; }
    public User User { get; set; } = default!;
    public Guid PermissionId { get; set; }
    public PermissionEntity Permission { get; set; } = default!;
    public bool Granted { get; set; } = true;
}

public class Profile
{
    public Guid Id { get; set; } = Guid.NewGuid();
    [MaxLength(120)] public string Name { get; set; } = default!;
    public bool Active { get; set; } = true;
    // Optional Tailwind-like classes to style profile badge in UI
    [MaxLength(200)] public string? BadgeClass { get; set; }

    public ICollection<ProfilePermission> Permissions { get; set; } = [];
}

public class ProfilePermission
{
    public Guid ProfileId { get; set; }
    public Profile Profile { get; set; } = default!;
    public Guid PermissionId { get; set; }
    public PermissionEntity Permission { get; set; } = default!;
    public bool Granted { get; set; } = true;
}

// Configurações de formulário
public class Area
{
    public Guid Id { get; set; } = Guid.NewGuid();
    [MaxLength(120)] public string Name { get; set; } = default!;
    public bool Active { get; set; } = true;
}

public class Client
{
    public Guid Id { get; set; } = Guid.NewGuid();
    [MaxLength(160)] public string Name { get; set; } = default!;
    public bool Active { get; set; } = true;
}

public class Unit
{
    public Guid Id { get; set; } = Guid.NewGuid();
    [MaxLength(120)] public string Name { get; set; } = default!;
    public bool Active { get; set; } = true;
}

public class StatusConfig
{
    public Guid Id { get; set; } = Guid.NewGuid();
    [MaxLength(120)] public string Name { get; set; } = default!;
    public bool Active { get; set; } = true;
}

public class SystemEntity
{
    public Guid Id { get; set; } = Guid.NewGuid();
    [MaxLength(160)] public string Name { get; set; } = default!;
    public bool Active { get; set; } = true;
    public ICollection<SystemVersion> Versions { get; set; } = [];
    public ICollection<ModuleEntity> Modules { get; set; } = [];
}

public class SystemVersion
{
    public Guid Id { get; set; } = Guid.NewGuid();
    [MaxLength(60)] public string Version { get; set; } = default!;
    public bool Active { get; set; } = true;
    public Guid SystemEntityId { get; set; }
    public SystemEntity System { get; set; } = default!;
}

public class ModuleEntity
{
    public Guid Id { get; set; } = Guid.NewGuid();
    [MaxLength(160)] public string Name { get; set; } = default!;
    public bool Active { get; set; } = true;
    public Guid SystemEntityId { get; set; }
    public SystemEntity System { get; set; } = default!;
}

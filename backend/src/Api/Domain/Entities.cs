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
    // Dados adicionais do perfil
    [MaxLength(20)] public string? Phone { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}

public class Demand
{
    public Guid Id { get; set; } = Guid.NewGuid();
    [MaxLength(32)] public string Protocol { get; set; } = default!;
    public DateTime OpenedAt { get; set; } = DateTime.UtcNow;

    public string Description { get; set; } = default!;
    public string? Observation { get; set; }

    public Guid ModuleId { get; set; }
    public ModuleEntity Module { get; set; } = default!;
    public Guid RequesterUserId { get; set; }
    public User RequesterUser { get; set; } = default!;
    public Guid ReporterAreaId { get; set; }
    public Area ReporterArea { get; set; } = default!;
    public OccurrenceType OccurrenceType { get; set; }
    public Guid UnitId { get; set; }
    public Unit Unit { get; set; } = default!;
    public Classification Classification { get; set; }
    public int? Priority { get; set; } // Valores 1-5, null quando não definido

    [MaxLength(120)] public string? Responsible { get; set; }
    public Guid? SystemVersionId { get; set; }
    public SystemVersion? SystemVersion { get; set; }
    public DemandStatus Status { get; set; } = DemandStatus.Aberta;
    [MaxLength(120)] public string? NextActionResponsible { get; set; }
    public DateTime? EstimatedDelivery { get; set; }
    public string? DocumentUrl { get; set; }

    // Relação com Backlog
    public Guid? BacklogId { get; set; }
    public Backlog? Backlog { get; set; }

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
    [MaxLength(120)] public string? ResponsibleUser { get; set; }
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

public class Unit
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

public class Backlog
{
    public Guid Id { get; set; } = Guid.NewGuid();
    [MaxLength(100)] public string Name { get; set; } = default!;
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public ICollection<Demand> Demands { get; set; } = [];
}


public class Sprint
{
    public Guid Id { get; set; } = Guid.NewGuid();
    [MaxLength(160)] public string Name { get; set; } = default!;
    public DateTime StartDate { get; set; }
    public DateTime EndDate { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public ICollection<SprintItem> Items { get; set; } = [];
}

public class SprintItem
{
    public Guid Id { get; set; } = Guid.NewGuid();

    public Guid SprintId { get; set; }
    public Sprint Sprint { get; set; } = default!;

    public Guid DemandId { get; set; }
    public Demand Demand { get; set; } = default!;

    public double PlannedHours { get; set; }
    public double WorkedHours { get; set; }
}

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
    public Permission Permissions { get; set; }
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

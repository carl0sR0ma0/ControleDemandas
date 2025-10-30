namespace Api.Features.Backlogs;

public record CreateBacklogDto(string Name, List<Guid> DemandIds);

public record BacklogSummaryDto(Guid Id, string Name, int DemandsCount, DateTime CreatedAt);

public record BacklogDetailDto(
    Guid Id,
    string Name,
    DateTime CreatedAt,
    List<BacklogDemandDto> Demands
);

public record BacklogDemandDto(
    Guid Id,
    string Protocol,
    string Description,
    int? Priority,
    string Status
);

public record UpdatePriorityDto(int? Priority);

public record AddDemandsToBacklogDto(List<Guid> DemandIds);

using Api.Domain;
using Api.Features.Demands;
using FluentValidation;

namespace Api.Features.Demands;

public class CreateDemandValidator : AbstractValidator<DemandEndpoints.CreateDemandDto>
{
    public CreateDemandValidator()
    {
        RuleFor(x => x.Description).NotEmpty();
        RuleFor(x => x.ModuleId).NotEmpty();
        RuleFor(x => x.RequesterUserId).NotEmpty();
        RuleFor(x => x.ReporterAreaId).NotEmpty();
        RuleFor(x => x.UnitId).NotEmpty();
        RuleFor(x => x.OccurrenceType).IsInEnum();
        RuleFor(x => x.Classification).IsInEnum();

        RuleFor(x => x.Responsible).MaximumLength(120).When(x => !string.IsNullOrWhiteSpace(x.Responsible));
        RuleFor(x => x.DocumentUrl).MaximumLength(2048).When(x => !string.IsNullOrWhiteSpace(x.DocumentUrl));
        RuleFor(x => x.ReporterEmail).EmailAddress().When(x => !string.IsNullOrWhiteSpace(x.ReporterEmail));
    }
}

public class UpdateDemandValidator : AbstractValidator<DemandEndpoints.UpdateDemandDto>
{
    public UpdateDemandValidator()
    {
        RuleFor(x => x.Observation).MaximumLength(4000).When(x => !string.IsNullOrWhiteSpace(x.Observation));
        RuleFor(x => x.NextActionResponsible).MaximumLength(120).When(x => !string.IsNullOrWhiteSpace(x.NextActionResponsible));
        RuleFor(x => x.DocumentUrl).MaximumLength(2048).When(x => !string.IsNullOrWhiteSpace(x.DocumentUrl));
    }
}

public class ChangeStatusValidator : AbstractValidator<DemandEndpoints.ChangeStatusDto>
{
    public ChangeStatusValidator()
    {
        RuleFor(x => x.NewStatus).IsInEnum();
        RuleFor(x => x.Note).MaximumLength(4000).When(x => !string.IsNullOrWhiteSpace(x.Note));
    }
}

public class UpdatePriorityDemandValidator : AbstractValidator<DemandEndpoints.UpdatePriorityDemandDto>
{
    public UpdatePriorityDemandValidator()
    {
        RuleFor(x => x.Priority)
            .Must(p => p == null || (p >= 1 && p <= 5))
            .WithMessage("Prioridade deve estar entre 1 e 5");
    }
}


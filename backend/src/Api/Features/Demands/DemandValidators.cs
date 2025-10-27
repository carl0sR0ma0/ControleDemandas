using Api.Domain;
using Api.Features.Demands;
using FluentValidation;

namespace Api.Features.Demands;

public class CreateDemandValidator : AbstractValidator<DemandEndpoints.CreateDemandDto>
{
    public CreateDemandValidator()
    {
        RuleFor(x => x.Description).NotEmpty();
        RuleFor(x => x.Module).NotEmpty().MaximumLength(120);
        RuleFor(x => x.RequesterResponsible).NotEmpty().MaximumLength(120);
        RuleFor(x => x.ReporterArea).NotEmpty().MaximumLength(60);
        RuleFor(x => x.Unit).NotEmpty().MaximumLength(120);
        RuleFor(x => x.OccurrenceType).IsInEnum();
        RuleFor(x => x.Classification).IsInEnum();

        RuleFor(x => x.Client).MaximumLength(120).When(x => !string.IsNullOrWhiteSpace(x.Client));
        RuleFor(x => x.Priority).MaximumLength(30).When(x => !string.IsNullOrWhiteSpace(x.Priority));
        RuleFor(x => x.SystemVersion).MaximumLength(30).When(x => !string.IsNullOrWhiteSpace(x.SystemVersion));
        RuleFor(x => x.Reporter).MaximumLength(120).When(x => !string.IsNullOrWhiteSpace(x.Reporter));
        RuleFor(x => x.ProductModule).MaximumLength(120).When(x => !string.IsNullOrWhiteSpace(x.ProductModule));
        RuleFor(x => x.DocumentUrl).MaximumLength(2048).When(x => !string.IsNullOrWhiteSpace(x.DocumentUrl));
        RuleFor(x => x.Order).GreaterThanOrEqualTo(0).When(x => x.Order.HasValue);
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
        RuleFor(x => x.Order).GreaterThanOrEqualTo(0).When(x => x.Order.HasValue);
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


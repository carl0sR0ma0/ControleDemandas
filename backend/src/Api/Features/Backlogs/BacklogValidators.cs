using FluentValidation;

namespace Api.Features.Backlogs;

public class CreateBacklogValidator : AbstractValidator<CreateBacklogDto>
{
    public CreateBacklogValidator()
    {
        RuleFor(x => x.Name)
            .NotEmpty().WithMessage("Nome do backlog é obrigatório")
            .MaximumLength(100).WithMessage("Nome do backlog deve ter no máximo 100 caracteres");

        RuleFor(x => x.DemandIds)
            .NotEmpty().WithMessage("Selecione ao menos uma demanda para o backlog");
    }
}

public class UpdatePriorityValidator : AbstractValidator<UpdatePriorityDto>
{
    public UpdatePriorityValidator()
    {
        RuleFor(x => x.Priority)
            .Must(p => p == null || (p >= 1 && p <= 5))
            .WithMessage("Prioridade deve estar entre 1 e 5");
    }
}

using Api.Features.Auth;
using FluentValidation;

namespace Api.Features.Auth;

public class LoginDtoValidator : AbstractValidator<AuthEndpoints.LoginDto>
{
    public LoginDtoValidator()
    {
        RuleFor(x => x.Email).NotEmpty().EmailAddress();
        RuleFor(x => x.Password).NotEmpty();
    }
}

public class CreateUserDtoValidator : AbstractValidator<AuthEndpoints.CreateUserDto>
{
    public CreateUserDtoValidator()
    {
        RuleFor(x => x.Name).NotEmpty().MaximumLength(120);
        RuleFor(x => x.Email).NotEmpty().EmailAddress();
        RuleFor(x => x.Password)
            .NotEmpty().MinimumLength(8)
            .Matches("[A-Z]").WithMessage("Deve conter letra maiúscula")
            .Matches("[a-z]").WithMessage("Deve conter letra minúscula")
            .Matches("[0-9]").WithMessage("Deve conter número");
        RuleFor(x => x.Role).NotEmpty();
        RuleFor(x => x.Permissions).NotEqual(Api.Domain.Permission.None);
    }
}


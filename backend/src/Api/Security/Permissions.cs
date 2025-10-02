using Api.Domain;
using Microsoft.AspNetCore.Authorization;

namespace Api.Security;

public static class PermissionPolicies
{
    public const string PolicyPrefix = "PERM:";

    public static AuthorizationPolicy BuildPolicy(Permission p) =>
        new AuthorizationPolicyBuilder().RequireAssertion(ctx =>
        {
            var claim = ctx.User.FindFirst("perms")?.Value;
            if (claim is null) return false;
            if (!long.TryParse(claim, out var val)) return false;
            return ((Permission)val).HasFlag(p);
        }).Build();

    public static void AddPermissionPolicies(this AuthorizationOptions opts)
    {
        foreach (Permission p in Enum.GetValues(typeof(Permission)))
            if (p != Permission.None)
                opts.AddPolicy(PolicyPrefix + p, BuildPolicy(p));
    }
}

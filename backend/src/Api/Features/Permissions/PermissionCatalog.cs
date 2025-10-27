using Api.Domain;

namespace Api.Features.Permissions;

public record PermissionDefinition(string Code, long Value, string Name, string Description, string Category);

public static class PermissionCatalog
{
    public static readonly IReadOnlyList<PermissionDefinition> All = new List<PermissionDefinition>
    {
        new(nameof(Permission.AcessarDashboard), (long)Permission.AcessarDashboard, "Acessar Dashboard", "Acesso ao painel principal", "Dashboard"),
        new(nameof(Permission.VisualizarDemandas), (long)Permission.VisualizarDemandas, "Visualizar Demandas", "Ver lista e detalhes das demandas", "Demandas"),
        new(nameof(Permission.RegistrarDemandas), (long)Permission.RegistrarDemandas, "Registrar Demandas", "Criar novas demandas", "Demandas"),
        new(nameof(Permission.EditarStatus), (long)Permission.EditarStatus, "Editar Status", "Alterar status e histórico da demanda", "Demandas"),
        new(nameof(Permission.Aprovar), (long)Permission.Aprovar, "Aprovar Demandas", "Aprovar demandas para execução", "Demandas"),
        new(nameof(Permission.GerenciarUsuarios), (long)Permission.GerenciarUsuarios, "Gerenciar Usuários", "Criar/editar usuários e permissões", "Sistema"),
    };

    public static readonly IReadOnlyDictionary<string, Permission> RolePresets = new Dictionary<string, Permission>(StringComparer.OrdinalIgnoreCase)
    {
        ["Admin"] = All.Aggregate(Permission.None, (acc, p) => acc | (Permission)p.Value),
        ["Gestor"] = Permission.AcessarDashboard | Permission.VisualizarDemandas | Permission.RegistrarDemandas | Permission.EditarStatus | Permission.Aprovar,
        ["Colaborador"] = Permission.AcessarDashboard | Permission.VisualizarDemandas | Permission.RegistrarDemandas,
    };
}


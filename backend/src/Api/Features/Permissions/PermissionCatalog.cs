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
        new(nameof(Permission.EditarDemanda), (long)Permission.EditarDemanda, "Editar Demanda", "Editar informações das demandas", "Demandas"),
        new(nameof(Permission.NotificarEmail), (long)Permission.NotificarEmail, "Notificar Email", "Enviar notificações por email", "Notificações"),
        new(nameof(Permission.GerenciarUsuarios), (long)Permission.GerenciarUsuarios, "Gerenciar Usuários", "Criar/editar usuários", "Sistema"),
        new(nameof(Permission.GerenciarPerfis), (long)Permission.GerenciarPerfis, "Gerenciar Perfis", "Criar/editar perfis e permissões", "Sistema"),
        new(nameof(Permission.Configuracoes), (long)Permission.Configuracoes, "Configurações", "Acessar e alterar configurações do sistema", "Sistema"),
    };

    public static readonly IReadOnlyDictionary<string, Permission> RolePresets = new Dictionary<string, Permission>(StringComparer.OrdinalIgnoreCase)
    {
        ["Admin"] = All.Aggregate(Permission.None, (acc, p) => acc | (Permission)p.Value),
        ["Gestor"] = Permission.AcessarDashboard | Permission.VisualizarDemandas | Permission.RegistrarDemandas | Permission.EditarStatus | Permission.EditarDemanda | Permission.NotificarEmail,
        ["Colaborador"] = Permission.AcessarDashboard | Permission.VisualizarDemandas | Permission.RegistrarDemandas,
    };
}


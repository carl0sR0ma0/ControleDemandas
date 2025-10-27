namespace Api.Domain;

public enum DemandStatus
{
    Ranqueado = 1,
    AguardandoAprovacao = 2,
    Execucao = 3,
    Validacao = 4,
    Concluida = 5
}

[Flags]
public enum Permission : long
{
    None = 0,
    AcessarDashboard      = 1 << 0,
    VisualizarDemandas    = 1 << 1,
    RegistrarDemandas     = 1 << 2,
    EditarStatus          = 1 << 3,
    Aprovar               = 1 << 4,
    GerenciarUsuarios     = 1 << 5
}

public enum OccurrenceType { Incremental = 1, Melhoria = 2, Bug = 3 }
public enum Classification { Urgente = 1, Medio = 2, Baixo = 3 }

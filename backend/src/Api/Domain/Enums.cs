namespace Api.Domain;

public enum DemandStatus
{
    Aberta = 0,
    Ranqueado = 1,
    Documentacao = 2,
    Aprovacao = 3,
    Execucao = 4,
    Pausado = 5,
    Validacao = 6,
    Concluida = 7
}

[Flags]
public enum Permission : long
{
    None = 0,
    AcessarDashboard      = 1 << 0,  // 1
    VisualizarDemandas    = 1 << 1,  // 2
    RegistrarDemandas     = 1 << 2,  // 4
    EditarStatus          = 1 << 3,  // 8
    EditarDemanda         = 1 << 4,  // 16
    NotificarEmail        = 1 << 5,  // 32
    GerenciarUsuarios     = 1 << 6,  // 64
    GerenciarPerfis       = 1 << 7,  // 128
    Configuracoes         = 1 << 8   // 256
}

public enum OccurrenceType { Incremental = 1, Melhoria = 2, Bug = 3 }
public enum Classification { Urgente = 1, Medio = 2, Baixo = 3 }
public enum Priority { Baixa = 1, Media = 2, Alta = 3 }

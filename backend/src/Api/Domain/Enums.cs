namespace Api.Domain;

public enum DemandStatus
{
    Aberta = 0,
    Arquivado = 1,
    Ranqueado = 2,
    Aprovacao = 3,
    Documentacao = 4,
    Execucao = 5,
    Pausado = 6,
    Validacao = 7,
    Concluida = 8
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
    Configuracoes         = 1 << 8,  // 256
    GerenciarBacklogs     = 1 << 9   // 512
}

public enum OccurrenceType { Incremental = 1, Melhoria = 2, Bug = 3 }
public enum Classification { Urgente = 1, Medio = 2, Baixo = 3 }

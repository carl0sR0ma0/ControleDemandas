import { DemandStatus, StatusHistory } from "@/types/api"

/**
 * Define a ordem hierárquica dos status
 * Nota: "Arquivado" está no mesmo nível de "Aberta" pois pode transicionar para/de Aberta
 */
const STATUS_HIERARCHY: Record<DemandStatus, number> = {
  [DemandStatus.Aberta]: 0,
  [DemandStatus.Arquivado]: 0, // Mesmo nível de Aberta (status lateral, não progressão)
  [DemandStatus.Ranqueado]: 1,
  [DemandStatus.Documentacao]: 2,
  [DemandStatus.Aprovacao]: 3,
  [DemandStatus.Execucao]: 4,
  [DemandStatus.Pausado]: 5,
  [DemandStatus.Validacao]: 6,
  [DemandStatus.Concluida]: 7,
}

/**
 * Analisa o histórico de status e detecta retrocessos para cada status
 * Um retrocesso ocorre quando um status é revisitado após ter avançado para um status de nível superior
 *
 * @param history - Array de StatusHistory ordenado por data
 * @returns Map com o número de retrocessos para cada status
 */
export function detectStatusRegressions(history: StatusHistory[]): Map<DemandStatus, number> {
  const regressionCounts = new Map<DemandStatus, number>()

  if (history.length <= 1) {
    return regressionCounts
  }

  // Ordena histórico por data (mais antigo primeiro)
  const sortedHistory = [...history].sort((a, b) =>
    new Date(a.date).getTime() - new Date(b.date).getTime()
  )

  // Rastreia o nível máximo atingido até o momento
  let maxLevelReached = STATUS_HIERARCHY[sortedHistory[0].status]

  // Rastreia quantas vezes cada status foi visitado após ter avançado
  const statusVisits = new Map<DemandStatus, number>()

  for (let i = 1; i < sortedHistory.length; i++) {
    const currentStatus = sortedHistory[i].status
    const currentLevel = STATUS_HIERARCHY[currentStatus]

    // Se o nível atual é menor que o máximo já atingido, é um retrocesso
    if (currentLevel < maxLevelReached) {
      // Incrementa o contador de retrocessos para este status
      const currentCount = regressionCounts.get(currentStatus) || 0
      regressionCounts.set(currentStatus, currentCount + 1)
    }

    // Atualiza o nível máximo se necessário
    maxLevelReached = Math.max(maxLevelReached, currentLevel)
  }

  return regressionCounts
}

/**
 * Retorna a cor de destaque baseada no número de retrocessos
 *
 * @param regressionCount - Número de retrocessos
 * @returns Cor hexadecimal ou undefined se não houver retrocessos
 */
export function getRegressionColor(regressionCount: number): string | undefined {
  if (regressionCount === 0) {
    return undefined
  } else if (regressionCount === 1) {
    return "#FFC107" // Amarelo chamativo (Material Design Amber 500)
  } else {
    return "#EF5350" // Vermelho moderado mas chamativo (Material Design Red 400)
  }
}

/**
 * Obtém informações sobre retrocessos para um status específico
 */
export function getStatusRegressionInfo(
  status: DemandStatus,
  history: StatusHistory[]
): {
  regressionCount: number
  highlightColor: string | undefined
  hasRegression: boolean
} {
  const regressions = detectStatusRegressions(history)
  const regressionCount = regressions.get(status) || 0
  const highlightColor = getRegressionColor(regressionCount)

  return {
    regressionCount,
    highlightColor,
    hasRegression: regressionCount > 0,
  }
}

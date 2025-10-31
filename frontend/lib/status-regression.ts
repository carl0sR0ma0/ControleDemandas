import { DemandStatus, StatusHistory } from "@/types/api"
import { STATUS_TRANSITIONS } from "./status-transitions"

/**
 * Status considerados "laterais" que não representam retrocesso quando revisitados
 * Estes são status temporários ou de suspensão que fazem parte do fluxo normal
 */
const LATERAL_STATUSES = new Set<DemandStatus>([
  DemandStatus.Pausado,    // Pausas são normais durante execução
  DemandStatus.Arquivado,  // Arquivamento pode acontecer de múltiplos pontos
])

/**
 * Define a progressão natural do fluxo (ordem esperada de avanço)
 * Usado para detectar quando uma demanda volta para trás no fluxo
 */
const FLOW_PROGRESSION: Record<DemandStatus, number> = {
  [DemandStatus.Aberta]: 0,
  [DemandStatus.Arquivado]: 0,     // Lateral - mesmo nível que Aberta
  [DemandStatus.Ranqueado]: 1,
  [DemandStatus.Aprovacao]: 2,
  [DemandStatus.Documentacao]: 3,
  [DemandStatus.Execucao]: 4,
  [DemandStatus.Pausado]: 4,       // Lateral - mesmo nível que Execução
  [DemandStatus.Validacao]: 5,
  [DemandStatus.Concluida]: 6,
}

/**
 * Analisa o histórico de status e detecta retrocessos para cada status
 *
 * Um retrocesso é detectado quando:
 * 1. Uma demanda retorna para um status que já foi visitado anteriormente
 * 2. E esse retorno representa retrabalho (não é uma transição lateral normal)
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

  // Rastreia a progressão máxima alcançada e os status já visitados
  let maxProgressionReached = FLOW_PROGRESSION[sortedHistory[0].status]
  const visitedStatuses = new Set<DemandStatus>()
  visitedStatuses.add(sortedHistory[0].status)

  for (let i = 1; i < sortedHistory.length; i++) {
    const currentStatus = sortedHistory[i].status
    const currentProgression = FLOW_PROGRESSION[currentStatus]
    const previousStatus = sortedHistory[i - 1].status

    // Atualiza o nível máximo de progressão
    if (currentProgression > maxProgressionReached) {
      maxProgressionReached = currentProgression
    }

    // Verifica se é um retrocesso
    const isRevisit = visitedStatuses.has(currentStatus)
    const isProgressionBackward = currentProgression < maxProgressionReached
    const isLateralStatus = LATERAL_STATUSES.has(currentStatus)

    // Um retrocesso ocorre quando:
    // - Revisita um status que já foi visitado
    // - E não é um status lateral (Pausado/Arquivado)
    // - Ou quando volta na progressão do fluxo
    if ((isRevisit || isProgressionBackward) && !isLateralStatus) {
      // Verifica se a transição de volta é válida no fluxo
      const validTransitions = STATUS_TRANSITIONS[previousStatus] || []
      const isValidTransition = validTransitions.includes(currentStatus)

      // Se é uma transição válida de volta, mas já visitou antes, conta como retrocesso
      if (isRevisit && isValidTransition) {
        const currentCount = regressionCounts.get(currentStatus) || 0
        regressionCounts.set(currentStatus, currentCount + 1)
      }
      // Se é uma progressão backward que não é status lateral, é retrocesso
      else if (isProgressionBackward && !isLateralStatus) {
        const currentCount = regressionCounts.get(currentStatus) || 0
        regressionCounts.set(currentStatus, currentCount + 1)
      }
    }

    // Marca o status como visitado
    visitedStatuses.add(currentStatus)
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

import { DemandStatus } from "@/types/api"

/**
 * Define as transições permitidas entre status de demanda.
 *
 * Cada chave representa um status de origem, e o array contém os status
 * para os quais é permitido transitar a partir desse status.
 *
 * Baseado na especificação: doc/backlog/status-flow-diagram.md
 */
export const STATUS_TRANSITIONS: Record<DemandStatus, DemandStatus[]> = {
  [DemandStatus.Aberta]: [DemandStatus.Arquivado, DemandStatus.Ranqueado],
  [DemandStatus.Arquivado]: [DemandStatus.Ranqueado],
  [DemandStatus.Ranqueado]: [DemandStatus.Arquivado, DemandStatus.Aprovacao],
  [DemandStatus.Aprovacao]: [DemandStatus.Documentacao, DemandStatus.Arquivado],
  [DemandStatus.Documentacao]: [DemandStatus.Execucao, DemandStatus.Arquivado, DemandStatus.Pausado],
  [DemandStatus.Execucao]: [DemandStatus.Validacao, DemandStatus.Pausado, DemandStatus.Arquivado, DemandStatus.Aprovacao],
  [DemandStatus.Pausado]: [DemandStatus.Validacao, DemandStatus.Execucao, DemandStatus.Arquivado, DemandStatus.Documentacao],
  [DemandStatus.Validacao]: [DemandStatus.Concluida, DemandStatus.Arquivado, DemandStatus.Pausado, DemandStatus.Execucao],
  [DemandStatus.Concluida]: [], // Status final - não pode ser alterado
}

/**
 * Retorna os status disponíveis para transição a partir do status atual
 */
export function getAvailableStatusTransitions(currentStatus: DemandStatus): DemandStatus[] {
  return STATUS_TRANSITIONS[currentStatus] || []
}

/**
 * Verifica se uma transição é permitida
 */
export function isTransitionAllowed(fromStatus: DemandStatus, toStatus: DemandStatus): boolean {
  const allowedTransitions = STATUS_TRANSITIONS[fromStatus] || []
  return allowedTransitions.includes(toStatus)
}

/**
 * Verifica se um status é final (não permite mais transições)
 */
export function isFinalStatus(status: DemandStatus): boolean {
  return STATUS_TRANSITIONS[status]?.length === 0
}

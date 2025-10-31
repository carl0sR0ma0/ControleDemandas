# Playbook de Transições e Notas (Exemplo Prático)

Cenário: Demanda 2001 segue o fluxo Ranqueado → Aprovação → Documentação → Execução. Este playbook mostra quando trocar o status e como registrar notas claras e úteis.

Princípios gerais
- Troque o status no início da fase para refletir entrada na etapa.
- A nota fica registrada no status de destino (para onde você está indo).
- Use a nota para: decisão tomada, objetivo da fase, escopo/responsáveis e próximos passos; adicione links (documentos, tarefas relacionadas) quando houver.

Passo a passo (com exemplos de notas)

1) Aberta → Ranqueado (início do ranqueamento)
- Nota: "Legal ideia, decidimos seguir para o ranqueamento. Critérios: impacto, esforço, alinhamento estratégico."
- ResponsibleUser (opcional): "Time X" ou o nome do responsável pela priorização.

2) Ranqueado → Aprovação (envio à diretoria)
- Nota: "Encaminhado para diretoria avaliar priorização. Justificativa: aumento de produtividade no módulo Y. Itens relacionados: #2, #3."
- ResponsibleUser: "Diretoria Z" ou o nome do aprovador.

3) Aprovação → Documentação (aprovado, iniciar documentação)
- Nota: "Aprovado por Fulano em 12/11. Requisitos a detalhar: RQ-2, RQ-3, RQ-7. Responsável: Maria Silva. Prazo estimado de documentação: 20/11."
- EstimatedDelivery (na demanda, se for usar): 2025-11-20.

4) Notas intermediárias em Documentação (sem trocar status)
- Se já existir endpoint de notas sem troca de status: registre progresso, decisões e links no histórico (status atual = Documentação).
- Se ainda não existir: use `observation` da demanda (não entra no histórico) e anexe o link do documento.
- Exemplo de nota (sem troca de status): "Esboço v0.3 publicado, pendente revisão segurança. Link: https://docs/..."

5) Documentação → Execução (iniciar desenvolvimento)
- Nota: "Especificação v1.2 aprovada. Escopo liberado para desenvolvimento. Responsável de execução: João. Tasks vinculadas: DEV-101, DEV-102."
- ResponsibleUser: "João".

6) Execução → Validação (quando entregar para testes) — opcional, fora do escopo imediato
- Nota: "Build 0.9.0 entregue em ambiente de testes. Casos de teste: CT-55, CT-56."

Como o histórico aparecerá (ilustrativo)
- 2025-11-10 09:15 — Status: Ranqueado — Autor: você — Nota: "Legal ideia, decidimos seguir para o ranqueamento..."
- 2025-11-10 14:35 — Status: Aprovação — Autor: você — Nota: "Encaminhado para diretoria avaliar..."
- 2025-11-11 10:05 — Status: Documentação — Autor: você — Nota: "Aprovado por Fulano em 12/11..."
- 2025-11-12 16:20 — Status: Documentação — Autor: você — Nota: "Esboço v0.3 publicado..." (se houver endpoint de nota sem troca de status)
- 2025-11-15 08:50 — Status: Execução — Autor: você — Nota: "Especificação v1.2 aprovada..."

Boas práticas de nota
- Seja objetivo: registro deve explicar o porquê da mudança e quem faz o quê.
- Vincule IDs/links relevantes (requisitos, tasks, documentos).
- Evite informações sensíveis; se necessário, armazene em sistema apropriado e referencie por link.


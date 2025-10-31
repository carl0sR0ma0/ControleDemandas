# Novas Tasks Planejadas

> Observacao: migrations e ajustes de banco continuam sob responsabilidade do mantenedor. As tasks abaixo devem manter a aplicacao escalavel e funcional sem exigir execucao local de `dotnet ef database update`.
>
> **Estado atual:** o backlog oficial passa a ser controlado no projeto GitHub **Controle de demandas**. Utilize o script `scripts/migrate_next_tasks.py` para converter estas entradas em issues e adicioná-las automaticamente ao projeto. Após a migração, este arquivo pode ser arquivado ou utilizado apenas como rascunho.

## 1. Ajuste de Exibicao do Status "Arquivada"
- **Objetivo:** Garantir que o status "Arquivada" so apareca na linha do tempo ou historico da demanda quando ela de fato tiver atingido esse estado.
- **Regras:**
  - Se a demanda nunca foi arquivada, ocultar o status "Arquivada" e tambem evitar listar estados futuros ou irrelevantes.
  - Em validacoes ou mensagens de erro/sucesso, so mencionar "Arquivada" se a demanda tiver passado por esse status.
  - Revisar endpoints e frontend para que o historico de status respeite essas regras.
- **Criterios de Aceite:**
  - [ ] Demandas que nunca foram arquivadas nao exibem o status nem mensagens relacionadas.
  - [ ] Demandas arquivadas continuam mostrando "Arquivada" normalmente.
  - [ ] Cobertura de testes (unitarios ou e2e) garantindo que o status so aparece quando apropriado.
  - [ ] Nenhuma migration adicional necessaria; ajustes apenas em codigo e configuracao existente.

## 2. Gestao de Sprint a partir do Backlog
- **Objetivo:** Permitir iniciar e acompanhar uma sprint diretamente da lista de backlog.
- **Funcionalidades:**
  - Criar sprint com nome, data inicial, data final e calculo automatico da porcentagem de andamento.
  - (Opcional / baixa prioridade) Exibir grafico de burndown para visualizacao do progresso.
  - Ao configurar a sprint, definir horas estimadas para cada demanda selecionada para alimentar o burndown e relatorios.
- **Criterios de Aceite:**
  - [ ] Cadastro e edicao de sprint com campos obrigatorios (nome, datas, demandas associadas).
  - [ ] Percentual de andamento calculado com base nas horas trabalhadas versus horas planejadas.
  - [ ] Interface permitindo atribuir horas por demanda no momento da configuracao da sprint.
  - [ ] Estrutura pronta para gerar burndown chart, mesmo que a renderizacao fique para etapa posterior.
  - [ ] Solucao preparada para escalar (cargas maiores de demandas/sprints) sem novas migrations; ajustes apenas em codigo.

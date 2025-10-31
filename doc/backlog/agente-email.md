# Agente: Automacao de E-mails de Demandas

## Objetivo
- Garantir notificacao automatica por e-mail assim que uma nova demanda for criada.
- Habilitar reenvio manual das notificacoes pelo botao **Notificar** na tela de detalhes.
- Apoiar configuracao flexivel do SMTP para Gmail (primeira fase) e Outlook (fase seguinte).

## Contexto Atual
- O `EmailService` encapsula `SmtpClient` e usa `SmtpOptions` carregadas de `appsettings.json` (`backend/src/Api/Services/EmailService.cs` e `backend/src/Api/appsettings.json:13`).
- A criacao de demanda (`backend/src/Api/Features/Demands/DemandEndpoints.cs:201`) envia e-mail simples somente quando `reporterEmail` e informado.
- O botao **Notificar** existe no componente `frontend/components/demand-detail.tsx:170`, mas ainda nao dispara nenhuma chamada.
- Permissao `NotificarEmail` definida em `frontend/hooks/useAuthGuard.ts:12`, pronta para controlar o fluxo.

## Escopo do Agente
1. **Backend**
   - Centralizar composicao e envio de notificacoes em servico dedicado.
   - Enriquecer o corpo dos e-mails com dados relevantes (protocolo, status atual, prazos, links).
   - Expor endpoint autenticado para notificacao manual com controles de destinatarios.
   - Robustecer logs e tratamento de falhas de SMTP sem interromper o fluxo da API.
2. **Frontend**
   - Criar fluxo de confirmacao para o botao **Notificar** com feedback ao usuario.
   - Restringir exibicao e uso do botao a usuarios com `PERMS.NotificarEmail`.
   - Consumir o endpoint manual, exibindo estados de loading/sucesso/erro.
3. **Infra e DevOps**
   - Organizar variaveis de ambiente para `SmtpOptions`, evitando credenciais em arquivo.
   - Registrar na documentacao parametros para Gmail agora e Outlook depois.

## Plano de Implementacao

### 1. Backend (.NET 7)
1. **Criar DemandNotificationService**
   - Local: `backend/src/Api/Services/DemandNotificationService.cs`.
   - Dependencias: `EmailService`, `ILogger<DemandNotificationService>`, `LinkGenerator` (opcional para montar URL da demanda).
   - Responsabilidades:
     - Montar template HTML/texto com dados da demanda e assinatura.
     - Calcular destinatarios padrao (reporter, solicitante, responsavel) e mesclar com extras; quando o e-mail nao estiver populado na entidade carregada, realizar busca pelo respectivo `UserId` antes de enviar.
     - Expor metodos `SendCreationAsync` e `SendManualAsync`.
     - Registrar logs estruturados com protocolo, id e lista de destinatarios.

2. **DTOs e validacoes**
   - Criar record `ManualNotificationRequest` com:
     - `bool includeReporter`
     - `bool includeRequester`
     - `bool includeResponsible`
     - `IEnumerable<string>? additionalEmails`
     - `string? message`
   - Validar e-mails usando `MailAddress` ou Regex simples; retornar 400 quando houver formato invalido.

3. **Atualizar criacao de demanda**
   - Substituir a chamada direta ao `EmailService.SendAsync` por `DemandNotificationService.SendCreationAsync`.
   - Garantir que a entidade `Demand` usada tenha `RequesterUser.Email` carregado (executar `db.Entry(d).Reference(x => x.RequesterUser).LoadAsync()` se necessario) e, caso ainda esteja nulo, consultar diretamente a tabela de usuarios pelo `RequesterUserId`.

4. **Endpoint manual**
   - Adicionar rota `POST /demands/{id:guid}/notify` em `DemandEndpoints` com:
     - `[Authorize(Policy = "PERM:" + nameof(Permission.NotificarEmail))]`.
     - Leitura da demanda com `Include(x => x.RequesterUser)` e `Include(x => x.Module.System)`.
     - Chamada de `SendManualAsync`.
     - Resposta `202 Accepted` contendo `{ sentTo: string[], protocol: string }`.

5. **Registro de servico**
   - Incluir `builder.Services.AddScoped<DemandNotificationService>();` em `backend/src/Api/Program.cs` logo apos o registro do `EmailService`.

6. **SmtpOptions**
   - Adicionar campos opcionais `DisplayName` e `UseStartTls` em `SmtpOptions`.
   - Ler override via variaveis de ambiente (`SMTP__HOST`, `SMTP__PORT`, `SMTP__ENABLESSL`, `SMTP__USER`, `SMTP__PASSWORD`, `SMTP__FROM`, `SMTP__DISPLAYNAME`).
   - Documentar fallback seguro quando nenhuma credencial estiver presente.

7. **Testes**
   - Adicionar testes unitarios para `DemandNotificationService` (com `EmailService` mochado) garantindo que a lista de destinatarios e calculada corretamente.
   - Se houver infraestrutura de testes de integracao, usar servidor SMTP fake (ex.: Papercut) ou `SmtpClient` customizado.

### 2. Frontend (Next.js)
1. **Cliente HTTP**
   - Criar funcao `notifyDemand` em `frontend/lib/api/demands.ts` realizando `POST /demands/{id}/notify`.
2. **Hooks**
   - `useNotifyDemand(id: string)` em `frontend/hooks/useDemands.ts` com `useMutation`, exibindo toasts (sucesso e erro) e invalidando `["demands","detail",id]`.
3. **UI**
   - Criar componente `NotifyDemandDialog` em `frontend/components/notify-demand-dialog.tsx` contendo:
     - Checkboxes para incluir reporter/solicitante/responsavel.
     - Campo para e-mails adicionais (lista separada por virgula).
     - Textarea opcional para mensagem personalizada.
     - Botoes `Cancelar` e `Enviar` com spinner enquanto aguarda resposta.
   - No `DemandDetail`:
     - Calcular `const canNotify = useHasPermission(PERMS.NotificarEmail)`.
     - Exibir o botao **Notificar** apenas quando `canNotify` for verdadeiro.
     - Abrir o modal e chamar `useNotifyDemand` no confirm.

### 3. Observabilidade e seguranca
- Usar `ILogger` para registrar sucesso e falhas, incluindo status do SMTP.
- Prever retentativa simples (ex.: segunda tentativa dentro do servico) e registrar motivo da falha final.
- Mascara senhas no log e evitar serializar payloads com credenciais.

## Criterios de Aceite
- Criacao de demanda dispara e-mail com informacoes minimas (protocolo, descricao curta, link para detalhes).
- Endpoint manual so pode ser usado por usuarios com permissao `NotificarEmail`.
- UI confirma envio com lista de destinatarios retornada pelo backend.
- Configuracao `SmtpOptions` funciona com Gmail e pode ser alternada para Outlook sem alterar codigo.

## Riscos e Mitigacoes
- **SMTP indisponivel**: logar e alertar (future improvement: fila ou retry com backoff).
- **Destinatarios invalidos**: validar no backend e informar no modal.
- **Credenciais expostas**: utilizar `dotnet user-secrets`, variaveis de ambiente e pipelines seguros.

## Proximos Passos
1. Validar conteudo e layout do e-mail com o solicitante.
2. Confirmar lista padrao de destinatarios e regras de copia oculta.
3. Implementar conforme plano e registrar evidencias em homologacao.
4. Evoluir documentacao para o caso Outlook apos concluir Gmail.

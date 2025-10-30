using System.Text;
using Api.Domain;
using Api.Persistence;
using Microsoft.AspNetCore.Routing;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;

namespace Api.Services;

public class DemandNotificationService(
    IEmailQueueService emailQueue,
    ILogger<DemandNotificationService> logger,
    AppDbContext db)
{
    public async Task SendCreationAsync(Demand demand, string? reporterEmail, CancellationToken ct = default)
    {
        logger.LogInformation("Iniciando envio de e-mail para demanda {Protocol}", demand.Protocol);

        var recipients = new List<string>();

        // Reporter email (se fornecido)
        if (!string.IsNullOrWhiteSpace(reporterEmail))
        {
            logger.LogInformation("Adicionando reporter email: {Email}", reporterEmail);
            recipients.Add(reporterEmail);
        }

        // Carregar RequesterUser se não estiver carregado
        if (demand.RequesterUser is null)
        {
            logger.LogInformation("Carregando RequesterUser para demanda {Protocol}", demand.Protocol);
            await db.Entry(demand).Reference(x => x.RequesterUser).LoadAsync(ct);
        }

        // Email do solicitante
        if (demand.RequesterUser?.Email is not null && !string.IsNullOrWhiteSpace(demand.RequesterUser.Email))
        {
            logger.LogInformation("RequesterUser encontrado: {Email}", demand.RequesterUser.Email);
            if (!recipients.Contains(demand.RequesterUser.Email))
                recipients.Add(demand.RequesterUser.Email);
        }
        else
        {
            logger.LogWarning("RequesterUser sem e-mail para demanda {Protocol}", demand.Protocol);
        }

        if (recipients.Count == 0)
        {
            logger.LogWarning("Nenhum destinatário encontrado para envio de e-mail de criação da demanda {Protocol}", demand.Protocol);
            return;
        }

        var subject = $"[Protocolo {demand.Protocol}] Solicitação recebida";
        var body = BuildCreationEmailBody(demand);

        logger.LogInformation("Enfileirando e-mail para {Count} destinatário(s): {Recipients}",
            recipients.Count, string.Join(", ", recipients));

        foreach (var recipient in recipients)
        {
            logger.LogInformation("Enfileirando e-mail para: {Recipient}", recipient);
            await emailQueue.EnqueueAsync(recipient, subject, body, ct);
        }

        logger.LogInformation("E-mail de criação enfileirado com sucesso para demanda {Protocol} - Destinatários: {Recipients}",
            demand.Protocol, string.Join(", ", recipients));
    }

    public async Task<List<string>> SendManualAsync(Demand demand, ManualNotificationRequest request, CancellationToken ct = default)
    {
        var recipients = new List<string>();

        // Carregar navegação se necessário
        if (demand.RequesterUser is null)
        {
            await db.Entry(demand).Reference(x => x.RequesterUser).LoadAsync(ct);
        }

        if (demand.Module is null)
        {
            await db.Entry(demand).Reference(x => x.Module).LoadAsync(ct);
        }

        // Incluir reporter (se houver email adicional na request)
        if (request.IncludeReporter && request.AdditionalEmails?.Any() == true)
        {
            recipients.AddRange(request.AdditionalEmails.Where(e => !string.IsNullOrWhiteSpace(e)));
        }

        // Incluir solicitante
        if (request.IncludeRequester && demand.RequesterUser?.Email is not null)
        {
            if (!recipients.Contains(demand.RequesterUser.Email))
                recipients.Add(demand.RequesterUser.Email);
        }

        // Incluir responsável
        if (request.IncludeResponsible && !string.IsNullOrWhiteSpace(demand.Responsible))
        {
            // Buscar email do responsável pelo nome
            var responsibleUser = await db.Users
                .Where(u => u.Name == demand.Responsible && u.Email != null)
                .FirstOrDefaultAsync(ct);

            if (responsibleUser?.Email is not null && !recipients.Contains(responsibleUser.Email))
                recipients.Add(responsibleUser.Email);
        }

        // Adicionar emails extras
        if (request.AdditionalEmails?.Any() == true)
        {
            foreach (var email in request.AdditionalEmails.Where(e => !string.IsNullOrWhiteSpace(e)))
            {
                if (!recipients.Contains(email))
                    recipients.Add(email);
            }
        }

        if (recipients.Count == 0)
        {
            logger.LogWarning("Nenhum destinatário encontrado para notificação manual da demanda {Protocol}", demand.Protocol);
            return recipients;
        }

        var subject = $"[Protocolo {demand.Protocol}] Notificação da demanda";
        var body = BuildManualEmailBody(demand, request.Message);

        foreach (var recipient in recipients)
        {
            await emailQueue.EnqueueAsync(recipient, subject, body, ct);
        }

        logger.LogInformation("Notificação manual enfileirada para demanda {Protocol} - Destinatários: {Recipients}",
            demand.Protocol, string.Join(", ", recipients));

        return recipients;
    }

    public async Task SendStatusChangeAsync(Demand demand, DemandStatus oldStatus, DemandStatus newStatus, string? note, string? responsibleUser, CancellationToken ct = default)
    {
        logger.LogInformation("Iniciando envio de e-mail de mudança de status para demanda {Protocol}: {OldStatus} -> {NewStatus}",
            demand.Protocol, oldStatus, newStatus);

        var recipients = new List<string>();

        // Carregar RequesterUser se não estiver carregado
        if (demand.RequesterUser is null)
        {
            logger.LogInformation("Carregando RequesterUser para demanda {Protocol}", demand.Protocol);
            await db.Entry(demand).Reference(x => x.RequesterUser).LoadAsync(ct);
        }

        // Email do solicitante
        if (demand.RequesterUser?.Email is not null && !string.IsNullOrWhiteSpace(demand.RequesterUser.Email))
        {
            logger.LogInformation("Adicionando solicitante: {Email}", demand.RequesterUser.Email);
            recipients.Add(demand.RequesterUser.Email);
        }
        else
        {
            logger.LogWarning("RequesterUser sem e-mail para demanda {Protocol}", demand.Protocol);
        }

        // Email do responsável anterior (se houver)
        if (!string.IsNullOrWhiteSpace(demand.Responsible))
        {
            var previousResponsible = await db.Users
                .Where(u => u.Name == demand.Responsible && u.Email != null)
                .FirstOrDefaultAsync(ct);

            if (previousResponsible?.Email is not null && !recipients.Contains(previousResponsible.Email))
            {
                logger.LogInformation("Adicionando responsável anterior: {Email}", previousResponsible.Email);
                recipients.Add(previousResponsible.Email);
            }
        }

        // Email do novo responsável (se informado e diferente do anterior)
        if (!string.IsNullOrWhiteSpace(responsibleUser) && responsibleUser != demand.Responsible)
        {
            var newResponsible = await db.Users
                .Where(u => u.Name == responsibleUser && u.Email != null)
                .FirstOrDefaultAsync(ct);

            if (newResponsible?.Email is not null && !recipients.Contains(newResponsible.Email))
            {
                logger.LogInformation("Adicionando novo responsável: {Email}", newResponsible.Email);
                recipients.Add(newResponsible.Email);
            }
        }

        if (recipients.Count == 0)
        {
            logger.LogWarning("Nenhum destinatário encontrado para notificação de mudança de status da demanda {Protocol}", demand.Protocol);
            return;
        }

        var subject = $"[Protocolo {demand.Protocol}] Status alterado para {newStatus}";
        var body = BuildStatusChangeEmailBody(demand, oldStatus, newStatus, note, responsibleUser);

        logger.LogInformation("Enfileirando e-mail de mudança de status para {Count} destinatário(s): {Recipients}",
            recipients.Count, string.Join(", ", recipients));

        foreach (var recipient in recipients)
        {
            logger.LogInformation("Enfileirando notificação de mudança de status para: {Recipient}", recipient);
            await emailQueue.EnqueueAsync(recipient, subject, body, ct);
        }

        logger.LogInformation("E-mail de mudança de status enfileirado com sucesso para demanda {Protocol} - Destinatários: {Recipients}",
            demand.Protocol, string.Join(", ", recipients));
    }

    private string BuildCreationEmailBody(Demand demand)
    {
        var sb = new StringBuilder();
        sb.AppendLine("<html><body style='font-family: Arial, sans-serif;'>");
        sb.AppendLine($"<h2>Solicitação Registrada</h2>");
        sb.AppendLine($"<p>Sua solicitação foi registrada com sucesso.</p>");
        sb.AppendLine($"<p><strong>Protocolo:</strong> {demand.Protocol}</p>");
        sb.AppendLine($"<p><strong>Data de Abertura:</strong> {demand.OpenedAt:dd/MM/yyyy HH:mm}</p>");
        sb.AppendLine($"<p><strong>Tipo:</strong> {demand.OccurrenceType}</p>");
        sb.AppendLine($"<p><strong>Status:</strong> {demand.Status}</p>");
        sb.AppendLine($"<p><strong>Descrição:</strong> {demand.Description}</p>");

        if (!string.IsNullOrWhiteSpace(demand.Observation))
        {
            sb.AppendLine($"<p><strong>Observação:</strong> {demand.Observation}</p>");
        }

        if (demand.EstimatedDelivery.HasValue)
        {
            sb.AppendLine($"<p><strong>Previsão de Entrega:</strong> {demand.EstimatedDelivery.Value:dd/MM/yyyy}</p>");
        }

        sb.AppendLine("<p>Acompanhe o andamento usando o protocolo informado.</p>");
        sb.AppendLine("<hr/>");
        sb.AppendLine("<p style='font-size: 0.9em; color: #666;'>Este é um e-mail automático. Por favor, não responda.</p>");
        sb.AppendLine("</body></html>");

        return sb.ToString();
    }

    private string BuildManualEmailBody(Demand demand, string? customMessage)
    {
        var sb = new StringBuilder();
        sb.AppendLine("<html><body style='font-family: Arial, sans-serif;'>");
        sb.AppendLine($"<h2>Notificação - Demanda {demand.Protocol}</h2>");

        if (!string.IsNullOrWhiteSpace(customMessage))
        {
            sb.AppendLine($"<div style='background-color: #f0f0f0; padding: 15px; margin: 10px 0; border-left: 4px solid #007bff;'>");
            sb.AppendLine($"<p><strong>Mensagem:</strong></p>");
            sb.AppendLine($"<p>{customMessage}</p>");
            sb.AppendLine("</div>");
        }

        sb.AppendLine("<h3>Detalhes da Demanda</h3>");
        sb.AppendLine($"<p><strong>Protocolo:</strong> {demand.Protocol}</p>");
        sb.AppendLine($"<p><strong>Data de Abertura:</strong> {demand.OpenedAt:dd/MM/yyyy HH:mm}</p>");
        sb.AppendLine($"<p><strong>Tipo:</strong> {demand.OccurrenceType}</p>");
        sb.AppendLine($"<p><strong>Status Atual:</strong> {demand.Status}</p>");
        sb.AppendLine($"<p><strong>Classificação:</strong> {demand.Classification}</p>");

        if (demand.Priority.HasValue)
        {
            sb.AppendLine($"<p><strong>Prioridade:</strong> {demand.Priority.Value}</p>");
        }

        sb.AppendLine($"<p><strong>Descrição:</strong> {demand.Description}</p>");

        if (!string.IsNullOrWhiteSpace(demand.Observation))
        {
            sb.AppendLine($"<p><strong>Observação:</strong> {demand.Observation}</p>");
        }

        if (!string.IsNullOrWhiteSpace(demand.Responsible))
        {
            sb.AppendLine($"<p><strong>Responsável:</strong> {demand.Responsible}</p>");
        }

        if (demand.EstimatedDelivery.HasValue)
        {
            sb.AppendLine($"<p><strong>Previsão de Entrega:</strong> {demand.EstimatedDelivery.Value:dd/MM/yyyy}</p>");
        }

        sb.AppendLine("<hr/>");
        sb.AppendLine("<p style='font-size: 0.9em; color: #666;'>Este é um e-mail automático. Por favor, não responda.</p>");
        sb.AppendLine("</body></html>");

        return sb.ToString();
    }

    private string BuildStatusChangeEmailBody(Demand demand, DemandStatus oldStatus, DemandStatus newStatus, string? note, string? responsibleUser)
    {
        var sb = new StringBuilder();
        sb.AppendLine("<html><body style='font-family: Arial, sans-serif;'>");
        sb.AppendLine($"<h2>Status Atualizado - Demanda {demand.Protocol}</h2>");

        // Highlight da mudança de status
        sb.AppendLine("<div style='background-color: #e8f5e9; padding: 20px; margin: 20px 0; border-left: 4px solid #4caf50; border-radius: 4px;'>");
        sb.AppendLine($"<p style='margin: 0; font-size: 16px;'><strong>Status alterado:</strong></p>");
        sb.AppendLine($"<p style='margin: 10px 0 0 0; font-size: 18px;'>");
        sb.AppendLine($"<span style='color: #666; text-decoration: line-through;'>{oldStatus}</span>");
        sb.AppendLine($" <strong>→</strong> ");
        sb.AppendLine($"<span style='color: #4caf50; font-weight: bold;'>{newStatus}</span>");
        sb.AppendLine($"</p>");
        sb.AppendLine("</div>");

        // Observação/nota da mudança
        if (!string.IsNullOrWhiteSpace(note))
        {
            sb.AppendLine("<div style='background-color: #fff3e0; padding: 15px; margin: 10px 0; border-left: 4px solid #ff9800;'>");
            sb.AppendLine($"<p><strong>Observação:</strong></p>");
            sb.AppendLine($"<p>{note}</p>");
            sb.AppendLine("</div>");
        }

        // Novo responsável
        if (!string.IsNullOrWhiteSpace(responsibleUser))
        {
            sb.AppendLine($"<p><strong>Responsável atribuído:</strong> {responsibleUser}</p>");
        }

        // Detalhes da demanda
        sb.AppendLine("<hr/>");
        sb.AppendLine("<h3>Detalhes da Demanda</h3>");
        sb.AppendLine($"<p><strong>Protocolo:</strong> {demand.Protocol}</p>");
        sb.AppendLine($"<p><strong>Descrição:</strong> {demand.Description}</p>");
        sb.AppendLine($"<p><strong>Data de Abertura:</strong> {demand.OpenedAt:dd/MM/yyyy HH:mm}</p>");
        sb.AppendLine($"<p><strong>Tipo:</strong> {demand.OccurrenceType}</p>");
        sb.AppendLine($"<p><strong>Classificação:</strong> {demand.Classification}</p>");

        if (demand.Priority.HasValue)
        {
            sb.AppendLine($"<p><strong>Prioridade:</strong> {demand.Priority.Value}</p>");
        }

        if (demand.EstimatedDelivery.HasValue)
        {
            sb.AppendLine($"<p><strong>Previsão de Entrega:</strong> {demand.EstimatedDelivery.Value:dd/MM/yyyy}</p>");
        }

        sb.AppendLine("<hr/>");
        sb.AppendLine("<p style='font-size: 0.9em; color: #666;'>Este é um e-mail automático. Por favor, não responda.</p>");
        sb.AppendLine("</body></html>");

        return sb.ToString();
    }
}

public record ManualNotificationRequest(
    bool IncludeReporter,
    bool IncludeRequester,
    bool IncludeResponsible,
    IEnumerable<string>? AdditionalEmails,
    string? Message
);

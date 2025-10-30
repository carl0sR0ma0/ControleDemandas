using System.Threading.Channels;

namespace Api.Services;

/// <summary>
/// Modelo de item da fila de e-mails
/// </summary>
public record EmailQueueItem(
    string To,
    string Subject,
    string HtmlBody,
    int RetryCount = 0,
    DateTime QueuedAt = default
)
{
    public DateTime QueuedAt { get; init; } = QueuedAt == default ? DateTime.UtcNow : QueuedAt;
}

/// <summary>
/// Serviço de fila de e-mails usando Channel (preparado para migração futura para RabbitMQ)
/// </summary>
public interface IEmailQueueService
{
    /// <summary>
    /// Enfileira um e-mail para envio assíncrono
    /// </summary>
    ValueTask EnqueueAsync(string to, string subject, string htmlBody, CancellationToken ct = default);

    /// <summary>
    /// Enfileira múltiplos e-mails para envio assíncrono
    /// </summary>
    ValueTask EnqueueBatchAsync(IEnumerable<EmailQueueItem> items, CancellationToken ct = default);
}

public class EmailQueueService : IEmailQueueService
{
    private readonly Channel<EmailQueueItem> _channel;
    private readonly ILogger<EmailQueueService> _logger;

    public EmailQueueService(ILogger<EmailQueueService> logger)
    {
        _logger = logger;

        // Configuração do canal com capacidade limitada para evitar sobrecarga de memória
        // Em produção, considere usar BoundedChannelFullMode.DropOldest ou persistir em disco
        var options = new BoundedChannelOptions(1000)
        {
            FullMode = BoundedChannelFullMode.Wait, // Aguarda se a fila estiver cheia
            SingleReader = false, // Permite múltiplos workers (para escalar no futuro)
            SingleWriter = false
        };

        _channel = Channel.CreateBounded<EmailQueueItem>(options);

        _logger.LogInformation("EmailQueueService inicializado com capacidade de 1000 itens");
    }

    public async ValueTask EnqueueAsync(string to, string subject, string htmlBody, CancellationToken ct = default)
    {
        if (string.IsNullOrWhiteSpace(to))
        {
            _logger.LogWarning("Tentativa de enfileirar e-mail sem destinatário");
            return;
        }

        var item = new EmailQueueItem(to, subject, htmlBody);

        try
        {
            await _channel.Writer.WriteAsync(item, ct);
            _logger.LogDebug("E-mail enfileirado para {To} com assunto '{Subject}'", to, subject);
        }
        catch (ChannelClosedException)
        {
            _logger.LogError("Canal de e-mails está fechado. E-mail para {To} não foi enfileirado", to);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Erro ao enfileirar e-mail para {To}", to);
        }
    }

    public async ValueTask EnqueueBatchAsync(IEnumerable<EmailQueueItem> items, CancellationToken ct = default)
    {
        foreach (var item in items)
        {
            await EnqueueAsync(item.To, item.Subject, item.HtmlBody, ct);
        }
    }

    /// <summary>
    /// Obtém o reader do canal (usado pelo BackgroundService)
    /// </summary>
    internal ChannelReader<EmailQueueItem> GetReader() => _channel.Reader;

    /// <summary>
    /// Fecha o canal (usado no shutdown)
    /// </summary>
    internal void Complete() => _channel.Writer.Complete();
}

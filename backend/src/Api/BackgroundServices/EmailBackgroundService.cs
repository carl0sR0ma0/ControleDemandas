using Api.Services;

namespace Api.BackgroundServices;

/// <summary>
/// Background service que processa a fila de e-mails de forma assíncrona
/// Processa e-mails continuamente sem bloquear requisições HTTP
/// </summary>
public class EmailBackgroundService : BackgroundService
{
    private readonly ILogger<EmailBackgroundService> _logger;
    private readonly IServiceProvider _serviceProvider;
    private readonly EmailQueueService _queueService;

    // Configurações de retry (pode ser movido para appsettings.json)
    private const int MaxRetries = 3;
    private static readonly TimeSpan[] RetryDelays =
    {
        TimeSpan.FromSeconds(5),   // 1ª tentativa
        TimeSpan.FromSeconds(30),  // 2ª tentativa
        TimeSpan.FromMinutes(2)    // 3ª tentativa
    };

    public EmailBackgroundService(
        ILogger<EmailBackgroundService> logger,
        IServiceProvider serviceProvider,
        EmailQueueService queueService)
    {
        _logger = logger;
        _serviceProvider = serviceProvider;
        _queueService = queueService;
    }

    protected override async Task ExecuteAsync(CancellationToken stoppingToken)
    {
        _logger.LogInformation("EmailBackgroundService iniciado");

        await foreach (var item in _queueService.GetReader().ReadAllAsync(stoppingToken))
        {
            try
            {
                await ProcessEmailAsync(item, stoppingToken);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Erro não tratado ao processar e-mail para {To}", item.To);
            }
        }

        _logger.LogInformation("EmailBackgroundService finalizado");
    }

    private async Task ProcessEmailAsync(EmailQueueItem item, CancellationToken ct)
    {
        // Criar um novo scope para resolver serviços scoped (como EmailService)
        using var scope = _serviceProvider.CreateScope();
        var emailService = scope.ServiceProvider.GetRequiredService<EmailService>();

        var attempt = 0;
        var success = false;

        while (attempt <= MaxRetries && !success && !ct.IsCancellationRequested)
        {
            try
            {
                _logger.LogInformation(
                    "Processando e-mail para {To} (tentativa {Attempt}/{MaxAttempts}). Fila desde: {QueuedAt}",
                    item.To, attempt + 1, MaxRetries + 1, item.QueuedAt);

                await emailService.SendAsync(item.To, item.Subject, item.HtmlBody, ct);

                success = true;

                var processingTime = DateTime.UtcNow - item.QueuedAt;
                _logger.LogInformation(
                    "E-mail enviado com sucesso para {To} após {Attempts} tentativa(s). Tempo total: {ProcessingTime}ms",
                    item.To, attempt + 1, processingTime.TotalMilliseconds);
            }
            catch (Exception ex)
            {
                attempt++;

                if (attempt > MaxRetries)
                {
                    _logger.LogError(ex,
                        "FALHA PERMANENTE ao enviar e-mail para {To} após {MaxRetries} tentativas. " +
                        "Assunto: '{Subject}'. E-mail descartado.",
                        item.To, MaxRetries + 1, item.Subject);

                    // TODO: Persistir em "dead letter queue" ou banco de dados para análise posterior
                    // await SaveToDeadLetterQueueAsync(item, ex);
                }
                else
                {
                    var delay = RetryDelays[attempt - 1];
                    _logger.LogWarning(ex,
                        "Falha ao enviar e-mail para {To} (tentativa {Attempt}/{MaxAttempts}). " +
                        "Aguardando {Delay}s antes de retentar...",
                        item.To, attempt, MaxRetries + 1, delay.TotalSeconds);

                    await Task.Delay(delay, ct);
                }
            }
        }
    }

    public override async Task StopAsync(CancellationToken cancellationToken)
    {
        _logger.LogInformation("EmailBackgroundService parando. Finalizando processamento da fila...");

        // Sinaliza que não aceitará mais itens
        _queueService.Complete();

        // Aguarda o processamento finalizar (ou timeout de 30 segundos)
        await base.StopAsync(cancellationToken);

        _logger.LogInformation("EmailBackgroundService parado");
    }
}

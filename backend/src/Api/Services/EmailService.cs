using System.Net;
using System.Net.Mail;
using Microsoft.Extensions.Options;
using Microsoft.Extensions.Logging;

namespace Api.Services;

public class SmtpOptions
{
    public string Host { get; set; } = "localhost";
    public int Port { get; set; } = 25;
    public bool EnableSsl { get; set; } = false;
    public string? User { get; set; }
    public string? Password { get; set; }
    public string From { get; set; } = "no-reply@empresa.com";
    public string? DisplayName { get; set; }
    public bool UseStartTls { get; set; } = false;
}

public class EmailService(IOptions<SmtpOptions> opt, ILogger<EmailService> log)
{
    private readonly SmtpOptions _opt = opt.Value;

    public async Task SendAsync(string to, string subject, string html, CancellationToken ct = default)
    {
        try
        {
            log.LogInformation("Tentando enviar e-mail para {To} com assunto '{Subject}'", to, subject);
            log.LogInformation("Configuração SMTP: Host={Host}, Port={Port}, SSL={Ssl}, User={User}",
                _opt.Host, _opt.Port, _opt.EnableSsl, _opt.User ?? "(not set)");

            using var client = new SmtpClient(_opt.Host, _opt.Port)
            {
                EnableSsl = _opt.EnableSsl,
                Credentials = _opt.User is null ? CredentialCache.DefaultNetworkCredentials :
                    new NetworkCredential(_opt.User, _opt.Password)
            };

            var from = string.IsNullOrWhiteSpace(_opt.DisplayName)
                ? new MailAddress(_opt.From)
                : new MailAddress(_opt.From, _opt.DisplayName);

            var msg = new MailMessage(from, new MailAddress(to))
            {
                Subject = subject,
                Body = html,
                IsBodyHtml = true
            };

            await client.SendMailAsync(msg, ct);
            log.LogInformation("E-mail enviado com sucesso para {To}", to);
        }
        catch (Exception ex)
        {
            log.LogError(ex, "ERRO ao enviar e-mail para {To}. Host: {Host}, Port: {Port}, SSL: {Ssl}",
                to, _opt.Host, _opt.Port, _opt.EnableSsl);
        }
    }
}

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
}

public class EmailService(IOptions<SmtpOptions> opt, ILogger<EmailService> log)
{
    private readonly SmtpOptions _opt = opt.Value;

    public async Task SendAsync(string to, string subject, string html, CancellationToken ct = default)
    {
        try
        {
            using var client = new SmtpClient(_opt.Host, _opt.Port)
            {
                EnableSsl = _opt.EnableSsl,
                Credentials = _opt.User is null ? CredentialCache.DefaultNetworkCredentials :
                    new NetworkCredential(_opt.User, _opt.Password)
            };

            var msg = new MailMessage(_opt.From, to, subject, html) { IsBodyHtml = true };
            await client.SendMailAsync(msg, ct);
        }
        catch (Exception ex)
        {
            log.LogWarning(ex, "Falha ao enviar e-mail (dev).");
        }
    }
}

using Microsoft.AspNetCore.Identity.UI.Services;
using Microsoft.Extensions.Logging;
using System.Net;
using System.Net.Mail;

namespace IsaArtTattoo.IdentityApi.Services;

public class EmailSender : IEmailSender
{
    private readonly ILogger<EmailSender> _logger;
    private readonly IConfiguration _cfg;

    public EmailSender(ILogger<EmailSender> logger, IConfiguration cfg)
    {
        _logger = logger;
        _cfg = cfg;
    }

    public async Task SendEmailAsync(string email, string subject, string htmlMessage)
    {
        try
        {
            var smtpHost = _cfg["Smtp:Host"];
            var smtpPort = int.Parse(_cfg["Smtp:Port"] ?? "587");
            var smtpUser = _cfg["Smtp:User"];
            var smtpPass = _cfg["Smtp:Pass"];
            var from = _cfg["Smtp:From"] ?? smtpUser;

            using var client = new SmtpClient(smtpHost, smtpPort)
            {
                Credentials = new NetworkCredential(smtpUser, smtpPass),
                EnableSsl = true
            };

            var mail = new MailMessage(from, email, subject, htmlMessage)
            {
                IsBodyHtml = true
            };

            await client.SendMailAsync(mail);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error enviando correo a {Email}", email);
        }
    }
}

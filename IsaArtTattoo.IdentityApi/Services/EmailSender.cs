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
            // Lee de Email:Smtp
            var smtpHost = _cfg["Email:Smtp:Host"];
            var smtpPort = int.Parse(_cfg["Email:Smtp:Port"] ?? "587");
            var smtpUser = _cfg["Email:Smtp:User"];
            var smtpPass = _cfg["Email:Smtp:Pass"];
            var fromAddress = _cfg["Email:FromAddress"] ?? smtpUser;
            var fromName = _cfg["Email:FromName"] ?? "IsaArt";

            var from = new MailAddress(fromAddress, fromName);

            using var client = new SmtpClient(smtpHost, smtpPort)
            {
                Credentials = new NetworkCredential(smtpUser, smtpPass),
                EnableSsl = true
            };

            var mail = new MailMessage()
            {
                From = from,
                Subject = subject,
                Body = htmlMessage,
                IsBodyHtml = true,
            };

            mail.To.Add(email);

            await client.SendMailAsync(mail);

            _logger.LogInformation("Email enviado correctamente a {Email}", email);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error enviando correo a {Email}", email);
        }
    }
}

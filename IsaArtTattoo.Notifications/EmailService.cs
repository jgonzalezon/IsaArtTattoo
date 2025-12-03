using MailKit.Net.Smtp;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Configuration;
using MimeKit;

namespace IsaArtTattoo.Notifications
{
    public class EmailService : IEmailService
    {
        private readonly ILogger<EmailService> _logger;
        private readonly IConfiguration _configuration;

        public EmailService(ILogger<EmailService> logger, IConfiguration configuration)
        {
            _logger = logger;
            _configuration = configuration;
        }

        public async Task SendWelcomeMail(string toEmail)
        {
            await SendEmailAsync(toEmail, "Bienvenido/a a IsaArtTattoo",
                "Gracias por registrarte en IsaArtTattoo. ¡Nos alegra tenerte por aquí!");
        }

        public async Task SendConfirmationEmail(string toEmail, string confirmationUrl)
        {
            var htmlBody = $"""
                <p>Gracias por registrarte en <b>IsaArtTattoo</b>.</p>
                <p>Haz clic <a href="{confirmationUrl}">aquí</a> para confirmar tu correo.</p>
                """;

            await SendEmailAsync(toEmail, "Confirma tu cuenta", htmlBody);
        }

        public async Task SendPasswordResetEmail(string toEmail, string resetUrl)
        {
            var htmlBody = $"""
                <p>Para restablecer tu contraseña haz clic <a href="{resetUrl}">aquí</a>.</p>
                """;

            await SendEmailAsync(toEmail, "Restablece tu contraseña", htmlBody);
        }

        private async Task SendEmailAsync(string toEmail, string subject, string body)
        {
            using var client = new SmtpClient();

            try
            {
                client.Connect(
                    _configuration["Email:SmtpHost"] ?? "localhost",
                    int.Parse(_configuration["Email:SmtpPort"] ?? "1025"),
                    useSsl: false);

                var fromEmail = _configuration["Email:FromAddress"] ?? "noreply@isaarttattoo.local";
                var fromName = _configuration["Email:FromName"] ?? "IsaArtTattoo";

                var message = new MimeMessage();
                message.From.Add(new MailboxAddress(fromName, fromEmail));
                message.To.Add(new MailboxAddress("", toEmail));
                message.Subject = subject;
                message.Body = new BodyBuilder { HtmlBody = body }.ToMessageBody();

                await client.SendAsync(message);
                _logger.LogInformation("Email sent to {Email} with subject '{Subject}'", toEmail, subject);

                await client.DisconnectAsync(true);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Failed to send email to {Email}", toEmail);
                throw;
            }
        }
    }
}

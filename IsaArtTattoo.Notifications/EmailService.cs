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
            using var client = new SmtpClient();

            client.Connect(
                _configuration["Email:SmtpHost"],
                int.Parse(_configuration["Email:SmtpPort"]!),
                false);

            var fromEmail = _configuration["Email:FromAddress"];

            var message = new MimeMessage();
            message.From.Add(new MailboxAddress("IsaArtTattoo", fromEmail!));
            message.To.Add(new MailboxAddress("", toEmail));
            message.Subject = "Bienvenido/a a IsaArtTattoo";
            message.Body = new TextPart("plain")
            {
                Text = "Gracias por registrarte en IsaArtTattoo. ¡Nos alegra tenerte por aquí!"
            };

            await client.SendAsync(message);
            _logger.LogInformation("Welcome email sent to {ToEmail}", toEmail);

            await client.DisconnectAsync(true);
        }
    }
}

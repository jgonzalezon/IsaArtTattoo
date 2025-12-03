using IsaArtTattoo.Shared.Events;
using MassTransit;
using Microsoft.Extensions.Logging;

namespace IsaArtTattoo.Notifications
{
    public class SendEmailConfirmationConsumer : IConsumer<SendEmailConfirmationEvent>
    {
        private readonly ILogger<SendEmailConfirmationConsumer> _logger;
        private readonly IEmailService _emailService;

        public SendEmailConfirmationConsumer(
            ILogger<SendEmailConfirmationConsumer> logger,
            IEmailService emailService)
        {
            _logger = logger;
            _emailService = emailService;
        }

        public async Task Consume(ConsumeContext<SendEmailConfirmationEvent> context)
        {
            var message = context.Message;

            _logger.LogInformation("Sending confirmation email to {Email}", message.Email);

            await _emailService.SendConfirmationEmail(message.Email, message.ConfirmationUrl);
        }
    }
}
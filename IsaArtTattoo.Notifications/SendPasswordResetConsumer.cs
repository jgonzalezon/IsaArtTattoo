using IsaArtTattoo.Shared.Events;
using MassTransit;
using Microsoft.Extensions.Logging;

namespace IsaArtTattoo.Notifications
{
    public class SendPasswordResetConsumer : IConsumer<SendPasswordResetEvent>
    {
        private readonly ILogger<SendPasswordResetConsumer> _logger;
        private readonly IEmailService _emailService;

        public SendPasswordResetConsumer(
            ILogger<SendPasswordResetConsumer> logger,
            IEmailService emailService)
        {
            _logger = logger;
            _emailService = emailService;
        }

        public async Task Consume(ConsumeContext<SendPasswordResetEvent> context)
        {
            var message = context.Message;

            _logger.LogInformation("Sending password reset email to {Email}", message.Email);

            await _emailService.SendPasswordResetEmail(message.Email, message.ResetUrl);
        }
    }
}
using IsaArtTattoo.Shared.Events;
using MassTransit;
using Microsoft.Extensions.Logging;

namespace IsaArtTattoo.Notifications
{
    public class UserRegisteredConsumer : IConsumer<UserCreatedEvent>
    {
        private readonly ILogger<UserRegisteredConsumer> _logger;
        private readonly IEmailService _emailService;

        public UserRegisteredConsumer(
            ILogger<UserRegisteredConsumer> logger,
            IEmailService emailService)
        {
            _logger = logger;
            _emailService = emailService;
        }

        public async Task Consume(ConsumeContext<UserCreatedEvent> context)
        {
            var user = context.Message;

            _logger.LogInformation("New user registered: {UserId}, Email: {Email}",
                user.userId, user.email);

            await _emailService.SendWelcomeMail(user.email);
        }
    }
}

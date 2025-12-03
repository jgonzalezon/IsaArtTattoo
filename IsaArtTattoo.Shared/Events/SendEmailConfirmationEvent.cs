namespace IsaArtTattoo.Shared.Events
{
    public sealed record SendEmailConfirmationEvent(
        string Email,
        string ConfirmationUrl
    ) : IRabbitEvent
    {
        public Guid EventId => Guid.NewGuid();
        public DateTime CreatedAt => DateTime.UtcNow;
    }
}
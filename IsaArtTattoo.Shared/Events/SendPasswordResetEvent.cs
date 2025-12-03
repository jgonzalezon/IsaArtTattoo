namespace IsaArtTattoo.Shared.Events
{
    public sealed record SendPasswordResetEvent(
        string Email,
        string ResetUrl
    ) : IRabbitEvent
    {
        public Guid EventId => Guid.NewGuid();
        public DateTime CreatedAt => DateTime.UtcNow;
    }
}
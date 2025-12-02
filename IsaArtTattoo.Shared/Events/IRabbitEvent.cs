using MassTransit;

namespace IsaArtTattoo.Shared.Events
{
    [ExcludeFromTopology]
    public interface IRabbitEvent
    {
        Guid EventId { get; }
        DateTime CreatedAt { get; }
    }
}

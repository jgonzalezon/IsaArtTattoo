using IsaArtTattoo.OrdersApi.Application.Dto;

namespace IsaArtTattoo.OrdersApi.Application.Services;

/// <summary>
/// Implementación del servicio de pedidos para el usuario autenticado.
/// Delegado en <see cref="IOrdersService"/> para la lógica de negocio.
/// </summary>
public class UserOrdersService : IUserOrdersService
{
    private readonly IOrdersService _ordersService;

    public UserOrdersService(IOrdersService ordersService)
    {
        _ordersService = ordersService;
    }

    public Task<OrderDetailDto> CreateOrderAsync(string userId, CreateOrderDto dto, CancellationToken ct = default)
        => _ordersService.CreateOrderAsync(userId, dto, ct);

    public Task<IReadOnlyList<OrderListItemDto>> GetUserOrdersAsync(string userId, CancellationToken ct = default)
        => _ordersService.GetUserOrdersAsync(userId, ct);

    public Task<OrderDetailDto?> GetUserOrderByIdAsync(string userId, int orderId, CancellationToken ct = default)
        => _ordersService.GetUserOrderByIdAsync(userId, orderId, ct);

    public Task<OrderDetailDto?> CancelOrderByUserAsync(string userId, int orderId, CancellationToken ct = default)
        => _ordersService.CancelOrderByUserAsync(userId, orderId, ct);

    public Task<OrderDetailDto?> SetOrderPaidByUserAsync(string userId, int orderId, CancellationToken ct = default)
        => _ordersService.SetOrderPaidByUserAsync(userId, orderId, ct);
}

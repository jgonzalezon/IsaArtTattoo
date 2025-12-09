using IsaArtTattoo.OrdersApi.Application.Dto;
using IsaArtTattoo.OrdersApi.Domain.Enums;

namespace IsaArtTattoo.OrdersApi.Application.Services;

public interface IOrdersService
{
    // Usuario
    Task<OrderDetailDto> CreateOrderAsync(string userId, CreateOrderDto dto, CancellationToken ct = default);
    Task<IReadOnlyList<OrderListItemDto>> GetUserOrdersAsync(string userId, CancellationToken ct = default);
    Task<OrderDetailDto?> GetUserOrderByIdAsync(string userId, int orderId, CancellationToken ct = default);
    Task<OrderDetailDto?> CancelOrderByUserAsync(string userId, int orderId, CancellationToken ct = default);
    Task<OrderDetailDto?> SetOrderPaidByUserAsync(string userId, int orderId, CancellationToken ct = default);

    // Admin
    Task<IReadOnlyList<OrderListItemDto>> GetAllOrdersAsync(
        OrderStatus? status,
        PaymentStatus? paymentStatus,
        DateTime? from,
        DateTime? to,
        CancellationToken ct = default);

    Task<OrderDetailDto?> GetOrderByIdAsync(int orderId, CancellationToken ct = default);

    Task<OrderDetailDto?> ConfirmOrderAsync(int orderId, CancellationToken ct = default);
    Task<OrderDetailDto?> SetOrderPaidAsync(int orderId, CancellationToken ct = default);
    Task<OrderDetailDto?> ShipOrderAsync(int orderId, CancellationToken ct = default);
    Task<OrderDetailDto?> DeliverOrderAsync(int orderId, CancellationToken ct = default);
    Task<OrderDetailDto?> CancelOrderByAdminAsync(int orderId, CancellationToken ct = default);
}

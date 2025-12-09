using IsaArtTattoo.OrdersApi.Application.Dto;
using IsaArtTattoo.OrdersApi.Domain.Enums;

namespace IsaArtTattoo.OrdersApi.Application.Services;

/// <summary>
/// Resultado de operaciones que devuelven una colección de pedidos.
/// </summary>
public record AdminOrderListResult(
    bool Succeeded,
    IReadOnlyList<OrderListItemDto>? Orders = null,
    string? Error = null);

/// <summary>
/// Resultado de operaciones que actúan sobre un pedido concreto (detalles, cambios de estado, etc.).
/// </summary>
public record AdminOrderResult(
    bool Succeeded,
    OrderDetailDto? Order = null,
    string? Error = null);

/// <summary>
/// Servicio de aplicación para operaciones de administración de pedidos
/// (listado, consulta de detalle y cambios de estado).
/// </summary>
public interface IAdminOrdersService
{
    Task<AdminOrderListResult> GetAllOrdersAsync(
        OrderStatus? status,
        PaymentStatus? paymentStatus,
        DateTime? from,
        DateTime? to,
        CancellationToken ct);

    Task<AdminOrderResult> GetOrderByIdAsync(int id, CancellationToken ct);

    Task<AdminOrderResult> ConfirmOrderAsync(int id, CancellationToken ct);

    Task<AdminOrderResult> SetOrderPaidAsync(int id, CancellationToken ct);

    Task<AdminOrderResult> ShipOrderAsync(int id, CancellationToken ct);

    Task<AdminOrderResult> DeliverOrderAsync(int id, CancellationToken ct);

    Task<AdminOrderResult> CancelOrderByAdminAsync(int id, CancellationToken ct);
}

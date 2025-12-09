using IsaArtTattoo.OrdersApi.Application.Dto;
using IsaArtTattoo.OrdersApi.Domain.Enums;

namespace IsaArtTattoo.OrdersApi.Application.Services;

/// <summary>
/// Servicio de aplicación principal para la gestión de pedidos,
/// que expone operaciones tanto para el usuario final como para administración.
/// </summary>
public interface IOrdersService
{
    // ---------- Usuario ----------

    /// <summary>
    /// Crea un nuevo pedido para el usuario indicado.
    /// </summary>
    Task<OrderDetailDto> CreateOrderAsync(string userId, CreateOrderDto dto, CancellationToken ct = default);

    /// <summary>
    /// Obtiene los pedidos pertenecientes a un usuario concreto.
    /// </summary>
    Task<IReadOnlyList<OrderListItemDto>> GetUserOrdersAsync(string userId, CancellationToken ct = default);

    /// <summary>
    /// Obtiene el detalle de un pedido, validando que pertenece al usuario.
    /// </summary>
    Task<OrderDetailDto?> GetUserOrderByIdAsync(string userId, int orderId, CancellationToken ct = default);

    /// <summary>
    /// Cancela un pedido del usuario, si está en un estado cancelable.
    /// </summary>
    Task<OrderDetailDto?> CancelOrderByUserAsync(string userId, int orderId, CancellationToken ct = default);

    /// <summary>
    /// Marca como pagado un pedido del usuario.
    /// </summary>
    Task<OrderDetailDto?> SetOrderPaidByUserAsync(string userId, int orderId, CancellationToken ct = default);

    // ---------- Admin ----------

    /// <summary>
    /// Obtiene el listado de pedidos con filtros de estado, pago y rango de fechas.
    /// </summary>
    Task<IReadOnlyList<OrderListItemDto>> GetAllOrdersAsync(
        OrderStatus? status,
        PaymentStatus? paymentStatus,
        DateTime? from,
        DateTime? to,
        CancellationToken ct = default);

    /// <summary>
    /// Obtiene el detalle de un pedido sin filtrar por usuario (uso interno/admin).
    /// </summary>
    Task<OrderDetailDto?> GetOrderByIdAsync(int orderId, CancellationToken ct = default);

    /// <summary>
    /// Confirma un pedido (reserva stock, cambia estado, etc.).
    /// </summary>
    Task<OrderDetailDto?> ConfirmOrderAsync(int orderId, CancellationToken ct = default);

    /// <summary>
    /// Marca un pedido como pagado.
    /// </summary>
    Task<OrderDetailDto?> SetOrderPaidAsync(int orderId, CancellationToken ct = default);

    /// <summary>
    /// Marca un pedido como enviado.
    /// </summary>
    Task<OrderDetailDto?> ShipOrderAsync(int orderId, CancellationToken ct = default);

    /// <summary>
    /// Marca un pedido como entregado al cliente.
    /// </summary>
    Task<OrderDetailDto?> DeliverOrderAsync(int orderId, CancellationToken ct = default);

    /// <summary>
    /// Cancela un pedido desde administración (incluyendo posible devolución de stock).
    /// </summary>
    Task<OrderDetailDto?> CancelOrderByAdminAsync(int orderId, CancellationToken ct = default);
}

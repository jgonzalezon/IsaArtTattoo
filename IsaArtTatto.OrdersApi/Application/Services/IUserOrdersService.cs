using IsaArtTattoo.OrdersApi.Application.Dto;

namespace IsaArtTattoo.OrdersApi.Application.Services;

/// <summary>
/// Servicio de aplicación para operaciones de pedidos del usuario autenticado:
/// creación de pedidos, consulta de sus propios pedidos y acciones como cancelar o marcar como pagado.
/// </summary>
public interface IUserOrdersService
{
    /// <summary>
    /// Crea un nuevo pedido para el usuario indicado.
    /// </summary>
    /// <param name="userId">Identificador del usuario (generalmente tomado del token JWT).</param>
    /// <param name="dto">Datos de creación del pedido.</param>
    /// <param name="ct">Token de cancelación.</param>
    Task<OrderDetailDto> CreateOrderAsync(string userId, CreateOrderDto dto, CancellationToken ct = default);

    /// <summary>
    /// Obtiene la lista de pedidos del usuario.
    /// </summary>
    /// <param name="userId">Identificador del usuario.</param>
    /// <param name="ct">Token de cancelación.</param>
    Task<IReadOnlyList<OrderListItemDto>> GetUserOrdersAsync(string userId, CancellationToken ct = default);

    /// <summary>
    /// Obtiene el detalle de un pedido concreto del usuario.
    /// </summary>
    /// <param name="userId">Identificador del usuario.</param>
    /// <param name="orderId">Identificador del pedido.</param>
    /// <param name="ct">Token de cancelación.</param>
    Task<OrderDetailDto?> GetUserOrderByIdAsync(string userId, int orderId, CancellationToken ct = default);

    /// <summary>
    /// Cancela un pedido del usuario, si todavía es cancelable.
    /// </summary>
    /// <param name="userId">Identificador del usuario.</param>
    /// <param name="orderId">Identificador del pedido.</param>
    /// <param name="ct">Token de cancelación.</param>
    Task<OrderDetailDto?> CancelOrderByUserAsync(string userId, int orderId, CancellationToken ct = default);

    /// <summary>
    /// Marca un pedido del usuario como pagado (p.ej. tras confirmar pago externo).
    /// </summary>
    /// <param name="userId">Identificador del usuario.</param>
    /// <param name="orderId">Identificador del pedido.</param>
    /// <param name="ct">Token de cancelación.</param>
    Task<OrderDetailDto?> SetOrderPaidByUserAsync(string userId, int orderId, CancellationToken ct = default);
}

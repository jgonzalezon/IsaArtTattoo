using IsaArtTattoo.OrdersApi.Application.Dto;
using IsaArtTattoo.OrdersApi.Domain.Enums;

namespace IsaArtTattoo.OrdersApi.Application.Services;

/// <summary>
/// Implementación del servicio de administración de pedidos.
/// Orquesta la lógica de negocio de pedidos orientada a uso interno (panel admin),
/// delegando en <see cref="IOrdersService"/> para el acceso a datos / dominio.
/// </summary>
public class AdminOrdersService : IAdminOrdersService
{
    private readonly IOrdersService _ordersService;

    public AdminOrdersService(IOrdersService ordersService)
    {
        _ordersService = ordersService;
    }

    public async Task<AdminOrderListResult> GetAllOrdersAsync(
        OrderStatus? status,
        PaymentStatus? paymentStatus,
        DateTime? from,
        DateTime? to,
        CancellationToken ct)
    {
        var orders = await _ordersService.GetAllOrdersAsync(status, paymentStatus, from, to, ct);
        return new AdminOrderListResult(true, Orders: orders);
    }

    public async Task<AdminOrderResult> GetOrderByIdAsync(int id, CancellationToken ct)
    {
        var order = await _ordersService.GetOrderByIdAsync(id, ct);
        if (order is null)
        {
            return new AdminOrderResult(false, Error: $"Pedido con id {id} no encontrado.");
        }

        return new AdminOrderResult(true, Order: order);
    }

    public async Task<AdminOrderResult> ConfirmOrderAsync(int id, CancellationToken ct)
    {
        var order = await _ordersService.ConfirmOrderAsync(id, ct);
        if (order is null)
        {
            return new AdminOrderResult(false, Error: $"No se ha podido confirmar. Pedido con id {id} no encontrado.");
        }

        return new AdminOrderResult(true, Order: order);
    }

    public async Task<AdminOrderResult> SetOrderPaidAsync(int id, CancellationToken ct)
    {
        var order = await _ordersService.SetOrderPaidAsync(id, ct);
        if (order is null)
        {
            return new AdminOrderResult(false, Error: $"No se ha podido marcar como pagado. Pedido con id {id} no encontrado.");
        }

        return new AdminOrderResult(true, Order: order);
    }

    public async Task<AdminOrderResult> ShipOrderAsync(int id, CancellationToken ct)
    {
        var order = await _ordersService.ShipOrderAsync(id, ct);
        if (order is null)
        {
            return new AdminOrderResult(false, Error: $"No se ha podido marcar como enviado. Pedido con id {id} no encontrado.");
        }

        return new AdminOrderResult(true, Order: order);
    }

    public async Task<AdminOrderResult> DeliverOrderAsync(int id, CancellationToken ct)
    {
        var order = await _ordersService.DeliverOrderAsync(id, ct);
        if (order is null)
        {
            return new AdminOrderResult(false, Error: $"No se ha podido marcar como entregado. Pedido con id {id} no encontrado.");
        }

        return new AdminOrderResult(true, Order: order);
    }

    public async Task<AdminOrderResult> CancelOrderByAdminAsync(int id, CancellationToken ct)
    {
        var order = await _ordersService.CancelOrderByAdminAsync(id, ct);
        if (order is null)
        {
            return new AdminOrderResult(false, Error: $"No se ha podido cancelar. Pedido con id {id} no encontrado.");
        }

        return new AdminOrderResult(true, Order: order);
    }
}

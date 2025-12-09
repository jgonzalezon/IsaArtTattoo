using IsaArtTattoo.OrdersApi.Application.Dto;
using IsaArtTattoo.OrdersApi.Application.Services;
using IsaArtTattoo.OrdersApi.Domain.Enums;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace IsaArtTattoo.OrdersApi.Controllers;

/// <summary>
/// Endpoints de administración para la gestión de pedidos:
/// listado, consulta de detalle y cambios de estado (confirmación, pago, envío, entrega y cancelación).
/// </summary>
[ApiController]
[Route("api/v1/admin/orders")]
[Authorize(Policy = "admin")]
public class AdminOrdersController : ControllerBase
{
    private readonly IAdminOrdersService _service;

    public AdminOrdersController(IAdminOrdersService service)
    {
        _service = service;
    }

    /// <summary>
    /// Obtiene el listado de pedidos, filtrando opcionalmente por estado, estado de pago y rango de fechas.
    /// </summary>
    /// <param name="status">Estado del pedido (opcional).</param>
    /// <param name="paymentStatus">Estado de pago del pedido (opcional).</param>
    /// <param name="from">Fecha mínima de creación (opcional).</param>
    /// <param name="to">Fecha máxima de creación (opcional).</param>
    /// <param name="ct">Token de cancelación.</param>
    /// <returns>Lista de pedidos que cumplen los filtros.</returns>
    [HttpGet]
    [ProducesResponseType(typeof(IReadOnlyList<OrderListItemDto>), StatusCodes.Status200OK)]
    public async Task<ActionResult<IReadOnlyList<OrderListItemDto>>> GetAll(
        [FromQuery] OrderStatus? status,
        [FromQuery] PaymentStatus? paymentStatus,
        [FromQuery] DateTime? from,
        [FromQuery] DateTime? to,
        CancellationToken ct)
    {
        var result = await _service.GetAllOrdersAsync(status, paymentStatus, from, to, ct);
        if (!result.Succeeded || result.Orders is null)
            return Ok(Array.Empty<OrderListItemDto>());

        return Ok(result.Orders);
    }

    /// <summary>
    /// Obtiene el detalle de un pedido concreto por id.
    /// </summary>
    /// <param name="id">Identificador del pedido.</param>
    /// <param name="ct">Token de cancelación.</param>
    /// <returns>Detalle del pedido si existe.</returns>
    [HttpGet("{id:int}")]
    [ProducesResponseType(typeof(OrderDetailDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<ActionResult<OrderDetailDto>> GetById(int id, CancellationToken ct)
    {
        var result = await _service.GetOrderByIdAsync(id, ct);
        if (!result.Succeeded || result.Order is null)
            return NotFound(result.Error ?? "Pedido no encontrado.");

        return Ok(result.Order);
    }

    /// <summary>
    /// Confirma un pedido (cambio de estado a confirmado).
    /// </summary>
    /// <param name="id">Identificador del pedido.</param>
    /// <param name="ct">Token de cancelación.</param>
    /// <returns>Detalle actualizado del pedido.</returns>
    [HttpPost("{id:int}/confirm")]
    [ProducesResponseType(typeof(OrderDetailDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<ActionResult<OrderDetailDto>> Confirm(int id, CancellationToken ct)
    {
        var result = await _service.ConfirmOrderAsync(id, ct);
        if (!result.Succeeded || result.Order is null)
            return NotFound(result.Error ?? "Pedido no encontrado.");

        return Ok(result.Order);
    }

    /// <summary>
    /// Marca un pedido como pagado.
    /// </summary>
    /// <param name="id">Identificador del pedido.</param>
    /// <param name="ct">Token de cancelación.</param>
    /// <returns>Detalle actualizado del pedido.</returns>
    [HttpPost("{id:int}/set-paid")]
    [ProducesResponseType(typeof(OrderDetailDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<ActionResult<OrderDetailDto>> SetPaid(int id, CancellationToken ct)
    {
        var result = await _service.SetOrderPaidAsync(id, ct);
        if (!result.Succeeded || result.Order is null)
            return NotFound(result.Error ?? "Pedido no encontrado.");

        return Ok(result.Order);
    }

    /// <summary>
    /// Marca un pedido como enviado.
    /// </summary>
    /// <param name="id">Identificador del pedido.</param>
    /// <param name="ct">Token de cancelación.</param>
    /// <returns>Detalle actualizado del pedido.</returns>
    [HttpPost("{id:int}/ship")]
    [ProducesResponseType(typeof(OrderDetailDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<ActionResult<OrderDetailDto>> Ship(int id, CancellationToken ct)
    {
        var result = await _service.ShipOrderAsync(id, ct);
        if (!result.Succeeded || result.Order is null)
            return NotFound(result.Error ?? "Pedido no encontrado.");

        return Ok(result.Order);
    }

    /// <summary>
    /// Marca un pedido como entregado al cliente final.
    /// </summary>
    /// <param name="id">Identificador del pedido.</param>
    /// <param name="ct">Token de cancelación.</param>
    /// <returns>Detalle actualizado del pedido.</returns>
    [HttpPost("{id:int}/deliver")]
    [ProducesResponseType(typeof(OrderDetailDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<ActionResult<OrderDetailDto>> Deliver(int id, CancellationToken ct)
    {
        var result = await _service.DeliverOrderAsync(id, ct);
        if (!result.Succeeded || result.Order is null)
            return NotFound(result.Error ?? "Pedido no encontrado.");

        return Ok(result.Order);
    }

    /// <summary>
    /// Cancela un pedido desde el panel de administración.
    /// </summary>
    /// <param name="id">Identificador del pedido.</param>
    /// <param name="ct">Token de cancelación.</param>
    /// <returns>Detalle actualizado del pedido cancelado.</returns>
    [HttpPost("{id:int}/cancel")]
    [ProducesResponseType(typeof(OrderDetailDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<ActionResult<OrderDetailDto>> Cancel(int id, CancellationToken ct)
    {
        var result = await _service.CancelOrderByAdminAsync(id, ct);
        if (!result.Succeeded || result.Order is null)
            return NotFound(result.Error ?? "Pedido no encontrado.");

        return Ok(result.Order);
    }
}

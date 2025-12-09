using System.Security.Claims;
using IsaArtTattoo.OrdersApi.Application.Dto;
using IsaArtTattoo.OrdersApi.Application.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace IsaArtTattoo.OrdersApi.Controllers;

/// <summary>
/// Endpoints de la API de pedidos para el usuario autenticado:
/// creación de pedidos, listado de pedidos propios y acciones sobre ellos
/// (consultar detalle, cancelar, marcar como pagado).
/// </summary>
[ApiController]
[Route("api/v1/orders")]
[Authorize(Policy = "authenticated")]
public class OrdersController : ControllerBase
{
    private readonly IUserOrdersService _service;

    public OrdersController(IUserOrdersService service)
    {
        _service = service;
    }

    /// <summary>
    /// Obtiene el identificador del usuario actual desde el token JWT.
    /// </summary>
    /// <remarks>
    /// Se intenta primero <see cref="ClaimTypes.NameIdentifier"/> y, si no existe,
    /// se utiliza <see cref="ClaimTypes.Name"/>. Si ninguno está presente,
    /// se lanza una excepción.
    /// </remarks>
    private string GetUserId()
        => User.FindFirstValue(ClaimTypes.NameIdentifier)
           ?? User.FindFirstValue(ClaimTypes.Name)
           ?? throw new InvalidOperationException("No se ha encontrado el identificador de usuario en el token.");

    /// <summary>
    /// Crea un nuevo pedido para el usuario autenticado.
    /// </summary>
    /// <param name="dto">Datos del pedido a crear.</param>
    /// <param name="ct">Token de cancelación.</param>
    /// <returns>Detalle del pedido creado.</returns>
    [HttpPost]
    [ProducesResponseType(typeof(OrderDetailDto), StatusCodes.Status201Created)]
    public async Task<ActionResult<OrderDetailDto>> CreateOrder(
        [FromBody] CreateOrderDto dto,
        CancellationToken ct)
    {
        var userId = GetUserId();
        var order = await _service.CreateOrderAsync(userId, dto, ct);
        return CreatedAtAction(nameof(GetOrderById), new { id = order.Id }, order);
    }

    /// <summary>
    /// Devuelve la lista de pedidos del usuario autenticado.
    /// </summary>
    /// <param name="ct">Token de cancelación.</param>
    /// <returns>Lista de pedidos del usuario.</returns>
    [HttpGet]
    [ProducesResponseType(typeof(IReadOnlyList<OrderListItemDto>), StatusCodes.Status200OK)]
    public async Task<ActionResult<IReadOnlyList<OrderListItemDto>>> GetMyOrders(CancellationToken ct)
    {
        var userId = GetUserId();
        var orders = await _service.GetUserOrdersAsync(userId, ct);
        return Ok(orders);
    }

    /// <summary>
    /// Obtiene el detalle de un pedido concreto del usuario autenticado.
    /// </summary>
    /// <param name="id">Identificador del pedido.</param>
    /// <param name="ct">Token de cancelación.</param>
    /// <returns>Detalle del pedido si pertenece al usuario y existe.</returns>
    [HttpGet("{id:int}")]
    [ProducesResponseType(typeof(OrderDetailDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<ActionResult<OrderDetailDto>> GetOrderById(int id, CancellationToken ct)
    {
        var userId = GetUserId();
        var order = await _service.GetUserOrderByIdAsync(userId, id, ct);
        if (order is null) return NotFound();
        return Ok(order);
    }

    /// <summary>
    /// Cancela un pedido del usuario autenticado, si todavía es cancelable.
    /// </summary>
    /// <param name="id">Identificador del pedido.</param>
    /// <param name="ct">Token de cancelación.</param>
    /// <returns>Detalle actualizado del pedido cancelado.</returns>
    [HttpPost("{id:int}/cancel")]
    [ProducesResponseType(typeof(OrderDetailDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<ActionResult<OrderDetailDto>> CancelOrder(int id, CancellationToken ct)
    {
        var userId = GetUserId();
        var order = await _service.CancelOrderByUserAsync(userId, id, ct);
        if (order is null) return NotFound();
        return Ok(order);
    }

    /// <summary>
    /// Marca un pedido del usuario autenticado como pagado.
    /// </summary>
    /// <param name="id">Identificador del pedido.</param>
    /// <param name="ct">Token de cancelación.</param>
    /// <returns>Detalle actualizado del pedido.</returns>
    [HttpPost("{id:int}/pay")]
    [ProducesResponseType(typeof(OrderDetailDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<ActionResult<OrderDetailDto>> SetPaid(int id, CancellationToken ct)
    {
        var userId = GetUserId();
        var order = await _service.SetOrderPaidByUserAsync(userId, id, ct);
        if (order is null) return NotFound();
        return Ok(order);
    }
}

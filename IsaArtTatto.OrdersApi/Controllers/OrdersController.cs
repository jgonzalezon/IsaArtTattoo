using System.Security.Claims;
using IsaArtTattoo.OrdersApi.Application.Dto;
using IsaArtTattoo.OrdersApi.Application.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace IsaArtTattoo.OrdersApi.Controllers;

[ApiController]
[Route("api/v1/orders")]
[Authorize(Policy = "authenticated")]
public class OrdersController : ControllerBase
{
    private readonly IOrdersService _service;

    public OrdersController(IOrdersService service)
    {
        _service = service;
    }

    private string GetUserId()
        => User.FindFirstValue(ClaimTypes.NameIdentifier)
           ?? User.FindFirstValue(ClaimTypes.Name)
           ?? throw new InvalidOperationException("No se ha encontrado el identificador de usuario en el token.");

    [HttpPost]
    public async Task<ActionResult<OrderDetailDto>> CreateOrder([FromBody] CreateOrderDto dto, CancellationToken ct)
    {
        var userId = GetUserId();
        var order = await _service.CreateOrderAsync(userId, dto, ct);
        return CreatedAtAction(nameof(GetOrderById), new { id = order.Id }, order);
    }

    [HttpGet]
    public async Task<ActionResult<IReadOnlyList<OrderListItemDto>>> GetMyOrders(CancellationToken ct)
    {
        var userId = GetUserId();
        var orders = await _service.GetUserOrdersAsync(userId, ct);
        return Ok(orders);
    }

    [HttpGet("{id:int}")]
    public async Task<ActionResult<OrderDetailDto>> GetOrderById(int id, CancellationToken ct)
    {
        var userId = GetUserId();
        var order = await _service.GetUserOrderByIdAsync(userId, id, ct);
        if (order is null) return NotFound();
        return Ok(order);
    }

    [HttpPost("{id:int}/cancel")]
    public async Task<ActionResult<OrderDetailDto>> CancelOrder(int id, CancellationToken ct)
    {
        var userId = GetUserId();
        var order = await _service.CancelOrderByUserAsync(userId, id, ct);
        if (order is null) return NotFound();
        return Ok(order);
    }

    [HttpPost("{id:int}/pay")]
    public async Task<ActionResult<OrderDetailDto>> SetPaid(int id, CancellationToken ct)
    {
        var userId = GetUserId();
        var order = await _service.SetOrderPaidByUserAsync(userId, id, ct);
        if (order is null) return NotFound();
        return Ok(order);
    }
}

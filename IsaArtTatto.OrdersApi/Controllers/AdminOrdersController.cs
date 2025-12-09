using IsaArtTattoo.OrdersApi.Application.Dto;
using IsaArtTattoo.OrdersApi.Application.Services;
using IsaArtTattoo.OrdersApi.Domain.Enums;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace IsaArtTattoo.OrdersApi.Controllers;

[ApiController]
[Route("api/v1/admin/orders")]
[Authorize(Policy = "admin")]
public class AdminOrdersController : ControllerBase
{
    private readonly IOrdersService _service;

    public AdminOrdersController(IOrdersService service)
    {
        _service = service;
    }

    [HttpGet]
    public async Task<ActionResult<IReadOnlyList<OrderListItemDto>>> GetAll(
        [FromQuery] OrderStatus? status,
        [FromQuery] PaymentStatus? paymentStatus,
        [FromQuery] DateTime? from,
        [FromQuery] DateTime? to,
        CancellationToken ct)
    {
        var orders = await _service.GetAllOrdersAsync(status, paymentStatus, from, to, ct);
        return Ok(orders);
    }

    [HttpGet("{id:int}")]
    public async Task<ActionResult<OrderDetailDto>> GetById(int id, CancellationToken ct)
    {
        var order = await _service.GetOrderByIdAsync(id, ct);
        if (order is null) return NotFound();
        return Ok(order);
    }

    [HttpPost("{id:int}/confirm")]
    public async Task<ActionResult<OrderDetailDto>> Confirm(int id, CancellationToken ct)
    {
        var order = await _service.ConfirmOrderAsync(id, ct);
        if (order is null) return NotFound();
        return Ok(order);
    }

    [HttpPost("{id:int}/set-paid")]
    public async Task<ActionResult<OrderDetailDto>> SetPaid(int id, CancellationToken ct)
    {
        var order = await _service.SetOrderPaidAsync(id, ct);
        if (order is null) return NotFound();
        return Ok(order);
    }

    [HttpPost("{id:int}/ship")]
    public async Task<ActionResult<OrderDetailDto>> Ship(int id, CancellationToken ct)
    {
        var order = await _service.ShipOrderAsync(id, ct);
        if (order is null) return NotFound();
        return Ok(order);
    }

    [HttpPost("{id:int}/deliver")]
    public async Task<ActionResult<OrderDetailDto>> Deliver(int id, CancellationToken ct)
    {
        var order = await _service.DeliverOrderAsync(id, ct);
        if (order is null) return NotFound();
        return Ok(order);
    }

    [HttpPost("{id:int}/cancel")]
    public async Task<ActionResult<OrderDetailDto>> Cancel(int id, CancellationToken ct)
    {
        var order = await _service.CancelOrderByAdminAsync(id, ct);
        if (order is null) return NotFound();
        return Ok(order);
    }
}

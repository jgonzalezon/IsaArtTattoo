using IsaArtTattoo.OrdersApi.Application.Dto;
using IsaArtTattoo.OrdersApi.Domain.Entities;
using IsaArtTattoo.OrdersApi.Domain.Enums;
using IsaArtTattoo.OrdersApi.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace IsaArtTattoo.OrdersApi.Application.Services;

public class OrdersService : IOrdersService
{
    private readonly OrdersDbContext _db;
    private readonly IStockService _stock;

    public OrdersService(OrdersDbContext db, IStockService stock)
    {
        _db = db;
        _stock = stock;
    }

    // ---------- Helpers ----------

    private static OrderDetailDto MapToDetailDto(Order o)
        => new(
            o.Id,
            o.OrderNumber,
            o.UserId,
            o.Status,
            o.PaymentStatus,
            o.TotalAmount,
            o.Currency,
            o.CreatedAt,
            o.UpdatedAt,
            o.PaidAt,
            o.CancelledAt,
            o.ShippedAt,
            o.DeliveredAt,
            o.Items
                .OrderBy(i => i.Id)
                .Select(i => new OrderItemDto(
                    i.ProductId,
                    i.ProductName,
                    i.UnitPrice,
                    i.Quantity,
                    i.Subtotal))
                .ToList()
        );

    private static OrderListItemDto MapToListItemDto(Order o)
        => new(
            o.Id,
            o.OrderNumber,
            o.CreatedAt,
            o.Status,
            o.PaymentStatus,
            o.TotalAmount
        );

    private string GenerateOrderNumber()
    {
        // Muy simple: ORD-YYYYMMDD-HHMMSS-random
        return $"ORD-{DateTime.UtcNow:yyyyMMddHHmmss}-{Random.Shared.Next(1000, 9999)}";
    }

    // ---------- Usuario ----------

    public async Task<OrderDetailDto> CreateOrderAsync(string userId, CreateOrderDto dto, CancellationToken ct = default)
    {
        if (dto.Items == null || dto.Items.Count == 0)
            throw new InvalidOperationException("La orden debe tener al menos un producto.");

        // NOTA: aquí podrías llamar a Catalog para obtener nombre y precio actual.
        // Por simplicidad, fakeamos nombre/precio. Lo ideal es que OrdersApi
        // tenga un HttpClient a CatalogApi para resolver esto.

        var items = new List<OrderItem>();
        decimal total = 0;

        foreach (var item in dto.Items)
        {
            // TODO: reemplazar por llamada real a CatalogApi
            var productName = $"Product {item.ProductId}";
            var unitPrice = 10m; // Precio fake

            var subtotal = unitPrice * item.Quantity;
            total += subtotal;

            items.Add(new OrderItem
            {
                ProductId = item.ProductId,
                ProductName = productName,
                UnitPrice = unitPrice,
                Quantity = item.Quantity,
                Subtotal = subtotal
            });
        }

        var order = new Order
        {
            OrderNumber = GenerateOrderNumber(),
            UserId = userId,
            Status = OrderStatus.Pending,
            PaymentStatus = PaymentStatus.Unpaid,
            TotalAmount = total,
            Currency = "EUR",
            CreatedAt = DateTime.UtcNow,
            Items = items
        };

        _db.Orders.Add(order);
        await _db.SaveChangesAsync(ct);

        return MapToDetailDto(order);
    }

    public async Task<IReadOnlyList<OrderListItemDto>> GetUserOrdersAsync(string userId, CancellationToken ct = default)
    {
        var orders = await _db.Orders
            .Where(o => o.UserId == userId)
            .OrderByDescending(o => o.CreatedAt)
            .ToListAsync(ct);

        return orders.Select(MapToListItemDto).ToList();
    }

    public async Task<OrderDetailDto?> GetUserOrderByIdAsync(string userId, int orderId, CancellationToken ct = default)
    {
        var order = await _db.Orders
            .Include(o => o.Items)
            .FirstOrDefaultAsync(o => o.Id == orderId && o.UserId == userId, ct);

        return order is null ? null : MapToDetailDto(order);
    }

    public async Task<OrderDetailDto?> CancelOrderByUserAsync(string userId, int orderId, CancellationToken ct = default)
    {
        var order = await _db.Orders
            .Include(o => o.Items)
            .FirstOrDefaultAsync(o => o.Id == orderId && o.UserId == userId, ct);

        if (order is null)
            return null;

        if (order.Status == OrderStatus.Cancelled)
            return MapToDetailDto(order);

        // El usuario solo puede cancelar si está pendiente
        if (order.Status != OrderStatus.Pending)
            throw new InvalidOperationException("Solo se pueden cancelar pedidos pendientes.");

        order.Status = OrderStatus.Cancelled;
        order.CancelledAt = DateTime.UtcNow;
        order.UpdatedAt = DateTime.UtcNow;

        await _db.SaveChangesAsync(ct);

        return MapToDetailDto(order);
    }

    public async Task<OrderDetailDto?> SetOrderPaidByUserAsync(string userId, int orderId, CancellationToken ct = default)
    {
        var order = await _db.Orders
            .Include(o => o.Items)
            .FirstOrDefaultAsync(o => o.Id == orderId && o.UserId == userId, ct);

        if (order is null)
            return null;

        if (order.PaymentStatus == PaymentStatus.Paid)
            return MapToDetailDto(order);

        order.PaymentStatus = PaymentStatus.Paid;
        order.PaidAt = DateTime.UtcNow;
        order.UpdatedAt = DateTime.UtcNow;

        await _db.SaveChangesAsync(ct);

        return MapToDetailDto(order);
    }

    // ---------- Admin ----------

    public async Task<IReadOnlyList<OrderListItemDto>> GetAllOrdersAsync(
        OrderStatus? status,
        PaymentStatus? paymentStatus,
        DateTime? from,
        DateTime? to,
        CancellationToken ct = default)
    {
        var query = _db.Orders.AsQueryable();

        if (status.HasValue)
            query = query.Where(o => o.Status == status.Value);

        if (paymentStatus.HasValue)
            query = query.Where(o => o.PaymentStatus == paymentStatus.Value);

        if (from.HasValue)
            query = query.Where(o => o.CreatedAt >= from.Value);

        if (to.HasValue)
            query = query.Where(o => o.CreatedAt <= to.Value);

        var orders = await query
            .OrderByDescending(o => o.CreatedAt)
            .ToListAsync(ct);

        return orders.Select(MapToListItemDto).ToList();
    }

    public async Task<OrderDetailDto?> GetOrderByIdAsync(int orderId, CancellationToken ct = default)
    {
        var order = await _db.Orders
            .Include(o => o.Items)
            .FirstOrDefaultAsync(o => o.Id == orderId, ct);

        return order is null ? null : MapToDetailDto(order);
    }

    public async Task<OrderDetailDto?> ConfirmOrderAsync(int orderId, CancellationToken ct = default)
    {
        var order = await _db.Orders
            .Include(o => o.Items)
            .FirstOrDefaultAsync(o => o.Id == orderId, ct);

        if (order is null)
            return null;

        if (order.Status != OrderStatus.Pending)
            throw new InvalidOperationException("Solo se pueden confirmar pedidos pendientes.");

        // Reservar stock en Catalog
        var items = order.Items.Select(i => (i.ProductId, i.Quantity)).ToList();

        var success = await _stock.ReserveStockAsync(items, ct);
        if (!success)
            throw new InvalidOperationException("No se pudo reservar stock para la orden.");

        order.Status = OrderStatus.Confirmed;
        order.UpdatedAt = DateTime.UtcNow;

        await _db.SaveChangesAsync(ct);

        return MapToDetailDto(order);
    }

    public async Task<OrderDetailDto?> SetOrderPaidAsync(int orderId, CancellationToken ct = default)
    {
        var order = await _db.Orders
            .Include(o => o.Items)
            .FirstOrDefaultAsync(o => o.Id == orderId, ct);

        if (order is null)
            return null;

        order.PaymentStatus = PaymentStatus.Paid;
        order.PaidAt = DateTime.UtcNow;
        order.UpdatedAt = DateTime.UtcNow;

        await _db.SaveChangesAsync(ct);

        return MapToDetailDto(order);
    }

    public async Task<OrderDetailDto?> ShipOrderAsync(int orderId, CancellationToken ct = default)
    {
        var order = await _db.Orders
            .Include(o => o.Items)
            .FirstOrDefaultAsync(o => o.Id == orderId, ct);

        if (order is null)
            return null;

        if (order.Status != OrderStatus.Confirmed)
            throw new InvalidOperationException("Solo se pueden marcar como enviados los pedidos confirmados.");

        order.Status = OrderStatus.Shipped;
        order.ShippedAt = DateTime.UtcNow;
        order.UpdatedAt = DateTime.UtcNow;

        await _db.SaveChangesAsync(ct);

        return MapToDetailDto(order);
    }

    public async Task<OrderDetailDto?> DeliverOrderAsync(int orderId, CancellationToken ct = default)
    {
        var order = await _db.Orders
            .Include(o => o.Items)
            .FirstOrDefaultAsync(o => o.Id == orderId, ct);

        if (order is null)
            return null;

        if (order.Status != OrderStatus.Shipped)
            throw new InvalidOperationException("Solo se pueden marcar como entregados los pedidos enviados.");

        order.Status = OrderStatus.Delivered;
        order.DeliveredAt = DateTime.UtcNow;
        order.UpdatedAt = DateTime.UtcNow;

        await _db.SaveChangesAsync(ct);

        return MapToDetailDto(order);
    }

    public async Task<OrderDetailDto?> CancelOrderByAdminAsync(int orderId, CancellationToken ct = default)
    {
        var order = await _db.Orders
            .Include(o => o.Items)
            .FirstOrDefaultAsync(o => o.Id == orderId, ct);

        if (order is null)
            return null;

        if (order.Status == OrderStatus.Cancelled)
            return MapToDetailDto(order);

        // Si estaba confirmado, devolver stock
        if (order.Status == OrderStatus.Confirmed)
        {
            var items = order.Items.Select(i => (i.ProductId, i.Quantity)).ToList();
            var success = await _stock.ReleaseStockAsync(items, ct);
            if (!success)
                throw new InvalidOperationException("No se pudo devolver el stock de la orden.");
        }

        order.Status = OrderStatus.Cancelled;
        order.CancelledAt = DateTime.UtcNow;
        order.UpdatedAt = DateTime.UtcNow;

        await _db.SaveChangesAsync(ct);

        return MapToDetailDto(order);
    }
}

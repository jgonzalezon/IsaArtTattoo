namespace IsaArtTattoo.OrdersApi.Domain.Entities;

public class OrderItem
{
    public int Id { get; set; }

    public int OrderId { get; set; }
    public Order Order { get; set; } = default!;

    public int ProductId { get; set; }

    // Snapshot de información del producto
    public string ProductName { get; set; } = default!;
    public decimal UnitPrice { get; set; }

    public int Quantity { get; set; }
    public decimal Subtotal { get; set; }
}

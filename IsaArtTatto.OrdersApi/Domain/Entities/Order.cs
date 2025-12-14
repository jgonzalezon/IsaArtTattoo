using IsaArtTattoo.OrdersApi.Domain.Enums;

namespace IsaArtTattoo.OrdersApi.Domain.Entities;

public class Order
{
    public int Id { get; set; }

    // Número amigable tipo ORD-2025-00001 (lo generaremos más adelante)
    public string OrderNumber { get; set; } = default!;

    // Usuario que realiza la compra (sub del JWT o Email, según decidas)
    public string UserId { get; set; } = default!;

    public OrderStatus Status { get; set; } = OrderStatus.Pending;
    public PaymentStatus PaymentStatus { get; set; } = PaymentStatus.Unpaid;

    // ✅ Desglose de precios
    public decimal SubtotalAmount { get; set; }  // Antes de IVA
    public decimal TaxAmount { get; set; }       // IVA (21%)
    public decimal TotalAmount { get; set; }     // Subtotal + IVA
    public string Currency { get; set; } = "EUR";

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime? UpdatedAt { get; set; }

    public DateTime? PaidAt { get; set; }
    public DateTime? CancelledAt { get; set; }

    // 👉 nuevos campos para "enviado" y "recibido"
    public DateTime? ShippedAt { get; set; }
    public DateTime? DeliveredAt { get; set; }

    public List<OrderItem> Items { get; set; } = new();
}

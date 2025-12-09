using IsaArtTattoo.OrdersApi.Domain.Enums;

namespace IsaArtTattoo.OrdersApi.Application.Dto;

// ----------- ENTRADA -----------

public record CreateOrderItemDto(
    int ProductId,
    int Quantity
);

public record CreateOrderDto(
    List<CreateOrderItemDto> Items
);

// ----------- SALIDA (LISTA) -----------

public record OrderListItemDto(
    int Id,
    string OrderNumber,
    DateTime CreatedAt,
    OrderStatus Status,
    PaymentStatus PaymentStatus,
    decimal TotalAmount
);

// ----------- SALIDA (DETALLE) -----------

public record OrderItemDto(
    int ProductId,
    string ProductName,
    decimal UnitPrice,
    int Quantity,
    decimal Subtotal
);

public record OrderDetailDto(
    int Id,
    string OrderNumber,
    string UserId,
    OrderStatus Status,
    PaymentStatus PaymentStatus,
    decimal TotalAmount,
    string Currency,
    DateTime CreatedAt,
    DateTime? UpdatedAt,
    DateTime? PaidAt,
    DateTime? CancelledAt,
    DateTime? ShippedAt,
    DateTime? DeliveredAt,
    IReadOnlyList<OrderItemDto> Items
);

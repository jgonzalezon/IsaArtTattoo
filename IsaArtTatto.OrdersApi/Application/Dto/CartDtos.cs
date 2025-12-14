namespace IsaArtTattoo.OrdersApi.Application.Dto;

/// <summary>
/// DTOs para gestión del carrito de compras.
/// </summary>

public record CartItemDto(
    int ProductId,
    string ProductName,
    decimal UnitPrice,
    int Quantity
);

public record CartResponseDto(
    IReadOnlyList<CartItemDto> Items
);

public record AddToCartDto(
    int ProductId,
    int Quantity
);

public record UpdateCartItemDto(
    int ProductId,
    int Quantity
);

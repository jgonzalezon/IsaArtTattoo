using IsaArtTattoo.OrdersApi.Application.Dto;

namespace IsaArtTattoo.OrdersApi.Application.Services;

/// <summary>
/// Servicio para gestionar el carrito de compras del usuario.
/// El carrito se almacena en memoria (puede cambiar a BD si es necesario).
/// </summary>
public interface ICartService
{
    /// <summary>
    /// Obtiene el carrito actual del usuario.
    /// </summary>
    Task<CartResponseDto> GetCartAsync(string userId, CancellationToken ct = default);

    /// <summary>
    /// Añade un producto al carrito.
    /// </summary>
    Task<CartResponseDto> AddItemAsync(string userId, AddToCartDto dto, CancellationToken ct = default);

    /// <summary>
    /// Actualiza la cantidad de un producto en el carrito.
    /// </summary>
    Task<CartResponseDto> UpdateItemAsync(string userId, int productId, int quantity, CancellationToken ct = default);

    /// <summary>
    /// Elimina un producto del carrito.
    /// </summary>
    Task<CartResponseDto> RemoveItemAsync(string userId, int productId, CancellationToken ct = default);

    /// <summary>
    /// Vacía completamente el carrito del usuario.
    /// </summary>
    Task ClearCartAsync(string userId, CancellationToken ct = default);
}

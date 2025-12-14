using IsaArtTattoo.OrdersApi.Application.Dto;
using IsaArtTattoo.OrdersApi.Domain.Entities;
using IsaArtTattoo.OrdersApi.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace IsaArtTattoo.OrdersApi.Application.Services;

/// <summary>
/// Implementación del servicio de carrito usando BD.
/// Los carritos se guardan en tabla "carts" de PostgreSQL.
/// </summary>
public class CartService : ICartService
{
    private readonly ICatalogServiceClient _catalogClient;
    private readonly OrdersDbContext _db;
    private readonly ILogger<CartService> _logger;

    public CartService(ICatalogServiceClient catalogClient, OrdersDbContext db, ILogger<CartService> logger)
    {
        _catalogClient = catalogClient;
        _db = db;
        _logger = logger;
    }

    /// <summary>
    /// Obtiene el carrito del usuario, enriquecido con datos de productos desde CatalogApi.
    /// </summary>
    public async Task<CartResponseDto> GetCartAsync(string userId, CancellationToken ct = default)
    {
        var cart = await _db.Carts
            .Include(c => c.Items)
            .FirstOrDefaultAsync(c => c.UserId == userId, ct);

        if (cart is null)
        {
            return new CartResponseDto(new List<CartItemDto>());
        }

        var items = new List<CartItemDto>();

        foreach (var cartItem in cart.Items)
        {
            // Obtener datos del producto desde CatalogApi
            var product = await _catalogClient.GetProductAsync(cartItem.ProductId, ct);
            
            if (product is not null)
            {
                var (productName, unitPrice) = product.Value;
                items.Add(new CartItemDto(cartItem.ProductId, productName, unitPrice, cartItem.Quantity));
            }
            else
            {
                _logger.LogWarning("Producto {ProductId} no encontrado en catálogo", cartItem.ProductId);
            }
        }

        return new CartResponseDto(items);
    }

    /// <summary>
    /// Añade un producto al carrito. Si ya existe, suma la cantidad.
    /// </summary>
    public async Task<CartResponseDto> AddItemAsync(string userId, AddToCartDto dto, CancellationToken ct = default)
    {
        // Validar que el producto existe en Catalog
        var product = await _catalogClient.GetProductAsync(dto.ProductId, ct);
        if (product is null)
        {
            throw new InvalidOperationException($"Producto {dto.ProductId} no encontrado en catálogo.");
        }

        // Obtener o crear carrito del usuario
        var cart = await _db.Carts
            .Include(c => c.Items)
            .FirstOrDefaultAsync(c => c.UserId == userId, ct);

        if (cart is null)
        {
            cart = new Cart { UserId = userId };
            _db.Carts.Add(cart);
        }

        // Buscar si ya existe el producto en el carrito
        var existingItem = cart.Items.FirstOrDefault(x => x.ProductId == dto.ProductId);
        if (existingItem != null)
        {
            existingItem.Quantity += dto.Quantity;
        }
        else
        {
            cart.Items.Add(new CartItem { ProductId = dto.ProductId, Quantity = dto.Quantity, CartUserId = userId });
        }

        cart.UpdatedAt = DateTime.UtcNow;
        await _db.SaveChangesAsync(ct);

        return await GetCartAsync(userId, ct);
    }

    /// <summary>
    /// Actualiza la cantidad de un producto en el carrito.
    /// </summary>
    public async Task<CartResponseDto> UpdateItemAsync(string userId, int productId, int quantity, CancellationToken ct = default)
    {
        var cart = await _db.Carts
            .Include(c => c.Items)
            .FirstOrDefaultAsync(c => c.UserId == userId, ct);

        if (cart is null)
        {
            throw new InvalidOperationException("El carrito no existe.");
        }

        var existing = cart.Items.FirstOrDefault(x => x.ProductId == productId);
        if (existing is null)
        {
            throw new InvalidOperationException($"Producto {productId} no está en el carrito.");
        }

        if (quantity <= 0)
        {
            cart.Items.Remove(existing);
        }
        else
        {
            existing.Quantity = quantity;
        }

        cart.UpdatedAt = DateTime.UtcNow;
        await _db.SaveChangesAsync(ct);

        return await GetCartAsync(userId, ct);
    }

    /// <summary>
    /// Elimina un producto del carrito.
    /// </summary>
    public async Task<CartResponseDto> RemoveItemAsync(string userId, int productId, CancellationToken ct = default)
    {
        var cart = await _db.Carts
            .Include(c => c.Items)
            .FirstOrDefaultAsync(c => c.UserId == userId, ct);

        if (cart is null)
        {
            throw new InvalidOperationException("El carrito no existe.");
        }

        var existing = cart.Items.FirstOrDefault(x => x.ProductId == productId);
        if (existing is not null)
        {
            cart.Items.Remove(existing);
        }

        cart.UpdatedAt = DateTime.UtcNow;
        await _db.SaveChangesAsync(ct);

        return await GetCartAsync(userId, ct);
    }

    /// <summary>
    /// Vacía completamente el carrito del usuario.
    /// </summary>
    public async Task ClearCartAsync(string userId, CancellationToken ct = default)
    {
        var cart = await _db.Carts
            .Include(c => c.Items)
            .FirstOrDefaultAsync(c => c.UserId == userId, ct);

        if (cart is not null)
        {
            cart.Items.Clear();
            cart.UpdatedAt = DateTime.UtcNow;
            await _db.SaveChangesAsync(ct);
        }
    }
}

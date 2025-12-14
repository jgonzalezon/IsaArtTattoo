using System.Security.Claims;
using IsaArtTattoo.OrdersApi.Application.Dto;
using IsaArtTattoo.OrdersApi.Application.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace IsaArtTattoo.OrdersApi.Controllers;

/// <summary>
/// Endpoints para gestionar el carrito de compras del usuario autenticado.
/// </summary>
[ApiController]
[Route("api/v1/cart")]
[Authorize(Policy = "authenticated")]
public class CartController : ControllerBase
{
    private readonly ICartService _cartService;

    public CartController(ICartService cartService)
    {
        _cartService = cartService;
    }

    /// <summary>
    /// Obtiene el identificador del usuario actual desde el token JWT.
    /// </summary>
    private string GetUserId()
        => User.FindFirstValue(ClaimTypes.NameIdentifier)
           ?? User.FindFirstValue(ClaimTypes.Name)
           ?? throw new InvalidOperationException("No se ha encontrado el identificador de usuario en el token.");

    /// <summary>
    /// GET /api/v1/cart
    /// Obtiene el carrito actual del usuario.
    /// </summary>
    [HttpGet]
    [ProducesResponseType(typeof(CartResponseDto), StatusCodes.Status200OK)]
    public async Task<ActionResult<CartResponseDto>> GetCart(CancellationToken ct)
    {
        var userId = GetUserId();
        var cart = await _cartService.GetCartAsync(userId, ct);
        return Ok(cart);
    }

    /// <summary>
    /// POST /api/v1/cart/items
    /// Añade un producto al carrito.
    /// </summary>
    [HttpPost("items")]
    [ProducesResponseType(typeof(CartResponseDto), StatusCodes.Status200OK)]
    public async Task<ActionResult<CartResponseDto>> AddItem(
        [FromBody] AddToCartDto dto,
        CancellationToken ct)
    {
        var userId = GetUserId();
        var cart = await _cartService.AddItemAsync(userId, dto, ct);
        return Ok(cart);
    }

    /// <summary>
    /// PUT /api/v1/cart/items/{productId}
    /// Actualiza la cantidad de un producto en el carrito.
    /// </summary>
    [HttpPut("items/{productId:int}")]
    [ProducesResponseType(typeof(CartResponseDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<ActionResult<CartResponseDto>> UpdateItem(
        int productId,
        [FromBody] UpdateCartItemDto dto,
        CancellationToken ct)
    {
        var userId = GetUserId();
        var cart = await _cartService.UpdateItemAsync(userId, productId, dto.Quantity, ct);
        return Ok(cart);
    }

    /// <summary>
    /// DELETE /api/v1/cart/items/{productId}
    /// Elimina un producto del carrito.
    /// </summary>
    [HttpDelete("items/{productId:int}")]
    [ProducesResponseType(typeof(CartResponseDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<ActionResult<CartResponseDto>> RemoveItem(int productId, CancellationToken ct)
    {
        var userId = GetUserId();
        var cart = await _cartService.RemoveItemAsync(userId, productId, ct);
        return Ok(cart);
    }

    /// <summary>
    /// DELETE /api/v1/cart
    /// Vacía completamente el carrito del usuario.
    /// </summary>
    [HttpDelete]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    public async Task<IActionResult> ClearCart(CancellationToken ct)
    {
        var userId = GetUserId();
        await _cartService.ClearCartAsync(userId, ct);
        return NoContent();
    }
}

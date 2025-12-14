namespace IsaArtTattoo.OrdersApi.Application.Services;

/// <summary>
/// Interfaz para comunicarse con CatalogApi y obtener información de productos.
/// </summary>
public interface ICatalogServiceClient
{
    /// <summary>
    /// Obtiene el nombre y precio de un producto desde CatalogApi.
    /// </summary>
    /// <param name="productId">ID del producto</param>
    /// <param name="ct">Token de cancelación</param>
    /// <returns>Tupla (nombre, precio) o null si no existe</returns>
    Task<(string name, decimal price)?> GetProductAsync(int productId, CancellationToken ct = default);
}

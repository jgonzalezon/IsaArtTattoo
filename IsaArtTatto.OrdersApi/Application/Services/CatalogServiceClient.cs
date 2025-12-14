using System.Net.Http.Json;

namespace IsaArtTattoo.OrdersApi.Application.Services;

/// <summary>
/// Cliente HTTP para comunicarse con CatalogApi.
/// Obtiene información de productos (nombre, precio) para llenar órdenes.
/// </summary>
public class CatalogServiceClient : ICatalogServiceClient
{
    private readonly HttpClient _httpClient;
    private readonly ILogger<CatalogServiceClient> _logger;

    public CatalogServiceClient(HttpClient httpClient, ILogger<CatalogServiceClient> logger)
    {
        _httpClient = httpClient;
        _logger = logger;
    }

    /// <summary>
    /// Obtiene un producto desde CatalogApi por su ID.
    /// Usa service discovery (http://catalog-api) o URL configurada.
    /// </summary>
    public async Task<(string name, decimal price)?> GetProductAsync(int productId, CancellationToken ct = default)
    {
        try
        {
            // Llamar a CatalogApi a través de service discovery
            // En desarrollo: http://catalog-api
            // En producción: service discovery (Aspire)
            var response = await _httpClient.GetAsync(
                $"http://catalog-api/api/catalog/products/{productId}",
                ct);

            if (!response.IsSuccessStatusCode)
            {
                _logger.LogWarning(
                    "No se pudo obtener producto {ProductId} desde CatalogApi: {StatusCode}",
                    productId,
                    response.StatusCode);
                return null;
            }

            var productDto = await response.Content.ReadFromJsonAsync<ProductDto>(cancellationToken: ct);
            
            return productDto != null
                ? (productDto.Name, productDto.Price)
                : null;
        }
        catch (Exception ex)
        {
            _logger.LogError(
                ex,
                "Error al obtener producto {ProductId} desde CatalogApi",
                productId);
            return null;
        }
    }

    /// <summary>
    /// DTO mínimo de producto desde CatalogApi.
    /// </summary>
    private record ProductDto(
        int Id,
        string Name,
        decimal Price,
        string? ShortDescription = null
    );
}

using System.Net.Http.Json;
using IsaArtTattoo.OrdersApi.Application.Services;

namespace IsaArtTattoo.OrdersApi.Infrastructure.Services;

public class CatalogStockService : IStockService
{
    private readonly HttpClient _http;
    private readonly ILogger<CatalogStockService> _logger;

    public CatalogStockService(HttpClient http, ILogger<CatalogStockService> logger)
    {
        _http = http ?? throw new ArgumentNullException(nameof(http));
        _logger = logger;
    }

    public async Task<bool> ReserveStockAsync(
        IEnumerable<(int ProductId, int Quantity)> items,
        CancellationToken ct = default)
    {
        foreach (var (productId, quantity) in items)
        {
            var payload = new
            {
                quantity = -Math.Abs(quantity),
                reason = "Order paid"
            };

            try
            {
                // ✅ Usar endpoint público para reservar stock
                var resp = await _http.PostAsJsonAsync(
                    $"http://catalog-api/api/catalog/products/{productId}/reserve-stock",
                    payload,
                    ct);

                if (!resp.IsSuccessStatusCode)
                {
                    _logger.LogWarning(
                        "No se pudo reservar stock para producto {ProductId}: {StatusCode}",
                        productId,
                        resp.StatusCode);
                    return false;
                }
            }
            catch (Exception ex)
            {
                _logger.LogError(
                    ex,
                    "Error al reservar stock para producto {ProductId}",
                    productId);
                return false;
            }
        }

        return true;
    }

    public async Task<bool> ReleaseStockAsync(
        IEnumerable<(int ProductId, int Quantity)> items,
        CancellationToken ct = default)
    {
        foreach (var (productId, quantity) in items)
        {
            var payload = new
            {
                quantity = Math.Abs(quantity),
                reason = "Order cancelled / stock release"
            };

            try
            {
                // ✅ Usar endpoint público para liberar stock
                var resp = await _http.PostAsJsonAsync(
                    $"http://catalog-api/api/catalog/products/{productId}/reserve-stock",
                    payload,
                    ct);

                if (!resp.IsSuccessStatusCode)
                {
                    _logger.LogWarning(
                        "No se pudo liberar stock para producto {ProductId}: {StatusCode}",
                        productId,
                        resp.StatusCode);
                    return false;
                }
            }
            catch (Exception ex)
            {
                _logger.LogError(
                    ex,
                    "Error al liberar stock para producto {ProductId}",
                    productId);
                return false;
            }
        }

        return true;
    }
}

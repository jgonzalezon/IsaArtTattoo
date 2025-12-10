using System.Net.Http.Json;
using IsaArtTattoo.OrdersApi.Application.Services;

namespace IsaArtTattoo.OrdersApi.Infrastructure.Services;

public class CatalogStockService : IStockService
{
    private readonly HttpClient _http;

    public CatalogStockService(HttpClient http, IConfiguration cfg)
    {
        _http = http ?? throw new ArgumentNullException(nameof(http));

        // Token opcional para llamadas de admin al Catalog (si lo usas)
        var adminBearerToken = cfg["Catalog:AdminBearerToken"];

        if (!string.IsNullOrWhiteSpace(adminBearerToken))
        {
            _http.DefaultRequestHeaders.Authorization =
                new System.Net.Http.Headers.AuthenticationHeaderValue(
                    "Bearer",
                    adminBearerToken
                );
        }

        // ❌ Ya NO miramos Catalog:BaseUrl ni seteamos BaseAddress aquí.
        // BaseAddress la rellena Aspire usando service discovery ("catalog-api").
    }

    public async Task<bool> ReserveStockAsync(
        IEnumerable<(int ProductId, int Quantity)> items,
        CancellationToken ct = default)
    {
        // Llamamos a Catalog en serie (simple). Más adelante puedes optimizar.
        foreach (var (productId, quantity) in items)
        {
            var payload = new
            {
                quantity = -Math.Abs(quantity),
                reason = "Order confirmed"
            };

            var resp = await _http.PostAsJsonAsync(
                "/api/admin/catalog/products/" + productId + "/stock",
                payload,
                ct);

            if (!resp.IsSuccessStatusCode)
            {
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

            var resp = await _http.PostAsJsonAsync(
                "/api/admin/catalog/products/" + productId + "/stock",
                payload,
                ct);

            if (!resp.IsSuccessStatusCode)
            {
                return false;
            }
        }

        return true;
    }
}

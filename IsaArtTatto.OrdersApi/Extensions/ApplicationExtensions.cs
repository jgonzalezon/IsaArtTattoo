using IsaArtTattoo.OrdersApi.Application.Services;
using IsaArtTattoo.OrdersApi.Infrastructure.Services;

namespace IsaArtTattoo.OrdersApi.Extensions;

public static class ApplicationExtensions
{
    public static void AddOrdersApplicationServices(this IServiceCollection services)
    {
        services.AddScoped<IOrdersService, OrdersService>();
        
        // ✅ Servicio de carrito
        services.AddScoped<ICartService, CartService>();

        // ✅ Handler de JWT para inyectar token en requests al Catalog API
        services.AddTransient<JwtTokenHandler>();

        // ✅ Cliente HTTP para obtener información de productos desde CatalogApi
        services.AddHttpClient<ICatalogServiceClient, CatalogServiceClient>("catalog-api")
            .AddServiceDiscovery()
            .AddHttpMessageHandler<JwtTokenHandler>();

        // ✅ Cliente HTTP para ajustar stock en CatalogApi
        services.AddHttpClient<IStockService, CatalogStockService>("catalog-api")
            .AddServiceDiscovery()
            .AddHttpMessageHandler<JwtTokenHandler>();
    }
}

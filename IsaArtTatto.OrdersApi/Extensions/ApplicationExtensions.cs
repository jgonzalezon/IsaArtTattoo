using IsaArtTattoo.OrdersApi.Application.Services;
using IsaArtTattoo.OrdersApi.Infrastructure.Services;

namespace IsaArtTattoo.OrdersApi.Extensions;

public static class ApplicationExtensions
{
    public static void AddOrdersApplicationServices(this IServiceCollection services)
    {
        services.AddScoped<IOrdersService, OrdersService>();

        services.AddHttpClient<IStockService, CatalogStockService>("catalog-api")
            .AddServiceDiscovery();
    }
}

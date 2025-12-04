using IsaArtTattoo.CatalogApi.Application.Services;

namespace IsaArtTattoo.CatalogApi.Extensions;

public static class ApplicationExtensions
{
    /// <summary>
    /// Registra servicios de aplicación del catálogo.
    /// </summary>
    public static void AddCatalogApplicationServices(this IServiceCollection services)
    {
        services.AddScoped<ICatalogService, CatalogService>();
    }
}

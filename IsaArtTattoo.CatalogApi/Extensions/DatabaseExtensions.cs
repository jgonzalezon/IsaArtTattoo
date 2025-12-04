    using IsaArtTattoo.CatalogApi.Infraestructure.Data;
using Microsoft.EntityFrameworkCore;

namespace IsaArtTattoo.CatalogApi.Extensions;

public static class DatabaseExtensions
{
    /// <summary>
    /// Configura el DbContext de Catálogo usando la ConnectionString "catalogdb"
    /// que inyecta Aspire desde el AppHost.
    /// </summary>
    public static void AddCatalogDatabase(this WebApplicationBuilder builder)
    {
        builder.AddNpgsqlDbContext<CatalogDbContext>("catalogdb");
    }
}

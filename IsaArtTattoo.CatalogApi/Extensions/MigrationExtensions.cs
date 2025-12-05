using IsaArtTattoo.CatalogApi.Infraestructure.Data;
using Microsoft.EntityFrameworkCore;

namespace IsaArtTattoo.CatalogApi.Extensions;

public static class MigrationExtensions
{

    public static void ApplyCatalogMigrations(this WebApplication app)
    {
        using var scope = app.Services.CreateScope();
        var db = scope.ServiceProvider.GetRequiredService<CatalogDbContext>();
        db.Database.Migrate();
    }
}

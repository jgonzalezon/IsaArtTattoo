using IsaArtTattoo.IdentityApi.Data;
using Microsoft.EntityFrameworkCore;

namespace IsaArtTattoo.IdentityApi.Extensions;

public static class MigrationExtensions
{
    /// <summary>
    /// Aplica migraciones de EF Core al arrancar (solo desarrollo normalmente).
    /// </summary>
    public static void ApplyIdentityMigrations(this WebApplication app)
    {
        using var scope = app.Services.CreateScope();
        var db = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();
        db.Database.Migrate();
    }
}

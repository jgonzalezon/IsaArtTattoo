using IsaArtTattoo.OrdersApi.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace IsaArtTattoo.OrdersApi.Extensions;

public static class MigrationExtensions
{
    public static void ApplyOrdersMigrations(this WebApplication app)
    {
        using var scope = app.Services.CreateScope();
        var db = scope.ServiceProvider.GetRequiredService<OrdersDbContext>();
        db.Database.Migrate();
    }
}

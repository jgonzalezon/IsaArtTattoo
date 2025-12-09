using IsaArtTattoo.OrdersApi.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace IsaArtTattoo.OrdersApi.Extensions;

public static class DatabaseExtensions
{
    public static void AddOrdersDatabase(this WebApplicationBuilder builder)
    {
        builder.Services.AddDbContext<OrdersDbContext>(opt =>
            opt.UseNpgsql(builder.Configuration.GetConnectionString("ordersdb")));
    }
}

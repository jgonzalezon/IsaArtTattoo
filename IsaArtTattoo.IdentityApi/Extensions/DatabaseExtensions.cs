using IsaArtTattoo.IdentityApi.Data;
using Microsoft.EntityFrameworkCore;

namespace IsaArtTattoo.IdentityApi.Extensions;

public static class DatabaseExtensions
{
    /// <summary>
    /// Configura el DbContext de Identity usando la ConnectionString "DefaultConnection"
    /// que inyecta Aspire desde el AppHost.
    /// </summary>
    public static void AddIdentityDatabase(this WebApplicationBuilder builder)
    {
        builder.Services.AddDbContext<ApplicationDbContext>(opt =>
            opt.UseNpgsql(builder.Configuration.GetConnectionString("DefaultConnection")));
    }
}

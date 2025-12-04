using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Design;

namespace IsaArtTattoo.CatalogApi.Infraestructure.Data;

public class CatalogDbContextFactory : IDesignTimeDbContextFactory<CatalogDbContext>
{
    public CatalogDbContext CreateDbContext(string[] args)
    {
        var optionsBuilder = new DbContextOptionsBuilder<CatalogDbContext>();
        optionsBuilder.UseNpgsql("Server=localhost;Port=5432;Database=catalogdb;User Id=postgres;Password=postgres;");
        return new CatalogDbContext(optionsBuilder.Options);
    }
}
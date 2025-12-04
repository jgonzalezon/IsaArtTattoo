using IsaArtTattoo.CatalogApi.Extensions;

var builder = WebApplication.CreateBuilder(args);

// Telemetría, health, service discovery de Aspire
builder.AddServiceDefaults();

// Infraestructura + servicios del Catálogo
builder.AddCatalogDatabase();                // DbContext + Postgres catalogdb
builder.AddCatalogJwtAuth();                 // JWT + policies (authenticated/admin)
builder.AddCatalogCors();                    // CORS para el front
builder.Services.AddCatalogApplicationServices(); // Servicios de aplicación + endpoints

// OpenAPI / Scalar (sin SwaggerGen)
builder.Services.AddCatalogOpenApi();

var app = builder.Build();

// Migraciones automáticas (catálogo)
app.ApplyCatalogMigrations();

// Pipeline HTTP
if (app.Environment.IsDevelopment())
{
    app.MapCatalogOpenApi();  // /openapi, /swagger, /scalar
}

app.UseHttpsRedirection();
app.UseCors(CatalogCorsExtensions.AllowWebPolicyName);
app.UseAuthentication();
app.UseAuthorization();

// Minimal APIs para catálogo
app.MapCatalogEndpoints();

// Endpoints por defecto de Aspire (health, etc.)
app.MapDefaultEndpoints();

app.Run();

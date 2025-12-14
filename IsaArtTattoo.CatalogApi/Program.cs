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

builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowAll", policy =>
    {
        policy
            .AllowAnyOrigin()
            .AllowAnyMethod()
            .AllowAnyHeader();
    });
});

var app = builder.Build();

// Migraciones automáticas (catálogo)
app.ApplyCatalogMigrations();

// Pipeline HTTP
if (app.Environment.IsDevelopment())
{
    app.MapCatalogOpenApi();  // /openapi, /swagger, /scalar
}

// ? Solo redirigir HTTPS en producción (YARP usa HTTP en desarrollo)
if (!app.Environment.IsDevelopment())
{
    app.UseHttpsRedirection();
}

app.UseCors("AllowAll");
app.UseAuthentication();
app.UseAuthorization();

// Minimal APIs para catálogo
app.MapCatalogEndpoints();

// Endpoints por defecto de Aspire (health, etc.)
app.MapDefaultEndpoints();

app.Run();

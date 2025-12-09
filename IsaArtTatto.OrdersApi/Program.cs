using IsaArtTattoo.OrdersApi.Extensions;

var builder = WebApplication.CreateBuilder(args);

// Telemetría / health / service discovery
builder.AddServiceDefaults();

// Infraestructura Orders
builder.AddOrdersDatabase();
builder.AddOrdersJwtAuth();
builder.AddOrdersCors();

// Controllers + OpenAPI
builder.Services.AddControllers();
builder.Services.AddOrdersOpenApi();

// Servicios de aplicación (Orders + HttpClient a Catalog)
builder.Services.AddOrdersApplicationServices();

var app = builder.Build();

// Migraciones EF
app.ApplyOrdersMigrations();

if (app.Environment.IsDevelopment())
{
    app.MapOrdersOpenApi();
}

app.UseHttpsRedirection();
app.UseCors(OrdersCorsExtensions.AllowWebPolicyName);
app.UseAuthentication();
app.UseAuthorization();

app.MapControllers();
app.MapDefaultEndpoints();

app.Run();

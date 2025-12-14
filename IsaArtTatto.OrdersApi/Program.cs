using IsaArtTattoo.OrdersApi.Application.Services;
using IsaArtTattoo.OrdersApi.Extensions;
using System.Reflection;

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
builder.Services.AddScoped<IUserOrdersService, UserOrdersService>();


var app = builder.Build();

// Migraciones EF
app.ApplyOrdersMigrations();

if (app.Environment.IsDevelopment())
{
    app.MapOrdersOpenApi();
}

// ? Solo redirigir HTTPS en producción (YARP usa HTTP en desarrollo)
if (!app.Environment.IsDevelopment())
{
    app.UseHttpsRedirection();
}

app.UseCors(OrdersCorsExtensions.AllowWebPolicyName);
app.UseAuthentication();
app.UseAuthorization();

app.MapControllers();
app.MapDefaultEndpoints();

app.Run();

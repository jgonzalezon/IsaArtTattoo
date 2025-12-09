using IsaArtTattoo.IdentityApi.Extensions;
using IsaArtTattoo.IdentityApi.Services;
using MassTransit;


var builder = WebApplication.CreateBuilder(args);

// Telemetría, health, service discovery de Aspire
builder.AddServiceDefaults();

// Infraestructura + servicios de la Identity API
builder.AddIdentityDatabase();              // DbContext + Postgres
builder.AddIdentityCoreAndJwt();            // Identity + JWT + Authorization policies
builder.AddIdentityCors();                  // CORS para el front
builder.Services.AddIdentityApiVersioning();// ApiVersioning + Explorer
builder.Services.AddIdentityApplicationServices(); // Controllers, EmailSender, JwtTokenService
builder.Services.AddScoped<IAuthService, AuthService>();
builder.Services.AddScoped<IRolesService, RolesService>();
builder.Services.AddScoped<IUsersService, UsersService>();



// OpenAPI / Swagger / Scalar
builder.Services.AddIdentityOpenApi();


builder.Services.AddMassTransit(x =>
{
    // En IdentityApi solo publicamos, no registramos consumidores
    x.UsingRabbitMq((context, cfg) =>
    {
        var configuration = context.GetRequiredService<IConfiguration>();
        var connectionString = configuration.GetConnectionString("rabbitmq");

        if (!string.IsNullOrEmpty(connectionString))
        {
            cfg.Host(new Uri(connectionString));
        }
    });
});


var app = builder.Build();

// Migraciones automáticas en desarrollo
app.ApplyIdentityMigrations();

// Pipeline HTTP
if (app.Environment.IsDevelopment())
{
    app.MapIdentityOpenApi();  // /openapi, /swagger, /scalar
}

app.UseHttpsRedirection();
app.UseCors(CorsExtensions.AllowWebPolicyName);
app.UseAuthentication();
app.UseAuthorization();

app.MapControllers();
app.MapDefaultEndpoints();

app.Run();

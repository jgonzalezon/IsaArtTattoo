using IsaArtTattoo.IdentityApi.Extensions;

var builder = WebApplication.CreateBuilder(args);

// Telemetría, health, service discovery de Aspire
builder.AddServiceDefaults();

// Infraestructura + servicios de la Identity API
builder.AddIdentityDatabase();              // DbContext + Postgres
builder.AddIdentityCoreAndJwt();            // Identity + JWT + Authorization policies
builder.AddIdentityCors();                  // CORS para el front
builder.Services.AddIdentityApiVersioning();// ApiVersioning + Explorer
builder.Services.AddIdentityApplicationServices(); // Controllers, EmailSender, JwtTokenService

// OpenAPI / Swagger / Scalar
builder.Services.AddIdentityOpenApi();

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

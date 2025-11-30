using IsaArtTattoo.ApiGateWay.Extensions;
using Aspire.StackExchange.Redis; // para AddRedisClient

var builder = WebApplication.CreateBuilder(args);

// ------------------------------------
// Aspire service defaults (logs, hc…)
// ------------------------------------
builder.AddServiceDefaults();

// ------------------------------------
// Redis client (para rate limiting RedisRateLimitingExtensions)
// El nombre "cache" debe coincidir con el del AppHost: builder.AddRedis("cache")
// ------------------------------------
builder.AddRedisClient("cache");

// ------------------------------------
// Configuración del ApiGateway vía EXTENSIONS
// ------------------------------------

// CORS para el frontend (AllowAnyOrigin/AnyHeader/AnyMethod)
builder.Services.AddGatewayCors();

// JWT (lee sección "Jwt" de appsettings y configura JwtBearer)
builder.Services.AddGatewayJwtAuthentication(builder.Configuration);

// Policies de autorización (authenticated, admin, sin fallback raro)
builder.Services.AddGatewayAuthorizationPolicies();

// Rate limiting usando Redis (policies "anonymous" y "authenticated")
builder.Services.AddRedisRateLimiting(builder.Configuration);

// YARP + Service Discovery (lee ReverseProxy de appsettings y resuelve "identity-api")
builder.Services.AddYarpReverseProxy(builder.Configuration);

var app = builder.Build();

// Health checks / metrics Aspire
app.MapDefaultEndpoints();

if (app.Environment.IsDevelopment())
{
    app.UseDeveloperExceptionPage();
}

app.UseHttpsRedirection();

// 🔹 CORS antes de auth / rateLimit
app.UseCors("GatewayCors");

app.UseAuthentication();
app.UseAuthorization();

app.UseRateLimiter();

// 🔹 Aplicar la policy *explícitamente* al reverse proxy
app.MapReverseProxy()
   .RequireCors("GatewayCors");

app.Run();

using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.IdentityModel.Tokens;
using System.Text;

namespace IsaArtTattoo.CatalogApi.Extensions;

public static class CatalogAuthExtensions
{
    /// <summary>
    /// Configura autenticación JWT y policies básicas (authenticated, admin).
    /// Usa la misma sección "Jwt" que IdentityApi.
    /// </summary>
    public static void AddCatalogJwtAuth(this WebApplicationBuilder builder)
    {
        var jwtSection = builder.Configuration.GetSection("Jwt");
        
        var key = jwtSection["Key"];
        var issuer = jwtSection["Issuer"];
        var audience = jwtSection["Audience"];

        if (string.IsNullOrEmpty(key) || string.IsNullOrEmpty(issuer) || string.IsNullOrEmpty(audience))
        {
            throw new InvalidOperationException(
                "La configuración JWT está incompleta. Asegúrate de que appsettings.json contiene: " +
                "Jwt:Key, Jwt:Issuer y Jwt:Audience.");
        }
        
        var keyBytes = Encoding.UTF8.GetBytes(key);

        builder.Services
            .AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
            .AddJwtBearer(opt =>
            {
                opt.TokenValidationParameters = new TokenValidationParameters
                {
                    ValidateIssuer = true,
                    ValidateAudience = true,
                    ValidateLifetime = true,
                    ValidateIssuerSigningKey = true,
                    ValidIssuer = issuer,
                    ValidAudience = audience,
                    IssuerSigningKey = new SymmetricSecurityKey(keyBytes),
                    ClockSkew = TimeSpan.FromMinutes(1)
                };
            });

        builder.Services.AddAuthorization(options =>
        {
            options.AddPolicy("authenticated", policy =>
            {
                policy.RequireAuthenticatedUser();
            });

            options.AddPolicy("admin", policy =>
            {
                policy.RequireAuthenticatedUser();
                policy.RequireRole("Admin");
            });
        });
    }
}

using IsaArtTattoo.IdentityApi.Data;
using IsaArtTattoo.IdentityApi.Models;
using IsaArtTattoo.IdentityApi.Services;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using System.Text;      

namespace IsaArtTattoo.IdentityApi.Extensions;

public static class IdentityAuthExtensions
{
    /// <summary>
    /// Configura IdentityCore + Roles + JWT + Authorization policies.
    /// </summary>
    public static void AddIdentityCoreAndJwt(this WebApplicationBuilder builder)
    {
        // Identity (sin UI)
        builder.Services.AddIdentityCore<ApplicationUser>(o =>
        {
            o.User.RequireUniqueEmail = true;
        })
            .AddRoles<IdentityRole>()
            .AddEntityFrameworkStores<ApplicationDbContext>()
            .AddSignInManager<SignInManager<ApplicationUser>>()
            .AddDefaultTokenProviders();

        // JWT
        var jwtSection = builder.Configuration.GetSection("Jwt");
        var keyBytes = Encoding.UTF8.GetBytes(jwtSection["Key"]!);

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
                    ValidIssuer = jwtSection["Issuer"],
                    ValidAudience = jwtSection["Audience"],
                    IssuerSigningKey = new SymmetricSecurityKey(keyBytes),
                    ClockSkew = TimeSpan.FromMinutes(1)
                };
            });

        // Authorization policies básicas
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

    /// <summary>
    /// Registra servicios de aplicación (controllers, hosted services, jwt token).
    /// </summary>
    public static void AddIdentityApplicationServices(this IServiceCollection services)
    {
        services.AddControllers();
        services.AddHostedService<SeedHostedService>();
        services.AddScoped<IJwtTokenService, JwtTokenService>();
    }
}

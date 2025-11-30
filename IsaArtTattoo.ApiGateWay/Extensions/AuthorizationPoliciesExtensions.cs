using Microsoft.AspNetCore.Authorization;

namespace IsaArtTattoo.ApiGateWay.Extensions;

public static class AuthorizationPoliciesExtensions
{
    public static IServiceCollection AddGatewayAuthorizationPolicies(
        this IServiceCollection services)
    {
        services.AddAuthorization(options =>
        {
            // requiere JWT válido
            options.AddPolicy("authenticated", policy =>
                policy.RequireAuthenticatedUser());

            // NO definimos "anonymous" – es palabra reservada en YARP

            // rol Admin
            options.AddPolicy("admin", policy =>
            {
                policy.RequireAuthenticatedUser();
                policy.RequireRole("Admin");
            });

            // si no se especifica policy en la ruta, que no exija nada extra
            options.FallbackPolicy = null;
        });

        return services;
    }
}

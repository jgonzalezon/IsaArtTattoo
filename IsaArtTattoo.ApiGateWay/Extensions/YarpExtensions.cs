namespace IsaArtTattoo.ApiGateWay.Extensions;

public static class YarpExtensions
{
    public static IServiceCollection AddYarpReverseProxy(
        this IServiceCollection services,
        IConfiguration configuration)
    {
        services.AddServiceDiscovery();

        services.AddReverseProxy()
            .LoadFromConfig(configuration.GetSection("ReverseProxy"))
            .AddServiceDiscoveryDestinationResolver();

        return services;
    }

    public static IServiceCollection AddGatewayCors(
        this IServiceCollection services)
    {
        const string CorsPolicyName = "GatewayCors";

        services.AddCors(options =>
        {
            // Policy con nombre: la que usamos en Program.cs y en MapReverseProxy
            options.AddPolicy(CorsPolicyName, policy =>
            {
                policy
                    .AllowAnyOrigin()
                    .AllowAnyHeader()
                    .AllowAnyMethod();
            });

            // (Opcional) que sea también la default para UseCors() sin parámetros
            options.AddDefaultPolicy(policy =>
            {
                policy
                    .AllowAnyOrigin()
                    .AllowAnyHeader()
                    .AllowAnyMethod();
            });
        });

        return services;
    }
}

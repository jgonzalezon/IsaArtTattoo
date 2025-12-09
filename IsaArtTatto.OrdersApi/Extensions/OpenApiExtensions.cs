using Microsoft.AspNetCore.OpenApi;
using Microsoft.OpenApi;
using Scalar.AspNetCore;

namespace IsaArtTattoo.OrdersApi.Extensions;

public static class OpenApiExtensions
{
    public static IServiceCollection AddOrdersOpenApi(this IServiceCollection services)
    {
        services.AddOpenApi("v1", options =>
        {
            options.AddDocumentTransformer((document, context, cancellationToken) =>
            {
                document.Info = new OpenApiInfo
                {
                    Title = "IsaArtTattoo Orders API",
                    Version = "v1",
                    Description = "API de pedidos (órdenes) para IsaArtTattoo"
                };

                document.Components ??= new OpenApiComponents();
                document.Components.SecuritySchemes ??=
                    new Dictionary<string, IOpenApiSecurityScheme>();

                document.Components.SecuritySchemes["Bearer"] = new OpenApiSecurityScheme
                {
                    Name = "Authorization",
                    Type = SecuritySchemeType.Http,
                    Scheme = "bearer",
                    BearerFormat = "JWT",
                    In = ParameterLocation.Header,
                    Description = "Introduce: Bearer {token}"
                };

                document.Security ??= new List<OpenApiSecurityRequirement>();
                document.Security.Add(new OpenApiSecurityRequirement
                {
                    {
                        new OpenApiSecuritySchemeReference("Bearer", document)
                        {
                            Description = "JWT Bearer"
                        },
                        new List<string>()
                    }
                });

                return Task.CompletedTask;
            });
        });

        return services;
    }

    public static void MapOrdersOpenApi(this WebApplication app)
    {
        app.MapOpenApi(); // /openapi/v1.json

        app.MapGet("/swagger/v1/swagger.json", ctx =>
        {
            ctx.Response.Redirect("/openapi/v1.json");
            return Task.CompletedTask;
        });

        app.MapScalarApiReference("/scalar", options =>
        {
            options
                .WithTitle("IsaArtTattoo Orders API")
                .AddDocument("v1", "IsaArtTattoo Orders API v1", "/openapi/v1.json", isDefault: true);
        });

        app.UseSwaggerUI(options =>
        {
            options.SwaggerEndpoint("/openapi/v1.json", "IsaArtTattoo.OrdersApi v1");
            options.RoutePrefix = "swagger";
        });
    }
}

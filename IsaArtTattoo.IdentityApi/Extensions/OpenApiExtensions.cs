using Microsoft.AspNetCore.OpenApi;
using Microsoft.OpenApi;
using Scalar.AspNetCore;

namespace IsaArtTattoo.IdentityApi.Extensions;

public static class OpenApiExtensions
{
    /// <summary>
    /// Configura el documento OpenAPI v1 con el esquema de seguridad JWT.
    /// </summary>
    public static IServiceCollection AddIdentityOpenApi(this IServiceCollection services)
    {
        services.AddOpenApi("v1", options =>
        {
            options.AddDocumentTransformer((document, context, cancellationToken) =>
            {
                document.Info = new OpenApiInfo
                {
                    Title = "IsaArtTattoo Identity API",
                    Version = "v1",
                    Description = "Identity API para IsaArtTattoo (JWT Bearer)"
                };

                // Componentes + esquemas de seguridad
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

                // Requisito de seguridad global (equivalente a AddSecurityRequirement)
                document.Security ??= new List<OpenApiSecurityRequirement>();
                document.Security.Add(new OpenApiSecurityRequirement
                {
                    {
                        new OpenApiSecuritySchemeReference(
                            referenceId: "Bearer",
                            hostDocument: document
                        )
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

    /// <summary>
    /// Mapea /openapi, /swagger y /scalar en desarrollo.
    /// </summary>
    public static void MapIdentityOpenApi(this WebApplication app)
    {
        // 1. OpenAPI JSON estándar
        app.MapOpenApi(); // /openapi/v1.json

        // 2. Compatibilidad con /swagger/v1/swagger.json
        app.MapGet("/swagger/v1/swagger.json", context =>
        {
            context.Response.Redirect("/openapi/v1.json");
            return Task.CompletedTask;
        });

        // 3. Scalar UI
        app.MapScalarApiReference("/scalar", options =>
        {
            options
                .WithTitle("IsaArtTattoo Identity API")
                .AddDocument("v1", "IsaArtTattoo Identity API v1", "/openapi/v1.json", isDefault: true);
        });

        // 4. Swagger UI
        app.UseSwaggerUI(options =>
        {
            options.SwaggerEndpoint("/openapi/v1.json", "IsaArtTattoo.IdentityApi v1");
            options.RoutePrefix = "swagger";
        });
    }
}

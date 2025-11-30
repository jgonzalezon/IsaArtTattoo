namespace IsaArtTattoo.IdentityApi.Extensions;

public static class CorsExtensions
{
    public const string AllowWebPolicyName = "AllowWeb";

    /// <summary>
    /// CORS permisivo para el frontend (luego se puede afinar a dominio concreto).
    /// </summary>
    public static void AddIdentityCors(this WebApplicationBuilder builder)
    {
        builder.Services.AddCors(opt =>
        {
            opt.AddPolicy(AllowWebPolicyName, p =>
                p.AllowAnyOrigin()
                 .AllowAnyHeader()
                 .AllowAnyMethod());
        });
    }
}

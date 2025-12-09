namespace IsaArtTattoo.OrdersApi.Extensions;

public static class OrdersCorsExtensions
{
    public const string AllowWebPolicyName = "AllowWeb";

    public static void AddOrdersCors(this WebApplicationBuilder builder)
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

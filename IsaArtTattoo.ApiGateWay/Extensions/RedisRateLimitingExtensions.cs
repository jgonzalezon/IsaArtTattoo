using System.Net;
using System.Security.Claims;
using System.Threading.RateLimiting;
using Microsoft.AspNetCore.RateLimiting;
using RedisRateLimiting;
using RedisRateLimiting.AspNetCore;
using StackExchange.Redis;

namespace IsaArtTattoo.ApiGateWay.Extensions;

public static class RedisRateLimitingExtensions
{
    private static readonly string KeyPrefix =
        Environment.GetEnvironmentVariable("ASPNETCORE_ENVIRONMENT") ?? "Production";

    public static IServiceCollection AddRedisRateLimiting(
        this IServiceCollection services,
        IConfiguration configuration)
    {
        services.AddRateLimiter(options =>
        {
            // anónimos -> 100 req/min por IP
            options.AddPolicy("anonymous", context =>
            {
                var redis = context.RequestServices.GetRequiredService<IConnectionMultiplexer>();
                var ipAddress = GetClientIpAddress(context);

                return RedisRateLimitPartition.GetFixedWindowRateLimiter(
                    $"{KeyPrefix}:ip:{ipAddress}",
                    _ => new RedisFixedWindowRateLimiterOptions
                    {
                        ConnectionMultiplexerFactory = () => redis,
                        PermitLimit = 50,
                        Window = TimeSpan.FromMinutes(1)
                    });
            });

            // autenticados -> 250 req/min por usuario
            options.AddPolicy("authenticated", context =>
            {
                var redis = context.RequestServices.GetRequiredService<IConnectionMultiplexer>();

                var userId = context.User.FindFirst("sub")?.Value
                    ?? context.User.FindFirst(ClaimTypes.NameIdentifier)?.Value;

                if (!string.IsNullOrWhiteSpace(userId))
                {
                    return RedisRateLimitPartition.GetFixedWindowRateLimiter(
                        $"{KeyPrefix}:user:{userId}",
                        _ => new RedisFixedWindowRateLimiterOptions
                        {
                            ConnectionMultiplexerFactory = () => redis,
                            PermitLimit = 250,
                            Window = TimeSpan.FromMinutes(1)
                        });
                }

                // si no hay userId válido, tratamos como no autenticado pero en ruta protegida
                var ipAddress = GetClientIpAddress(context);
                return RedisRateLimitPartition.GetFixedWindowRateLimiter(
                    $"{KeyPrefix}:unauth:{ipAddress}",
                    _ => new RedisFixedWindowRateLimiterOptions
                    {
                        ConnectionMultiplexerFactory = () => redis,
                        PermitLimit = 50,
                        Window = TimeSpan.FromMinutes(1)
                    });
            });

            options.OnRejected = async (context, cancellationToken) =>
            {
                context.HttpContext.Response.StatusCode = StatusCodes.Status429TooManyRequests;

                var retryAfter = context.Lease.TryGetMetadata(MetadataName.RetryAfter, out var retryAfterValue)
                    ? ((TimeSpan)retryAfterValue).TotalSeconds
                    : 60;

                context.HttpContext.Response.Headers.RetryAfter = retryAfter.ToString();

                await context.HttpContext.Response.WriteAsJsonAsync(new
                {
                    error = "Too many requests",
                    message = "Rate limit exceeded. Please try again later.",
                    retryAfter = $"{retryAfter} seconds"
                }, cancellationToken);
            };
        });

        return services;
    }

    private static string GetClientIpAddress(HttpContext context)
    {
        string? ipAddress = null;

        var forwardedFor = context.Request.Headers["X-Forwarded-For"].FirstOrDefault();
        if (!string.IsNullOrWhiteSpace(forwardedFor))
        {
            ipAddress = forwardedFor.Split(',', StringSplitOptions.RemoveEmptyEntries)
                .FirstOrDefault()?.Trim();
        }

        if (string.IsNullOrWhiteSpace(ipAddress))
            ipAddress = context.Request.Headers["X-Real-IP"].FirstOrDefault();

        if (string.IsNullOrWhiteSpace(ipAddress))
            ipAddress = context.Request.Headers["CF-Connecting-IP"].FirstOrDefault();

        if (string.IsNullOrWhiteSpace(ipAddress))
            ipAddress = context.Connection.RemoteIpAddress?.ToString();

        return NormalizeIpAddress(ipAddress);
    }

    private static string NormalizeIpAddress(string? ipAddress)
    {
        if (string.IsNullOrWhiteSpace(ipAddress))
            return "0.0.0.0";

        if (IPAddress.TryParse(ipAddress, out var parsedIp))
        {
            if (parsedIp.IsIPv4MappedToIPv6)
                parsedIp = parsedIp.MapToIPv4();

            return parsedIp.ToString();
        }

        return ipAddress.Replace(":", "_").Replace("/", "_");
    }
}

using System.Net.Http.Headers;
using Microsoft.AspNetCore.Http;

namespace IsaArtTattoo.OrdersApi.Application.Services;

/// <summary>
/// Manejador HTTP que automáticamente inyecta el token JWT del usuario actual
/// en los headers de autorización de las requests al Catalog API.
/// </summary>
public class JwtTokenHandler : DelegatingHandler
{
    private readonly IHttpContextAccessor _httpContextAccessor;

    public JwtTokenHandler(IHttpContextAccessor httpContextAccessor)
    {
        _httpContextAccessor = httpContextAccessor;
    }

    protected override async Task<HttpResponseMessage> SendAsync(
        HttpRequestMessage request,
        CancellationToken cancellationToken)
    {
        // Intentar obtener el token JWT del HttpContext actual
        var token = _httpContextAccessor.HttpContext?.User
            .FindFirst("http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier")
            ?.Value;

        // Si no encuentras el claim anterior, intenta con otros nombres
        if (string.IsNullOrEmpty(token))
        {
            token = _httpContextAccessor.HttpContext?.User
                .FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)
                ?.Value;
        }

        // Intenta obtener el token del header Authorization (más directo)
        if (string.IsNullOrEmpty(token))
        {
            var authHeader = _httpContextAccessor.HttpContext?.Request.Headers
                .Authorization.ToString();

            if (!string.IsNullOrEmpty(authHeader) && authHeader.StartsWith("Bearer "))
            {
                token = authHeader["Bearer ".Length..];
            }
        }

        // Si tenemos token, agregarlo al request
        if (!string.IsNullOrEmpty(token))
        {
            request.Headers.Authorization = new AuthenticationHeaderValue("Bearer", token);
        }

        return await base.SendAsync(request, cancellationToken);
    }
}

using System.Net.Http.Headers;
using IsaArtTattoo.CatalogApi.Application.Services;

namespace IsaArtTattoo.CatalogApi.Infrastructure.Supabase;

public class SupabaseImageStorageService : IImageStorageService
{
    private readonly HttpClient _http;
    private readonly SupabaseOptions _options;

    public SupabaseImageStorageService(HttpClient http, IConfiguration cfg)
    {
        _http = http;

        _options = new SupabaseOptions();
        cfg.GetSection(SupabaseOptions.SectionName).Bind(_options);

        if (string.IsNullOrWhiteSpace(_options.Url) ||
            string.IsNullOrWhiteSpace(_options.Bucket) ||
            string.IsNullOrWhiteSpace(_options.ServiceRoleKey))
        {
            throw new InvalidOperationException(
                "La sección Supabase en appsettings está incompleta. " +
                "Debes configurar Url, Bucket y ServiceRoleKey.");
        }

        _http.BaseAddress = new Uri(_options.Url);
        _http.DefaultRequestHeaders.Authorization =
            new AuthenticationHeaderValue("Bearer", _options.ServiceRoleKey);
    }

    public async Task<string> UploadProductImageAsync(
        int productId,
        string fileName,
        Stream fileStream,
        string contentType,
        CancellationToken ct = default)

    {
        // Validación básica de tipo y tamaño
        var allowedContentTypes = new[]
        {
    "image/jpeg",
    "image/png",
    "image/webp"
};

        // Si no viene contentType, mejor asumir binario y fallar
        if (string.IsNullOrWhiteSpace(contentType) ||
            !allowedContentTypes.Contains(contentType.ToLowerInvariant()))
        {
            throw new InvalidOperationException(
                $"Tipo de archivo no permitido: {contentType}. " +
                "Solo se permiten JPEG, PNG y WEBP.");
        }

        // Límite de peso: p.ej. 5 MB
        // (Si el Stream no expone Length, esa parte la puedes saltar o validarlo antes)
        if (fileStream.CanSeek && fileStream.Length > 5 * 1024 * 1024)
        {
            throw new InvalidOperationException("La imagen supera el tamaño máximo de 5 MB.");
        }


        // ruta dentro del bucket: products/{productId}/{guid}_{fileName}
        var safeFileName = Path.GetFileName(fileName);
        var objectPath = $"products/{productId}/{Guid.NewGuid():N}_{safeFileName}";

        var request = new HttpRequestMessage(
            HttpMethod.Post,
            $"/storage/v1/object/{_options.Bucket}/{objectPath}");

        request.Headers.Add("x-upsert", "true"); // sobreescribir si existe

        var content = new StreamContent(fileStream);
        content.Headers.ContentType = new MediaTypeHeaderValue(
            string.IsNullOrWhiteSpace(contentType)
                ? "application/octet-stream"
                : contentType);
        request.Content = content;

        var response = await _http.SendAsync(request, ct);
        if (!response.IsSuccessStatusCode)
        {
            var body = await response.Content.ReadAsStringAsync(ct);
            throw new InvalidOperationException(
                $"Error al subir imagen a Supabase: {response.StatusCode} - {body}");
        }

        // URL pública (bucket marcado como public)
        var publicUrl =
            $"{_options.Url}/storage/v1/object/public/{_options.Bucket}/{objectPath}";

        return publicUrl;
    }
}

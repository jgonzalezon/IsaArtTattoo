namespace IsaArtTattoo.CatalogApi.Application.Services;

public interface IImageStorageService
{
    /// <summary>
    /// Sube una imagen de producto a Supabase y devuelve la URL pública.
    /// </summary>
    Task<string> UploadProductImageAsync(
        int productId,
        string fileName,
        Stream fileStream,
        string contentType,
        CancellationToken ct = default);
}

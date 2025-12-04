using IsaArtTattoo.CatalogApi.Application.Dto;

namespace IsaArtTattoo.CatalogApi.Application.Services;

public interface ICatalogService
{
    // Público
    Task<IReadOnlyList<ProductListItemDto>> GetProductsAsync(
        int? categoryId = null,
        string? search = null,
        bool onlyActive = true,
        CancellationToken ct = default);

    Task<ProductDetailDto?> GetProductByIdAsync(int id, CancellationToken ct = default);

    // Admin
    Task<ProductDetailDto> CreateProductAsync(CreateProductDto dto, CancellationToken ct = default);
    Task<ProductDetailDto?> AdjustStockAsync(int id, AdjustStockDto dto, CancellationToken ct = default);
    Task<ProductImageDto?> AddProductImageAsync(int productId, AddProductImageDto dto, CancellationToken ct = default);
}

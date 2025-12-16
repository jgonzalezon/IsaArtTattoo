using IsaArtTattoo.CatalogApi.Application.Dto;

namespace IsaArtTattoo.CatalogApi.Application.Services;

public interface ICatalogService
{
    // ---------- Público ----------

    Task<IReadOnlyList<CategoryDto>> GetCategoriesAsync(CancellationToken ct = default);
    Task<CategoryDetailDto?> GetCategoryByIdAsync(int id, CancellationToken ct = default);

    Task<IReadOnlyList<ProductListItemDto>> GetProductsAsync(
        int? categoryId = null,
        string? search = null,
        bool onlyActive = true,
        CancellationToken ct = default);

    // Público: obtener imágenes de un producto
    Task<IReadOnlyList<ProductImageDto>?> GetProductImagesAsync(int productId, CancellationToken ct = default);

    // Admin: actualizar metadata de una imagen (orden, altText, principal)
    Task<ProductImageDto?> UpdateProductImageAsync(
        int productId,
        int imageId,
        UpdateProductImageDto dto,
        CancellationToken ct = default);

    // Admin: eliminar una imagen de un producto
    Task<bool> DeleteProductImageAsync(int productId, int imageId, CancellationToken ct = default);
    Task<ProductDetailDto?> GetProductByIdAsync(int id, CancellationToken ct = default);

    // ---------- Admin: categorías ----------

    Task<CategoryDetailDto> CreateCategoryAsync(CreateCategoryDto dto, CancellationToken ct = default);
    Task<CategoryDetailDto?> UpdateCategoryAsync(int id, UpdateCategoryDto dto, CancellationToken ct = default);
    Task<bool> DeleteCategoryAsync(int id, CancellationToken ct = default);
    Task<bool> DeleteCategoryWithProductsAsync(int id, bool deleteProducts, CancellationToken ct = default);

    // ---------- Admin: productos ----------

    Task<ProductDetailDto> CreateProductAsync(CreateProductDto dto, CancellationToken ct = default);
    Task<ProductDetailDto?> UpdateProductAsync(int id, UpdateProductDto dto, CancellationToken ct = default);
    Task<ProductDetailDto?> AdjustStockAsync(int id, AdjustStockDto dto, CancellationToken ct = default);
    Task<ProductImageDto?> AddProductImageAsync(int productId, AddProductImageDto dto, CancellationToken ct = default);
    Task<bool> DeleteProductAsync(int id, CancellationToken ct = default);

    // Público: cambiar estado activo/inactivo (usuarios identificados)
    Task<ProductDetailDto?> SetProductActiveStatusAsync(int id, bool isActive, CancellationToken ct = default);
}

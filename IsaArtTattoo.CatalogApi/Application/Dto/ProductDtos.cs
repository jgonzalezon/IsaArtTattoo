namespace IsaArtTattoo.CatalogApi.Application.Dto;

// ---------- CATEGORÍAS ----------

public record CategoryDto(
    int Id,
    string Name,
    string? Description,
    int DisplayOrder,
    int ProductsCount
);

public record CategoryDetailDto(
    int Id,
    string Name,
    string? Description,
    int DisplayOrder,
    IReadOnlyList<ProductListItemDto> Products
);

public record CreateCategoryDto(
    string Name,
    string? Description,
    int DisplayOrder
);

public record UpdateCategoryDto(
    string? Name,
    string? Description,
    int? DisplayOrder
);

// ---------- PRODUCTOS (zona pública) ----------

public record ProductListItemDto(
    int Id,
    string Name,
    string? ShortDescription,
    decimal Price,
    string? MainImageUrl,
    string? CategoryName
);

public record ProductImageDto(
    int Id,
    string Url,
    string? AltText,
    int DisplayOrder
);

public record ProductDetailDto(
    int Id,
    string Name,
    string? ShortDescription,
    decimal Price,
    int Stock,
    bool IsActive,
    string? CategoryName,
    IReadOnlyList<ProductImageDto> Images
);

// ---------- PRODUCTOS (admin) ----------

public record CreateProductDto(
    string Name,
    string? ShortDescription,
    decimal Price,
    int? CategoryId,
    int InitialStock,
    bool IsActive
);

/// <summary>
/// DTO de actualización parcial: cualquier campo null NO se modifica.
/// </summary>
public record UpdateProductDto(
    string? Name,
    string? ShortDescription,
    decimal? Price,
    int? CategoryId,
    int? Stock,
    bool? IsActive
);

public record AdjustStockDto(
    int Quantity,
    string? Reason
);

public record AddProductImageDto(
    string Url,
    string? AltText,
    int DisplayOrder
);
public record UpdateProductImageDto(
    int? DisplayOrder,
    string? AltText,
    bool? IsPrimary
);


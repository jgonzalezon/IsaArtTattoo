namespace IsaArtTattoo.CatalogApi.Application.Dto;

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

// Admin

public record CreateProductDto(
    string Name,
    string? ShortDescription,
    decimal Price,
    int? CategoryId,
    int InitialStock,
    bool IsActive
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

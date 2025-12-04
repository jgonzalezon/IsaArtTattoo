using IsaArtTattoo.CatalogApi.Application.Dto;
using IsaArtTattoo.CatalogApi.Domain.Entities;
using IsaArtTattoo.CatalogApi.Infraestructure.Data;
using Microsoft.EntityFrameworkCore;

namespace IsaArtTattoo.CatalogApi.Application.Services;

public class CatalogService : ICatalogService
{
    private readonly CatalogDbContext _db;

    public CatalogService(CatalogDbContext db)
    {
        _db = db;
    }

    public async Task<IReadOnlyList<ProductListItemDto>> GetProductsAsync(
        int? categoryId = null,
        string? search = null,
        bool onlyActive = true,
        CancellationToken ct = default)
    {
        var query = _db.Products
            .Include(p => p.Category)
            .Include(p => p.Images)
            .AsQueryable();

        if (onlyActive)
            query = query.Where(p => p.IsActive);

        if (categoryId.HasValue)
            query = query.Where(p => p.CategoryId == categoryId);

        if (!string.IsNullOrWhiteSpace(search))
        {
            var term = search.Trim();
            query = query.Where(p =>
                p.Name.Contains(term) ||
                (p.ShortDescription != null && p.ShortDescription.Contains(term)));
        }

        query = query.OrderBy(p => p.Name);

        var products = await query.ToListAsync(ct);

        return products.Select(p =>
        {
            var mainImage = p.Images
                .OrderBy(i => i.DisplayOrder)
                .FirstOrDefault();

            return new ProductListItemDto(
                p.Id,
                p.Name,
                p.ShortDescription,
                p.Price,
                mainImage?.Url,
                p.Category?.Name
            );
        }).ToList();
    }

    public async Task<ProductDetailDto?> GetProductByIdAsync(int id, CancellationToken ct = default)
    {
        var p = await _db.Products
            .Include(p => p.Category)
            .Include(p => p.Images.OrderBy(i => i.DisplayOrder))
            .FirstOrDefaultAsync(p => p.Id == id, ct);

        if (p is null) return null;

        return MapToDetailDto(p);
    }

    public async Task<ProductDetailDto> CreateProductAsync(CreateProductDto dto, CancellationToken ct = default)
    {
        var product = new Product
        {
            Name = dto.Name,
            ShortDescription = dto.ShortDescription,
            Price = dto.Price,
            CategoryId = dto.CategoryId,
            Stock = dto.InitialStock,
            IsActive = dto.IsActive
        };

        _db.Products.Add(product);
        await _db.SaveChangesAsync(ct);

        // recargar con relaciones
        await _db.Entry(product).Reference(p => p.Category).LoadAsync(ct);
        await _db.Entry(product).Collection(p => p.Images).LoadAsync(ct);

        return MapToDetailDto(product);
    }

    public async Task<ProductDetailDto?> AdjustStockAsync(int id, AdjustStockDto dto, CancellationToken ct = default)
    {
        var product = await _db.Products.FirstOrDefaultAsync(p => p.Id == id, ct);
        if (product is null) return null;

        product.Stock += dto.Quantity;
        if (product.Stock < 0)
            product.Stock = 0;

        product.UpdatedAt = DateTime.UtcNow;

        await _db.SaveChangesAsync(ct);

        await _db.Entry(product).Reference(p => p.Category).LoadAsync(ct);
        await _db.Entry(product).Collection(p => p.Images).LoadAsync(ct);

        return MapToDetailDto(product);
    }

    public async Task<ProductImageDto?> AddProductImageAsync(int productId, AddProductImageDto dto, CancellationToken ct = default)
    {
        var product = await _db.Products.FirstOrDefaultAsync(p => p.Id == productId, ct);
        if (product is null) return null;

        var img = new ProductImage
        {
            ProductId = productId,
            Url = dto.Url,
            AltText = dto.AltText,
            DisplayOrder = dto.DisplayOrder
        };

        _db.ProductImages.Add(img);
        await _db.SaveChangesAsync(ct);

        return new ProductImageDto(img.Id, img.Url, img.AltText, img.DisplayOrder);
    }

    private static ProductDetailDto MapToDetailDto(Product p)
    {
        var images = p.Images
            .OrderBy(i => i.DisplayOrder)
            .Select(i => new ProductImageDto(i.Id, i.Url, i.AltText, i.DisplayOrder))
            .ToList();

        return new ProductDetailDto(
            p.Id,
            p.Name,
            p.ShortDescription,
            p.Price,
            p.Stock,
            p.IsActive,
            p.Category?.Name,
            images
        );
    }
}
